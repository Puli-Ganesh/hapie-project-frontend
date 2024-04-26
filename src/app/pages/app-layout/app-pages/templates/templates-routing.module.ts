import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TemplatesComponent } from './components/templates/templates.component';
import { NotFoundComponent } from '@src/app/components/not-found/not-found.component';

const routes: Routes = [
  {
    path: '',
    title: 'Templates | NexGen Force',
    component: TemplatesComponent
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
export class TemplatesRoutingModule { }
