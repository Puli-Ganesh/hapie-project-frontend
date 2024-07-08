import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Roles } from '@src/app/constants/roles';
import { FacadeService } from '@src/app/services/facade.service';
import { Regex } from '@src/app/constants/regex';


@Component({
  selector: 'app-add-member',
  templateUrl: './add-member.component.html',
  styleUrls: ['./add-member.component.scss']
})
export class AddMemberComponent implements OnInit, OnChanges {

  @Input() memberDetails: any;
  @Output() close: EventEmitter<boolean> = new EventEmitter();
  @Output() memberAdded: EventEmitter<any> = new EventEmitter();
  @Output() memberUpdated: EventEmitter<any> = new EventEmitter();

  constructor(
    private _formBuilder: FormBuilder,
    private _facadeService: FacadeService
  ) {
    this.userForm = this._formBuilder.group({
      firstName: ['', [Validators.maxLength(30)]],
      lastName: ['', [Validators.maxLength(30)]],
      email: ['', [
        Validators.required,
        Validators.pattern(Regex.EMAIL),
        Validators.maxLength(254)
      ]],
      hasAllProjectAccess: [false]
    });
  }

  protected readonly userRoles = Roles;
  protected readonly roleOptions: Array<any> = [
    {
      title: 'System owner',
      value: this.userRoles.SYSTEM_OWNER
    },
    {
      title: 'Project owner',
      value: this.userRoles.PROJECT_OWNER
    },
    {
      title: 'Viewer',
      value: this.userRoles.VIEWER
    }
  ];
  protected projectToggler: boolean = false;
  protected roleToggler: boolean = false;
  protected selectedRole: any = this.roleOptions[this.roleOptions.length - 1];

  @ViewChild('memberWrapper') memberWrapper!: ElementRef;
  @ViewChild('roleListWrapper') roleListWrapper!: ElementRef;
  @ViewChild('selectedRoleWrapper') selectedRoleWrapper!: ElementRef;
  @ViewChild('projectListWrapper') projectListWrapper!: ElementRef;
  @ViewChild('selectedProjectWrapper') selectedProjectWrapper!: ElementRef;

  @HostListener('document:click', ['$event'])
  clickOut(event: any) {
    if (this.isOpenFirstTime == false && this.memberWrapper && !this.memberWrapper.nativeElement.contains(event.target)) {
      this.onCloseModal();
    }

    if (this.roleListWrapper && !this.roleListWrapper.nativeElement.contains(event.target) && this.selectedRoleWrapper && !this.selectedRoleWrapper.nativeElement.contains(event.target)) {
      this.roleToggler = false;
    }

    if (this.projectListWrapper && !this.projectListWrapper.nativeElement.contains(event.target) && this.selectedProjectWrapper && !this.selectedProjectWrapper.nativeElement.contains(event.target)) {
      this.projectToggler = false;
    }
  }

  protected oldProjectAccessIds: any = [];
  protected editMode: boolean = false;
  protected userForm: FormGroup;
  protected isOpenFirstTime: boolean = true;
  protected projectsList: any = [];
  protected selectedProjectString: string = 'All projects';

  get email(): AbstractControl | null {
    return this.userForm.get('email') as AbstractControl;
  }

  get firstName(): AbstractControl | null {
    return this.userForm.get('firstName') as AbstractControl;
  }

  get lastName(): AbstractControl | null {
    return this.userForm.get('lastName') as AbstractControl;
  }

