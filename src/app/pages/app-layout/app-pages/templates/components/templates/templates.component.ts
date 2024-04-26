import { Component, OnDestroy, OnInit } from '@angular/core';

import { CkEditorConfig } from '@src/app/constants/ckEditorConfig';
import { Permissions } from '@src/app/constants/permissions';
// import { StorageKeys } from '@src/app/constants/storage-keys';
import { FacadeService } from '@src/app/services/facade.service';
import * as moment from 'moment';


@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss']
})
export class TemplatesComponent implements OnInit, OnDestroy {

  constructor(
    private _facadeService: FacadeService
  ) {
    // this.projectColor = localStorage.getItem(StorageKeys.PROJECT_COLOR) ?? 1;
    this.currentUser = this._facadeService.authService.getCurrentUser();
  }

  protected readonly permissions = Permissions;
  protected currentUser: any;

  // protected projectColor: any;
  protected projectsList: Array<any> = [];
  protected selectedProjectId: string = 'workspace';
  protected templatesList: Array<any> = [];
  protected displayTemplatesList: Array<any> = [];
  protected filteredDisplayTemplateList: Array<any> = [];
  protected selectedTemplate: any;
  protected selectedTemplateForDelete: any;
  protected isUploading: boolean = false;

  protected searchQuery: string = '';
  protected onSearchQueryDebounceTimeoutId: any;


  ngOnInit(): void {
    this.getProjectsList();
    this.getTemplatesList();
    this._facadeService.modalService.registerModal('deleteTemplateModal');
  }

  getProjectsList() {
    this._facadeService.projectService.getList().subscribe({
      next: (res: any) => {
        this.projectsList = res.data.projects;
      },
      error: (err: any) => {
        console.error('There is an error while fetching projects', err.error);
      }
    })
  }

  getTemplatesList() {
    this._facadeService.templateService.getList().subscribe({
      next: (res: any) => {
        if (res.data.list) {
          this.templatesList = res.data.list.map((temp: any) => {
            temp.uploadedOn = moment(temp.createdAt).format('DD MMMM YYYY')
            return temp;
          });
        }
        this.setDisplayTemplates();
      },
      error: (err: any) => {
        console.error('There is an error while fetching projects', err.error);
      }
    })
  }

  setDisplayTemplates() {
    if (this.selectedProjectId == 'workspace') {
      this.displayTemplatesList = this.templatesList.filter((template: any) => !template.projectId);
      this.filteredDisplayTemplateList = this.templatesList.filter((template: any) => !template.projectId);
    } else {
      this.displayTemplatesList = this.templatesList.filter((template: any) => template?.projectId == this.selectedProjectId);
      this.filteredDisplayTemplateList = this.templatesList.filter((template: any) => template?.projectId == this.selectedProjectId);
    }
    if (this.searchQuery) {
      this.onSearchQuery('');
    }
  }

  onSelectProject(projectId: string) {
    this.selectedProjectId = projectId;
    if (this.searchQuery) this.searchQuery = '';
    this.setDisplayTemplates();
  }

  onManageTemplate(templateId: string) {
    const template = this.templatesList.find((temp: any) => temp._id == templateId);
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
        }).catch((error: any) => {
          console.error(error);
        });
      }, 100);
    }
  }

  onDeleteTemplateModal(event: Event, templateIndex: number) {
    event?.stopPropagation();
    const template = this.filteredDisplayTemplateList[templateIndex];
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

  onDeleteTemplate(templateId: string) {
    this._facadeService.templateService.deleteById(templateId).subscribe({
      next: (res: any) => {
        this._facadeService.modalService.closeModal('deleteTemplateModal');
        this.getTemplatesList();
      },
      error: (err: any) => {
        console.error('There is an error while deleting template', err.error);
      }
    });
  }

  onGoBack() {
    this.selectedTemplate = null;
  }

  onSaveTemplate() {
    // @ts-ignore
    if (!window.editor.getData()) {
      return;
    }

    if (this.selectedTemplate) {
      const body: any = {
        //@ts-ignore
        html: window.editor.getData()
      };
      this._facadeService.templateService.updateById(this.selectedTemplate._id, body).subscribe({
        next: (res: any) => {
          if (res.code === "OK") {
            this._facadeService.appService.openToaster('Saved', 'success');
            if (res.data?._id) {
              this.getTemplatesList();
            }
          }
        },
        error: (err: any) => {
          console.error('Error while save changes on template.', err.error);
        }
      });
    }
  }

  onUploadClick() {
    this.isUploading = true;
  }

  onCloseModal(event: any) {
    this.isUploading = false;
  }

  onDocumentUpdated(event: any) {
    if (event) {
      this.isUploading = false;
      this.getTemplatesList();
    }
    this.isUploading = false;
  }

  onSearchQuery(event: Event | string) {
    if (this.onSearchQueryDebounceTimeoutId) clearTimeout(this.onSearchQueryDebounceTimeoutId);

    this.onSearchQueryDebounceTimeoutId = setTimeout(() => {
      this.filteredDisplayTemplateList = this.displayTemplatesList.filter((item: any) => item.title.toLowerCase().includes(this.searchQuery.toLowerCase()));
    }, (!!event ? 300 : 0));
  }

  ngOnDestroy(): void {
    // @ts-ignore
    window.editor = null;

    this._facadeService.modalService.unregisterModal('deleteTemplateModal');
  }

}
