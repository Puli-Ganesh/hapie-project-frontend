import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Permissions } from '@src/app/constants/permissions';
import { StorageKeys } from '@src/app/constants/storage-keys';
import { FacadeService } from '@src/app/services/facade.service';

type TViewType = 't' | 'g';

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss']
})
export class WorkflowComponent implements OnInit {

  constructor(
    private _facadeService: FacadeService,
    private _router: Router
  ) {
    // this.workspaceId = localStorage.getItem(StorageKeys.WORKSPACE_ID) ?? '';
    this.viewType = 'g';
    // this.viewType = (sessionStorage.getItem(StorageKeys.SST.PROJECT_VIEW_TYPE) as TViewType) ?? 'g';
    // if (!['t', 'g'].includes(this.viewType)) {
    //   this.viewType = 't';
    // }
  }

  viewType!: TViewType;
  protected readonly permissions = Permissions;
  loggedInUser: any = null;

  ngOnInit(): void {
    this.loggedInUser = this._facadeService.authService.getCurrentUser();
    this.getWorkflowList();
  }

  protected searchQuery: string = '';
  protected workflowList: Array<any> = [];
  protected filteredWorkflowList: Array<any> = [];

  getWorkflowList() {
    this._facadeService.workflowService.getList().subscribe({
      next: (res: any) => {
        console.log(res);
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


  onSelectProject(index: number) {
    // const projectData = this.projectList[index];
    // if (projectData) {
    //   localStorage.setItem(StorageKeys.PROJECT_ID, projectData._id);
    //   localStorage.setItem(StorageKeys.PROJECT_NAME, projectData.projectName);
    //   localStorage.setItem(StorageKeys.PROJECT_COLOR, projectData.color);
    //   let userData: any = localStorage.getItem(StorageKeys.USER_INFORMATION);
    //   if (userData) {
    //     userData = JSON.parse(userData) ?? {};
    //     const asMember = projectData.members.find((m: any) => m.userId == userData._id);
    //     userData.color = asMember?.color ?? 1;
    //     localStorage.setItem(StorageKeys.USER_INFORMATION, JSON.stringify(userData));
    //   }

    //   // if (this.isSystemOwner) {
    //   //   localStorage.setItem(StorageKeys.WORKSPACE_ID, projectData.workspaceId);
    //   // }
    //   this._router.navigateByUrl(this.appRoutes.PROJECT_MEDIA);
    // }
  }

  onEditWorkflow(index: number) {
    console.log(index);
    const workflowId = this.filteredWorkflowList[index]._id;
    // console.log(workflowId);
    if (workflowId) {
      this._router.navigate(['/workflow/details', workflowId]);
    }
  }

  onDeleteWorkflow(index: number) {
    const workflowId = this.filteredWorkflowList[index]._id;
    this._facadeService.workflowService.deleteById(workflowId).subscribe({
      next: (res: any) => {
        this._facadeService.appService.openToaster('Workflow deleted successfully', 'success');
        this.filteredWorkflowList.splice(index, 1);
      },
      error: (err: any) => {
        this._facadeService.appService.openToaster('Workflow delete failed', 'danger');
      }
    });
  }


}