  async ngOnInit() {
    setTimeout(() => {
      this.isOpenFirstTime = false;
    }, 0);
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes && changes['memberDetails']?.currentValue) {
      await this.getProjectList();
      this.setEditMode();
    } else {
      await this.getProjectList();
    }
  }

  setEditMode() {
    if (this.memberDetails) {
      this.editMode = true;
      this.userForm.patchValue({
        firstName: this.memberDetails.firstName,
        lastName: this.memberDetails.lastName,
        email: this.memberDetails.email,
        hasAllProjectAccess: this.memberDetails.hasAllProjectAccess ?? false
      });
      this.userForm.get('email')?.disable();
      const rIndex = this.roleOptions.findIndex((role: any) => role.value == this.memberDetails.type);
      if (rIndex > -1) {
        this.selectedRole = this.roleOptions[rIndex];
      }

      for (let project of this.projectsList) {
        project.checked = false;
        if (project.members) {
          const index = project.members.findIndex((user: any) => user.userId == this.memberDetails._id);
          if (index > -1) {
            project.checked = true;
          }
        }
      }

      this.oldProjectAccessIds = this.projectsList.filter((p: any) => p.checked).map((p: any) => p._id);
      const res = this.projectsList.every((p: any) => p.checked);
      const bangRes = this.projectsList.every((p: any) => !p.checked);
      if (res) {
        this.selectedProjectString = 'All projects';
      } else if (bangRes) {
        this.selectedProjectString = 'None';
      } else {
        this.selectedProjectString = this.projectsList.filter((p: any) => p.checked).map((p: any) => p.projectName).join(', ');
      }
    }
  }

  getProjectList() {
    return new Promise((resolve: any, reject: any) => {
      this._facadeService.projectService.getList().subscribe({
        next: (res: any) => {
          this.projectsList = res.data.projects.map((p: any) => ({ ...p, checked: true }));
          resolve();
        },
        error: (err: any) => {
          reject();
        }
      });
    });
  }

  onSelectRole(event: any, roleIndex: number) {
    event.stopPropagation();
    const role = this.roleOptions[roleIndex];
    if (role) {
      this.selectedRole = role;
    }
    this.roleToggler = false;
  }

  onSelectProject(event: any, projectIndex: number) {
    event.stopPropagation();
    if (this.projectsList[projectIndex]) {
      this.projectsList[projectIndex].checked = !this.projectsList[projectIndex].checked;
    }

    if (this.projectsList[projectIndex].checked) {
      const res = this.projectsList.every((p: any) => p.checked);
      if (res) {
        this.selectedProjectString = 'All projects';
      } else {
        this.selectedProjectString = this.projectsList.filter((p: any) => p.checked).map((p: any) => p.projectName).join(', ');
      }
      this.userForm.get('hasAllProjectAccess')?.patchValue(res);
      this.userForm.updateValueAndValidity();
    } else {
      const res = this.projectsList.every((p: any) => !p.checked);
      if (res) {
        this.selectedProjectString = 'None';
      } else {
        this.selectedProjectString = this.projectsList.filter((p: any) => p.checked).map((p: any) => p.projectName).join(', ');
      }
      this.userForm.get('hasAllProjectAccess')?.patchValue(res);
      this.userForm.updateValueAndValidity();
    }
  }

  onSelectAllProject(event: any) {
    event.stopPropagation();
    if (this.selectedProjectString == 'All projects') {
      for (let project of this.projectsList) {
        project.checked = false;
      }
      this.selectedProjectString = 'None';
      this.userForm.get('hasAllProjectAccess')?.patchValue(false);
      this.userForm.updateValueAndValidity();
    } else {
      for (let project of this.projectsList) {
        project.checked = true;
      }
      this.selectedProjectString = 'All projects';
      this.userForm.get('hasAllProjectAccess')?.patchValue(true);
      this.userForm.updateValueAndValidity();
    }
  }

  onSendInvite() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.userForm.updateValueAndValidity();
      return;
    }
    if (this.selectedProjectString == 'None') return;


    if (this.editMode) {
      const body: any = {
        firstName: this.userForm.value.firstName,
        lastName: this.userForm.value.lastName,
        userId: this.memberDetails._id,
        role: this.selectedRole.value,
        hasAllProjectAccess: this.userForm.value.hasAllProjectAccess,
        add: [],
        remove: []
      };

      let newProjectAccess = this.projectsList.filter((p: any) => p.checked).map((p: any) => p._id);
      for (let projectId of this.oldProjectAccessIds) {
        if (!newProjectAccess.includes(projectId)) {
          body.remove.push(projectId);
        }
      }
      body.add = newProjectAccess.filter((p: any) => !this.oldProjectAccessIds.includes(p));

      this._facadeService.userService.updateRoleWithProjectAccess(this.memberDetails._id, body).subscribe({
        next: (res: any) => {
          this.memberUpdated.next(res.data);
          this._facadeService.appService.openToaster('Saved', 'success');
          this.onCloseModal();
        },
        error: (err: any) => {
          console.error(err);
          this._facadeService.appService.openToaster('member updating error', 'danger');
        }
      });
    } else {
      const body = {
        email: this.userForm.value.email,
        firstName: this.userForm.value.firstName,
        lastName: this.userForm.value.lastName,
        role: this.selectedRole.value,
        projectAccess: this.projectsList.filter((p: any) => p.checked).map((p: any) => p._id),
        hasAllProjectAccess: this.userForm.value.hasAllProjectAccess,
        isInvited: true,
      };

      this._facadeService.userService.inviteUser(body).subscribe({
        next: (res: any) => {
          this.memberAdded.emit(res.data);
          this._facadeService.appService.openToaster('Invite sent', 'success');
          this.onCloseModal();
        },
        error: (err: any) => {
          console.error(err);
          this._facadeService.appService.openToaster('Invite sending error', 'danger');
        }
      });
    }
  }

  onCloseModal() {
    this.close.emit(true);
  }
}
