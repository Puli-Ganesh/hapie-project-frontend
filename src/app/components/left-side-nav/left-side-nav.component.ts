import { Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';

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
        // console.log(this.currentUser)
      }
    });
    

    this.setActiveMenu(this._router.url);

    this.routerSubscription = this._router.events.pipe(
      filter((event: any) => event instanceof NavigationEnd)
    ).subscribe({
      next: (event: any) => {
        this.setActiveMenu(event.urlAfterRedirects)
      },
      error: (err) => {
        console.error('There is an error while navigation end', err);
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

  routerSubscription: Subscription;
  activeMenu = '';
  workflowToggler = false;
  projectsToggler = false;


  @HostListener('document:click', ['$event'])
  clickOut(event: any) {
    if (this.avatarToggler && !this.avatarToggler.nativeElement.contains(event.target) && this.avatarMenuWrapper && !this.avatarMenuWrapper.nativeElement.contains(event.target)) {
      this.avatarMenu = false;
    }
    if (this.isNotifCenterOpen && !this.notificationContainer?.nativeElement?.contains(event.target)) {
      this.isNotifCenterOpen = false;
    }
  }

  setActiveMenu(url: string) {
    if (url.startsWith('/projects') || url.startsWith('/home')) {
      this.activeMenu = 'projects';
    } else if (url.startsWith('/workflows')) {
      this.activeMenu = 'workflows'
    } else if (url.startsWith('/team')) {
      this.activeMenu = 'team';
    } else if (url.startsWith('/templates')) {
      this.activeMenu = 'templates';
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

  onTeam() {
    this._router.navigate([this.appRoutes.TEAM])
  }
  onProjects() {
    this._router.navigate([this.appRoutes.HOME])
  }
  onTemplates() {
    this._router.navigate([this.appRoutes.TEMPLATES])
  }
  onWorkflows() {
    this._router.navigate([this.appRoutes.WORKFLOWS])
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
    this._facadeService.projectService.removeSelectedProject();
    this.routerSubscription?.unsubscribe();
  }

}
