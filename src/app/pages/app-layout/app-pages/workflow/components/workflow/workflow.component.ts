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
    this.viewType = (sessionStorage.getItem(StorageKeys.SST.WORKFLOW_VIEW_TYPE) as TViewType) ?? 'g';
    if (!['t', 'g'].includes(this.viewType)) {
      this.viewType = 'g';
      sessionStorage.setItem(StorageKeys.SST.WORKFLOW_VIEW_TYPE, this.viewType);
    }

    this.workflowForm = this._fb.group({
      name: ['', [
        Validators.required
      ]],
      description: ['', [
        Validators.required
      ]]
    });
  }

  protected readonly appRoutes = Routes;
  protected viewType: TViewType = 'g';
  protected readonly permissions = Permissions;
  protected loggedInUser: any = null;

  protected workflowForm: FormGroup;

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

  protected workflowList: Array<any> = [];
  protected selectedWorkflow: any = null;
  protected filteredWorkflowList: Array<any> = [];
  protected searchQuery: string = '';
  protected onSearchQueryDebounceTimeoutId: any;

  getWorkflowList() {
    this._facadeService.workflowService.getAggregateList().subscribe({
      next: (res: any) => {
        if (res.code == 'OK') {
          this.workflowList = res.data.list?.map((item: any) => {
            item.projects = item.projects.map(({ projectName }: any) => projectName).join(', ');
            return item;
          }) ?? [];
          this.filteredWorkflowList = [...this.workflowList];
        }
      }
    });
  }

  onAddNewWorkflow() {
    this._router.navigate(['/workflow/details/new']);
  }

  onSearchQuery(event: Event | string) {
    if (this.onSearchQueryDebounceTimeoutId) clearTimeout(this.onSearchQueryDebounceTimeoutId);

    this.onSearchQueryDebounceTimeoutId = setTimeout(() => {
      this.filteredWorkflowList = this.workflowList.filter(workflow => workflow.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
    }, (event ? 300 : 0));
  }

  onChangeView() {
    this.viewType = (this.viewType === 't' ? 'g' : 't');
    sessionStorage.setItem(StorageKeys.SST.WORKFLOW_VIEW_TYPE, this.viewType);
  }

  onCreateWorkflow() {
    this._facadeService.modalService.openModal('createWorkflowModal');
  }

  onViewWorkflow(index: number) {
    const workflowId = this.filteredWorkflowList[index]?._id;
    if (workflowId) {
      this._router.navigate([this.appRoutes.WORKFLOW_DETAILS, workflowId], { state: { isCreating: false } });
    }
  }

  onEditWorkflow(index: number) {
    const workflowId = this.filteredWorkflowList[index]._id;
    if (workflowId) {
      this._router.navigate([this.appRoutes.WORKFLOWS, 'details', workflowId]);
    }
  }

  onDeleteWorkflow(event: Event, index: number) {
    if (event.stopPropagation) {
      event.stopPropagation()
    }
    const ele = document.getElementById('workflowContainer');
    ele?.scroll({ top: 0 });
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
    };
    this._facadeService.workflowService.create(body).subscribe({
      next: (res: any) => {
        this.workflowForm.reset();
        this._facadeService.modalService.closeModal('createWorkflowModal');
        this._facadeService.appService.openToaster('Workflow successfully created.', 'success');
        this._router.navigate([this.appRoutes.WORKFLOW_DETAILS, res.data._id], { state: { isCreating: true } });
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
        this.workflowList = this.workflowList.filter((wf: any) => wf._id != workflowId);
        this.filteredWorkflowList = this.filteredWorkflowList.filter((wf: any) => wf._id != workflowId);
        this._facadeService.modalService.closeModal('deleteWorkflowModal');
        this._facadeService.appService.openToaster('Workflow deleted successfully', 'success');
      },
      error: (err: any) => {
        this._facadeService.appService.openToaster('Workflow delete failed', 'danger');
      }
    });
  }

  ngOnDestroy(): void {
    ;
    this._facadeService.modalService.unregisterModal('createWorkflowModal');
    this._facadeService.modalService.unregisterModal('deleteWorkflowModal');
  }

}
