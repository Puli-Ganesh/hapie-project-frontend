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
  activeTab: string = 'general';
  notificationList: Array<any> = [
    {
      title: 'A recent sign-in to your account was detected from an unknown location.',
      message: '',
      time: '8 min ago',
      category: 'general',
      icon: 'assets/images/notification_warning_icon.svg',
      actions: [{ label: 'Review', type: 'primary' }],
      status: 'unread'
    },
    {
      title: '<strong><b>John Smith</b></strong> requested access to <strong><b>Project 1</b></strong>',
      message: '',
      time: '8 min ago',
      category: 'requests',
      icon: 'assets/images/notification_user_profile.svg',
      actions: [{ label: 'Deny', type: 'secondary' }, { label: 'Approve', type: 'primary' }],
      status: 'unread'
    },
    {
      title: '<strong><b>John Smith</b></strong> uploaded a document <strong><b>to project 1</b></strong>',
      message: 'document-name.docx',
      time: '8 min ago',
      category: 'general',
      icon: 'assets/images/notification_file_upload.svg',
      status: 'unread'
    },
    {
      title: 'Your document is ready for viewing',
      message: '',
      time: '8 min ago',
      category: 'general',
      icon: 'assets/images/notification_uploaded_file_view.svg',
      status: 'unread'
    },
    {
      title: 'Someone recently joined your project',
      message: '',
      time: '8 min ago',
      category: 'general',
      icon: 'assets/images/notification_unknown_user.svg',
      status: 'unread'
    }
];

notifications: any[] = [];
notificationCount: number = this.notificationList.length;
archivedNotifications: Array<any> = [];
private archiveMenuTimeout: any = null;
  ngOnInit(): void { }

  onLogout() {
    this._router.navigateByUrl(this._facadeService.appService.getReplacedUrl(this.appRoutes.LOGIN));
    this._facadeService.projectService.removeSelectedProject();
    this._facadeService.authService.logOut();
  }

  onNotificationToggle() {
    this.isNotifCenterOpen = !this.isNotifCenterOpen;
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  

 

  markAllAsRead() {
    this.notificationList = this.notificationList.map(notification => {
        if (notification.category === this.activeTab) {
            return { ...notification, status: 'read' };
        }
        return notification;
    });
}

markSingleAsRead(notification: any) {
  notification.status = 'read';
}

stopCloseArchiveMenu(notification: any) {
  if (this.archiveMenuTimeout) {
    clearTimeout(this.archiveMenuTimeout);
  }
}
startCloseArchiveMenu(notification: any) {
  this.archiveMenuTimeout = setTimeout(() => {
    notification.isArchiveOpen = false;
  }, 500);
}

toggleArchiveMenu(notification: any, event: Event) {
  event.stopPropagation();
  this.notificationList.forEach(notif => {
      if (notif !== notification) {
          notif.isArchiveOpen = false;
      }
  });

  notification.isArchiveOpen = !notification.isArchiveOpen;
}







keepArchiveOpen(notification: any) {
  if (this.archiveMenuTimeout) {
    clearTimeout(this.archiveMenuTimeout);
  }
  notification.isArchiveOpen = true;
}


scheduleCloseArchiveMenu(notification: any) {
  this.archiveMenuTimeout = setTimeout(() => {
    notification.isArchiveOpen = false;
  }, 100);
}




archiveNotification(notification: any, event: Event) {
  event.stopPropagation();
  this.notificationList = this.notificationList.filter(n => n !== notification);
  notification.category = 'archived';
  notification.isArchiveOpen = false;
  this.archivedNotifications.push(notification);
}



get filteredNotifications() {
  return this.activeTab === 'archived' 
    ? this.archivedNotifications 
    : this.notificationList.filter(n => n.category === this.activeTab);
}


get unreadNotificationCount(): number {
  return this.notificationList.filter(notification => notification.status === 'unread').length;
}


getTabCount(category: string): number {
  if (category === 'general') {
    return this.notificationList.filter(n => n.category === 'general').length;
  } else if (category === 'requests') {
    return this.notificationList.filter(n => n.category === 'requests').length;
  } else if (category === 'archived') {
    return this.archivedNotifications.length;
  }
  return 0;
}


approveRequest(notification: any) {
  this.notificationList = this.notificationList.filter(n => n !== notification);
}



  ngOnDestroy(): void {
    this.notificationSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
  }


  @HostListener('document:click', ['$event'])
onClickOutside(event: Event) {
    const clickedElement = event.target as HTMLElement;
    if (clickedElement.closest('.notif-dots') || clickedElement.closest('.notif-archive')) {
        return;
    }
    this.notificationList.forEach(notif => {
        notif.isArchiveOpen = false;
    });
}

  






}
