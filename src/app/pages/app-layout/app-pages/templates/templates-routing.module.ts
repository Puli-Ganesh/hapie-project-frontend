import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TemplatesComponent } from './components/templates/templates.component';
import { NotFoundComponent } from '@src/app/components/not-found/not-found.component';
import { postfixPageTitle } from '@src/app/constants/appConfig';

const routes: Routes = [
  {
    path: '',
    title: `Templates ${postfixPageTitle}`,
    component: TemplatesComponent
  },
  {
    path: '**',
    title: `Page Not Found ${postfixPageTitle}`,
    component: NotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TemplatesRoutingModule { }
