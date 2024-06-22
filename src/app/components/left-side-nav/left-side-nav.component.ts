import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';

import { Permissions } from '@src/app/constants/permissions';
import { Routes } from '@src/app/constants/routes';
import { FacadeService } from '@src/app/services/facade.service';
import { StorageKeys } from '@src/app/constants/storage-keys';

@Component({
  selector: 'app-left-side-nav',
  templateUrl: './left-side-nav.component.html',
  styleUrls: ['./left-side-nav.component.scss']
})
export class LeftSideNavComponent implements OnInit, OnDestroy {

  constructor(
    private _facadeService: FacadeService,
    private _router: Router
  ) {

    this.projectsSubscription = this._facadeService.projectService.projectsList$.subscribe({
      next: (res: Array<any>) => {
        this.projectList = [...res];
        this.projectList?.map((p: any) => {
          p.tooltip = p.projectName?.split(' ')?.map((pn: string) => pn.charAt(0).toUpperCase() + pn.slice(1))?.join(' ') ?? '';
          return p;
        });
      }
    });

    this.projectDetailsSubscription = this._facadeService.projectService.projectDetails$.subscribe({
      next: (projectDetails: any) => {
        this.projectDetails = projectDetails;
        this.hasAccessTo = [];
        if (this.projectDetails?.workflowId?.nodes) {
          /** temporary set dashboard without any condition */
          this.hasAccessTo.push('Dashboard');

          const nodesObj = this.projectDetails.workflowId.nodes.reduce((ac: any, cv: any) => {
            if (!ac[cv.app]) { ac[cv.app] = cv.app; } return ac;
          }, {});

          for (const menuKey in this._accessibleMenu) {
            if (menuKey in nodesObj) {
              this.hasAccessTo.push(this._accessibleMenu[menuKey]);
            }
          }

          if (!this.hasAccessTo.some((a: any) => a === 'Analysis') && 'Video Upload' in nodesObj) {
            this.hasAccessTo.push(this._accessibleMenu['Analysis']);
          }

          if (nodesObj['Confluence'] && nodesObj['Chat Bot']) {
            this.hasAccessTo.push('Chat');
          }

          // const nodes = this.projectDetails.workflowId.nodes;
          // for (const node of nodes) {
          //   if (this._accessibleMenu[node.app]) {
          //     this.hasAccessTo.push(this._accessibleMenu[node.app]);
          //   }
          // }

          // const confluenceChatBotIndex = nodes.findIndex((n: any) => (n.app == 'Confluence'));
          // if (confluenceChatBotIndex > -1) {
          //   if (nodes.find((n: any) => n.app == 'Chat Bot')) {
          //     this.hasAccessTo.push('Chat');
          //   }
          // }

          const projectSubRoute = _router.routerState.snapshot.url.match(/^\/([a-f\d]{24}|project)/i);
          if (_router.routerState.snapshot.url === this.appRoutes.PROJECTS || /^\/[a-f\d]{24}$/.test(_router.routerState.snapshot.url)) {
            switch (this.hasAccessTo[0]) {
              case 'Dashboard':
                _router.navigateByUrl(this.getReplacedUrl(this.appRoutes.PROJECT_DASHBOARD));
                break;
              case 'Analysis':
                _router.navigateByUrl(this.getReplacedUrl(this.appRoutes.PROJECT_MEDIA));
                break;
              case 'Compare Video':
                _router.navigateByUrl(this.getReplacedUrl(this.appRoutes.PROJECT_COMPARE));
                break;
              case 'Canvas':
                _router.navigateByUrl(this.getReplacedUrl(this.appRoutes.PROJECT_CANVAS));
                break;
              case 'Document':
                _router.navigateByUrl(this.getReplacedUrl(this.appRoutes.PROJECT_TEMPLATE));
                break;
              case 'Document Upload':
                _router.navigateByUrl(this.getReplacedUrl(this.appRoutes.PROJECT_DOCUMENT_UPLOAD));
                break;
              case 'Chat':
                _router.navigateByUrl(this.getReplacedUrl(this.appRoutes.PROJECT_CHAT));
                break;
              case 'MoM':
                _router.navigateByUrl(this.getReplacedUrl(this.appRoutes.PROJECT_MOM));
                break;
              default:
                break;
            }
          } else if (projectSubRoute) {
            const routeKey = projectSubRoute.input?.replace(new RegExp(`${projectSubRoute[0]}/?`), '')?.split('/')?.[0] ?? '';
            if (!routeKey || !(this._projectSubRoutes[routeKey] && this.hasAccessTo.some((item: string) => item === this._projectSubRoutes[routeKey]))) {
              _router.navigateByUrl(projectSubRoute[0]);
            }
          } else if (!projectSubRoute && this.hasAccessTo.length) {
            this.projectDetails = null;
            this.hasAccessTo = [];
            localStorage.removeItem(StorageKeys.PROJECT_ID);
          }
        }

        if (!this.projectDetails?._id) {
          this.isChatBoxVisible = false;
        }

        this.isExportedProject = !!this._facadeService.appService.exportedProjectId;
      }
    });

    this.userSubscription = this._facadeService.authService.getCurrentUser$().subscribe({
      next: (user: any) => {
        this.currentUser = user;
      }
    });

    this.setActiveMenu(this._router.url);

    this.routerSubscription = this._router.events.pipe(
      filter((event: any) => event instanceof NavigationEnd)
    ).subscribe({
      next: (event: any) => {
        this.setActiveMenu(event.urlAfterRedirects);
      },
      error: (err) => {
        console.error('There is an error while navigation end', err);
      }
    });
  }

