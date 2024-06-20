import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ToasterComponent } from './components/toaster/toaster.component';
import { ModalComponent } from './components/modal/modal.component';
import { UploadDocumentModalComponent } from './components/upload-document-modal/upload-document-modal.component';
import { UploadMediaModalComponent } from './components/upload-media-modal/upload-media-modal.component';

import { DragDropFileDirective } from '../directives/drag-drop-file.directive';
import { AutofocusDirective } from '../directives/autofocus.directive';

import { SafePipe } from '../pipes/safe.pipe';
import { HeaderComponent } from './components/header/header.component';
import { DropDownComponent } from './components/drop-down/drop-down.component';
import { UploadDocModalComponent } from './components/upload-doc-modal/upload-doc-modal.component';
import { ProjectExitBtnComponent } from './components/project-exit-btn/project-exit-btn.component';
import { ProjectGoBackBtnComponent } from './components/project-go-back-btn/project-go-back-btn.component';


@NgModule({
  declarations: [
    ToasterComponent,
    ModalComponent,
    UploadDocumentModalComponent,
    UploadMediaModalComponent,
    UploadDocModalComponent,
    DragDropFileDirective,
    AutofocusDirective,
    SafePipe,
    HeaderComponent,
    DropDownComponent,
    ProjectExitBtnComponent,
    ProjectGoBackBtnComponent
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
    UploadMediaModalComponent,
    UploadDocModalComponent,
    DragDropFileDirective,
    AutofocusDirective,
    SafePipe,
    HeaderComponent,
    DropDownComponent,
    ProjectExitBtnComponent,
    ProjectGoBackBtnComponent
  ]
})
export class SharedModule { }
