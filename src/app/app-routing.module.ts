import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppLayoutComponent } from './components/app-layout/app-layout.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
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
    matcher: (url) => {
      if (url.length > 0) {
        if (url[0].path === 'auth') {
          /** 'consumed', return only matched and verified UrlSegment list. */
          return { consumed: url.slice(0, 1) };
        } else if ((/^[a-f\d]{24}$/i.test(url[0].path) && url[1]?.path === 'auth')) {
          /** 'consumed', return only matched and verified UrlSegment list. */
          return { consumed: url.slice(0, 2) };
        }
      }
      return null;
    },
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