  protected readonly permissions = Permissions;
  protected readonly appRoutes = Routes;
  protected readonly _accessibleMenu: { [key: string]: string } = {
    'Analysis': 'Analysis',
    'Compare Video': 'Compare Video',
    'Canvas': 'Canvas',
    'Document': 'Document',
    'Document Upload': 'Document Upload',
    'MoM': 'MoM',
    // 'Confluence': 'Confluence',
    // 'Chat Bot': 'Chat',
  };
  protected currentUser: any;
  protected userSubscription!: Subscription;
  protected projectsSubscription!: Subscription;
  protected projectDetailsSubscription!: Subscription;

  protected readonly _projectSubRoutes: { [key: string]: string } = {
    'dashboard': 'Dashboard',
    'media': 'Analysis',
    'compare': 'Compare Video',
    'canvas': 'Canvas',
    'template': 'Document',
    'documents': 'Document',
    'document-upload': 'Document Upload',
    'mom': 'MoM',
    'chat': 'Chat',
  };

  protected isExportedProject: boolean = false;
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

  protected isNavCollapsed: boolean = false;
  protected avatarMenu: boolean = false;
  protected isChatBoxVisible: boolean = false;

  @ViewChild('userInput') userInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('avatarToggler') avatarToggler!: ElementRef;
  @ViewChild('avatarMenuWrapper') avatarMenuWrapper!: ElementRef;

  protected isNotifCenterOpen: boolean = false;
  @ViewChild('notificationContainer') notificationContainer!: ElementRef;

  protected routerSubscription: Subscription;
  protected activeMenu: string = '';
  protected secondaryMenu: string = '';
  protected workflowToggler: boolean = false;
  protected projectsToggler: boolean = false;
  protected projectDetails: any;
  protected hasAccessTo: Array<string> = [];
  protected selectedWorkflowId: string = '';

  protected workflowList: Array<any> = [];
  protected projectList: Array<any> = [];

  @HostListener('document:click', ['$event'])
  clickOut(event: any) {
    if (this.avatarToggler && !this.avatarToggler.nativeElement.contains(event.target) && this.avatarMenuWrapper && !this.avatarMenuWrapper.nativeElement.contains(event.target)) {
      this.avatarMenu = false;
    }
    if (this.isNotifCenterOpen && !this.notificationContainer?.nativeElement?.contains(event.target)) {
      this.isNotifCenterOpen = false;
    }
  }

  ngOnInit(): void {
    this.getWorkflowList();
    // this.getProjectList();
  }

  getReplacedUrl(url: string): string {
    return this._facadeService.appService.getReplacedUrl(url);
  }

  onSelectProject(projectId: string) {
    this._facadeService.projectService.selectProject(projectId);
    this.projectsToggler = false;
  }

