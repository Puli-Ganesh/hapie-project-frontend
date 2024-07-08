import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Roles } from '@src/app/constants/roles';
import { Routes } from '@src/app/constants/routes';
import { FacadeService } from '@src/app/services/facade.service';
import { IResponse } from '@src/interfaces/response.interface';

@Component({
  selector: 'app-manage-project',
  templateUrl: './manage-project.component.html',
  styleUrls: ['./manage-project.component.scss']
})
export class ManageProjectComponent implements OnInit {

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _formBuilder: FormBuilder,
    private _facadeService: FacadeService,
  ) {

    this.projectId = this._route.snapshot.params['projectId'];
    // this.workspaceId = localStorage.getItem(StorageKeys.WORKSPACE_ID) ?? '';

    this.projectForm = this._formBuilder.group({
      projectName: ['', [Validators.required]],
      projectDescription: ['', [Validators.required]],
      thumbnailUrl: ['', []],
      workflow: [null, [Validators.required]],
      workspaceId: this.currentUser?.type == this.appRoles.ADMIN ? ['', [Validators.required]] : [''],
    });
  }


  protected readonly appRoles = Roles;
  protected readonly appRoutes = Routes;

  protected isRequestAlive: boolean = false;
  protected currentUser: any;
  protected workspaceId: string = '';
  protected isEditMode: boolean = false;

  protected currentStep: number = 1;
  protected readonly imageMimeTypes: Array<String> = ['image/jpg', 'image/jpeg', 'image/png'];


  // protected projectId: any;
  @Input('projectId') projectId: any;
  @Output('onClose') closeModal: EventEmitter<boolean> = new EventEmitter<boolean>();
  // @ViewChild('newProjectContainer') newProjectContainer!: ElementRef;
  @Output('upsertProject') upsertProjectEvent: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('colorOptionsList') colorOptionsList!: ElementRef;
  @ViewChild('selectedColorOption') selectedColorOption!: ElementRef;

  // @ViewChild('selectedTemplateWrapper') selectedTemplateWrapper!: ElementRef;
  // @ViewChild('templateListWrapper') templateListWrapper!: ElementRef;

  @ViewChild('workflowWrapper') workflowWrapper!: ElementRef;
  @ViewChild('workflowListWrapper') workflowListWrapper!: ElementRef;

  @ViewChild('selectedMemberWrapper') selectedMemberWrapper!: ElementRef;
  @ViewChild('membersListWrapper') membersListWrapper!: ElementRef;

  @ViewChildren('colorDropdown') colorDropdown!: Array<ElementRef>;

  protected projectCoverImg!: File | null;
  protected projectCoverImgPreview: string = '';

  protected projectForm: FormGroup;

  protected projectDetails: any;
  protected workspaceList: { _id: string, title: string }[] = [];
  protected selectedWorkspace?: { _id: string, title: string };

  protected workspaceOptionToggler: boolean = false;
  protected selectedColor: number = 1;
  protected colorOptions: Array<Array<number>> = [
    [1, 2, 3, 4],
    [1, 2, 3, 4],
    [1, 2, 3, 4],
    [1, 2, 3, 4]
  ];

  // protected selectTemplateToggler: boolean = false;
  protected selectMemberToggler: boolean = false;
  protected workflowToggler: boolean = false;
  protected loggedInUser: any = null;

  // private isOpenFirstTime: boolean = true;
  async ngOnInit() {
    // setTimeout(() => {
    //   this.isOpenFirstTime = false;
    //   // /** close the model if workspace id not found with if user is systemOwner */
    //   // if (!this.workspaceId) {
    //   //   this.closeModal.emit(true);
    //   // }
    // }, 0);
    this.loggedInUser = this._facadeService.authService.getCurrentUser();

    // if (this.currentUser?.type == this.appRoles.ADMIN) {
    //   await this.getWorkspaceOptions()
    //   await this.getMembersList();
    // } else {
    //   await this.getTemplatesList();
    //   await this.getMembersList();
    // }
    // if (this.projectId) {
    //   await this.getProjectDetails();
    //   this.isEditMode = true;
    // }
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes && changes['projectId'].firstChange) {
      if (this.currentUser?.type == this.appRoles.ADMIN) {
        await this.getWorkspaceOptions();
        await this.getMembersList();
        await this.getWorkflowList();
      } else {
        // await this.getTemplatesList();
        await this.getWorkflowList();
        await this.getMembersList();
      }
      if (changes['projectId'].currentValue) {
        await this.getProjectDetails();
        this.isEditMode = true;
      }
    }
  }

  getProjectDetails() {
    return new Promise((resolve, reject) => {
      this._facadeService.projectService.getProjectData(this.projectId).subscribe({
        next: (res: IResponse) => {
          this.projectDetails = res.data;
          this.setToEditProjectDetails();
          resolve(true);
        },
        error: (err: any) => {
          reject(err);
          console.error('Error while getting workspace options', err.error);
        }
      });
    });
  }

  @HostListener('document:click', ['$event.target'])
  clickOut(target: HTMLElement) {
    // if (this.isOpenFirstTime === false && !this.newProjectContainer?.nativeElement.contains(target)) {
    //   this.closeModal.emit(true);
    // }

    if (this.colorOptionsList && !this.colorOptionsList.nativeElement.contains(target) && this.selectedColorOption && !this.selectedColorOption.nativeElement.contains(target)) {
      this.selectColorToggler = false;
    }

    // if (this.selectedTemplateWrapper && !this.selectedTemplateWrapper.nativeElement.contains(target) && this.templateListWrapper && !this.templateListWrapper.nativeElement.contains(target)) {
    //   this.selectTemplateToggler = false;
    // }

    if (this.workflowWrapper && !this.workflowWrapper.nativeElement.contains(target) && this.workflowListWrapper && !this.workflowListWrapper.nativeElement.contains(target)) {
      this.workflowToggler = false;
    }

    if (this.selectedMemberWrapper && !this.selectedMemberWrapper.nativeElement.contains(target) && this.membersListWrapper && !this.membersListWrapper.nativeElement.contains(target)) {
      this.selectMemberToggler = false;
    }

    if (this.colorDropdown && this.memberDropdownToggler > -1) {
      let tempIndex = -1;
      this.colorDropdown.forEach((el: any, index: number) => {
        if (el.nativeElement.contains(target)) {
          tempIndex = index;
        }
      });
      this.memberDropdownToggler = tempIndex;
    }
  }


  get projectName(): AbstractControl {
    return this.projectForm.get('projectName') as FormGroup;
  }

  get projectDesc(): AbstractControl {
    return this.projectForm.get('projectDescription') as FormGroup;
  }

  get thumbnailUrl(): AbstractControl {
    return this.projectForm.get('thumbnailUrl') as FormGroup;
  }

  get getWorkspaceId(): AbstractControl {
    return this.projectForm.get('workspaceId') as FormGroup;
  }

  get getWorkflow(): AbstractControl {
    return this.projectForm.get('workflow') as FormGroup;
  }

  // get templateIds(): AbstractControl {
  //   return this.projectForm.get('templateIds') as FormArray;
  // }

  // addNewTemplateIdControls(val: string): void {
  //   // templateIds: this._formBuilder.array([]);
  //   (this.projectForm.controls['templateIds'] as FormArray).push(this._formBuilder.group({
  //     templateId: [val]
  //   }));
  // }

  onFileDrop(event: any) {
    this.onUploadProjectCoverThumb({
      target: {
        files: event
      }
    });
  }

  protected selectColorToggler: boolean = false;
  onToggleColorOptions() {
    this.selectColorToggler = !this.selectColorToggler;
  }

  selectProjectColor(event: any, index: number) {
    event.stopPropagation();
    this.selectedColor = index;
    this.selectColorToggler = false;
  }

  onStep(event: any, step: number) {
    event.stopPropagation();
    if (this.isEditMode) {
      this.currentStep = step
    }
  }

  protected projectImageDeleted: Boolean = false;
  onRemovePicture() {
    if (this.projectDetails?.thumbnailUrl && this.projectCoverImg) {
      this.thumbnailUrl.patchValue(this.projectDetails.thumbnailUrl?.split('/')?.pop() || '');
      this.thumbnailUrl.updateValueAndValidity();
      this.projectCoverImgPreview = this.projectDetails.thumbnailUrl;
      this.projectCoverImg = null;
    } else if (this.projectDetails?.thumbnailUrl && this.projectCoverImgPreview) {
      this.thumbnailUrl.patchValue('');
      this.thumbnailUrl.updateValueAndValidity();
      this.projectCoverImgPreview = '';
      this.projectDetails.thumbnailUrl = '';
      this.projectImageDeleted = true;
    } else if (this.projectCoverImgPreview) {
      this.thumbnailUrl.patchValue('');
      this.thumbnailUrl.updateValueAndValidity();
      this.projectCoverImg = null;
      this.projectCoverImgPreview = '';
    }
  }

  onUploadProjectCoverThumb({ target }: any) {
    if (this.imageMimeTypes.includes(target.files[0]?.type)) {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(target.files[0]);
      this.projectCoverImg = target.files[0];
      this.thumbnailUrl.setValue(this.projectCoverImg!.name);

      fileReader.onload = (fileEvent: any) => {
        this.projectCoverImgPreview = fileEvent.target.result;
      };
    } else if (target.files[0]) {
      if (this.thumbnailUrl.value) {
        target.value = '';
        this.projectCoverImg = null;
        this.projectCoverImgPreview = '';
        this.thumbnailUrl.patchValue('');
        this.thumbnailUrl.updateValueAndValidity();
      }
      this.thumbnailUrl.setErrors({ mimeTypeNotSupport: `.${target.files[0].name?.split('.')?.pop()} file format not supported.` });
      this.thumbnailUrl.markAsTouched();
    }
  }

  onProjectUpsert() {
    if (this.isRequestAlive) {
      return;
    }
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      this.projectForm.updateValueAndValidity();
      return;
    }

    const projectDto: any = new FormData();

    if (this.projectCoverImg) {
      projectDto.append('file', this.projectCoverImg);
    } else if (this.projectImageDeleted) {
      projectDto.append('file', 'remove');
    }

    projectDto.append('projectName', this.projectName.value);
    projectDto.append('projectDescription', this.projectDesc.value);
    projectDto.append('color', this.selectedColor.toString());
    projectDto.append('templateIds', this.selectedTemplate.map((t: any) => t._id).join(','));

    if (this.currentUser?.type == this.appRoles.ADMIN) {
      projectDto.append('workspaceId', this.getWorkspaceId.value);
    }

    this.isRequestAlive = true;
    if (this.isEditMode) {
      this._facadeService.projectService.updateProject(this.projectDetails._id, projectDto).subscribe({
        next: (res: any) => {
          this.isRequestAlive = false;
          if (res.code == "OK") {
            this.upsertProjectEvent.emit(res.data.project);
            // this.currentStep = 2;
            this._facadeService.appService.openToaster('Saved', 'success');
          }
        },
        error: (error: any) => {
          this.isRequestAlive = false;
          this._facadeService.appService.openToaster('Project details not updated', 'danger');
          console.error('There is an error while updating project', error);
        }
      });

    } else {
      projectDto.append('workflowId', this.getWorkflow.value._id);
      this._facadeService.projectService.createProject(projectDto).subscribe({
        next: (res: any) => {
          this.isRequestAlive = false;
          if (res.code == "CREATED") {
            this.projectDetails = res.data.project;
            this.upsertProjectEvent.emit(res.data.project);
            for (const member of this.projectDetails.members) {
              const index = this.membersList.findIndex((mem: any) => mem._id == member.userId);
              if (index > -1) {
                this.selectedMembers.push({
                  ...this.membersList[index],
                  color: member.color
                });
              }
            }
            this.filteredMembersList = this.membersList.filter((m: any) => !this.selectedMembers.some((sm: any) => sm._id === m._id));
            this.currentStep = 2;
            this._facadeService.appService.openToaster('Project created successfully', 'success');
          }
        },
        error: (error: any) => {
          this._facadeService.appService.openToaster('Can not create project', 'danger');
          this.isRequestAlive = false;
          console.error('There is an error while creating project', error);
        }
      });
    }
  }

  async setToEditProjectDetails() {
    if (!this.projectDetails) {
      // this.closeModal.emit(true);
      return;
    }

    const workflow = this.workflowList.find((w: any) => w._id === this.projectDetails?.workflowId?._id);

    this.projectForm.patchValue({
      projectName: this.projectDetails.projectName,
      projectDescription: this.projectDetails.projectDescription,
      thumbnailUrl: this.projectDetails.thumbnailUrl?.split('/').pop(),
      workspaceId: this.projectDetails?.workspaceId,
      workflow: workflow ?? null
    });

    this.projectCoverImgPreview = this.projectDetails.thumbnailUrl;
    this.selectedColor = this.projectDetails.color;

    // for (let template of this.projectDetails.templateIds) {
    //   const index = this.templateList.findIndex((tem: any) => tem._id == template);
    //   if (index > -1) {
    //     this.templateList[index].checked = true;
    //     this.selectedTemplate.push(this.templateList[index]);
    //   }
    // }
    // this.selectedTemplateString = this.selectedTemplate.map((t: any) => t.title).join(', ')

    for (let member of this.projectDetails.members) {
      const index = this.membersList.findIndex((mem: any) => mem._id == member.userId);
      if (index > -1) {
        this.selectedMembers.push({
          ...this.membersList[index],
          color: member.color
        });
      }
    }
    this.filteredMembersList = this.membersList.filter((m: any) => !this.selectedMembers.find((sm: any) => sm._id === m._id));
    // this.selectedWorkspace = this.workspaceList.find((item: any) => item._id === this.projectDetails.workspaceId);
    // await this.getTemplatesList();
    // this.selectedTemplates = this.templateList.filter((template: any) => this.projectDetails.templateIds.includes(template._id));
  }

  protected workflowList: Array<any> = [];
  getWorkflowList(): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      this._facadeService.workflowService.getMasterList().subscribe({
        next: (res: any) => {
          if (res.code == 'OK') {
            this.workflowList = res.data.list;
          }
          resolve();
        }, error: (err: any) => {
          reject(err);
          console.error('Error while getting workflow list', err.error);
        }
      });
    });
  }

  onSelectWorkflow(event: any, workflowIndex: any) {
    event.stopPropagation();
    const workflow = this.workflowList[workflowIndex];
    if (workflow && workflow._id !== this.getWorkflow.value?._id) {
      this.getWorkflow.patchValue(workflow);
      this.getWorkflow.updateValueAndValidity();
    }
    this.workflowToggler = false;
  }

  getWorkspaceOptions(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._facadeService.workspaceService.getOptions().subscribe({
        next: (res: IResponse) => {
          if (res.code === "OK") {
            this.workspaceList = res.data.workspaces;
          }
          resolve(true);
        },
        error: (err: any) => {
          reject(err);
          console.error('Error while getting workspace options', err.error);
        }
      });
    });
  }

  onToggleWorkspaceOptions() {
    this.workspaceOptionToggler = !this.workspaceOptionToggler;
  }

  onSelectWorkspace(workspace: any) {
    if (this.selectedWorkspace?._id === workspace._id) {
      this.workspaceOptionToggler = !this.workspaceOptionToggler;
      return;
    }
    this.getWorkspaceId.patchValue(workspace?._id);
    this.getWorkspaceId?.updateValueAndValidity();
    this.selectedWorkspace = workspace;
    this.workspaceOptionToggler = !this.workspaceOptionToggler;
    // this.getTemplatesList();
    // /** reset selected template list with workspace change */
    // this.selectedTemplates = [];
  }

  onBlurWorkspace() {
    this.workspaceOptionToggler = false;
  }

  // protected templateList: Array<any> = [];
  // protected selectedTemplates: Array<any> = [];
  // protected templateOptionToggler: boolean = false;

  // getTemplatesList(): Promise<any> {
  //   return new Promise((resolve: any, reject: any) => {
  //     /** workspaceId is compulsory to send in params only for system owner. with on workspace change, first we get workspaceId from projectForm if not found then move to projectDetails on project edit mode */
  //     this._facadeService.templateService.getTemplateListForProject(this.projectId).subscribe({
  //       next: (res: IResponse) => {
  //         if (res.code === "OK" && res.data?.list?.length) {
  //           this.templateList = res.data.list.map((t: any) => ({
  //             ...t,
  //             checked: false
  //           }));
  //         }
  //         resolve();
  //       },
  //       error: (err: any) => {
  //         reject(err);
  //         console.error('Error while getting template list', err);
  //       }
  //     });
  //   });
  // }

  protected membersList: Array<any> = [];
  protected filteredMembersList: Array<any> = [];
  protected selectedMembers: Array<any> = [];
  protected memberDropdownToggler: number = -1;

  getMembersList(): Promise<any> {
    if (!this.loggedInUser) {
      this.loggedInUser = this._facadeService.authService.getCurrentUser();
    }
    return new Promise((resolve: any, reject: any) => {
      this._facadeService.userService.getListByWorkspaceId().subscribe({
        next: (res: IResponse) => {
          if (res.data) {
            this.membersList = res.data.filter((m: any) => ![Roles.ADMIN].includes(m.type));
            this.filteredMembersList = [...this.membersList];
          }
          resolve();
        },
        error: (err: any) => {
          reject(err);
          console.error('Error while getting template list', err);
        }
      });
    })
  }

  selectMember(event: any, memberIndex: number) {
    event.stopPropagation();
    const member = this.selectedMembers.find((m: any) => m._id == this.filteredMembersList[memberIndex]._id);
    if (!member) {
      this.selectedMembers.push({ ...this.filteredMembersList[memberIndex], color: 1 });
      this.filteredMembersList.splice(memberIndex, 1);
    }
    this.selectMemberToggler = false;
  }

  removeSelectedUser(event: any, userIndex: number) {
    event.stopPropagation();
    if (this.selectedMembers[userIndex]) {
      this.selectedMembers.splice(userIndex, 1);
      this.filteredMembersList = this.membersList.filter((m: any) => !this.selectedMembers.find((sm: any) => sm._id === m._id));
    }
  }

  toggleMemberColorDropdown(userIndex: number) {
    if (this.memberDropdownToggler == userIndex) {
      this.memberDropdownToggler = -1;
    } else {
      this.memberDropdownToggler = userIndex
    }
  }

  selectMemberColor(event: any, userIndex: number, color: number) {
    event.stopPropagation();
    const member = this.selectedMembers[userIndex];
    if (member) {
      member.color = color;
    }
    this.memberDropdownToggler = -1;
  }

  onAddMembers() {
    if (this.isRequestAlive) return;

    if (this.isEditMode) {
      const body: any = {
        projectId: this.projectDetails._id,
        add: [],
        update: [],
        remove: []
      };
      const oldMemberIds = this.projectDetails.members.map((m: any) => m.userId);
      const selectedMemberIds = this.selectedMembers.map((m: any) => m._id);
      for (let member of this.selectedMembers) {
        if (!oldMemberIds.includes(member._id)) {
          body['add'].push({
            userId: member._id,
            color: member.color
          });
        } else if (oldMemberIds.includes(member._id)) {
          body['update'].push({
            userId: member._id,
            color: member.color
          });
        }
      }
      for (let oldId of oldMemberIds) {
        if (!selectedMemberIds.includes(oldId)) {
          body['remove'].push(oldId);
        }
      }

      this._facadeService.projectService.updateMembers(body).subscribe({
        next: (res: any) => {
          this.onCancelAndSkip();
          this._router.navigateByUrl(this.appRoutes.PROJECTS);
          this.isRequestAlive = false;
          this._facadeService.appService.openToaster('Team members saved', 'success');
        },
        error: (err: any) => {
          console.log(err.error);
          this._facadeService.appService.openToaster('Members not updated', 'danger');
          this.isRequestAlive = false;
        }
      });

    } else {
      if (!this.selectedMembers.length) {
        this.onCancelAndSkip();
        return;
      }

      const body = {
        projectId: this.projectDetails._id,
        add: this.selectedMembers.map((mem: any) => ({ userId: mem._id, color: mem.color }))
      };

      this.isRequestAlive = true;
      this._facadeService.projectService.updateMembers(body).subscribe({
        next: (res: any) => {
          this.onCancelAndSkip();
          this.isRequestAlive = false;
          this._facadeService.appService.openToaster('Team members added', 'success');
        },
        error: (err: any) => {
          console.log(err);
          this._facadeService.appService.openToaster('Members not updated', 'danger');
          this.isRequestAlive = false;
        }
      });
    }
  }

  protected selectedTemplate: any = [];
  protected selectedTemplateString = '';

  // onToggleTemplateOptions() {
  //   this.templateOptionToggler = !this.templateOptionToggler;
  // }

  // onSelectTemplate(event: any, templateIndex: any) {
  //   event.stopPropagation();
  //   this.templateList[templateIndex].checked = !this.templateList[templateIndex].checked;
  //   if (this.templateList[templateIndex].checked) {
  //     this.selectedTemplate.push(this.templateList[templateIndex]);
  //   } else {
  //     this.selectedTemplate = this.selectedTemplate.filter((t: any) => t._id != this.templateList[templateIndex]._id);
  //   }

  //   this.selectedTemplateString = this.selectedTemplate.map((t: any) => t.title).join(', ');
  // }

  // onRemoveSelectedTemplate(index: any) {
  //   if (this.selectedTemplates?.at(index)) {
  //     this.selectedTemplates.splice(index, 1);
  //   }
  // }

  // onBlurTemplate() {
  //   this.templateOptionToggler = false;
  // }

  onCancelAndSkip() {
    // this._router.navigateByUrl(this.appRoutes.HOME);
    this.closeModal.emit(true);
  }

}