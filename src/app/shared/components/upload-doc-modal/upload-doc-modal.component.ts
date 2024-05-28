import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import LanguageList from '@src/app/constants/language-list';
import { Routes } from '@src/app/constants/routes';
import { StorageKeys } from '@src/app/constants/storage-keys';
import { FacadeService } from '@src/app/services/facade.service';

@Component({
  selector: 'app-upload-doc-modal',
  templateUrl: './upload-doc-modal.component.html',
  styleUrls: ['../upload-media-modal/upload-media-modal.component.scss', './upload-doc-modal.component.scss']
})
export class UploadDocModalComponent implements OnInit, OnDestroy {

  constructor(
    private _formBuilder: FormBuilder,
    private _facadeService: FacadeService,
    private _router: Router
  ) {
    this.documentUploadForm = this._formBuilder.array([]);
    this.videoForm = this._formBuilder.group({
      url: ['', [Validators.required]]
    });

    this.projectId = localStorage.getItem(StorageKeys.PROJECT_ID) ?? '';

    if (!this.projectId) {
      this._router.navigateByUrl(this.appRoutes.PROJECTS);
      return;
    }
  }

  protected readonly appRoutes = Routes;
  protected projectId: string = '';
  protected videoForm: FormGroup;
  protected languageList: Array<{ code: string, name: string }> = LanguageList.list;
  protected documentUploadForm: FormArray;
  protected isDocUploadRequestAlive: boolean = false;
  protected mimeTypeNotSupportErr: string = '';

  /** mime types
   *  MP3: audio/mpeg | MP4: video/mp4 | MOV: video/quicktime | WMV: video/x-ms-wmv | WAV: audio/x-wav
   *  TEXT: text/plain | JSON: application/json | DOCX: application/vnd.openxmlformats-officedocument.wordprocessingml.document
   */
  protected readonly imageMimeTypes: Array<string> = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/json', 'text/plain'];

  // @ViewChildren('languageDropdown') languageDropdown!: Array<ElementRef>;
  @Output() onClose = new EventEmitter<boolean>();

  ngOnInit(): void {
    this._facadeService.modalService.registerModal('uploadDocModal');
    this._facadeService.modalService.openModal('uploadDocModal');
  }

  // onFileLanguageSelect(event: Event, fileIndex: number) {
  //   if (this.documentUploadForm?.controls[fileIndex].value?.progress != 0) return;

  //   this.documentUploadForm.controls[fileIndex].patchValue({
  //     isLanguageSelecting: false,
  //     language: event
  //   });
  // }

  onRemoveMedia(event: Event, fileIndex: number) {
    event?.stopPropagation();
    if (!this.documentUploadForm?.controls[fileIndex]) return;

    this.documentUploadForm.removeAt(fileIndex);
  }

  onFileDrop(event: any) {
    this.onFileChoose({
      target: {
        files: event
      }
    });
  }

  onUploadMedia() {
    if (!this.documentUploadForm.value.length || this.documentUploadForm.invalid) return;
    this.mimeTypeNotSupportErr = '';

    if (this.videoForm.value.url) {
      const body = {
        projectId: this.projectId,
        language: 'en',
        url: this.videoForm.value.url
      };

      console.log(body);
    } else {

      this.isDocUploadRequestAlive = true;
      for (let docI = 0; docI < this.documentUploadForm.value.length; docI++) {
        const documentUpload = this.documentUploadForm.value[docI];
        console.log(documentUpload)
      }

      this.isDocUploadRequestAlive = !this.documentUploadForm.value?.every((item: any) => item.progress === 100);
    }
  }

  onFileChoose(event: any) {
    if (this.imageMimeTypes.includes(event.target.files[0]?.type)) {
      this.documentUploadForm.push(this._formBuilder.group({
        mediaFile: [event.target.files[0]],
        mediaUrl: [''],
        type: ['doc', Validators.required],
        // language: [this.languageList.find((lan: any) => lan.code === 'en'), Validators.required],
        progress: [0],
        isLanguageSelecting: [false]
      }));
      event.target.value = '';
      this.mimeTypeNotSupportErr = '';
    } else if (event.target?.files?.[0]) {
      this.mimeTypeNotSupportErr = `.${event.target.files[0].name?.split('.')?.pop()} file format not supported.`;
    }
  }

  onCloseModal(event: boolean): void {
    if (event) {
      this.documentUploadForm.clear();
      this.isDocUploadRequestAlive = false;
      this.mimeTypeNotSupportErr = '';
    }
    this.onClose.emit(true);
  }

  ngOnDestroy(): void {
    this._facadeService.modalService.unregisterModal('uploadDocModal');
  }
}