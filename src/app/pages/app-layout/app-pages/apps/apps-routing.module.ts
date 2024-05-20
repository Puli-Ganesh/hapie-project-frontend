import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from '@src/app/components/not-found/not-found.component';
import { AppsComponent } from './components/apps/apps.component';

const routes: Routes = [
  {
    path: '',
    title: 'Apps | NexGen Force',
    component: AppsComponent
  },
  {
    path: '**',
    title: 'Page Not Found | NexGen Force',
    component: NotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppsRoutingModule { }
