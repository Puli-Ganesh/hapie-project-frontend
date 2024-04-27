import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Clipboard } from '@angular/cdk/clipboard';
import { Router } from '@angular/router';

import * as _ from 'lodash';
import * as moment from 'moment';

import { CkEditorConfig } from '@src/app/constants/ckEditorConfig';
import { Regex } from '@src/app/constants/regex';
import { Routes } from '@src/app/constants/routes';
import { StorageKeys } from '@src/app/constants/storage-keys';
import { FacadeService } from '@src/app/services/facade.service';
import { IResponse } from '@src/interfaces/response.interface';
import { Permissions } from '@src/app/constants/permissions';


type TViewType = 't' | 'g';


@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent implements OnInit, OnDestroy {

  constructor(
    private _router: Router,
    private _facadeService: FacadeService,
    private _formBuilder: FormBuilder,
    private _clipboard: Clipboard
  ) {
    this.projectId = localStorage.getItem(StorageKeys.PROJECT_ID) ?? '';
    this.projectName = localStorage.getItem(StorageKeys.PROJECT_NAME) ?? '';
    this.projectColor = localStorage.getItem(StorageKeys.PROJECT_COLOR) ?? 1;

    this.signDocumentForm = this._formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.pattern(Regex.EMAIL)]]
    });
  }

  protected projectId: string;
  protected projectName: any;
  protected projectColor: any;
  protected selectedTab: number = 1;

  protected documentList: Array<any> = [];
  protected filteredDocumentList: Array<any> = [];
  protected selectedDocument: any = null;
  protected selectedDocumentCategoryList: Array<any> = [];
  protected templatesList: Array<any> = [];
  protected filteredTemplatesList: Array<any> = [];
  protected selectedTemplate: any = null;
  protected selectedTemplateForDelete: any;

  protected docSearchQuery: string = '';
  /** Document display type
   * t(table view), g(grid/box view) */
  protected docViewType: TViewType = 't';
  protected tplSearchQuery: string = '';
  /** Template display type
   * t(table view), g(grid/box view) */
  protected tplViewType: TViewType = 't';
  protected searchQueryDebounceTimeoutId: any;

  protected isPreparingCKEditorForTemplate: boolean = true;
  protected isUploading: boolean = false;
  protected signDocumentForm: FormGroup;

  protected currentUser: any;
  protected readonly permissions = Permissions;

  ngOnInit(): void {
    this._facadeService.modalService.registerModal('signDocumentModal');
    this._facadeService.modalService.registerModal('deleteTemplateModal');
    this.currentUser = this._facadeService.authService.getCurrentUser();
    this.getTemplatesList();
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

  getTemplatesList() {
    this._facadeService.templateService.getListByProjectId(this.projectId).subscribe({
      next: (res: any) => {
        this.templatesList = res.data.list.map((template: any) => {
          template.uploadedOn = moment(template.createdAt).format('DD MMMM YYYY');
          template.createdBy = `${template.createdBy.firstName} ${template.createdBy.lastName}`
          return template;
        });
        this.filteredTemplatesList = _.cloneDeep(this.templatesList);
        this.documentList = _.cloneDeep(this.templatesList.filter((template: any) => template.latestMajor !== 0 && template.latestMinor !== 0));
        this.filteredDocumentList = _.cloneDeep(this.documentList);

        /** filter if updated or deleted record something */
        switch (this.selectedTab) {
          case 1:
            if (this.docSearchQuery) this.onDocSearchQuery(this.docSearchQuery);
            break;
          case 2:
            if (this.tplSearchQuery) this.onTplSearchQuery(this.tplSearchQuery);
            break;
        }
      }
    });
  }

  // onGoToProjects() {
  //   this._router.navigateByUrl(Routes.PROJECTS);
  // }
  // onGoToProject() {
  //   this._router.navigateByUrl(Routes.PROJECT_PROFILE);
  // }

  onGoToDocumentsOrTemplates() {
    this.resetCKEditorFromWindow();
    this.selectedTab = 1;
  }
  onGoToTemplates() {
    this.resetCKEditorFromWindow();
  }

  resetCKEditorFromWindow() {
    //@ts-ignore
    if (window.editor) {
      switch (this.selectedTab) {
        case 1:
          if (this.selectedDocument) this.selectedDocument = null;
          if (this.selectedDocumentCategoryList?.length) this.selectedDocumentCategoryList = [];
          break;
        case 2:
          if (this.selectedTemplate) this.selectedTemplate = null;
          break;
      }
      //@ts-ignore
      if (window.editor) delete window.editor;
    }
  }

  onUploadClick() {
    this.isUploading = true;
  }

  onManageTemplate(templateIndex: number) {
    const template = this.filteredTemplatesList[templateIndex];
    if (template) {
      this.selectedTemplate = template;

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
          //       editor.filter.check( 'ol' ); // -> true (thanks to extraAllowedContent)
          // @ts-ignore
          window.editor.setData(this.selectedTemplate.html);
          this.isPreparingCKEditorForTemplate = false;
        }).catch((error: any) => {
          console.log(error);
        });
      }, 100);
    }
  }

  onSaveTemplate() {
    if (this.selectedTemplate && this.isPreparingCKEditorForTemplate === false) {
      const body: any = {
        //@ts-ignore
        html: window.editor.getData()
      };
      this._facadeService.templateService.updateById(this.selectedTemplate._id, body).subscribe({
        next: (res: any) => {
          if (res.code === "OK") {
            if (res.data?._id) {
              this.getTemplatesList();
            }
            this._facadeService.appService.openToaster('Saved', 'success');
          }
        },
        error: (err: any) => {
          console.error('Error while save changes on template.', err);
        }
      });
    }
  }

  onSignDocument() {
    this._facadeService.modalService.openModal('signDocumentModal');
  }

  protected isGenerating: boolean = false;
  protected signLink: string = '';

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
        this._facadeService.appService.openToaster('Link generated successfully', 'success');
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

  onDeleteTemplate(templateId: string) {
    this._facadeService.templateService.deleteById(templateId).subscribe({
      next: (res: any) => {
        this.getTemplatesList();
        this.selectedTemplateForDelete = null;
        this._facadeService.modalService.closeModal('deleteTemplateModal');
      },
      error: (err: any) => {
        console.log('There is an error while deleting template', err);
      }
    });
  }

  onDeleteTemplateModal(event: Event, templateIndex: number) {
    event?.stopPropagation();
    const template = this.filteredTemplatesList[templateIndex];
    if (template) {
      this.selectedTemplateForDelete = template;
      this._facadeService.modalService.openModal('deleteTemplateModal');
    }
  }

  onDeleteTemplateModalClose(event: boolean) {
    if (event) {
      this.selectedTemplateForDelete = null;
    }
  }

  onNotNowDeleteTemplate() {
    this.selectedTemplateForDelete = null;
    this._facadeService.modalService.closeModal('deleteTemplateModal');
  }

  onCloseModal(event: any) {
    this.isUploading = false;
  }

  onDocumentUpdated(event: boolean) {
    if (event) {
      this.isUploading = false;
      this.getTemplatesList();
    }
  }

  protected docVersionDropdownToggler: boolean = false;
  protected selectedVersion: string = '';
  protected versionOptions = [];

  onManageDocument(docIndex: number) {
    this.selectedDocument = this.filteredDocumentList[docIndex];
    this.versionOptions = this.selectedDocument.versions.map((version: any) => version.majorMinorCombination).sort((versionA: any, versionB: any) => +versionA - +versionB);
    this.selectedVersion = this.versionOptions[this.versionOptions.length - 1];

    this.setDocumentView();
  }

  setDocumentView() {
    if (!this.selectedDocument) return;

    this._facadeService.documentService.categoryList({
      templateId: this.selectedDocument._id,
      projectId: this.selectedDocument.projectId,
      latestMajor: +this.selectedVersion.split('.')[0],
      latestMinor: +this.selectedVersion.split('.')[1]
    }).subscribe({
      next: (res: IResponse) => {
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

  onToggleDocVersionDropdown() {
    this.docVersionDropdownToggler = !this.docVersionDropdownToggler;
  }

  onSelectDocVersion(version: any) {
    this.selectedVersion = version;
    this.setDocumentView();
    this.docVersionDropdownToggler = false;
  }

  setDocumentCKEditor() {
    const rawTemplate = this.selectedDocument.html
      ?.replace(/<p/g, '\n<p')?.replace(/<\/p>/g, '<\/p>\n')
      ?.replace(/<li/g, '\n<li')?.replace(/<\/li>/g, '<\/li>\n')
      ?.replace(/<ul/g, '\n<ul')?.replace(/<\/ul>/g, '<\/ul>\n')
      ?.replace(/<ol/g, '\n<ol')?.replace(/<\/ol>/g, '<\/ol>\n') || '';
    const rawTemplateLines = rawTemplate.split(/\n+/);
    const titleAndPromptRegex = (/{[\w\/ -?@]+[\[]+.*?[\]]+}/g);
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
                  requirementsHtmlStr += `<li><p>${category.requirements[i].requirement}</p></li>`;
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
          templateHtml += line;
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

  // protected docVersionDropdownToggler: boolean = false;
  // onToggleDocVersionDropdown(): void {
  //   this.docVersionDropdownToggler = !this.docVersionDropdownToggler;
  // }

  // protected templateList: Array<any> = [];
  // onSelectDocVersion(template: any): void {
  //   if (this.selectedTemplate?._id === template?._id) {
  //     return;
  //   }
  //   this.selectedTemplate = template;
  //   this.docVersionDropdownToggler = false;
  // }

  onDocSearchQuery(event: Event | string) {
    if (this.searchQueryDebounceTimeoutId) clearTimeout(this.searchQueryDebounceTimeoutId);

    this.searchQueryDebounceTimeoutId = setTimeout(() => {
      this.filteredDocumentList = this.documentList.filter((doc: any) => doc.title.toLowerCase().includes(this.docSearchQuery.toLowerCase()));
    }, 300);
  }

  onDocChangeView() {
    this.docViewType = (this.docViewType === 't' ? 'g' : 't');
  }

  onTplSearchQuery(event: Event | string) {
    if (this.searchQueryDebounceTimeoutId) clearTimeout(this.searchQueryDebounceTimeoutId);

    this.searchQueryDebounceTimeoutId = setTimeout(() => {
      this.filteredTemplatesList = this.templatesList.filter((tpl: any) => tpl.title.toLowerCase().includes(this.tplSearchQuery.toLowerCase()));
    }, 300);
  }

  onTplChangeView() {
    this.tplViewType = (this.tplViewType === 't' ? 'g' : 't');
  }

  ngOnDestroy(): void {
    // @ts-ignore
    window.editor = null;
    this._facadeService.modalService.unregisterModal('deleteTemplateModal');
    this._facadeService.modalService.unregisterModal('signDocumentModal');
  }

}
