import { Clipboard } from '@angular/cdk/clipboard';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CkEditorConfig } from '@src/app/constants/ckEditorConfig';
import { Permissions } from '@src/app/constants/permissions';
import { Regex } from '@src/app/constants/regex';
import { Routes } from '@src/app/constants/routes';
import { FacadeService } from '@src/app/services/facade.service';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss']
})
export class DocumentComponent implements OnInit, OnDestroy {

  constructor(
    private _facadeService: FacadeService,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _clipboard: Clipboard
  ) {
    this.currentUser = this._facadeService.authService.getCurrentUser();

    this.projectDetailsSubscription = this._facadeService.projectService.projectDetails$.subscribe({
      next: (details: any) => {
        this.projectDetails = details;
        const nodes = this.projectDetails?.workflowId?.nodes;
        if (nodes?.length) {
          const documentNode = nodes.find((n: any) => n.app == 'Pandadoc');
          this.isSignDocumentVisible = documentNode ? true : false;
        } else {
          this.isSignDocumentVisible = false;
        }
        this.getDocumentList();
      }
    });

    this.signDocumentForm = this._formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.pattern(Regex.EMAIL)]]
    });
  }

  protected projectDetailsSubscription: Subscription;
  protected projectDetails: any;
  protected isSignDocumentVisible: boolean = false;
  protected signDocumentForm: FormGroup;
  protected isGenerating: boolean = false;
  protected signLink: string = '';

  permissions = Permissions;
  currentUser: any;
  selectedNodeId: number | null = null;

  templateList: any = [];
  filteredTemplateList: any = []
  templateNodes: any = [];
  selectedVersion = '';
  versionOptions = [];
  selectedDocument: any = null;
  selectedDocumentCategoryList: Array<any> = [];
  appRoutes = Routes;

  ngOnInit(): void {
    this._facadeService.modalService.registerModal('signDocumentModal');
    this._facadeService.modalService.registerModal('documentMigrationModal');
    this.getDocumentList();
  }

  get email(): AbstractControl {
    return (this.signDocumentForm.get('email') as AbstractControl);
  }
  get firstName(): AbstractControl {
    return (this.signDocumentForm.get('firstName') as AbstractControl);
  }
  get lastName(): AbstractControl {
    return (this.signDocumentForm.get('lastName') as AbstractControl);
  }


  onGoBack(event: string) {
    if (event === 'skip' && this.selectedDocument?._id) {
      this.onDone();
    }
  }

  onSignDocument() {
    this._facadeService.modalService.openModal('signDocumentModal');
  }

  onGenerateLink() {
    if (!this.selectedDocument?._id || !this.selectedDocument?.projectId || !this.selectedVersion) return;
    if (this.signDocumentForm.invalid) {
      this.signDocumentForm.markAllAsTouched();
      return;
    }

    this.isGenerating = true;
    // @ts-ignore
    const html = window.editor.getData();

    const body = {
      templateId: this.selectedDocument._id,
      projectId: this.selectedDocument.projectId,
      html: html,
      userDetails: {
        firstName: this.signDocumentForm.value.firstName,
        lastName: this.signDocumentForm.value.lastName,
        email: this.signDocumentForm.value.email,
      },
      major: this.selectedVersion.split('.')[0],
      minor: this.selectedVersion.split('.')[1]
    };

    this._facadeService.signedDocumentService.getSignLink(body).subscribe({
      next: (res: any) => {
        this.signLink = res.data.link;
        this.isGenerating = false;
        // this._facadeService.appService.openToaster('Link generated successfully', 'success');
        this.onCopyLink();
      },
      error: (err: any) => {
        this.signLink = '';
        this.isGenerating = false;
        this._facadeService.appService.openToaster('error while generating sign link', 'danger');
      }
    });
  }

  onCopyLink() {
    if (this.signLink) {
      this._clipboard.copy(this.signLink);
      this._facadeService.appService.openToaster('Link copied successfully', 'success');
    }
  }

  onCloseSignDocumentModel() {
    this.signDocumentForm.reset();
    this.signLink = '';
    this.isGenerating = false;
  }

  setDocumentCKEditor() {
    const rawTemplate = this.selectedDocument.html
      ?.replace(/<p/g, '\n<p')?.replace(/<\/p>/g, '<\/p>\n')
      ?.replace(/<li/g, '\n<li')?.replace(/<\/li>/g, '<\/li>\n')
      ?.replace(/<ul/g, '\n<ul')?.replace(/<\/ul>/g, '<\/ul>\n')
      ?.replace(/<ol/g, '\n<ol')?.replace(/<\/ol>/g, '<\/ol>\n') || '';
    const rawTemplateLines = rawTemplate.split(/\n+/);
    /** old one (/{[\w\/ -?@]+[\[]+.*?[\]]+}/g) */
    const titleAndPromptRegex = (/{[\w\/ -?@‘’“”]+[\[]+.*?[\]]+}/g);
    const spanWithStyleAtrRegex = /<span\s+style="([^"]*)">/g;
    const categories = _.cloneDeep(this.selectedDocumentCategoryList);
    let templateHtml = '';

    for (const line of rawTemplateLines) {
      if (line.match(titleAndPromptRegex)) {
        const titleAndPrompt = line.match(titleAndPromptRegex).at(0);
        const [categoryTitle] = titleAndPrompt.replaceAll(/^{|]}$/g, '').split(' - [');
        const categoryIndex = categories.findIndex((category) => category.title === categoryTitle);

        if (categoryIndex > -1) {
          const category = categories[categoryIndex];

          if (line.startsWith('<li')) {
            /** either is string or undefined (with second approach spanWithStyleAtrRegex.exec(line) results in array/null) */
            const spanStyleAtr = line.match(spanWithStyleAtrRegex)?.at(0);

            if (category?.requirements?.length > 1) {
              let requirementsHtmlStr = '';
              if (spanStyleAtr) {
                for (let i = 0; i < category.requirements.length; i++) {
                  requirementsHtmlStr += `<li>${spanStyleAtr}${category.requirements[i].requirement}</span></li>`;
                }
              } else {
                for (let i = 0; i < category.requirements.length; i++) {
                  requirementsHtmlStr += `<li>${category.requirements[i].requirement}</li>`;
                }
              }

              if (line.endsWith('</li>')) {
                templateHtml += line.replace(titleAndPrompt, '').replace('</li>', `<ol>${requirementsHtmlStr}</ol></li>`);
              } else {
                templateHtml += line.replace(titleAndPrompt, '');
              }
            } else if (category?.requirements?.length === 1) {
              templateHtml += line.replace(titleAndPrompt, category.requirements[0].requirement || '');
            } else {
              templateHtml += line.replace(titleAndPrompt, '');
            }
          } else if (line.startsWith('<p')) {

            if (category.requirements.length > 1) {
              let requirementsHtmlStr = `<ol><li>${category.title.split('/').pop()}<ol>`;
              for (let i = 0; i < category.requirements.length; i++) {
                requirementsHtmlStr += `<li>${category.requirements[i].requirement}</li>`;
              }
              requirementsHtmlStr += '</ol></li></ol>';
              templateHtml += line.replace(titleAndPrompt, '');
              templateHtml += requirementsHtmlStr;
            } else {
              templateHtml += line.replace(titleAndPrompt, category.requirements[0]?.requirement || '');
            }
          } else {
            templateHtml += line;
          }

          categories.splice(categoryIndex, 1);
        } else {
          templateHtml += line.replace(titleAndPrompt, '');
        }
      } else {
        templateHtml += line;
      }
    }

    // @ts-ignore
    if (window.editor) {
      // @ts-ignore
      window.editor.data.set(templateHtml);
    } else {
      let interval = setInterval(() => {
        // @ts-ignore
        if (window.editor) {
          // @ts-ignore
          window.editor.data.set(templateHtml);
          clearInterval(interval);
        }
      }, 500);
    }
  }


  getDocumentList() {
    if (this.projectDetails?._id) {
      this._facadeService.templateService.getListByProjectId(this.projectDetails._id).subscribe({
        next: (res: any) => {
          if (this.projectDetails?.workflowId?.nodes) {
            this.templateList = res.data.list;

            this.templateNodes = this.projectDetails.workflowId.nodes.filter((n: any) => n.app == 'Document');
            if (this.templateNodes.length) {
              this.selectPill(this.selectedNodeId ?? this.templateNodes[0].id);
            }
          }
        }
      });
    }
  }

  selectPill(nodeId: number) {
    this.selectedNodeId = nodeId;
    this.filteredTemplateList = this.templateList.filter((template: any) => template.nodeId == this.selectedNodeId && template.isDefault);
  }

  onManageDocument(docIndex: number) {
    this.selectedDocument = this.filteredTemplateList[docIndex];
    this.versionOptions = this.selectedDocument.versions.map((version: any) => version.majorMinorCombination).sort((versionA: string, versionB: string) => parseFloat(versionA) - parseFloat(versionB));
    this.selectedVersion = this.versionOptions[this.versionOptions.length - 1];

    this.setDocumentView();
  }

  onDone() {
    this.selectedDocument = null;
    // @ts-ignore
    window.editor = null;
  }

  onVersionChange(event: any) {
    this.selectedVersion = event;
    this.setDocumentView();
  }

  setDocumentView() {
    if (!this.selectedDocument) return;

    this._facadeService.documentService.categoryList({
      templateId: this.selectedDocument._id,
      projectId: this.selectedDocument.projectId,
      latestMajor: parseInt(this.selectedVersion?.split('.')[0] ?? 0),
      latestMinor: parseInt(this.selectedVersion?.split('.')[1] ?? 1)
    }).subscribe({
      next: (res: any) => {
        if (res.code == "OK") {
          this.selectedDocumentCategoryList = res.data.list.map(((category: any) => {
            category.requirements = category.requirements.filter((requirement: any) => requirement.isApproved);
            return category;
          }));
          this.setDocumentCKEditor();
        }
      },
      error: (err: any) => {
        console.error('Error while getting category list for doc', err);
      }
    });

    // @ts-ignore
    const editor = window.editor;
    if (!editor) {
      setTimeout(() => {
        // @ts-ignore
        CKEDITOR.ClassicEditor.create(document.querySelector('.document-editor__editable'), {
          ...CkEditorConfig.config,
          ...CkEditorConfig.documentOutline
        }).then((editor: any) => {
          const toolbarContainer = document.querySelector('.document-editor__toolbar');
          if (toolbarContainer) {
            toolbarContainer.appendChild(editor.ui.view.toolbar.element);
          }
          // @ts-ignore
          window.editor = editor;
          // editor.filter.check( 'li' ); // -> true (thanks to Format combo)
          // editor.filter.check( 'ol' ); // -> true (thanks to extraAllowedContent)
        }).catch((error: any) => {
          console.log(error);
        });
      }, 100);
    }
  }

  onOpenConfirmMigrationModal() {
    this._facadeService.modalService.toggleModal('documentMigrationModal');
  }

  onConfirmMigrateVersion(): void {
    if (!this.selectedDocument || !this.projectDetails._id) return;
    const body = {
      // @ts-ignore
      html: window.editor?.getData(),
      templateId: this.selectedDocument._id,
      projectId: this.projectDetails._id
    };

    if (!body.html) {
      return;
    }

    this._facadeService.documentService.migrateVersion(body).subscribe({
      next: (res: any) => {
        if (res.code === "OK") {
          this.selectedDocument.versions = res.data.templateVersion;
          this.versionOptions = this.selectedDocument.versions.map((version: any) => version.majorMinorCombination).sort((versionA: string, versionB: string) => parseFloat(versionA) - parseFloat(versionB));
          this.selectedVersion = this.versionOptions[this.versionOptions.length - 1];
          this.selectedDocument.latestMajor = parseInt(this.selectedVersion.split('.')[0] ?? 0);
          this.selectedDocument.latestMinor = parseInt(this.selectedVersion.split('.')[1] ?? 1);
          this.selectedDocumentCategoryList = res.data.list?.map(((category: any) => {
            category.requirements = category.requirements.filter((requirement: any) => requirement.isApproved);
            return category;
          }));
          this._facadeService.appService.openToaster('Migration has been done successfully.', 'success');
          this.setDocumentCKEditor();
        }
        this._facadeService.modalService.closeModal('documentMigrationModal');
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }

  onCancelMigrateVersion() {
    this._facadeService.modalService.closeModal('documentMigrationModal');
  }

  ngOnDestroy(): void {
    this._facadeService.modalService.unregisterModal('signDocumentModal');
    this._facadeService.modalService.unregisterModal('documentMigrationModal');
    //@ts-ignore
    window.editor = null;
  }

}
