import { Component, OnDestroy, OnInit } from '@angular/core';

import { FacadeService } from '@src/app/services/facade.service';
import { Roles } from '@src/app/constants/roles';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent implements OnInit, OnDestroy {

  constructor(
    private _facadeService: FacadeService
  ) { }


  protected readonly userRoles = Roles;

  protected usersList: Array<any> = [];
  protected projectsList: Array<any> = [];
  protected displayUsers: Array<any> = [];
  protected filteredDisplayUserList: Array<any> = [];

  protected searchQuery: string = '';
  protected onSearchQueryDebounceTimeoutId: any;

  protected modalToggler = false;

  protected selectedMember: any = null;

  async ngOnInit() {
    await this.getUsers();
    await this.getProjects();

    this.setDisplayUsers();
    this._facadeService.modalService.registerModal('manageTeamModal');
  }

  setDisplayUsers() {
    this.displayUsers = [];
    this.filteredDisplayUserList = [];

    for (let user of this.usersList) {
      const userData = { ...user };
      switch (user.type) {
        case this.userRoles.SYSTEM_OWNER:
          userData.role = 'System owner'
          break;
        case this.userRoles.PROJECT_OWNER:
          userData.role = 'Project owner'
          break;
        case this.userRoles.VIEWER:
          userData.role = 'Viewer'
          break;
        default:
          userData.role = 'Not found'
      }

      let projects = []
      for (let project of this.projectsList) {
        if (project.members) {
          const res = project.members.find((u: any) => u.userId == userData._id);
          if (res) {
            projects.push(project.projectName)
          }
        }
      }
      userData.projects = projects.length == this.projectsList.length ? 'All' : projects.join(', ');
      this.displayUsers.push(userData);
      this.filteredDisplayUserList.push(userData);
    }
  }

  onAddMember() {
    this._facadeService.modalService.openModal('manageTeamModal');
    this.modalToggler = true;
  }

  onEditMember(userId: string) {
    const index = this.usersList.findIndex((user: any) => user._id == userId);
    if (index > -1) {
      this.selectedMember = this.usersList[index];
    }
    this._facadeService.modalService.openModal('manageTeamModal');
    this.modalToggler = true;
  }

  onModalClose(event: any) {
    this.modalToggler = false;
    this.selectedMember = null;
    this._facadeService.modalService.closeModal('manageTeamModal');
  }

  async onMemberAdded(newMember: any) {
    this.usersList.push(newMember);
    await this.getProjects();
    this.setDisplayUsers();
  }

  async onMemberUpdated(member: any) {
    const index = this.usersList.findIndex((u: any) => u._id == member._id);
    if (index > -1) {
      this.usersList[index] = member;
      await this.getProjects();
      this.setDisplayUsers();
    }
  }

  getUsers() {
    return new Promise((resolve: any, reject: any) => {
      this._facadeService.userService.getListByWorkspaceId().subscribe({
        next: (res: any) => {
          this.usersList = res.data;
          resolve();
        },
        error: (error: any) => {
          console.error('There is an error while fetching users', error);
          reject();
        }
      });
    })
  }

  getProjects() {
    return new Promise((resolve: any, reject: any) => {
      this._facadeService.projectService.getList().subscribe({
        next: (res: any) => {
          this.projectsList = res.data.projects;
          resolve();
        },
        error: (error: any) => {
          console.error('There is an error while fetching users', error);
          reject();
        }
      });
    })
  }

  onSearchQuery(event: Event | string) {
    if (this.onSearchQueryDebounceTimeoutId) clearTimeout(this.onSearchQueryDebounceTimeoutId);

    this.onSearchQueryDebounceTimeoutId = setTimeout(() => {
      this.filteredDisplayUserList = this.displayUsers.filter(({ firstName, lastName }: any) => `${firstName.toLowerCase()} ${lastName.toLowerCase()}`.includes(this.searchQuery.toLowerCase()));
    }, 300);
  }

  ngOnDestroy(): void {
    this._facadeService.modalService.unregisterModal('manageTeamModal');
  }

}
