import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ManageProjectComponent } from './components/manage-project/manage-project.component';
import { NotFoundComponent } from '@src/app/components/not-found/not-found.component';
import { CompareComponent } from './components/compare/compare.component';
import { MediaComponent } from './components/media/media.component';
import { MediaTranscriptComponent } from './components/media-transcript/media-transcript.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { DocumentsComponent } from './components/documents/documents.component';
import { TemplateComponent } from './components/template/template.component';
import { DocumentComponent } from './components/document/document.component';
import { DocumentUploadComponent } from './components/document-upload/document-upload.component';
import { ChatBotComponent } from './components/chat-bot/chat-bot.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MomComponent } from './components/mom/mom.component';

const routes: Routes = [
  {
    path: 'dashboard',
    title: 'Dashboard | NexGen Force',
    component: DashboardComponent
  },
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
    path: 'compare',
    title: 'Compare | NexGen Force',
    component: CompareComponent
  },
  {
    path: 'media',
    title: 'Media | NexGen Force',
    component: MediaComponent
  },
  {
    path: 'media/:id',
    title: 'Media - Transcript | NexGen Force',
    component: MediaTranscriptComponent
  },
  {
    path: 'canvas',
    title: 'Canvas | NexGen Force',
    component: CanvasComponent
  },
  {
    path: 'template',
    title: 'Templates | NexGen Force',
    component: TemplateComponent
  },
  {
    path: 'documents',
    title: 'Documents & Templates | NexGen Force',
    component: DocumentComponent
  },
  {
    path: 'document-upload',
    title: 'Document Upload | NexGen Force',
    component: DocumentUploadComponent
  },
  {
    path: 'chat',
    title: 'Chat Bot | NexGen Force',
    component: ChatBotComponent
  },
  {
    path: 'mom',
    title: 'MoM | NexGen Force',
    component: MomComponent
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
