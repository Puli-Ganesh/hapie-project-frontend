import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CkEditorConfig } from '@src/app/constants/ckEditorConfig';
import { Permissions } from '@src/app/constants/permissions';
import { Routes } from '@src/app/constants/routes';
import { FacadeService } from '@src/app/services/facade.service';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.scss']
})
export class TemplateComponent implements OnInit, OnDestroy {

  constructor(
    private _facadeService: FacadeService,
    private _router: Router
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
  selectedTemplate: any;
  deleteTemplateId: string | null = null;
  appRoutes = Routes;
  defaultTemplateId = '';

  ngOnInit(): void {
    this.getTemplateList();
    this._facadeService.modalService.registerModal('deleteTemplateModal');
  }

  onGoBack() {
    this.selectedTemplate = null;
  }

  onExit() {
    this._router.navigate([this.appRoutes.PROJECTS]);
  }

  onSaveTemplate() {
    // @ts-ignore
    const html = window.editor.getData();
    if (html) {
      this._facadeService.templateService.updateById(this.selectedTemplate._id, { html: html }).subscribe({
        next: (res: any) => {
          if (res.code === "OK") {
            this._facadeService.appService.openToaster('Saved', 'success');
            this.getTemplateList();
          }
        },
        error: (err: any) => {
          console.error('Error while save changes on template.', err.error);
        }
      });
    }
  }

  onDeleteTemplate(index: number) {
    this.deleteTemplateId = this.filteredTemplateList[index]._id;
    this._facadeService.modalService.openModal('deleteTemplateModal');
  }

  onDeleteConfirm() {
    
    if (this.deleteTemplateId) {
      this._facadeService.templateService.deleteById(this.deleteTemplateId).subscribe({
        next: (res: any) => {
          this._facadeService.modalService.closeModal('deleteTemplateModal');
          this.getTemplateList();
          this.deleteTemplateId = null;
        },
        error: (err: any) => {
          console.error('There is an error while deleting template', err.error);
        }
      });
    }
  }

  onDeleteCancel() {
    this.deleteTemplateId = null;
  }

  onCloseModal() {
    this.isUploading = false;
  }

  onDocumentUpdated(event: any) {
    if (event) {
      this.getTemplateList();
    }
    this.isUploading = false;
  }

  getTemplateList() {
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
    this.filteredTemplateList = this.templateList.filter((template: any) => template.nodeId == this.selectedNodeId);
    const defaultTemplate = this.templateList.find((template: any) => template.nodeId == this.selectedNodeId && template.isDefault);
    if (defaultTemplate) {
      this.defaultTemplateId = defaultTemplate._id;
    }
  }

  onMakeDefault(templateId: any) {
    const body = {
      templateId: templateId
    }
    this._facadeService.templateService.setDefaultTemplate(body).subscribe({
      next: (res: any) => {
        this.getTemplateList();
      }
    })
  }

  onViewTemplate(index: number) {
    console.log(this.filteredTemplateList[index]);
    this.selectedTemplate = this.filteredTemplateList[index]

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

  onSelectTemplate() {
    if (this.selectedNodeId != null) {
      this.filteredTemplateList = this.templateList.filter((template: any) => template.nodeId == this.selectedNodeId);
    }
  }

  onUploadClick() {
    this.isUploading = true;
  }


  ngOnDestroy(): void {
    this._facadeService.modalService.unregisterModal('deleteTemplateModal')
  }

}
