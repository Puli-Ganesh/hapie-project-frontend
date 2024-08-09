import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from '@src/app/components/not-found/not-found.component';
import { AppsComponent } from './components/apps/apps.component';
import { postfixPageTitle } from '@src/app/constants/appConfig';

const routes: Routes = [
  {
    path: '',
    title: `Apps ${postfixPageTitle}`,
    component: AppsComponent
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
export class AppsRoutingModule { }
