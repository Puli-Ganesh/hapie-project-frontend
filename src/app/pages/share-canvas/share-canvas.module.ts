import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ClipboardModule } from '@angular/cdk/clipboard';

import { ShareCanvasRoutingModule } from './share-canvas-routing.module';
import { ShareCanvasLayoutComponent } from './components/share-canvas-layout/share-canvas-layout.component';
import { ShareCanvasComponent } from './components/share-canvas/share-canvas.component';
import { SharedModule } from '@src/app/shared/shared.module';


@NgModule({
  declarations: [
    ShareCanvasLayoutComponent,
    ShareCanvasComponent
  ],
  imports: [
    CommonModule,
    ShareCanvasRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ClipboardModule
  ]
})
export class ShareCanvasModule { }
