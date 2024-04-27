import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

import { AppLayoutComponent } from './components/app-layout/app-layout.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    loadChildren: () => import('./pages/app-layout/app-layout.module').then(m => m.AppLayoutModule),
  },
  {
    path: 'canvas',
    loadChildren: () => import('./pages/share-canvas/share-canvas.module').then(m => m.ShareCanvasModule),
  },
  {
    path: 'sign-document',
    loadChildren: () => import('./pages/sign-document/sign-document.module').then(m => m.SignDocumentModule),
  },
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthModule),
  },
  {
    path: '**',
    title: 'Page Not Found | NexGen Force',
    component: NotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
