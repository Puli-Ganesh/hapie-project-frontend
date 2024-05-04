import { HttpEventType } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import LanguageList from '@src/app/constants/language-list';
import { Routes } from '@src/app/constants/routes';
import { StorageKeys } from '@src/app/constants/storage-keys';
import { FacadeService } from '@src/app/services/facade.service';

@Component({
  selector: 'app-upload-media-modal',
  templateUrl: './upload-media-modal.component.html',
  styleUrls: ['./upload-media-modal.component.scss']
})
export class UploadMediaModalComponent implements OnInit, OnDestroy {

  constructor(
    private _formBuilder: FormBuilder,
    private _facadeService: FacadeService,
    private _router: Router
  ) {
    this.mediaUploadForm = this._formBuilder  .array([]);
    this.videoForm = this._formBuilder.group({
      url: ['', [Validators.required]]
    });

    this.projectId = localStorage.getItem(StorageKeys.PROJECT_ID) ?? '';

    if (!this.projectId) {
      this._router.navigateByUrl(this.appRoutes.PROJECTS);
      return;
    }
  }

  appRoutes = Routes;
  projectId: string = '';
  videoForm: FormGroup;
  languageList: Array<{ code: string, name: string }> = LanguageList.list;
  mediaUploadForm: FormArray;
  isMediaUploadRequestAlive: boolean = false;
  mimeTypeNotSupportErr: string = '';
  languageDropdownToggler: number = -1;

  /** mime types = MP3: audio/mpeg | MP4: video/mp4 | MOV: video/quicktime | WMV: video/x-ms-wmv | WAV: audio/x-wav */
  imageMimeTypes: Array<string> = ['video/mp4', 'video/quicktime', 'video/x-ms-wmv'];

  @ViewChildren('languageDropdown') languageDropdown!: Array<ElementRef>;
  @Output() onClose = new EventEmitter<boolean>();

  ngOnInit(): void {
    this._facadeService.modalService.registerModal('uploadMediaModal');
    this._facadeService.modalService.openModal('uploadMediaModal');
  }

  onUploadWrapper(event: Event) {
    if (this.languageDropdown && this.languageDropdownToggler > -1) {
      let tempIndex = -1;
      this.languageDropdown.forEach((el: any, index: number) => {
        if (el.nativeElement.contains(event.target)) {
          tempIndex = index;
        }
      });
      this.languageDropdownToggler = tempIndex;
    }
  }

  onMediaLanguageSelect(event: Event, mediaUploadIndex: number, langIndex: number) {
    event?.stopPropagation();
    if (this.mediaUploadForm?.controls[mediaUploadIndex].value?.progress != 0) return;

    this.mediaUploadForm.controls[mediaUploadIndex].patchValue({
      isLanguageSelecting: false,
      language: this.languageList[langIndex]
    });
    this.languageDropdownToggler = -1;
  }

  onRemoveMedia(event: Event, mediaUploadIndex: number) {
    event?.stopPropagation();
    if (!this.mediaUploadForm?.controls[mediaUploadIndex]) return;

    this.mediaUploadForm.removeAt(mediaUploadIndex);
  }

  onFileDrop(event: any) {
    this.onUploadProjectCoverThumb({
      target: {
        files: event
      }
    });
  }
  
  onUploadMedia() {
    if (!this.mediaUploadForm.value.length || this.mediaUploadForm.invalid) return;
    this.mimeTypeNotSupportErr = '';

    if (this.videoForm.value.url) {
      const body = {
        projectId: this.projectId,
        language: 'en',
        url: this.videoForm.value.url
      }
      this._facadeService.recordingService.uploadRecordingByUrl(body).subscribe({
        next: (res: any) => {
          if (res.code == 'OK') {
            this._facadeService.appService.openToaster('File uploaded successfully', 'success');
            this.videoForm.reset();
          }
        },
        error: (err: any) => {
          this._facadeService.appService.openToaster('File uploading error', 'danger');
        }
      });
    } else {

      this.isMediaUploadRequestAlive = true;
      for (let mui = 0; mui < this.mediaUploadForm.value.length; mui++) {
        const media = this.mediaUploadForm.value[mui];
        if (media.progress !== 0) continue;

        const formData = new FormData();
        formData.append('projectId', this.projectId);
        formData.append('language', media.language.code?.toLowerCase());
        formData.append('recordingFile', media.mediaFile);

        this._facadeService.recordingService.uploadRecording(formData).subscribe({
          next: (res: any) => {
            if (res.type == HttpEventType.UploadProgress) {
              const progress = Math.round(100 * res.loaded / res.total);
              this.mediaUploadForm.controls[mui].patchValue({ progress: progress });
            }

            if (res.type == HttpEventType.Response) {
              this.mediaUploadForm.controls[mui].patchValue({ progress: 100 });
              this.isMediaUploadRequestAlive = !this.mediaUploadForm.value?.every((item: any) => item.progress === 100);
              this._facadeService.appService.openToaster('File uploaded successfully', 'success');
            }
          },
          error: (err: any) => {
            this._facadeService.appService.openToaster('File uploading error', 'danger');
          }
        });
      }

      this.isMediaUploadRequestAlive = !this.mediaUploadForm.value?.every((item: any) => item.progress === 100);
    }
  }
    
  onUploadProjectCoverThumb(event: any) {
    if (this.imageMimeTypes.includes(event.target.files[0]?.type)) {
      this.mediaUploadForm.push(this._formBuilder.group({
        mediaFile: [event.target.files[0]],
        mediaUrl: [''],
        type: ['video', Validators.required],
        language: [this.languageList.find((lan: any) => lan.code === 'en'), Validators.required],
        progress: [0],
        isLanguageSelecting: [false]
      }));
      event.target.value = '';
      this.mimeTypeNotSupportErr = '';
    } else if (event.target?.files?.[0]) {
      this.mimeTypeNotSupportErr = `.${event.target.files[0].name?.split('.')?.pop()} file format not supported.`;
    }
  }

  toggleLanguageDropdown(event: Event, mediaUploadIndex: number) {
    event?.stopPropagation();
    if (this.mediaUploadForm?.controls[mediaUploadIndex].value?.progress != 0) return;

    if (this.languageDropdownToggler == mediaUploadIndex) {
      this.languageDropdownToggler = -1;
    } else {
      this.languageDropdownToggler = mediaUploadIndex;
    }
    this.mediaUploadForm.controls[mediaUploadIndex].patchValue({
      isLanguageSelecting: !this.mediaUploadForm.controls[mediaUploadIndex].value.isLanguageSelecting
    });
  }


  onCloseModal(event: boolean): void {
    if (event) {
      this.mediaUploadForm.clear();
      this.isMediaUploadRequestAlive = false;
      this.mimeTypeNotSupportErr = '';
    }
    this.onClose.emit(true);
  }

  ngOnDestroy(): void {
    this._facadeService.modalService.unregisterModal('uploadMediaModal');
  }

}
