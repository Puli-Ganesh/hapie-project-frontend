import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Permissions } from '@src/app/constants/permissions';
import { Routes } from '@src/app/constants/routes';
import { StorageKeys } from '@src/app/constants/storage-keys';
import { FacadeService } from '@src/app/services/facade.service';

type TViewType = 't' | 'g';

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss']
})
export class WorkflowComponent implements OnInit, OnDestroy {

  constructor(
    private _facadeService: FacadeService,
    private _router: Router,
    private _fb: FormBuilder
  ) {
    // this.workspaceId = localStorage.getItem(StorageKeys.WORKSPACE_ID) ?? '';
    this.viewType = 'g';
    // this.viewType = (sessionStorage.getItem(StorageKeys.SST.PROJECT_VIEW_TYPE) as TViewType) ?? 'g';
    // if (!['t', 'g'].includes(this.viewType)) {
    //   this.viewType = 't';
    // }

    this.workflowForm = this._fb.group({
      name: ['', [
        Validators.required
      ]],
      description: ['', [
        Validators.required
      ]]
    });
  }

  appRoutes = Routes;
  viewType!: TViewType;
  protected readonly permissions = Permissions;
  loggedInUser: any = null;
  query = '';

  workflowForm: FormGroup;

  ngOnInit(): void {
    this.loggedInUser = this._facadeService.authService.getCurrentUser();
    this.getWorkflowList();
    this._facadeService.modalService.registerModal('createWorkflowModal');
    this._facadeService.modalService.registerModal('deleteWorkflowModal');
  }

  get name(): FormControl {
    return this.workflowForm.get('name') as FormControl;
  }

  get description(): FormControl {
    return this.workflowForm.get('description') as FormControl;
  }

  protected searchQuery: string = '';
  protected workflowList: Array<any> = [];
  selectedWorkflow: any = null;
  protected filteredWorkflowList: Array<any> = [];

  getWorkflowList() {
    this._facadeService.workflowService.getList().subscribe({
      next: (res: any) => {
        if (res.code == 'OK') {
          this.filteredWorkflowList = res.data.list;
        }
      }
    });
  }

  onAddNewWorkflow() {
    this._router.navigate(['/workflow/details/new']);
  }

  onSearchQuery(event: Event | string) {
    // if (this.onSearchQueryDebounceTimeoutId) clearTimeout(this.onSearchQueryDebounceTimeoutId);

    // this.onSearchQueryDebounceTimeoutId = setTimeout(() => {
    //   this.filteredProjectList = this.projectList.filter(project => project.projectName.toLowerCase().includes(this.searchQuery.toLowerCase()));
    // }, (event ? 300 : 0));
  }

  onChangeView() {
    this.viewType = (this.viewType === 't' ? 'g' : 't');
    sessionStorage.setItem(StorageKeys.SST.PROJECT_VIEW_TYPE, this.viewType);
  }

  onCreateWorkflow() {
    this._facadeService.modalService.openModal('createWorkflowModal')
  }

  onEditWorkflow(index: number) {
    const workflowId = this.filteredWorkflowList[index]._id;
    if (workflowId) {
      this._router.navigate([this.appRoutes.WORKFLOWS, 'details', workflowId]);
    }
  }

  onDeleteWorkflow(index: number) {
    this.selectedWorkflow = this.filteredWorkflowList[index];
    this._facadeService.modalService.openModal('deleteWorkflowModal');
  }

  onConfirmCreate() {
    if (!this.workflowForm.valid) {
      this.workflowForm.markAllAsTouched();
      return;
    }

    const body = {
      name: this.workflowForm.value.name,
      description: this.workflowForm.value.description,
    }
    this._facadeService.workflowService.create(body).subscribe({
      next: (res: any) => {
        this.workflowForm.reset();
        this._facadeService.modalService.closeModal('createWorkflowModal')
        this._facadeService.appService.openToaster('Workflow successfully created.', 'success');
        this._router.navigate([this.appRoutes.WORKFLOWS, 'details', res.data._id]);
      },
      error: (err: any) => {
        console.log('There is an error while creating workflow', err);
        this._facadeService.appService.openToaster('Workflow creation failed.', 'danger');
      }
    });
  }

  onCancelCreate() {
    this._facadeService.modalService.closeModal('createWorkflowModal');
    this.workflowForm.reset();
  }

  onCancelDelete() {
    this._facadeService.modalService.closeModal('deleteWorkflowModal')
  }

  onConfirmDelete() {
    const workflowId = this.selectedWorkflow?._id;
    if (!workflowId) return;
    
    this._facadeService.workflowService.deleteById(workflowId).subscribe({
      next: (res: any) => {
        this.workflowList = this.workflowList.filter((wf:any) => wf._id != workflowId);
        this.filteredWorkflowList = this.filteredWorkflowList.filter((wf:any) => wf._id != workflowId);
        this._facadeService.modalService.closeModal('deleteWorkflowModal');
        this._facadeService.appService.openToaster('Workflow deleted successfully', 'success');
      },
      error: (err: any) => {
        this._facadeService.appService.openToaster('Workflow delete failed', 'danger');
      }
    });
  }

  ngOnDestroy(): void {
    this._facadeService.modalService.unregisterModal('createWorkflowModal')
    this._facadeService.modalService.unregisterModal('deleteWorkflowModal')
  }

}
