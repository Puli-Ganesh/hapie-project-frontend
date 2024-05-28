import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { FacadeService } from '@src/app/services/facade.service';
import { Routes } from '@src/app/constants/routes';

@Component({
  selector: 'app-document-upload',
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.scss']
})
export class DocumentUploadComponent implements OnInit {

  constructor(
    private _router: Router,
    private _facadeService: FacadeService,
  ) {
    this.projectDetailsSubscription = this._facadeService.projectService.projectDetails$.subscribe({
      next: (details: any) => {
        this.projectDetails = details;
      }
    });
  }

  protected readonly permissions = Permissions;
  protected readonly appRoutes = Routes;
  protected projectDetailsSubscription: Subscription;
  protected projectDetails: any;

  protected isUploadingDocs = false;


  ngOnInit(): void {
  }


  onGoBack() {
    this._router.navigate([this.appRoutes.PROJECTS]);
  }

  onExit() {
    this._router.navigateByUrl(this.appRoutes.PROJECTS);
  }

  onUploadMedia() {
    this.isUploadingDocs = true;
  }

  onCloseUploadMediaModal(event: boolean) {
    if (event) {
      this.isUploadingDocs = false;
    }
  }


  ngOnDestroy(): void {
    this.projectDetailsSubscription?.unsubscribe();
  }

}
