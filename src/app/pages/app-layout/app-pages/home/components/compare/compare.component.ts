import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import * as _ from 'lodash';

import { StorageKeys } from '@src/app/constants/storage-keys';
import { FacadeService } from '@src/app/services/facade.service';
import { IResponse } from '@src/interfaces/response.interface';
import { Routes } from '@src/app/constants/routes';
import { Permissions } from '@src/app/constants/permissions';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.scss']
})
export class CompareComponent implements OnInit {


  constructor(
    private _facadeService: FacadeService,
    private _router: Router,
  ) {
    this.projectId = localStorage.getItem(StorageKeys.PROJECT_ID) ?? '';
    this.projectName = localStorage.getItem(StorageKeys.PROJECT_NAME) ?? '';
    this.projectColor = parseInt(localStorage.getItem(StorageKeys.PROJECT_COLOR) ?? '1');

    this.projectDetailsSubscription = this._facadeService.projectService.projectDetails$.subscribe({
      next: (details: any) => {
        this.projectDetails = details;
      }
    });
  }

  permissions = Permissions;
  protected currentUser: any;
  protected readonly appRoutes = Routes;
  protected projectId: string = '';
  protected projectName: string = '';
  protected projectColor: number;
  protected isRequestAlive: boolean = false;

  projectDetailsSubscription: Subscription;
  projectDetails: any;

  protected templateList: Array<any> = [];
  protected selectedTemplate: any;
  protected templateDropdownToggler: boolean = false;

  protected categoryList: Array<any> = [];
  protected selectedCategory: any;
  protected displayCategoryByMediaList: Array<{
    title: string,
    categoryId: string,
    recordingId: string,
    requirements: Array<any>,
  }> = [];
  protected editIndex: {
    media: number,
    requirement: number,
    set: Function,
    reset: Function,
    isValidIndexes: Function,
  } = {
      media: -1,
      requirement: -1,
      set: function (media: number, requirement: number): void {
        this.media = media;
        this.requirement = requirement;
      },
      reset: function () {
        this.media = this.requirement = -1;
      },
      isValidIndexes: function (): boolean {
        return this.media > -1 && this.requirement > -1;
      },
    };

  protected promptList: Array<any> = [];
  protected selectedPromptIndexes: {
    listIndex: number,
    promptIndex: number,
    set: Function,
    reset: Function,
    isValidIndexes: Function,
    isSameIndexes: Function,
  } = {
      listIndex: -1,
      promptIndex: -1,
      set: function (lInx: number, pIdx: number): void {
        this.listIndex = lInx;
        this.promptIndex = pIdx;
      },
      reset: function (): void {
        this.listIndex = this.promptIndex = -1;
      },
      isValidIndexes: function (): boolean {
        return this.listIndex > -1 && this.promptIndex > -1;
      },
      isSameIndexes: function (lInx: number, pIdx: number): boolean {
        return this.listIndex === lInx && this.promptIndex === pIdx;
      }
    };

  protected mediaList: Array<any> = [];

  @ViewChild('mediaListWrap') mediaListWrap!: ElementRef;

  protected isGetAISummaryClicked: boolean = false;
  protected isAIRequestAlive: boolean = false;
  protected aiSummaryList: Array<any> = [];
  protected selectedCategoryAISummary: any = {};


  ngOnInit(): void {
    if (!this.projectId) {
      this._router.navigateByUrl(this._facadeService.appService.getReplacedUrl(this.appRoutes.PROJECT_MEDIA));
      return;
    }
    this.currentUser = this._facadeService.authService.getCurrentUser();
    this.getTemplateAndVideoList();
  }

  getTemplateAndVideoList(): void {
    if (this.isRequestAlive) {
      return;
    }
    this.isRequestAlive = true;
    this._facadeService.compareVideoService.getData(this.projectId).subscribe({
      next: (res: IResponse) => {
        if (res.code === "OK") {
          this.isRequestAlive = false;
          this.setTemplateList(res.data.templateList);
          this.setVideoList(res.data.videoList);
        }
      },
      error: (err: any) => {
        this.isRequestAlive = false;
        console.error('Error while getting template and video list', err);
      }
    });
  }

