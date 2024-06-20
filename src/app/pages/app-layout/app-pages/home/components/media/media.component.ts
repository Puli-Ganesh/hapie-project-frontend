import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Permissions } from '@src/app/constants/permissions';

import { Routes } from '@src/app/constants/routes';
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
    // this.projectId = localStorage.getItem(StorageKeys.PROJECT_ID) ?? '';
    // this.projectName = localStorage.getItem(StorageKeys.PROJECT_NAME) ?? '';
    // this.projectColor = localStorage.getItem(StorageKeys.PROJECT_COLOR) ?? 1;
    
    this.projectDetailsSubscription = this._facadeService.projectService.projectDetails$.subscribe({
      next: (details: any) => {
        this.projectDetails = details;
        const nodes = this.projectDetails?.workflowId?.nodes;
        if (nodes?.length) {
          const videoNode = nodes.find((n: any) => n.app == 'Video Upload');
          this.isUploadVisible = videoNode ? true : false;
        } else {
          this.isUploadVisible = false;
        }
        if (this.projectDetails) {
          this.getRecordingList();
        }
      }
    });
  }

  permissions = Permissions;
  currentUser: any;
  protected readonly appRoutes = Routes;
  projectDetailsSubscription: Subscription;
  projectDetails: any;
  isUploadVisible = false;

  projectColor: any;

  isUploadingMedia = false;

  protected recordings: Array<any> = [];


  ngOnInit(): void {
    this.currentUser = this._facadeService.authService.getCurrentUser();
  }

  getRecordingList() {
    if (!this.projectDetails?._id) { return; }

    this._facadeService.recordingService.list({ projectId: this.projectDetails?._id }).subscribe({
      next: (res: IResponse) => {
        if (res.code === 'OK') {
          this.recordings = res.data.list;
        }
      },
      error: (error: any) => {
        console.error('Error while getting recordings', error);
      }
    });
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

    this._router.navigateByUrl(this._facadeService.appService.getReplacedUrl(`${this.appRoutes.PROJECT_MEDIA_TRANSCRIPT}${recording._id}`));
  }

  ngOnDestroy(): void {
    this.projectDetailsSubscription?.unsubscribe();
  }

}