  setActiveMenu(url: string) {
    if (url.startsWith('/projects')) {
      this.activeMenu = 'projects';
    } else if (url.startsWith('/workflows')) {
      this.activeMenu = 'workflows';
      if (!url.includes('details')) {
        this.selectedWorkflowId = '';
      } else {
        this.selectedWorkflowId = url.split('/').pop() ?? '';
        if (this.selectedWorkflowId) {
          this.workflowToggler = true;
        }
      }
    } else if (url.startsWith('/team')) {
      this.activeMenu = 'team';
    } else if (url.startsWith('/apps')) {
      this.activeMenu = 'apps';
    } else if (url.startsWith('/templates')) {
      this.activeMenu = 'templates';
    } else if (url.startsWith('/project') || /^\/[a-f\d]{24}/.test(url)) {
      this.activeMenu = 'project';
      if (url.includes('/dashboard')) {
        this.secondaryMenu = 'dashboard';
      } else if (url.includes('/media')) {
        this.secondaryMenu = 'media'
      } else if (url.includes('/compare')) {
        this.secondaryMenu = 'compare'
      } else if (url.includes('/canvas')) {
        this.secondaryMenu = 'canvas'
      } else if (url.includes('/document-upload')) {
        this.secondaryMenu = 'document-upload';
      } else if (url.includes('/document')) {
        this.secondaryMenu = 'document';
      } else if (url.includes('/template')) {
        this.secondaryMenu = 'template';
      } else if (url.includes('/chat')) {
        this.secondaryMenu = 'chat';
      } else if (url.includes('/mom')) {
        this.secondaryMenu = 'mom';
      }

      this.isChatBoxVisible = false;
      setTimeout(() => {
        if (!url.startsWith('/project') && this._facadeService.projectService.isProjectDetails$Empty) {
          const exportedProjectId = this._facadeService.appService.exportedProjectId;
          const projectIdAsRoute = url.match(/^\/([a-f\d]{24})/);
          if (projectIdAsRoute && projectIdAsRoute[1] === exportedProjectId) {
            this._facadeService.projectService.selectProject(exportedProjectId);
          }
        }
      }, 1000);
    }

    if (this.activeMenu != 'project') {
      this.projectDetails = null;
      this.secondaryMenu = '';
      localStorage.removeItem(StorageKeys.PROJECT_ID);
      this.projectsToggler = false;
    }

    if (this.activeMenu != 'workflows') {
      this.workflowToggler = false;
    }

    if (!this.projectDetails?._id) {
      this.isChatBoxVisible = false;
    }
  }

  onNavigateTo(url: string, parseUrl: boolean = true, extras: any | undefined = undefined): void {
    if (!url?.trim()) return;

    if (parseUrl) {
      this._router.navigateByUrl(this.getReplacedUrl(url), extras);
    } else {
      this._router.navigateByUrl(url, extras);
    }
  }

  onViewWorkflow(index: number) {
    this.selectedWorkflowId = this.workflowList[index]?._id;
    if (this.selectedWorkflowId) {
      this._router.navigate([this.appRoutes.WORKFLOW_DETAILS, this.selectedWorkflowId], { state: { isCreating: false } })
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

  getWorkflowList() {
    this._facadeService.workflowService.getMasterList().subscribe({
      next: (res: any) => {
        if (res.code == 'OK') {
          this.workflowList = res.data.list;
          this.workflowList?.map((p: any) => {
            p.tooltip = p.name?.split(' ')?.map((pn: string) => pn.charAt(0).toUpperCase() + pn.slice(1))?.join(' ') ?? '';
            return p;
          });
        }
      }, error: (err: any) => {
        console.error('Error while getting workflow list', err.error);
      }
    });
  }

  protected chats: any = [];
  protected aiLoader: boolean = false;
  toggleChatBox() {
    this.isChatBoxVisible = !this.isChatBoxVisible;
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      if (event.shiftKey) {
        return;
      } else {
        event.preventDefault();
        this.sendMessage();
      }
    }
  }

  sendMessage(): void {
    const userInput = this.userInputRef.nativeElement.value?.trim();
    if (!userInput) {
      return;
    }

    this.chats.push({
      'user': userInput
    });

    this.aiLoader = true;

    setTimeout(() => {
      const element = document.getElementById('ai-loader');
      if (element) {
        element.scrollIntoView();
      }
    }, 100);

    this._facadeService.projectService.chatWithAI(this.projectDetails._id, userInput).subscribe({
      next: (res: any) => {
        if (res.code == 'OK') {
          if (res.data.startsWith(this.projectDetails._id)) {
            this.chats.push({
              'ai': 'There are no data for ai system.'
            });
          } else {
            this.chats.push({
              'ai': res.data
            })
          }
          this.aiLoader = false;
        }
      },
      error: (err: any) => {
        this.chats.push({
          'ai': 'There are no data for ai system.'
        });
        this.aiLoader = false;
      }
    });
    this.userInputRef.nativeElement.value = '';
  }

  onLogout() {
    this._facadeService.authService.logOut();
    this._router.navigateByUrl(this.appRoutes.LOGIN);
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    this.projectsSubscription?.unsubscribe();
    this.projectDetailsSubscription?.unsubscribe();
    this._facadeService.projectService.removeSelectedProject();
    this.routerSubscription?.unsubscribe();
  }
}
