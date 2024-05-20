import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectsComponent } from './app-pages/home/components/projects/projects.component';
import { CommonOutletComponent } from '@src/app/components/common-outlet/common-outlet.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'projects',
    pathMatch: 'full',
  },
  {
    path: 'projects',
    title: 'Projects | NexGen Force',
    component: ProjectsComponent
  },
  {
    path: 'project',
    component: CommonOutletComponent,
    loadChildren: () => import('./app-pages/home/home.module').then(m => m.HomeModule),
  },
  {
    path: 'team',
    component: CommonOutletComponent,
    loadChildren: () => import('./app-pages/team/team.module').then(m => m.TeamModule),
  },
  {
    path: 'apps',
    component: CommonOutletComponent,
    loadChildren: () => import('./app-pages/apps/apps.module').then(m => m.AppsModule)
  },
  {
    path: 'templates',
    component: CommonOutletComponent,
    loadChildren: () => import('./app-pages/templates/templates.module').then(m => m.TemplatesModule),
  },
  {
    path: 'workflows',
    component: CommonOutletComponent,
    loadChildren: () => import('./app-pages/workflow/workflow.module').then(m => m.WorkflowModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppLayoutRoutingModule { }
