import { Injectable, Injector } from '@angular/core';

import { AuthService } from './auth/auth.service';
import { NotificationService } from './notification/notification.service';
import { AppService } from './app/app.service';
import { UserService } from './user/user.service';
import { ModalService } from './modal/modal.service';
import { ProjectService } from './project/project.service';
import { TemplateService } from './template/template.service';
import { RecordingService } from './recording/recording.service';
import { ReportIssueService } from './reportIssue/report-issue.service';
import { WorkspaceService } from './workspace/workspace.service';

@Injectable({
  providedIn: 'root'
})
export class FacadeService {

  constructor(
    private _injector: Injector
  ) { }

  private _appService!: AppService;
  private _authService!: AuthService;
  private _userService!: UserService;
  private _projectService!: ProjectService;
  private _workspaceService!: WorkspaceService;
  private _recordingService!: RecordingService;
  private _templateService!: TemplateService;
  // private _canvasService!: CanvasService;
  // private _categoryService!: CategoryService;
  // private _compareVideoService!: CompareVideoService;
  private _modalService!: ModalService;
  // private _documentService!: DocumentService;
  private _notificationService!: NotificationService;
  // private _shareCanvasService!: ShareCanvasService;
  // private _signedDocumentService!: SignedDocumentService;
  private _reportIssueService!: ReportIssueService;


  /** App Service getter */
  public get appService(): AppService {
    if (!this._appService) {
      this._appService = this._injector.get(AppService);
    }
    return this._appService;
  }

  /** Auth Service getter */
  public get authService(): AuthService {
    if (!this._authService) {
      this._authService = this._injector.get(AuthService);
    }
    return this._authService;
  }

  /** User Service getter */
  public get userService(): UserService {
    if (!this._userService) {
      this._userService = this._injector.get(UserService);
    }
    return this._userService;
  }

  /** Project Service getter */
  public get projectService(): ProjectService {
    if (!this._projectService) {
      this._projectService = this._injector.get(ProjectService);
    }
    return this._projectService;
  }

  /** Workspace Service getter */
  public get workspaceService(): WorkspaceService {
    if (!this._workspaceService) {
      this._workspaceService = this._injector.get(WorkspaceService);
    }
    return this._workspaceService;
  }

  /** Recording Service getter */
  public get recordingService(): RecordingService {
    if (!this._recordingService) {
      this._recordingService = this._injector.get(RecordingService);
    }
    return this._recordingService;
  }

  /** Template Service getter */
  public get templateService(): TemplateService {
    if (!this._templateService) {
      this._templateService = this._injector.get(TemplateService);
    }
    return this._templateService;
  }

  /** Modal Service getter */
  public get modalService(): ModalService {
    if (!this._modalService) {
      this._modalService = this._injector.get(ModalService);
    }
    return this._modalService;
  }

  /** Notification Service getter */
  public get notificationService(): NotificationService {
    if (!this._notificationService) {
      this._notificationService = this._injector.get(NotificationService);
    }
    return this._notificationService;
  }

  /** ReportIssue Service getter */
  public get reportIssueService(): ReportIssueService {
    if (!this._reportIssueService) {
      this._reportIssueService = this._injector.get(ReportIssueService);
    }
    return this._reportIssueService;
  }
}