  setVideoList(list: Array<any>): void {
    this.mediaList = list.map((item: any) => {
      return { ...item, isSelected: false };
    });
  }

  onSelectMedia(mediaIndex: number): void {
    if (!this.mediaList[mediaIndex]?._id || !this.selectedCategory) return;

    const index = this.displayCategoryByMediaList.findIndex((item: any) => item.recordingId === this.mediaList[mediaIndex]._id);
    if (index > -1) {
      this.displayCategoryByMediaList.splice(index, 1);
    } else {
      const valueHolder = {
        title: `media upload ${this.mediaList[mediaIndex].version}`,
        categoryId: this.selectedCategory._id,
        recordingId: this.mediaList[mediaIndex]._id,
        requirements: _.cloneDeep(this.selectedCategory.requirements.filter((req: any) => req.recordingId == this.mediaList[mediaIndex]._id))
      };
      this.displayCategoryByMediaList.push(valueHolder);
    }
    this.mediaList[mediaIndex].isSelected = !this.mediaList[mediaIndex].isSelected;
  }

  setTemplateList(list: Array<any>): void {
    this.templateList = list;
    if (this.templateList?.length) {
      this.onSelectTemplate(this.templateList.at(0));
    }
  }

  onToggleTemplateDropdown(): void {
    this.templateDropdownToggler = !this.templateDropdownToggler;
  }

  onSelectTemplate(template: any): void {
    this.templateDropdownToggler = false;
    if (this.isRequestAlive || this.selectedTemplate?._id === template?._id) {
      return;
    }

    this.selectedTemplate = template;
    this.isRequestAlive = true;
    this._facadeService.compareVideoService.getCategoryPromptList(this.selectedTemplate._id, this.projectId).subscribe({
      next: async (res: any) => {
        if (res.code === "OK") {
          await this.setCategories(res.data.categoryList);
          this.selectedPromptIndexes.reset();
          this.setPromptList(res.data.promptList);
        }
        this.isRequestAlive = false;
      },
      error: (err: any) => {
        this.isRequestAlive = false;
        console.error('Error while getting template list', err);
      }
    });
  }

  setPromptList(list: Array<any>): void {
    if (!Array.isArray(list)) {
      return;
    }

    // const localPromptList: Array<any> = [];
    // for (const prompt of list) {
    //   const promptExist = localPromptList.find((cat: any) => prompt.title.includes(cat.title));
    //   if (promptExist) {
    //     const title = prompt.title.split('/').slice(1)?.join(' / ')?.trim();
    //     promptExist.list.push({
    //       ...prompt,
    //       dTitle: title,
    //       selected: false
    //     });
    //     if (!promptExist.hasMany) {
    //       promptExist.hasMany = true;
    //       promptExist.selected = false;
    //     }
    //   } else {
    //     const title = prompt.title.split('/');
    //     const dTitle = (title.length === 1) ? title[0] : title.slice(1).join(' / ');
    //     localPromptList.push({
    //       title: title[0]?.trim(),
    //       list: [{
    //         ...prompt,
    //         dTitle: dTitle?.trim(),
    //         selected: false
    //       }],
    //       hasMany: false
    //     });
    //   }
    // }

    const localPromptList: Array<any> = [];
    for (let i = 0; i < list.length; i++) {
      const title = list[i].title.split(/ *\/ */);
      const dTitle = (title.length === 1) ? title[0] : title.slice(1).join(' / ');
      const subPromptList = [{
        ...list[i],
        dTitle: dTitle,
        selected: false
      }];

      for (let j = i + 1; j < list.length; j++) {
        if (list[j].title.startsWith(`${list[i].title.split(/ *\/ */)?.at(0)} /`)) {
          const title = list[j].title.split(/ *\/ */);
          const dTitle = (title.length === 1) ? title[0] : title.slice(1).join(' / ');
          subPromptList.push({
            ...list[j],
            dTitle: dTitle?.trim(),
            selected: false
          });
          i++;
        } else { break; }
      }

      localPromptList.push({
        title: title[0]?.trim(),
        list: subPromptList,
        hasMany: subPromptList.length > 1,
        selected: false
      });
    }

    this.promptList = _.cloneDeep(localPromptList);
    if (localPromptList[0]?.list?.[0]) {
      this.onSelectPrompt(0, 0);
    }
  }

