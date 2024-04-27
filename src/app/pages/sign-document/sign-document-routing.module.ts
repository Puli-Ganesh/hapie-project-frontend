import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignDocumentComponent } from './components/sign-document/sign-document.component';

const routes: Routes = [
  {
    path: ':documentId',
    component: SignDocumentComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SignDocumentRoutingModule { }
