import { Component, OnInit } from '@angular/core';
import { CkEditorConfig } from '@src/app/constants/ckEditorConfig';
import { Permissions } from '@src/app/constants/permissions';
import { FacadeService } from '@src/app/services/facade.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss']
})
export class DocumentComponent implements OnInit {

  constructor(
    private _facadeService: FacadeService
  ) {
    this.currentUser = this._facadeService.authService.getCurrentUser();

    this.projectDetailsSubscription = this._facadeService.projectService.projectDetails$.subscribe({
      next: (details: any) => {
        this.projectDetails = details;
        this.getTemplateList();
      }
    });
  }

  projectDetailsSubscription: Subscription;
  projectDetails: any;

  permissions = Permissions;
  currentUser: any;
  isUploading = false;
  selectedNodeId: number | null = null;

  templateList: any = [];
  filteredTemplateList: any = []
  templateNodes: any = [];
  docVersionDropdownToggler = false;
  selectedVersion = '';
  versionOptions = [];
  selectedDocument: any = null;
  selectedDocumentCategoryList: Array<any> = [];

  ngOnInit(): void {
    this.getTemplateList();
  }

  onGoBack() {
    this.selectedDocument = null;
  }

  onSaveTemplate() {
    console.log('saving')
  }

  onSignDocument() {

  }

  onToggleDocVersionDropdown() {
    this.docVersionDropdownToggler = !this.docVersionDropdownToggler;
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

  onSelectDocVersion(version: any) {
    this.selectedVersion = version;
    this.setDocumentView();
    this.docVersionDropdownToggler = false;
  }

  getTemplateList() {
    if (this.projectDetails?._id) {
      this._facadeService.templateService.getListByProjectId(this.projectDetails._id).subscribe({
        next: (res: any) => {
          console.log(res)
          if (this.projectDetails?.workflowId?.nodes) {
            this.templateNodes = this.projectDetails.workflowId.nodes.filter((n: any) => n.app == 'Document');
            if (this.templateNodes.length) {
              this.selectedNodeId = this.templateNodes[0].id;
            }
            this.templateList = res.data.list.map((temp: any) => {
              temp.uploadedOn = moment(temp.createdAt).format('DD MMMM YYYY')
              return temp;
            })
            this.onSelectTemplate();
          }
        }
      });
    }
  }

  onManageDocument(docIndex: number) {
    this.selectedDocument = this.filteredTemplateList[docIndex];
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



  onSelectTemplate() {
    if (this.selectedNodeId != null) {
      this.filteredTemplateList = this.templateList.filter((template: any) => template.nodeId == this.selectedNodeId);
    }
  }

  onUploadClick() {
    this.isUploading = true;
  }


}
