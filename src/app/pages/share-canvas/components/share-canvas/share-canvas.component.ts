import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import * as _ from 'lodash';

import { Routes } from '@src/app/constants/routes';
import { FacadeService } from '@src/app/services/facade.service';
import { IResponse } from '@src/interfaces/response.interface';
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
  selector: 'app-share-canvas',
  templateUrl: './share-canvas.component.html',
  styleUrls: ['../../../app-layout/app-pages/home/components/canvas/canvas.component.scss', './share-canvas.component.scss']
})
export class ShareCanvasComponent implements OnInit, OnDestroy {

  constructor(
    private _facadeService: FacadeService,
    private _appSocketService: AppSocketService,
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
  ) {
    this.accessToken = decodeURIComponent(this._route.snapshot.params['token'] || '');
    if (!this.accessToken) {
      this.isLinkExpired = true;
    } else {
      this.requestEditAccessFrom = this._fb.group({
        userName: ['', [Validators.required]],
        message: ['']
      });
    }
  }

  protected readonly appRoutes = Routes;
  protected hasEditAccess: boolean = false;
  protected accessToken: string = '';
  protected projectName: string = '';

  protected isLinkExpired: boolean = false;
  protected isRequestAlive: boolean = false;


  protected templateList: Array<any> = [];
  protected selectedTemplate: any;

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

  protected requestEditAccessFrom!: FormGroup;
  projectId: any;
  canvasDataUpdatedSubscription!: Subscription;
  editAccessSubscription!: Subscription;
  shareCanvasLinkId: any;


  ngOnInit(): void {
    this._facadeService.modalService.registerModal('requestEditAccessModal');
    this.getTemplateList();
  }

