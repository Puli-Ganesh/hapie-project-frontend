import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ToasterComponent } from './components/toaster/toaster.component';
import { ModalComponent } from './components/modal/modal.component';
import { UploadDocumentModalComponent } from './components/upload-document-modal/upload-document-modal.component';
import { UploadMediaModalComponent } from './components/upload-media-modal/upload-media-modal.component';


@NgModule({
  declarations: [
    ToasterComponent,
    ModalComponent,
    UploadDocumentModalComponent,
    UploadMediaModalComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  exports: [
    ToasterComponent,
    ModalComponent,
    UploadDocumentModalComponent,
    UploadMediaModalComponent
  ]
})
export class SharedModule { }
