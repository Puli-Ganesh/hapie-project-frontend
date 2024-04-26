import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TeamComponent } from './components/team/team.component';
import { NotFoundComponent } from '@src/app/components/not-found/not-found.component';

const routes: Routes = [
  {
    path: '',
    title: 'NexGen Force | Team',
    component: TeamComponent
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
export class TeamRoutingModule { }
