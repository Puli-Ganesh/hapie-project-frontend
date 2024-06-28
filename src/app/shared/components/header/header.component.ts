import { ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Routes } from '@src/app/constants/routes';
import { FacadeService } from '@src/app/services/facade.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  constructor(
    private _facadeService: FacadeService,
    private _router: Router,
    private _cdRef: ChangeDetectorRef 
  ) {
    this.userSubscription = this._facadeService.authService.getCurrentUser$().subscribe({
      next: (user: any) => {
        this.currentUser = user;
      }
    });

    this.notificationSubscription = this._facadeService.notificationService.newNotification$.subscribe({
      next: (event: any) => {
        this.notificationCount = this._facadeService.notificationService.notificationCount;
        this._cdRef.detectChanges();
      }
    });
  }

  protected appRoutes = Routes;
  protected profileToggler = false;
  @ViewChild('profileMenuWrapper') profileMenuWrapper!: ElementRef;

  currentUser: any;
  notificationSubscription: Subscription;
  userSubscription: Subscription;
  isNotifCenterOpen: boolean = false;
  isRequestAlive: boolean = false;
  notificationList: Array<{
    message: string
    projectId: any
    name: string
    shareCanvasId: {
      hasEditAccess: boolean
    }
  }> = [];
  notificationCount: number = 0;
  @ViewChild('notificationContainer') notificationContainer!: ElementRef;


  @HostListener('document:click', ['$event'])
  clickOut(event: any) {
    if (this.isNotifCenterOpen && !this.notificationContainer?.nativeElement?.contains(event.target)) {
      this.isNotifCenterOpen = false;
    }
    if (this.profileToggler && !this.profileMenuWrapper?.nativeElement?.contains(event.target)) {
      this.profileToggler = false;
    }
  }

  ngOnInit(): void { }

  onLogout() {
    this._router.navigateByUrl(this._facadeService.appService.getReplacedUrl(this.appRoutes.LOGIN));
    this._facadeService.projectService.removeSelectedProject();
    this._facadeService.authService.logOut();
  }

  onNotificationToggle() {
    this.isNotifCenterOpen = !this.isNotifCenterOpen;
    this._facadeService.notificationService.markAllAsRead();
    if (this.isNotifCenterOpen) {
      this.getNotificationList();
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

  ngOnDestroy(): void {
    this.notificationSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
  }

}
