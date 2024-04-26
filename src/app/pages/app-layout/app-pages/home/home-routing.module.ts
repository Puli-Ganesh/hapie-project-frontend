import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ManageProjectComponent } from './components/manage-project/manage-project.component';
import { NotFoundComponent } from '@src/app/components/not-found/not-found.component';

const routes: Routes = [
  {
    path: 'create',
    title: 'Create Project | NexGen Force',
    component: ManageProjectComponent
  },
  {
    path: 'manage/:projectId',
    title: 'Manage Project | NexGen Force',
    component: ManageProjectComponent
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
export class HomeRoutingModule { }
