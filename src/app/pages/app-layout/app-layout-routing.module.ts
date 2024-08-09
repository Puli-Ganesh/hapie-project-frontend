import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProjectsComponent } from './app-pages/home/components/projects/projects.component';
import { CommonOutletComponent } from '@src/app/components/common-outlet/common-outlet.component';

import { AuthGuard } from '@src/app/guards/auth.guard';
import { postfixPageTitle } from '@src/app/constants/appConfig';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'projects',
    pathMatch: 'full',
  },
  {
    path: 'projects',
    title: `Projects ${postfixPageTitle}`,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    component: ProjectsComponent,
  },
  {
    // path: 'project',
    matcher: (url) => {
      if (url.length > 0 && (url[0].path === 'project' || /^[a-f\d]{24}$/i.test(url[0].path)) && url[1]?.path !== 'auth') {
        /** 'consumed', return only matched and verified UrlSegment list. */
        return { consumed: url.slice(0, 1) };
      }
      return null;
    },
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    component: CommonOutletComponent,
    loadChildren: () => import('./app-pages/home/home.module').then(m => m.HomeModule),
  },
  {
    path: 'team',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    component: CommonOutletComponent,
    loadChildren: () => import('./app-pages/team/team.module').then(m => m.TeamModule),
  },
  {
    path: 'apps',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    component: CommonOutletComponent,
    loadChildren: () => import('./app-pages/apps/apps.module').then(m => m.AppsModule)
  },
  {
    path: 'templates',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    component: CommonOutletComponent,
    loadChildren: () => import('./app-pages/templates/templates.module').then(m => m.TemplatesModule),
  },
  {
    path: 'workflows',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    component: CommonOutletComponent,
    loadChildren: () => import('./app-pages/workflow/workflow.module').then(m => m.WorkflowModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppLayoutRoutingModule { }
