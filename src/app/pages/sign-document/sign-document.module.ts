import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SignDocumentRoutingModule } from './sign-document-routing.module';
import { SignDocumentComponent } from './components/sign-document/sign-document.component';
import { SharedModule } from '@src/app/shared/shared.module';


@NgModule({
  declarations: [
    SignDocumentComponent
  ],
  imports: [
    CommonModule,
    SignDocumentRoutingModule,
    SharedModule
  ]
})
export class SignDocumentModule { }
