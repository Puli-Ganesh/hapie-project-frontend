import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HomeRoutingModule } from './home-routing.module';

import { ProjectsComponent } from './components/projects/projects.component';
import { ManageProjectComponent } from './components/manage-project/manage-project.component';
import { SharedModule } from '@src/app/shared/shared.module';
import { CanvasComponent } from './components/canvas/canvas.component';
import { CompareComponent } from './components/compare/compare.component';
import { DocumentsComponent } from './components/documents/documents.component';
import { MediaComponent } from './components/media/media.component';
import { MediaTranscriptComponent } from './components/media-transcript/media-transcript.component';


@NgModule({
  declarations: [
    ProjectsComponent,
    ManageProjectComponent,
    CanvasComponent,
    CompareComponent,
    DocumentsComponent,
    MediaComponent,
    MediaTranscriptComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class HomeModule { }