  onSelectPrompt(listIndex: number, promptIndex: number = 0): void {
    if (this.selectedPromptIndexes.isSameIndexes(listIndex, promptIndex)) {
      return;
    }

    if (this.selectedPromptIndexes.isValidIndexes()) {
      const listItem = this.promptList[this.selectedPromptIndexes.listIndex];
      listItem.list[this.selectedPromptIndexes.promptIndex].selected = false;
      if ('selected' in listItem) {
        listItem.selected = false;
      }
    }
    if ('selected' in this.promptList[listIndex]) {
      this.promptList[listIndex].selected = true;
    }
    this.promptList[listIndex].list[promptIndex].selected = true;
    this.selectedPromptIndexes.set(listIndex, promptIndex);
    /** select category based on current select prompt */
    this.selectedCategory = _.cloneDeep(this.categoryList.find((cat: any) => (cat.title === this.promptList[listIndex].list[promptIndex].title && cat.templateId == this.selectedTemplate?._id)));
    /** filter requirements based on selected media(video) from selected category */
    for (const displayCategoryByMedia of this.displayCategoryByMediaList) {
      displayCategoryByMedia.categoryId = this.selectedCategory?._id;
      displayCategoryByMedia.requirements = _.cloneDeep(this.selectedCategory?.requirements?.filter((req: any) => req.recordingId == displayCategoryByMedia.recordingId));
    }

    if (this.aiSummaryList?.length > 0 && this.selectedCategory._id) {
      this.selectedCategoryAISummary = this.aiSummaryList.find((item: any) => item._id === this.selectedCategory._id);
    }

    if (this.mediaListWrap.nativeElement) {
      this.mediaListWrap.nativeElement.scrollTop = 0;
    }
  }

