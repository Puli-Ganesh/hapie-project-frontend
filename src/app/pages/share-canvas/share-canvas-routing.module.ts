import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShareCanvasLayoutComponent } from './components/share-canvas-layout/share-canvas-layout.component';
import { ShareCanvasComponent } from './components/share-canvas/share-canvas.component';
import { NotFoundComponent } from '@src/app/components/not-found/not-found.component';

const routes: Routes = [
  {
    path: '',
    component: ShareCanvasLayoutComponent,
    children: [
      {
        path: ':token',
        pathMatch: 'full',
        title: 'NexGen Force | Share Canvas',
        component: ShareCanvasComponent
      },
      {
        path: '**',
        title: 'NexGen Force | Page Not Found',
        component: NotFoundComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShareCanvasRoutingModule { }
