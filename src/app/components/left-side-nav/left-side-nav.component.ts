import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';

import { Permissions } from '@src/app/constants/permissions';
import { Routes } from '@src/app/constants/routes';
import { FacadeService } from '@src/app/services/facade.service';
import { Node } from '@src/app/pages/app-layout/app-pages/workflow/components/workflow-details/node';
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
        if (this.projectDetails?.workflowId?.nodes) {
          const nodes = this.projectDetails?.workflowId?.nodes;
          // console.log(nodes)
          this.hasAccessTo = [];
          const analysisIndex = nodes.findIndex((n: any) => n.app == 'Analysis');
          if (analysisIndex > -1) {
            this.hasAccessTo.push('Analysis');
          }
          const compareIndex = nodes.findIndex((n: any) => n.app == 'Compare Video');
          if (compareIndex > -1) {
            this.hasAccessTo.push('Compare Video');
          }
          const canvasIndex = nodes.findIndex((n: any) => n.app == 'Canvas');
          if (canvasIndex > -1) {
            this.hasAccessTo.push('Canvas');
          }
          const documentIndex = nodes.findIndex((n: any) => n.app == 'Document');
          if (documentIndex > -1) {
            this.hasAccessTo.push('Document');
          }
          const videoUploadIndex = nodes.findIndex((n: any) => n.app == 'Video Upload');
          if (videoUploadIndex > -1) {
            this.hasAccessTo.push('Video Upload');
          }
          const confluenceChatBotIndex = nodes.findIndex((n: any) => (n.app == 'Confluence'));
          if (confluenceChatBotIndex > -1) {
            if (nodes.find((n: any) => n.app == 'Chat Bot')) {
              this.hasAccessTo.push('Chat');
            }
          }

          if (_router.routerState.snapshot.url === this.appRoutes.PROJECTS) {
            switch (this.hasAccessTo[0]) {
              case 'Analysis':
                _router.navigateByUrl(this.appRoutes.PROJECT_MEDIA);
                break;
              case 'Compare Video':
                _router.navigateByUrl(this.appRoutes.PROJECT_COMPARE);
                break;
              case 'Canvas':
                _router.navigateByUrl(this.appRoutes.PROJECT_CANVAS);
                break;
              case 'Document':
                _router.navigateByUrl(this.appRoutes.PROJECT_TEMPLATE);
                break;
              case 'Video Upload':
                _router.navigateByUrl(this.appRoutes.PROJECT_DOCUMENT_UPLOAD);
                break;
              case 'Chat':
                _router.navigateByUrl(this.appRoutes.PROJECT_CHAT);
                break;
              default:
                break;
            }
          }
        }

        if (!this.projectDetails?._id) {
          this.isChatBoxVisible = false;
        }
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
  protected currentUser: any;
  protected userSubscription!: Subscription;
  protected projectsSubscription!: Subscription;
  protected projectDetailsSubscription!: Subscription;

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

  routerSubscription: Subscription;
  activeMenu = '';
  secondaryMenu = '';
  workflowToggler = false;
  projectsToggler = false;
  projectDetails: any;
  hasAccessTo = [''];
  selectedWorkflowId = '';

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

  onSelectProject(projectId: string) {
    this._facadeService.projectService.selectProject(projectId);
    this._router.navigate([this.appRoutes.PROJECT_MEDIA]);
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
    } else if (url.startsWith('/project')) {
      this.activeMenu = 'project';
      if (url.includes('/media')) {
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
      }
    }

    if (this.activeMenu != 'project') {
      this.projectDetails = null;
      this.secondaryMenu = '';
      localStorage.removeItem(StorageKeys.PROJECT_ID);
    }

    if (this.activeMenu != 'workflows') {
      this.workflowToggler = false;
    }

  }

  onGoToMedia() {
    this._router.navigate([this.appRoutes.PROJECT_MEDIA]);
  }

  onGoToCompare() {
    this._router.navigate([this.appRoutes.PROJECT_COMPARE]);
  }

  onGoToCanvas() {
    this._router.navigate([this.appRoutes.PROJECT_CANVAS]);
  }

  onGoToDocument() {
    this._router.navigate([this.appRoutes.PROJECT_DOCUMENTS]);
  }

  onGoToTemplate() {
    this._router.navigate([this.appRoutes.PROJECT_TEMPLATE]);
  }

  onChat() {
    this._router.navigate([this.appRoutes.PROJECT_CHAT]);
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

  onTeam() {
    this._router.navigate([this.appRoutes.TEAM]);
  }
  onApps() {
    this._router.navigate([this.appRoutes.APPS]);
  }
  onProjects() {
    this._router.navigate([this.appRoutes.PROJECTS]);
  }
  onTemplates() {
    this._router.navigate([this.appRoutes.TEMPLATES]);
  }
  onWorkflows() {
    this._router.navigate([this.appRoutes.WORKFLOWS]);
  }
  onDocumentUpload() {
    this._router.navigate([this.appRoutes.PROJECT_DOCUMENT_UPLOAD]);
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



  chats: any = [];

  aiLoader: boolean = false;
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
    const userInput = this.userInputRef.nativeElement.value;
    this.chats.push({
      'user': userInput
    })

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
      }
    });
    this.userInputRef.nativeElement.value = '';
  }

}