  setCategories(list: Array<any>): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!Array.isArray(list)) {
        return;
      }
      this.categoryList = _.cloneDeep(list);
      resolve();
    });
  }

  onEditRequirement(mediaIndex: number, requirementIndex: number) {
    if (this.editIndex.isValidIndexes()) {
      this.onCancelEditing();
    }
    this.editIndex.set(mediaIndex, requirementIndex);
    this.displayCategoryByMediaList[mediaIndex].requirements[requirementIndex].editMode = true;
  }

  onCancelEditing() {
    const requirement = this.displayCategoryByMediaList?.[this.editIndex.media]?.requirements?.[this.editIndex.requirement];
    if (requirement) {
      requirement.editMode = false;
      const oldRequirement = this.categoryList.find((cat: any) => cat._id === this.displayCategoryByMediaList[this.editIndex.media].categoryId)?.requirements.find((req: any) => req._id === requirement._id);
      requirement.requirement = oldRequirement.requirement;
    }
    this.editIndex.reset();
  }

  trimString(str: string): string {
    if (typeof str === 'string') {
      return str?.replace(/^\n*\s*|\n*\s*$/g, '');
    }
    return str;
  }

  onSaveChanges() {
    if (this.isRequestAlive || !this.editIndex.isValidIndexes()) {
      this.editIndex.reset();
      return;
    }

    const categoryByMedia = this.displayCategoryByMediaList[this.editIndex.media];
    const requirement = categoryByMedia.requirements[this.editIndex.requirement];
    requirement.requirement = this.trimString(requirement.requirement);
    if (!requirement?.requirement) {
      this.onCancelEditing();
      return;
    } else {
      this.isRequestAlive = true;
      const bodyToSend = {
        categoryId: categoryByMedia.categoryId,
        requirementId: categoryByMedia.requirements[this.editIndex.requirement]._id,
        requirementContent: requirement.requirement
      };

      this._facadeService.categoryService.updateRequirement(bodyToSend).subscribe({
        next: (res: IResponse) => {
          this.isRequestAlive = false;
          if (res.code === "OK") {
            const rawRequirement = this.categoryList.find((cat: any) => cat._id === categoryByMedia.categoryId)?.requirements.find((req: any) => req._id === requirement._id);
            if (rawRequirement) {
              rawRequirement.requirement = requirement.requirement;
            }
            const selectedRequirement = this.selectedCategory?.requirements?.find((req: any) => req._id === requirement._id);
            if (selectedRequirement) {
              selectedRequirement.requirement = requirement.requirement;
            }
            requirement.editMode = false;
            this.editIndex.reset();
          } else {
            this.onCancelEditing();
          }
        },
        error: (err: any) => {
          this.isRequestAlive = false;
          this.onCancelEditing();
          console.error('Error while updating requirement', err);
        }
      });
    }
  }

  onDeleteRequirement(mediaIndex: number, requirementIndex: number) {
    if (this.isRequestAlive) {
      return;
    }
    if (confirm('Are you sure you want to delete it?')) {
      const categoryId = this.displayCategoryByMediaList[mediaIndex]?.categoryId;
      const requirementId = this.displayCategoryByMediaList[mediaIndex]?.requirements?.[requirementIndex]._id;
      if (!categoryId || !requirementId) {
        return;
      }
      this.isRequestAlive = true;
      this._facadeService.categoryService.deleteRequirement(categoryId, requirementId).subscribe({
        next: (res: IResponse) => {
          if (res.code === "OK") {
            this.displayCategoryByMediaList[mediaIndex].requirements.splice(requirementIndex, 1);
            const rawRequirements = this.categoryList.find((cat: any) => cat._id === categoryId)?.requirements?.filter((req: any) => req._id !== requirementId);
            if (rawRequirements) {
              this.categoryList.find((cat: any) => cat._id === categoryId).requirements = rawRequirements;
            }
            const selectedRequirements = this.selectedCategory.requirements?.filter((req: any) => req._id !== requirementId);
            if (selectedRequirements) {
              this.selectedCategory.requirements = selectedRequirements;
            }
          }
          this.isRequestAlive = false;
        },
        error: (err: any) => {
          this.isRequestAlive = false;
          console.error('Error while deleting requirement', err);
        }
      });
    }
  }

  onGetAISummary() {
    if (!this.displayCategoryByMediaList.length || this.isAIRequestAlive) return;

    if (!this.isGetAISummaryClicked) this.isGetAISummaryClicked = true;
    const categories = this.categoryList.reduce((catAc: any, catCv: any) => {
      let cont = 1;
      const requirementsPoints = catCv.requirements.reduce((acc: any, cv: any) => {
        const mediaIndex = this.displayCategoryByMediaList.findIndex((media: any) => media.recordingId === cv.recordingId);
        if (cv.isApproved && mediaIndex > -1) {
          acc += `${cont++}. ${cv.requirement}\n`;
        }
        return acc;
      }, '');

      const category = { _id: catCv._id, requirements: '' };
      if (requirementsPoints) {
        category.requirements = requirementsPoints;
      }

      catAc.push(category);
      return catAc;
    }, []);

    this.isAIRequestAlive = true;
    this._facadeService.compareVideoService.getSummariesFromAI(categories).subscribe({
      next: (res: IResponse) => {
        if (res.code === "OK") {
          if ("categories" in res.data) {
            this.setAISummary(res.data.categories);
            this._facadeService.appService.openToaster('AI summary enabled.', 'success');
          }
        }
        this.isAIRequestAlive = false;
      },
      error: (err: IResponse) => {
        this.isAIRequestAlive = false;
        console.log('Error while getting collect common points via AI', err);
      }
    });
  }

  setAISummary(list: Array<any>): void {
    if (!Array.isArray(list)) {
      return;
    }
    this.aiSummaryList = list.map((obj: any) => {
      obj.requirements = obj.requirements.map((item: any) => ({ requirement: item, isSelected: false }));
      return obj;
    });
  }

  onSelectRequirement(categoryId: string, requirementId: string) {
    if (!this.permissions.COMPARE_EDIT.includes(this.currentUser.type)) {
      return;
    }

    const rawRequirement = this.categoryList.find((cat: any) => cat._id === categoryId)?.requirements?.find((rq: any) => rq._id === requirementId);
    if (rawRequirement) {
      rawRequirement.isApproved = !rawRequirement.isApproved;
      this._facadeService.compareVideoService.toggleRequirementApproval(categoryId, requirementId, rawRequirement.isApproved).subscribe({
        next: (res: any) => {
          if (res.code === 'OK') {
            const selectedRequirement = this.displayCategoryByMediaList.find((item: any) => item.recordingId === rawRequirement.recordingId)?.requirements?.find((req: any) => req._id === requirementId);
            if (selectedRequirement) {
              selectedRequirement.isApproved = rawRequirement.isApproved;
            }
            const oldRequirement = this.selectedCategory?.requirements?.find((rq: any) => rq._id === requirementId);
            if (oldRequirement) {
              oldRequirement.isApproved = rawRequirement.isApproved;
            }
            const aiSummaryReqIndex = this.selectedCategoryAISummary?.requirements?.findIndex((item: any) => item.requirement === rawRequirement.requirement);
            if (aiSummaryReqIndex > -1) {
              this.selectedCategoryAISummary.requirements[aiSummaryReqIndex].isSelected = rawRequirement.isApproved;
            }
          } else {
            rawRequirement.isApproved = !rawRequirement.isApproved;
          }
        },
        error: (err: any) => {
          rawRequirement.isApproved = !rawRequirement.isApproved;
          console.error('Error while update requirement approval', err);
        }
      });
    }
  }

  onCreateAIRequirement(categoryId: string, requirementStr: string) {
    if (!this.permissions.COMPARE_EDIT.includes(this.currentUser.type)) {
      return;
    }

    const prevAddedRequirement = this.selectedCategory.requirements.find((requirement: any) => requirement.requirement === requirementStr && requirement?.isAiGenerated);
    if (prevAddedRequirement) {
      if (prevAddedRequirement?.isApproved) return;

      prevAddedRequirement.isApproved = !prevAddedRequirement.isApproved;
      const rawPrevAddedRequirement = this.categoryList.find((cat: any) => (cat._id === categoryId && cat.templateId == this.selectedTemplate?._id))?.requirements?.find((requirement: any) => requirement.requirement === requirementStr && requirement?.isAiGenerated);
      if (rawPrevAddedRequirement) {
        rawPrevAddedRequirement.isApproved = prevAddedRequirement.isApproved;
      }
      const aiSummaryReqIndex = this.selectedCategoryAISummary?.requirements?.findIndex((item: any) => item.requirement === requirementStr);
      if (aiSummaryReqIndex > -1) {
        this.selectedCategoryAISummary.requirements[aiSummaryReqIndex].isSelected = prevAddedRequirement.isApproved;
      }
      this._facadeService.compareVideoService.toggleRequirementApproval(categoryId, prevAddedRequirement._id, prevAddedRequirement.isApproved).subscribe({
        next: (res: any) => {
          if (res.code !== 'OK') {
            prevAddedRequirement.isApproved = !prevAddedRequirement.isApproved;
            rawPrevAddedRequirement.isApproved = prevAddedRequirement.isApproved;
            if (aiSummaryReqIndex > -1) {
              this.selectedCategoryAISummary.requirements[aiSummaryReqIndex].isSelected = prevAddedRequirement.isApproved;
            }
          }
        },
        error: (err: any) => {
          prevAddedRequirement.isApproved = !prevAddedRequirement.isApproved;
          if (rawPrevAddedRequirement) {
            rawPrevAddedRequirement.isApproved = prevAddedRequirement.isApproved;
          }
          console.error('Error while update requirement approval', err);
        }
      });
    } else {

      this._facadeService.compareVideoService.createAIRequirement(categoryId, requirementStr).subscribe({
        next: (res: IResponse) => {
          if (res.code === "OK" && res.data?.newRequirement) {
            this.selectedCategory.requirements.push({ ...res.data.newRequirement });
            /** select category based on current select prompt */
            this.categoryList.find((cat: any) => (cat._id === categoryId && cat.templateId == this.selectedTemplate?._id))?.requirements?.push({ ...res.data.newRequirement });
            const aiSummaryReqIndex = this.selectedCategoryAISummary?.requirements?.findIndex((item: any) => item.requirement === requirementStr);
            if (aiSummaryReqIndex > -1) {
              this.selectedCategoryAISummary.requirements[aiSummaryReqIndex].isSelected = true;
            }
          }
        },
        error: (err: IResponse) => {
          console.error('Error while adding new requirement in category', err);
        }
      });
    }
  }

}
