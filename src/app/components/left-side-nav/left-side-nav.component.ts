import { Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { Permissions } from '@src/app/constants/permissions';
import { Routes } from '@src/app/constants/routes';
import { FacadeService } from '@src/app/services/facade.service';

@Component({
  selector: 'app-left-side-nav',
  templateUrl: './left-side-nav.component.html',
  styleUrls: ['./left-side-nav.component.scss']
})
export class LeftSideNavComponent implements OnDestroy {

  constructor(
    private _facadeService: FacadeService,
    private _router: Router
  ) {
    this.projectIdSubscription = this._facadeService.projectService.projectId$.subscribe({
      next: (projectId: string) => {
        this.projectId = projectId ?? '';
      }
    });
    this.userSubscription = this._facadeService.authService.getCurrentUser$().subscribe({
      next: (user: any) => {
        this.currentUser = user;
      }
    });
    this.notificationSubscription = this._facadeService.notificationService.newNotification$.subscribe({
      next: (event: any) => {
        this.notificationCount = this._facadeService.notificationService.notificationCount;
      }
    });
  }

  protected readonly permissions = Permissions;
  protected readonly appRoutes = Routes;
  protected projectId: any;
  protected currentUser: any;
  protected userSubscription!: Subscription;
  protected projectIdSubscription!: Subscription;

  protected isRequestAlive: boolean = false;

  protected notificationSubscription: Subscription;
  protected notificationCount: number = 0;

  protected notificationList: Array<{
    message: string
    projectId: any
    name: string
    shareCanvasId: {
      hasEditAccess: boolean
    }
  }> = [];

  protected selectedMenu: number = 1;
  protected isNavCollapsed: boolean = false;
  protected avatarMenu: boolean = false;
  @ViewChild('avatarToggler') avatarToggler!: ElementRef;
  @ViewChild('avatarMenuWrapper') avatarMenuWrapper!: ElementRef;

  protected isNotifCenterOpen: boolean = false;
  @ViewChild('notificationContainer') notificationContainer!: ElementRef;



  @HostListener('document:click', ['$event'])
  clickOut(event: any) {
    if (this.avatarToggler && !this.avatarToggler.nativeElement.contains(event.target) && this.avatarMenuWrapper && !this.avatarMenuWrapper.nativeElement.contains(event.target)) {
      this.avatarMenu = false;
    }
    if (this.isNotifCenterOpen && !this.notificationContainer?.nativeElement?.contains(event.target)) {
      this.isNotifCenterOpen = false;
    }
  }

  getNotificationList(): void {
    if (this.isRequestAlive) return;

    this.isRequestAlive = true;
    this._facadeService.notificationService.getNotificationList().subscribe({
      next: (res: any) => {
        this.isRequestAlive = false;
        if (res.code == "OK") {
          this.notificationList = res.data.list;
        }
      },
      error: (err: any) => {
        this.isRequestAlive = false;
        console.error('Error while getting notification list', err);
      }
    });
  }

  onApproveEditAccess(index: number): void {
    if (this.isRequestAlive) return;

    this.isRequestAlive = true;
    const notification: any = this.notificationList[index];
    if (notification) {
      this._facadeService.notificationService.approveEditAccess(notification._id).subscribe({
        next: (res: any) => {
          this.isRequestAlive = false;
          if (res.code === "OK") {
            notification.shareCanvasId.hasEditAccess = true;
            this._facadeService.appService.openToaster('Approved', 'success');
          }
        },
        error: (err: any) => {
          this.isRequestAlive = false;
          if (err.error.message) {
            this._facadeService.appService.openToaster(err.error.message, 'danger');
          }
          console.error('Error while approving edit access.', err);
        }
      });
    }
  }

  onNotificationToggle() {
    this.isNotifCenterOpen = !this.isNotifCenterOpen;
    this._facadeService.notificationService.markAllAsRead();
    if (this.isNotifCenterOpen) {
      this.getNotificationList();
    }
  }

  onLogout() {
    this._facadeService.authService.logOut();
    this._router.navigateByUrl(this.appRoutes.LOGIN);
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    this.projectIdSubscription?.unsubscribe();
    this.notificationSubscription?.unsubscribe();
    this._facadeService.projectService.removeSelectedProject();
  }

}
