import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { FacadeService } from '@src/app/services/facade.service';
import { Permissions } from '@src/app/constants/permissions';
import { Roles } from '@src/app/constants/roles';
import { Routes } from '@src/app/constants/routes';
import { StorageKeys } from '@src/app/constants/storage-keys';
import { IResponse } from '@src/interfaces/response.interface';
import { Subscription } from 'rxjs';

type TViewType = 't' | 'g';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit, OnDestroy {

  constructor(
    private _router: Router,
    private _facadeService: FacadeService,
  ) {
    this.projectsSubscription = this._facadeService.projectService.projectsList$.subscribe({
      next: (projects: any) => {
        this.projectList = [...projects];
        this.filteredProjectList = [...projects];
      }
    });

    this.viewType = (sessionStorage.getItem(StorageKeys.SST.PROJECT_VIEW_TYPE) as TViewType) ?? 'g';
    if (!['t', 'g'].includes(this.viewType)) {
      this.viewType = 'g';
    }
  }

  projectsSubscription!: Subscription;
  protected readonly permissions = Permissions;

  protected readonly userRoles = Roles;
  protected readonly appRoutes = Routes;

  protected isRequestAlive: boolean = false;

  protected projectList: Array<any> = [];
  protected filteredProjectList: Array<any> = [];
  protected selectedProject!: any;
  protected isProjectUpserting: boolean = false;

  protected searchQuery: string = '';
  protected onSearchQueryDebounceTimeoutId: any;
  /** Project display type
   * t(table view), g(grid/box view) */
  protected viewType!: TViewType;

  protected loggedInUser: any;

  ngOnInit(): void {
    // this.getProjectList();
    this.loggedInUser = this._facadeService.authService.getCurrentUser();
    this._facadeService.projectService.updateProjectsList();
    if (this.loggedInUser) {
    }
    this._facadeService.modalService.registerModal('projectCreateModal');
    this._facadeService.modalService.registerModal('deleteProjectModal');
  }

  getProjectList() {
    this.isRequestAlive = true;
    if (!this.loggedInUser) {
      this.loggedInUser = this._facadeService.authService.getCurrentUser();
    }

    this._facadeService.projectService.getListByUserId(this.loggedInUser._id).subscribe({
      next: (res: IResponse) => {
        this.isRequestAlive = false;
        if (res.code === "OK" && ('projects' in res.data)) {
          this.projectList = res.data.projects;
          this.filteredProjectList = [...this.projectList];
        }
      },
      error: (err: any) => {
        this.isRequestAlive = false;
        console.error('There is an error while fetching projects list', err.error);
      }
    });
  }

  onSelectProject(index: number) {
    const projectData = this.projectList[index];
    if (projectData) {
      // localStorage.setItem(StorageKeys.PROJECT_ID, projectData._id);
      // localStorage.setItem(StorageKeys.PROJECT_NAME, projectData.projectName);
      // localStorage.setItem(StorageKeys.PROJECT_COLOR, projectData.color);
      this._facadeService.projectService.selectProject(projectData._id);
      let userData: any = localStorage.getItem(StorageKeys.USER_INFORMATION);
      if (userData) {
        userData = JSON.parse(userData) ?? {};
        const asMember = projectData.members.find((m: any) => m.userId == userData._id);
        userData.color = asMember?.color ?? 1;
        localStorage.setItem(StorageKeys.USER_INFORMATION, JSON.stringify(userData));
      }

      this._router.navigateByUrl(this.appRoutes.PROJECT_MEDIA);
    }
  }

  onProjectCreate() {
    this.isProjectUpserting = true;
    this._facadeService.modalService.openModal('projectCreateModal');
  }

  onCloseNewProjectModal(event: boolean) {
    if (event) {
      this.isProjectUpserting = false;
      this._facadeService.modalService.closeModal('projectCreateModal');
      if (this.selectedProject) {
        this.selectedProject = null;
      }
    }
  }

  onUpsertProject(event: any) {
    if (event && event._id) {
      this.isProjectUpserting = false;
      const projectIndex = this.filteredProjectList.findIndex((project: any) => project._id === event._id);
      if (projectIndex > -1) {
        this.filteredProjectList[projectIndex] = event;
        const projectIdx = this.projectList.findIndex((p: any) => p._id === this.filteredProjectList[projectIndex]._id);
        if (projectIdx > -1) {
          this.projectList[projectIdx] = { ...this.filteredProjectList[projectIndex] };
        }
      } else {
        this.projectList.push(event);
        this.onSearchQuery(this.searchQuery);
      }
      if (this.selectedProject) {
        this.selectedProject = null;
      }
      this._facadeService.modalService.closeModal('projectCreateModal');
    }
  }

  onEditProject(event: Event, projectIndex: number) {
    event?.stopPropagation();
    const project = this.projectList[projectIndex];

    if (project) {
      // this._router.navigateByUrl(`${this.appRoutes.PROJECT_MANAGE}${project._id ?? ''}`);
      this._facadeService.modalService.openModal('projectCreateModal');
      this.isProjectUpserting = true;
      this.selectedProject = {
        ...project
      };
    }
  }

  onDeleteProject(event: Event, projectIndex: number) {
    event?.stopPropagation();
    const project = this.filteredProjectList[projectIndex];

    if (project) {
      this.selectedProject = {
        ...project
      };
      this._facadeService.modalService.openModal('deleteProjectModal');
    }
  }

  onConfirmDeleteProject() {
    if (this.isRequestAlive || !this.selectedProject?._id) {
      return;
    }

    this.isRequestAlive = true;
    this._facadeService.projectService.deleteProject(this.selectedProject?._id).subscribe({
      next: (res: IResponse) => {
        this.isRequestAlive = false;
        if (res.code === "OK") {
          this._facadeService.appService.openToaster(`${this.selectedProject.projectName} project successfully deleted.`, 'success');
          this.selectedProject = null;
          this.getProjectList();
          this._facadeService.modalService.closeModal('deleteProjectModal');
        }
      },
      error: (err: any) => {
        this.isRequestAlive = false;
        this._facadeService.appService.openToaster('Something went wrong to deleting project', 'danger');
        console.error('Error while deleting project', err.error);
      }
    });
  }

  onCancelDeleteProject() {
    this.selectedProject = null;
    this._facadeService.modalService.closeModal('deleteProjectModal');
  }

  onSearchQuery(event: Event | string) {
    if (this.onSearchQueryDebounceTimeoutId) clearTimeout(this.onSearchQueryDebounceTimeoutId);

    this.onSearchQueryDebounceTimeoutId = setTimeout(() => {
      this.filteredProjectList = this.projectList.filter(project => project.projectName.toLowerCase().includes(this.searchQuery.toLowerCase()));
    }, (event ? 300 : 0));
  }

  onChangeView() {
    this.viewType = (this.viewType === 't' ? 'g' : 't');
    sessionStorage.setItem(StorageKeys.SST.PROJECT_VIEW_TYPE, this.viewType);
  }


  ngOnDestroy(): void {
    this._facadeService.modalService.unregisterModal('deleteProjectModal');
    this.projectsSubscription?.unsubscribe();
  }
}