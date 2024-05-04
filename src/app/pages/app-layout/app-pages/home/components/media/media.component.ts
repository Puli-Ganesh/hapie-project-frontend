import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Permissions } from '@src/app/constants/permissions';

import { Routes } from '@src/app/constants/routes';
import { StorageKeys } from '@src/app/constants/storage-keys';
import { FacadeService } from '@src/app/services/facade.service';
import { IResponse } from '@src/interfaces/response.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss']
})
export class MediaComponent implements OnInit, OnDestroy {

  constructor(
    private _router: Router,
    private _facadeService: FacadeService,
  ) {
    this.projectId = localStorage.getItem(StorageKeys.PROJECT_ID) ?? '';
    this.projectName = localStorage.getItem(StorageKeys.PROJECT_NAME) ?? '';
    this.projectColor = localStorage.getItem(StorageKeys.PROJECT_COLOR) ?? 1;
    
    this.projectDetailsSubscription = this._facadeService.projectService.projectDetails$.subscribe({
      next: (details: any) => {
        this.projectDetails = details;
        const nodes = this.projectDetails?.workflowId?.nodes;
        if (nodes?.length) {
          console.log(nodes);
          const videoNode = nodes.find((n: any) => n.app == 'Video Upload');
          this.isUploadVisible = videoNode ? true : false;
        } else {
          this.isUploadVisible = false;
        }
      }
    });

    if (!this.projectId) {
      _router.navigateByUrl(this.appRoutes.PROJECTS);
      return;
    }
  }

  permissions = Permissions;
  currentUser: any;
  protected readonly appRoutes = Routes;
  projectDetailsSubscription: Subscription;
  projectDetails: any;
  isUploadVisible = false;

  protected projectId: string = '';
  protected projectName: string = '';
  projectColor: any;

  isUploadingMedia = false;

  protected recordings: Array<any> = [];


  ngOnInit(): void {
    this.getRecordingList();
    this.currentUser = this._facadeService.authService.getCurrentUser();
  }

  getRecordingList() {
    this._facadeService.recordingService.list({ projectId: this.projectId }).subscribe({
      next: (res: IResponse) => {
        this.recordings = res.data.list;
      },
      error: (error: any) => {
        console.error('Error while getting recordings', error);
      }
    })
  }

  onGoBack() {
    this._router.navigate([this.appRoutes.PROJECTS]);
  }

  // onGoToProjects() {
  //   this._router.navigate([this.appRoutes.PROJECTS])
  // }

  // onGoToProject() {
  //   this._router.navigate([this.appRoutes.PROJECT_PROFILE])
  // }

  navigateOnCompare() {
    this._router.navigateByUrl(this.appRoutes.PROJECT_COMPARE);
  }

  onUploadMedia() {
    this.isUploadingMedia = true;
  }

  onCloseUploadMediaModal(event: boolean) {
    if (event) {
      this.isUploadingMedia = false;
      this.getRecordingList();
    }
  }

  navigateOnMediaTranscript(recording: any) {
    if (!recording?._id) { return; }

    this._router.navigateByUrl(`${this.appRoutes.PROJECT_MEDIA_TRANSCRIPT}${recording._id}`);
  }

  ngOnDestroy(): void {
    this.projectDetailsSubscription?.unsubscribe();
  }

}