  connectSocket() {
    if (!this._appSocketService.isConnected) {
      this._appSocketService.establishSocketConnection();
    }

    this.canvasDataUpdatedSubscription = this._appSocketService.canvasDataUpdated$.subscribe({
      next: (event: any) => {
        const categoriesIndex = this.categoryList.findIndex((cList: any) => event.data.category.title.toLowerCase().startsWith(cList.title.toLowerCase()));
        if (categoriesIndex > -1) {
          const categoryIndex = this.categoryList[categoriesIndex].list.findIndex((c: any) => c._id === event.data.category._id);
          if (categoryIndex > -1) {
            switch (event.data.action) {
              case 'requirement-update':
                const requirementIndex = this.categoryList[categoriesIndex].list[categoryIndex].requirements.findIndex((r: any) => r._id === event.data.requirement._id);
                if (requirementIndex > -1) {
                  this.categoryList[categoriesIndex].list[categoryIndex].requirements[requirementIndex].requirement = event.data.requirement.requirement;
                  this.rawCategoryList[categoriesIndex].list[categoryIndex].requirements[requirementIndex].requirement = event.data.requirement.requirement;
                }
                break;
              case 'requirement-added':
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
          } else if (event.data.action === 'requirement-added') {
            const newCatIndex = this.categoryList[categoriesIndex].list.findIndex((c: any) => c.title === event.data.category.title);
            if (newCatIndex > -1) {
              this.categoryList[categoriesIndex].list[newCatIndex]._id = event.data.category._id;
              this.rawCategoryList[categoriesIndex].list[newCatIndex]._id = event.data.category._id;
              this.categoryList[categoriesIndex].list[newCatIndex].requirements.push({ ...event.data.requirement, toggler: true, upsertMode: false });
              this.rawCategoryList[categoriesIndex].list[newCatIndex].requirements.push(event.data.requirement);
            }
          }
        }
      }
    });

    this.editAccessSubscription = this._appSocketService.editAccess$.subscribe({
      next: (event: any) => {
        if (this.shareCanvasLinkId == event.data.shareCanvasLinkId && event.data.hasEditAccess) {
          this.hasEditAccess = true;
          this.editAccessSubscription.unsubscribe();
        }
      }
    });
  }

  getTemplateList() {
    if (this.isRequestAlive) return;

    this.isRequestAlive = true;
    const bodyToSend = {
      accessToken: this.accessToken
    };
    this._facadeService.templateService.getShareCanvasList(bodyToSend).subscribe({
      next: (res: IResponse) => {
        this.isRequestAlive = false;
        if (res.code == "OK") {
          this.projectId = res.data.projectId;
          this.shareCanvasLinkId = res.data._id;
          this.hasEditAccess = res.data?.hasEditAccess ?? false;
          this.connectSocket();
          if (!this.projectName && res.data?.projectName) {
            this.projectName = res.data.projectName;
          }
          this.templateList = res.data.list;
          if (this.templateList.length) {
            this.onSelectTemplate(this.templateList[0]);
          }
        }
      },
      error: (err: any) => {
        this.isRequestAlive = false;
        if (err.error.status === 401) {
          this.isLinkExpired = true;
        }
        console.error('Error while getting public template list', err);
      }
    });
  }

  onSelectTemplate(template: any): void {
    if (this.selectedTemplate?._id === template?._id) {
      return;
    }

    if (this.selectedTemplate?._id) {
      if (this._appSocketService.isConnected) {
        this._appSocketService.leaveCanvasRoom(`canvas-${this.projectId}-${this.selectedTemplate._id}`);
      }
    }

    this.selectedTemplate = template;

    if (this.selectedTemplate?._id) {
      this._appSocketService.joinCanvasRoom(`canvas-${this.projectId}-${this.selectedTemplate._id}`);
    }

    const templateObj = this.templateList.find((template: any) => template._id == this.selectedTemplate._id);
    this.getData(templateObj.latestMajor, templateObj.latestMinor);
  }

  getData(major: number, minor: number): void {
    if (!this.selectedTemplate || this.isRequestAlive) return;
    const bodyToSend = {
      accessToken: this.accessToken,
      templateId: this.selectedTemplate._id,
      major: major,
      minor: minor
    };
    this.isRequestAlive = true;
    this._facadeService.canvasService.getShareCanvasData(bodyToSend).subscribe({
      next: (res: IResponse) => {
        this.isRequestAlive = false;
        if (res.code === "OK") {
          this.hasEditAccess = res.data?.hasEditAccess ?? false;
          this.sortCategoryListByTemplateCategoryList(res.data.categoryList, res.data.list);
        }
      },
      error: (err: any) => {
        this.isRequestAlive = false;
        if (err.error.status === 401) {
          this.isLinkExpired = true;
        }
        console.error('Error while getting category list', err);
      }
    });
  }

  sortCategoryListByTemplateCategoryList(templateCategoryList: Array<string>, categoryList: Array<any>): void {
    try {
      if (!Array.isArray(templateCategoryList) || !Array.isArray(categoryList) || !this.selectedTemplate?._id) {
        return;
      }

      this.rawCategoryList = [];
      let i = 1;
      const templateId = categoryList[0]?.templateId ?? this.selectedTemplate._id;
      for (const tcTitle of templateCategoryList) {
        const index = categoryList.findIndex(({ title }) => title === tcTitle);
        if (index > -1 && index < categoryList.length) {
          const category: any = categoryList.splice(index, 1)[0];
          category.requirements = category.requirements.filter((requirement: any) => requirement.isApproved).map((requirement: any) => ({ ...requirement, toggler: true }));
          this.rawCategoryList.push({ ...category });
        } else {
          this.rawCategoryList.push({
            _id: `new-category-${i++}`,
            title: tcTitle,
            requirements: [],
            templateId: templateId,
            major: 1,
            minor: 1
          });
        }
      }

      this.setCategories();
    } catch (error) {
      console.log('Error while sorting category as per template', error);
    }
  }

  setCategories(): void {
    this.categoryList = [];

    // for (const rawCategory of this.rawCategoryList) {
    //   const categoryExist = this.categoryList.find((cat: any) => rawCategory.title.includes(cat.title));
    //   if (categoryExist) {
    //     const title = rawCategory.title.split('/').slice(1)?.join(' / ')?.trim();
    //     categoryExist.list.push({
    //       ...rawCategory,
    //       dTitle: title,
    //       toggler: false
    //     });
    //     if (!categoryExist.hasMany) { categoryExist.hasMany = true; }
    //   } else {
    //     const title = rawCategory.title.split('/');
    //     const dTitle = (title.length === 1) ? title[0] : title.slice(1).join(' / ');
    //     this.categoryList.push({
    //       title: rawCategory.title.split('/')[0],
    //       list: [{
    //         ...rawCategory,
    //         dTitle: dTitle?.trim(),
    //         toggler: false
    //       }],
    //       hasMany: false
    //     });
    //   }
    // }

    for (let i = 0; i < this.rawCategoryList.length; i++) {
      const title = this.rawCategoryList[i].title.split(/ *\/ */);
      const dTitle = (title.length === 1) ? title[0] : title.slice(1).join(' / ');
      const subCategories = [{
        ...this.rawCategoryList[i],
        dTitle: dTitle,
        toggler: false
      }];

      for (let j = i + 1; j < this.rawCategoryList.length; j++) {
        if (this.rawCategoryList[j].title.startsWith(`${this.rawCategoryList[i].title.split(/ *\/ */)?.at(0)} /`)) {
          const title = this.rawCategoryList[j].title.split(/ *\/ */);
          const dTitle = (title.length === 1) ? title[0] : title.slice(1).join(' / ');
          subCategories.push({
            ...this.rawCategoryList[j],
            dTitle: dTitle?.trim(),
            toggler: false
          });
          i++;
        } else { break; }
      }

      this.categoryList.push({
        title: title[0]?.trim(),
        list: subCategories,
        hasMany: subCategories.length > 1
      });
    }

    this.rawCategoryList = _.cloneDeep(this.categoryList);
  }

  addNewRequirement(categoriesIndex: number, catIndex: number) {
    if (this.editIndexes.isIndexesSet()) {
      this.resetEditingAndCancelUpserData();
    }

    const category = this.categoryList[categoriesIndex]?.list[catIndex];
    if (category) {
      this.categoryList[categoriesIndex].list[catIndex].requirements.push({
        isAiGenerated: false,
        isApproved: true,
        recordingId: null,
        requirement: '',
        upsertMode: true,
        toggler: true
      });
      this.editIndexes.setIndexes(categoriesIndex, catIndex, (this.categoryList[categoriesIndex].list[catIndex].requirements.length - 1));
    }
  }

  onEditRequirement(categoriesIndex: number, catIndex: number, reqIndex: number) {
    if (!this.hasEditAccess) return;

    if (this.editIndexes.isIndexesSet()) {
      this.resetEditingAndCancelUpserData();
    }

    this.editIndexes.setIndexes(categoriesIndex, catIndex, reqIndex);
    const requirement = this.categoryList[categoriesIndex]?.list[catIndex]?.requirements[reqIndex];
    if (requirement) {
      requirement.upsertMode = true;
    }
  }

  onDeleteRequirement(categoriesIndex: number, catIndex: number, reqIndex: number) {
    if (!this.hasEditAccess || !this.accessToken) return;

    if (this.editIndexes.isIndexesSet()) {
      this.resetEditingAndCancelUpserData();
    }

    if (confirm('Are you sure you want to delete it?')) {
      const categoryId = this.categoryList?.[categoriesIndex]?.list?.[catIndex]?._id;
      const requirementId = this.categoryList?.[categoriesIndex]?.list?.[catIndex]?.requirements?.[reqIndex]?._id;
      if (!categoryId || !requirementId) {
        return;
      }
      const bodyToSend = {
        categoryId: categoryId,
        requirementId: requirementId,
        accessToken: this.accessToken
      };
      this._facadeService.shareCanvasService.deleteRequirement(bodyToSend).subscribe({
        next: (res: IResponse) => {
          if (res.code === "OK") {
            this.categoryList[categoriesIndex].list[catIndex].requirements = this.categoryList[categoriesIndex].list[catIndex].requirements.filter((req: any) => req._id !== requirementId);
            this.rawCategoryList[categoriesIndex].list[catIndex].requirements = this.rawCategoryList[categoriesIndex].list[catIndex].requirements.filter((req: any) => req._id !== requirementId);
          }
        },
        error: (err: any) => {
          if (err.error.message && err.error.code !== "UNPROCESSABLE_ENTITY") {
            this._facadeService.appService.openToaster(err.error.message, 'danger');
            console.error('Error while deleting requirement', err.error);
          }
          if (err.error.code === "UNPROCESSABLE_ENTITY") {
            this.rawCategoryList?.[categoriesIndex]?.list?.[catIndex]?.requirements?.splice(reqIndex, 1);
            this.categoryList?.[categoriesIndex]?.list?.[catIndex]?.requirements?.splice(reqIndex, 1);
          }
        }
      });
    }
  }

  resetEditingAndCancelUpserData(): void {
    const { categoriesIndex, categoryIndex, requirementIndex } = this.editIndexes;
    const requirement = this.categoryList?.[categoriesIndex]?.list?.[categoryIndex]?.requirements?.[requirementIndex];
    if (requirement) {
      if (requirement?._id) {
        const oldReq = this.rawCategoryList?.[categoriesIndex]?.list?.[categoryIndex]?.requirements?.[requirementIndex];
        requirement.upsertMode = false;
        requirement.requirement = oldReq.requirement;
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
    if (!this.hasEditAccess || this.isRequestAlive || !this.editIndexes.isIndexesSet()) {
      return;
    }

    const category = this.categoryList?.[this.editIndexes.categoriesIndex]?.list?.[this.editIndexes.categoryIndex];
    const requirement = category.requirements?.[this.editIndexes.requirementIndex];

    requirement.requirement = this.trimString(requirement.requirement);
    if (!requirement?.requirement) {
      this.resetEditingAndCancelUpserData();
      return;
    }

    // for creating new requirement
    if (!requirement?._id) {
      const bodyToSend: any = {
        categoryId: category._id,
        requirementContent: requirement.requirement,
        accessToken: this.accessToken
      };

      if (bodyToSend.categoryId.startsWith('new-category-')) {
        bodyToSend.category = {
          title: category.title,
          projectId: this.projectId,
          templateId: category.templateId,
          major: category.major,
          minor: category.minor
        };
      }

      this._facadeService.shareCanvasService.addRequirement(bodyToSend).subscribe({
        next: (res: IResponse) => {
          if (res.code === "OK") {
            category.requirements = category.requirements.filter((req: any) => req?._id);
            const rawCategory = this.rawCategoryList[this.editIndexes.categoriesIndex]?.list?.[this.editIndexes.categoryIndex];
            if (rawCategory?._id) {
              rawCategory.requirements = rawCategory.requirements.filter((req: any) => req?._id);
            }
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
        requirementContent: category.requirements?.[this.editIndexes.requirementIndex]?.requirement,
        accessToken: this.accessToken
      };

      this._facadeService.shareCanvasService.updateRequirement(bodyToSend).subscribe({
        next: (res: IResponse) => {
          if (res.code === "OK" && res.data.requirements?.length) {
            this.categoryList[this.editIndexes.categoriesIndex].list[this.editIndexes.categoryIndex].requirements.splice(this.editIndexes.requirementIndex, 1);
            this.rawCategoryList[this.editIndexes.categoriesIndex].list[this.editIndexes.categoryIndex].requirements.splice(this.editIndexes.requirementIndex, 1);

            const newRequirements = res.data.requirements.filter((requirement: any) => requirement.isApproved)
              .map((requirement: any) => ({ ...requirement, toggler: true, upsertMode: false })) ?? [];

            this.categoryList[this.editIndexes.categoriesIndex].list[this.editIndexes.categoryIndex].requirements = _.cloneDeep(newRequirements);
            this.rawCategoryList[this.editIndexes.categoriesIndex].list[this.editIndexes.categoryIndex].requirements = _.cloneDeep(newRequirements);

            this.editIndexes.resetIndexes();
          } else {
            this.resetEditingAndCancelUpserData();
          }
        },
        error: (err: any) => {
          if (err.error.message && err.error.code !== "UNPROCESSABLE_ENTITY") {
            this._facadeService.appService.openToaster(err.error.message, 'danger');
            console.error('Error while updating requirement', err);
            this.resetEditingAndCancelUpserData();
          }
          if (err.error.code === "UNPROCESSABLE_ENTITY") {
            this.categoryList[this.editIndexes.categoriesIndex].list[this.editIndexes.categoryIndex].requirements.splice(this.editIndexes.requirementIndex, 1);
            this.rawCategoryList[this.editIndexes.categoriesIndex].list[this.editIndexes.categoryIndex].requirements.splice(this.editIndexes.requirementIndex, 1);
            this.editIndexes.resetIndexes();
          }
        }
      });
    }
  }

  get userName(): AbstractControl {
    return this.requestEditAccessFrom.get('userName') as FormControl;
  }
  get message(): AbstractControl {
    return this.requestEditAccessFrom.get('message') as FormControl;
  }

  openRequestEditAccessModal(): void {
    this._facadeService.modalService.openModal('requestEditAccessModal');
  }

  onCloseRequestEditAccessModal(event: boolean): void {
    if (event) {
      this._facadeService.modalService.closeModal('requestEditAccessModal');
      this.requestEditAccessFrom.reset();
    }
  }

  onSendRequestEditAccess(): void {
    if (this.requestEditAccessFrom.invalid || !this.accessToken) {
      this.requestEditAccessFrom.markAllAsTouched();
      this.requestEditAccessFrom.updateValueAndValidity();
      return;
    }

    const bodyToSend = {
      ...this.requestEditAccessFrom.value,
      accessToken: this.accessToken
    };

    this._facadeService.shareCanvasService.requestEditAccess(bodyToSend).subscribe({
      next: (res: any) => {
        if (res.code == "CREATED") {
          this.onCloseRequestEditAccessModal(true);
          this._facadeService.appService.openToaster('Request send.', 'success');
        }
      },
      error: (err: any) => {
        console.log('Error while send request edit access', err);
        switch (err?.status) {
          case 401:
          case 422:
            this._facadeService.appService.openToaster(err.error.message, 'danger');
            break;
          default:
            this._facadeService.appService.openToaster('Unable to send request, try after some time.', 'danger');
            break;
        }
      }
    });
  }

  ngOnDestroy(): void {
    this._facadeService.modalService.unregisterModal('requestEditAccessModal');
    if (this._appSocketService.isConnected) {
      if (this.selectedTemplate?._id) {
        this._appSocketService.leaveCanvasRoom(`canvas-${this.projectId}-${this.selectedTemplate._id}`);
      }
      setTimeout(() => {
        this._appSocketService.disconnectSocketConnection();
      }, 10);
    }
    this.canvasDataUpdatedSubscription?.unsubscribe();
    this.editAccessSubscription?.unsubscribe();
  }

}
