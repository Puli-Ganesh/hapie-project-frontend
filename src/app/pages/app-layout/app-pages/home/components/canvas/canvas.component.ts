import { Component, OnDestroy, OnInit } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import * as _ from 'lodash';

import { Roles } from '@src/app/constants/roles';
import { Routes } from '@src/app/constants/routes';
import { StorageKeys } from '@src/app/constants/storage-keys';
import { FacadeService } from '@src/app/services/facade.service';
import { IResponse } from '@src/interfaces/response.interface';
import { Permissions } from '@src/app/constants/permissions';
import { AppSocketService } from '@src/app/services/app-socket/app-socket.service';


interface IEditIndexes {
  categoriesIndex: number,
  categoryIndex: number,
  requirementIndex: number,
  setIndexes: Function,
  resetIndexes: Function,
  isIndexesSet: Function,
}

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit, OnDestroy {

  constructor(
    private _facadeService: FacadeService,
    private _appSocketService: AppSocketService,
    private _clipboard: Clipboard,
    private _router: Router
  ) {
    this.projectId = localStorage.getItem(StorageKeys.PROJECT_ID) ?? '';
    this.projectName = localStorage.getItem(StorageKeys.PROJECT_NAME) ?? '';
    this.workspaceId = localStorage.getItem(StorageKeys.WORKSPACE_ID) ?? '';
    this.projectColor = localStorage.getItem(StorageKeys.PROJECT_COLOR) ?? 1;
    
    this.projectDetailsSubscription = this._facadeService.projectService.projectDetails$.subscribe({
      next: (details: any) => {
        this.projectDetails = details;
      }
    })
  }

  protected readonly userRoles = Roles;
  protected readonly appRoutes = Routes;
  protected workspaceId: string = '';
  protected projectId: string = '';
  protected projectName: string = '';
  protected isRequestAlive: boolean = false;
  projectColor: any;
  permissions = Permissions;
  currentUser: any;

  projectDetailsSubscription: Subscription;
  projectDetails: any;

  protected templatesList: Array<any> = [];
  protected templateDropdownList: Array<any> = [];
  protected selectedTemplate: any;
  protected templateDropdownToggler: boolean = false;

  protected rawCategoryList: Array<any> = [];
  protected categoryList: Array<any> = [];
  protected editIndexes: IEditIndexes = {
    categoriesIndex: -1,
    categoryIndex: -1,
    requirementIndex: -1,
    setIndexes: function (categoriesIndex: number, catIndex: number, reqIndex: number): void {
      this.categoriesIndex = categoriesIndex;
      this.categoryIndex = catIndex;
      this.requirementIndex = reqIndex;
    },
    resetIndexes: function (): void {
      this.categoriesIndex = this.categoryIndex = this.requirementIndex = -1;
    },
    isIndexesSet: function (): boolean {
      return this.categoriesIndex !== -1 && this.categoryIndex !== -1 && this.requirementIndex !== -1;
    }
  };

  currentVersion = {
    major: 0,
    minor: 0
  };

  canvasUsers: Array<any> = [];
  canvasUsersSubscription!: Subscription;
  liveEditingData: Array<any> = [];
  liveEditingSubscription!: Subscription;
  canvasDataUpdatedSubscription!: Subscription;

  ngOnInit(): void {
    this.currentUser = this._facadeService.authService.getCurrentUser();
    this.getTemplateList();
    this._appSocketService.establishSocketConnection();

    this.canvasUsersSubscription = this._appSocketService.canvasUsers$.subscribe({
      next: (event: any) => {
        if (event.state == 'join') {
          this.canvasUsers = _.cloneDeep(event.users);
        } else if (event.state == 'remove') {
          this.canvasUsers = _.cloneDeep(event.users);
        }
      }
    });

    this.liveEditingSubscription = this._appSocketService.liveEditing$.subscribe({
      next: (event: any) => {
        if (event.state == 'start') {
          this.liveEditingData = _.cloneDeep(event.data);
        } else if (event.state == 'end') {
          this.liveEditingData = _.cloneDeep(event.data);
        }
        this.setLiveEditing();
      }
    });

    this.canvasDataUpdatedSubscription = this._appSocketService.canvasDataUpdated$.subscribe({
      next: (event: any) => {
        const categoriesIndex = this.categoryList.findIndex((cList: any) => event.data.category.title.toLowerCase().startsWith(cList.title.toLowerCase()));
        if (categoriesIndex > -1) {
          const categoryIndex = this.categoryList[categoriesIndex].list.findIndex((c: any) => c._id === event.data.category._id);
          if (categoryIndex > -1)
            switch (event.data.action) {
              case 'requirement-update':
              const requirementIndex = this.categoryList[categoriesIndex].list[categoryIndex].requirements.findIndex((r: any) => r._id === event.data.requirement._id);
              if (requirementIndex > -1) {
                this.categoryList[categoriesIndex].list[categoryIndex].requirements[requirementIndex].requirement = event.data.requirement.requirement;
                this.rawCategoryList[categoriesIndex].list[categoryIndex].requirements[requirementIndex].requirement = event.data.requirement.requirement;
              }
              break;
              case 'requirement-added':
                this.categoryList[categoriesIndex].list[categoryIndex].requirements = this.categoryList[categoriesIndex].list[categoryIndex].requirements.filter((req: any) => req?._id);
                this.categoryList[categoriesIndex].list[categoryIndex].requirements.push({ ...event.data.requirement, toggler: true, upsertMode: false });
                this.rawCategoryList[categoriesIndex].list[categoryIndex].requirements.push(event.data.requirement);
                break;
              case 'requirement-deleted':
                this.categoryList[categoriesIndex].list[categoryIndex].requirements = this.categoryList[categoriesIndex].list[categoryIndex].requirements.filter((req: any) => req._id !== event.data.requirementId);
                this.rawCategoryList[categoriesIndex].list[categoryIndex].requirements = this.rawCategoryList[categoriesIndex].list[categoryIndex].requirements.filter((req: any) => req._id !== event.data.requirementId);
                break;
              default:
                break;
            }
        }
      }
    });

    this._facadeService.modalService.registerModal('migrateVersionModal');
  }

  onExit() {
    this._router.navigate([this.appRoutes.PROJECTS]);
  }

  onBack() {
    console.log('currently not desided where to send');
  }

  setLiveEditing() {
    for (let categoryData of this.categoryList) {
      for (let category of categoryData.list) {
        if (this.liveEditingData[category._id]) {
          const liveRequirements = this.liveEditingData[category._id];
          for (let req of category.requirements) {
            req.liveUsers = [];
          }
          for (let requirement of liveRequirements) {
            const reqIndex = category.requirements.findIndex((req: any) => req._id === requirement.requirementId);
            if (reqIndex > -1) {
              category.requirements[reqIndex].liveUsers.push(requirement.user);
            }
          }
        } else {
          for (let requirement of category.requirements) {
            requirement.liveUsers = [];
          }
        }
      }
    }
  }

  // onGoToProjects() {
  //   this._router.navigateByUrl(Routes.PROJECTS);
  // }

  // onGoToProject() {
  //   this._router.navigateByUrl(Routes.PROJECT_PROFILE);
  // }

  getTemplateList() {
    this._facadeService.templateService.getDefaultListByProjectId(this.projectId).subscribe({
      next: (res: any) => {
        if (res.code == "OK") {
          this.templatesList = res.data.list;
          this.templateDropdownList = res.data.list.map((t: any) => ({ _id: t._id, title: t.title }));
          if (this.templateDropdownList.length) {
            this.onSelectTemplate(this.templateDropdownList[0]);
          }
        }
      }
    });
  }

  onToggleTemplateDropdown(): void {
    this.templateDropdownToggler = !this.templateDropdownToggler;
  }

  // protected versionsList: Array<any> = [];
  // protected currentVersion: string = '';
  // protected latestVersion: string = '';

  onSelectTemplate(template: any): void {
    if (this.selectedTemplate?._id === template?._id) {
      return;
    }

    if (this.selectedTemplate?._id) {
      this._appSocketService.emitUserRemove({
        roomId: `canvas-${this.projectId}-${this.selectedTemplate._id}`,
        user: {
          _id: this.currentUser._id,
          firstName: this.currentUser.firstName,
          lastName: this.currentUser.lastName,
          color: this.currentUser.color
        }
      });
      this._appSocketService.leaveCanvasRoom(`canvas-${this.projectId}-${this.selectedTemplate._id}`);
    }
    this.selectedTemplate = template;
    this.templateDropdownToggler = false;

    if (this.selectedTemplate?._id) {
      this._appSocketService.joinCanvasRoom(`canvas-${this.projectId}-${this.selectedTemplate._id}`)
      this._appSocketService.emitUserJoin({
        roomId: `canvas-${this.projectId}-${this.selectedTemplate._id}`,
        user: {
          _id: this.currentUser._id,
          firstName: this.currentUser.firstName,
          lastName: this.currentUser.lastName,
          color: this.currentUser.color
        }
      });
    }

    const templateObj = this.templatesList.find((template: any) => template._id == this.selectedTemplate._id);
    this.currentVersion = {
      major: templateObj.latestMajor,
      minor: templateObj.latestMinor
    };
    // this.versionsList = templateObj.versions.map((v: any) => v.majorMinorCombination).sort((a: any, b: any) => a - b);
    // this.latestVersion = this.versionsList?.at(-1) || '';
    // this.currentVersion = `${templateObj.latestMajor}.${templateObj.latestMinor}`;
    this.getData();
  }

  getData(): void {
    if (!this.selectedTemplate) return;

    const bodyToSend = {
      projectId: this.projectId,
      templateId: this.selectedTemplate._id,
      major: this.currentVersion.major,
      minor: this.currentVersion.minor
    };
    this._facadeService.canvasService.getCanvasData(bodyToSend).subscribe({
      next: (res: IResponse) => {
        if (res.code === "OK") {
          this.rawCategoryList = res.data.list;
          this.rawCategoryList = this.rawCategoryList.map(((category: any) => {
            category.requirements = category.requirements.filter((requirement: any) => requirement.isApproved)
              .map((requirement: any) => ({ ...requirement, toggler: true }));
            return category;
          }));
          this.setCategories();
        }
      },
      error: (err: any) => {
        console.error('Error while getting category list', err.error);
      }
    });
  }

  onCancelMigrateVersion(): void {
    this._facadeService.modalService.closeModal('migrateVersionModal');
  }

  onMigrateVersion(): void {
    this._facadeService.modalService.openModal('migrateVersionModal');
  }

  onConfirmMigrateVersion() {
    const body = {
      templateId: this.selectedTemplate._id,
      projectId: this.projectId
    };

    this._facadeService.documentService.migrateVersion(body).subscribe({
      next: (res: IResponse) => {
        this.rawCategoryList = res.data.list;
        this.currentVersion = {
          major: this.currentVersion.major + 1,
          minor: 1
        };
        const template = this.templatesList.find((t: any) => t._id == this.selectedTemplate._id);
        if (template) {
          template.latestMajor = this.currentVersion.major;
          template.latestMinor = this.currentVersion.minor
        }
        this.rawCategoryList = this.rawCategoryList.map(((category: any) => {
          category.requirements = category.requirements.filter((requirement: any) => requirement.isApproved)
            .map((requirement: any) => ({ ...requirement, toggler: true }));
          return category;
        }));
        this.setCategories();
        this._facadeService.appService.openToaster('Migration has been done successfully', 'success');
        this._facadeService.modalService.closeModal('migrateVersionModal');
      },
      error: (err: any) => {
        console.error(err.error);
        this._facadeService.appService.openToaster('There is an error while migrating data', 'danger');
      }
    });
  }

  setCategories(): void {
    this.categoryList = [];

    for (const rawCategory of this.rawCategoryList) {
      const categoryExist = this.categoryList.find((cat: any) => rawCategory.title.includes(cat.title));
      if (categoryExist) {
        const title = rawCategory.title.split('/').slice(1)?.join(' / ')?.trim();
        categoryExist.list.push({
          ...rawCategory,
          dTitle: title,
          toggler: false
        });
        if (!categoryExist.hasMany) { categoryExist.hasMany = true; }
      } else {
        const title = rawCategory.title.split('/');
        const dTitle = (title.length === 1) ? title[0] : title.slice(1).join(' / ');
        this.categoryList.push({
          title: rawCategory.title.split('/')[0],
          list: [{
            ...rawCategory,
            dTitle: dTitle?.trim(),
            toggler: false
          }],
          hasMany: false
        });
      }
    }

    this.rawCategoryList = _.cloneDeep(this.categoryList);
  }

  addNewRequirement(categoriesIndex: number, catIndex: number) {
    if (this.editIndexes.isIndexesSet()) {
      this.resetEditingAndCancelUpserData();
    }

    const category = this.categoryList[categoriesIndex]?.list[catIndex];
    if (category && (category.requirements?.at(-1)?._id || category.requirements.length === 0)) {
      this.categoryList[categoriesIndex].list[catIndex].requirements.push({
        isAiGenerated: false,
        isApproved: true,
        recordingId: null,
        requirement: '',
        upsertMode: true
      });
      this.editIndexes.setIndexes(categoriesIndex, catIndex, (this.categoryList[categoriesIndex].list[catIndex].requirements.length - 1));
    }
  }

  onEditRequirement(categoriesIndex: number, catIndex: number, reqIndex: number) {
    if (this.editIndexes.isIndexesSet()) {
      this.resetEditingAndCancelUpserData();
    }

    this.editIndexes.setIndexes(categoriesIndex, catIndex, reqIndex);
    const requirement = this.categoryList[categoriesIndex]?.list[catIndex]?.requirements[reqIndex];
    if (requirement) {
      requirement.upsertMode = true;

      this._appSocketService.emitStartRequirementEditing({
        roomId: `canvas-${this.projectId}-${this.selectedTemplate._id}`,
        data: {
          categoryId: this.categoryList[categoriesIndex]?.list[catIndex]?._id,
          requirement: {
            requirementId: this.categoryList[categoriesIndex]?.list[catIndex]?.requirements[reqIndex]._id,
            user: {
              _id: this.currentUser._id,
              firstName: this.currentUser.firstName,
              lastName: this.currentUser.lastName,
              color: this.currentUser.color
            }
          }
        }
      });
    }
  }

  onDeleteRequirement(categoriesIndex: number, catIndex: number, reqIndex: number) {
    if (this.editIndexes.isIndexesSet()) {
      this.resetEditingAndCancelUpserData();
    }
    if (confirm('Are you sure you want to delete it?')) {
      const categoryId = this.categoryList?.[categoriesIndex]?.list?.[catIndex]?._id;
      const requirementId = this.categoryList?.[categoriesIndex]?.list?.[catIndex]?.requirements?.[reqIndex]?._id;
      if (!categoryId || !requirementId) {
        return;
      }
      this._facadeService.categoryService.deleteRequirement(categoryId, requirementId).subscribe({
        next: (res: IResponse) => {
          if (res.code === "OK") {
            this.categoryList[categoriesIndex].list[catIndex].requirements = this.categoryList[categoriesIndex].list[catIndex].requirements.filter((req: any) => req._id !== requirementId);
            this.rawCategoryList[categoriesIndex].list[catIndex].requirements = this.rawCategoryList[categoriesIndex].list[catIndex].requirements.filter((req: any) => req._id !== requirementId);
          }
        },
        error: (err: any) => {
          console.error('Error while deleting requirement', err.error);
        }
      });
    }
  }

  // onCancelUpsertRequirement(categoriesIndex: number, catIndex: number, reqIndex: number) {
  //   // this.editIndexes.resetIndexes();
  //   // const requirement = this.categoryList[categoriesIndex]?.list[catIndex]?.requirements[reqIndex];
  //   // if (requirement) {
  //   //   requirement.upsertMode = false;
  //   //   const oldReq = this.rawCategoryList[categoriesIndex].list[catIndex].requirements[reqIndex];
  //   //   if (oldReq) {
  //   //     requirement.requirement = oldReq.requirement;
  //   //   }
  //   // }
  // }

  resetEditingAndCancelUpserData(): void {
    const { categoriesIndex, categoryIndex, requirementIndex } = this.editIndexes;
    const requirement = this.categoryList?.[categoriesIndex]?.list?.[categoryIndex]?.requirements?.[requirementIndex];
    if (requirement) {
      if (requirement?._id) {
        const oldReq = this.rawCategoryList?.[categoriesIndex]?.list?.[categoryIndex]?.requirements?.[requirementIndex];
        requirement.upsertMode = false;
        requirement.requirement = oldReq.requirement;

        this._appSocketService.emitEndRequirementEditing({
          roomId: `canvas-${this.projectId}-${this.selectedTemplate._id}`,
          data: {
            categoryId: this.categoryList[categoriesIndex]?.list[categoryIndex]?._id,
            requirement: {
              requirementId: this.categoryList[categoriesIndex]?.list[categoryIndex]?.requirements[requirementIndex]._id,
              user: {
                _id: this.currentUser._id,
                firstName: this.currentUser.firstName,
                lastName: this.currentUser.lastName,
                color: this.currentUser.color
              }
            }
          }
        })
      } else {
        this.categoryList?.[categoriesIndex]?.list[categoryIndex]?.requirements?.splice(requirementIndex, 1);
      }

      this.editIndexes.resetIndexes();
    }
  }

  trimString(str: string): string {
    if (typeof str === 'string') {
      return str?.replace(/^\n*\s*|\n*\s*$/g, '');
    }
    return str;
  }

  onSaveChanges() {
    if (this.isRequestAlive || !this.editIndexes.isIndexesSet()) {
      return;
    }

    const category = this.categoryList?.[this.editIndexes.categoriesIndex]?.list?.[this.editIndexes.categoryIndex];
    const requirement = category.requirements?.[this.editIndexes.requirementIndex];

    requirement.requirement = this.trimString(requirement.requirement);
    if (!requirement?.requirement) {
      this.resetEditingAndCancelUpserData();
      return;
    }

    /** create new requirement, if _id not exist */
    if (!requirement?._id) {
      const bodyToSend = {
        categoryId: category._id,
        requirementContent: requirement.requirement
      };

      this._facadeService.categoryService.addRequirement(bodyToSend).subscribe({
        next: (res: IResponse) => {
          if (res.code === "OK" && res.data.requirements?.at(-1)) {
            category.requirements = category.requirements.filter((req: any) => req?._id);
            // this.rawCategoryList[this.editIndexes.categoriesIndex].list[this.editIndexes.categoryIndex].requirements.push(res.data.requirements?.at(-1));
            // requirement._id = res.data.requirements?.at(-1)?._id;
            // requirement.upsertMode = false;
            this.editIndexes.resetIndexes();
          } else {
            this.resetEditingAndCancelUpserData();
          }
        },
        error: (err: any) => {
          this.resetEditingAndCancelUpserData();
          console.error('Error while adding new requirement', err.error);
        }
      });
    } else {
      const oldRequirementStr = this.trimString(this.rawCategoryList[this.editIndexes.categoriesIndex].list[this.editIndexes.categoryIndex].requirements[this.editIndexes.requirementIndex].requirement);
      if (requirement.requirement === oldRequirementStr) {
        this.resetEditingAndCancelUpserData();
        return;
      }
      const bodyToSend = {
        categoryId: category._id,
        requirementId: category.requirements?.[this.editIndexes.requirementIndex]?._id,
        requirementContent: category.requirements?.[this.editIndexes.requirementIndex]?.requirement
      };

      this._facadeService.categoryService.updateRequirement(bodyToSend).subscribe({
        next: (res: IResponse) => {
          if (res.code === "OK") {
            for (let r of res.data.requirements) {
              if (r._id == requirement._id) {
                requirement.requirement = r.requirement;
                requirement.upsertMode = false;
                this.rawCategoryList[this.editIndexes.categoriesIndex].list[this.editIndexes.categoryIndex].requirements[this.editIndexes.requirementIndex].requirement = r.requirement;
                break;
              }
            }

            this.resetEditingAndCancelUpserData();
          } else {
            this.resetEditingAndCancelUpserData();
          }
        },
        error: (err: any) => {
          this.resetEditingAndCancelUpserData();
          console.error('Error while updating requirement', err.error);
        }
      });
    }
  }

  protected isCSLRequestAlive: boolean = false;
  onCopyShareLink() {
    if (this.isCSLRequestAlive || !this.projectId) return;

    const bodyToSend = {
      projectId: this.projectId
    };

    this.isCSLRequestAlive = true;
    this._facadeService.canvasService.generateShareCanvasLink(bodyToSend).subscribe({
      next: (res: IResponse) => {
        if (res.code === "OK" && res.data?.shareLink) {
          this._clipboard.copy(res.data.shareLink);
          this._facadeService.appService.openToaster('Share link copied successfully.', 'success');
        } else {
          this._facadeService.appService.openToaster('Unable to copy share link!', 'danger');
        }
        this.isCSLRequestAlive = false;
      },
      error: (err: any) => {
        this._facadeService.appService.openToaster('Unable to copy share link!', 'danger');
        this.isCSLRequestAlive = false;
        console.error('Error while generate share canvas link', err.error);
      }
    });
  }

  ngOnDestroy(): void {
    this.canvasUsersSubscription?.unsubscribe();
    this.canvasUsers = [];
    if (this.selectedTemplate?._id) {
      this._appSocketService.emitUserRemove({
        roomId: `canvas-${this.projectId}-${this.selectedTemplate._id}`,
        user: {
          _id: this.currentUser._id,
          firstName: this.currentUser.firstName,
          lastName: this.currentUser.lastName,
          color: this.currentUser.color
        }
      });
    }

    this.liveEditingSubscription?.unsubscribe();
    this.liveEditingData = [];
    if (this.editIndexes.categoriesIndex != -1 && this.editIndexes.categoryIndex != -1 && this.editIndexes.requirementIndex != -1) {
      this._appSocketService.emitEndRequirementEditing({
        roomId: `canvas-${this.projectId}-${this.selectedTemplate._id}`,
        data: {
          categoryId: this.categoryList[this.editIndexes.categoriesIndex]?.list[this.editIndexes.categoryIndex]?._id,
          requirement: {
            requirementId: this.categoryList[this.editIndexes.categoriesIndex]?.list[this.editIndexes.categoryIndex]?.requirements[this.editIndexes.requirementIndex]._id,
            user: {
              _id: this.currentUser._id,
              firstName: this.currentUser.firstName,
              lastName: this.currentUser.lastName,
              color: this.currentUser.color
            }
          }
        }
      });
    }
    if (this.selectedTemplate?._id) {
      this._appSocketService.leaveCanvasRoom(`canvas-${this.projectId}-${this.selectedTemplate._id}`);
    }

    setTimeout(() => {
      this._appSocketService.disconnectSocketConnection();
    }, 1000);

    this._facadeService.modalService.unregisterModal('migrateVersionModal');
  }

}
