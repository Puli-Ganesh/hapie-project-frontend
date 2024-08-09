import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NotFoundComponent } from '@src/app/components/not-found/not-found.component';
import { CompareComponent } from './components/compare/compare.component';
import { MediaComponent } from './components/media/media.component';
import { MediaTranscriptComponent } from './components/media-transcript/media-transcript.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { TemplateComponent } from './components/template/template.component';
import { DocumentComponent } from './components/document/document.component';
import { DocumentUploadComponent } from './components/document-upload/document-upload.component';
import { ChatBotComponent } from './components/chat-bot/chat-bot.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MomComponent } from './components/mom/mom.component';
import { postfixPageTitle } from '@src/app/constants/appConfig';

const routes: Routes = [
  {
    path: 'dashboard',
    title: `Dashboard ${postfixPageTitle}`,
    component: DashboardComponent
  },
  {
    path: 'compare',
    title: `Compare ${postfixPageTitle}`,
    component: CompareComponent
  },
  {
    path: 'media',
    title: `Media ${postfixPageTitle}`,
    component: MediaComponent
  },
  {
    path: 'media/:id',
    title: `Media - Transcript ${postfixPageTitle}`,
    component: MediaTranscriptComponent
  },
  {
    path: 'canvas',
    title: `Canvas ${postfixPageTitle}`,
    component: CanvasComponent
  },
  {
    path: 'template',
    title: `Templates ${postfixPageTitle}`,
    component: TemplateComponent
  },
  {
    path: 'documents',
    title: `Documents ${postfixPageTitle}`,
    component: DocumentComponent
  },
  {
    path: 'document-upload',
    title: `Document Upload ${postfixPageTitle}`,
    component: DocumentUploadComponent
  },
  {
    path: 'chat',
    title: `Chat Bot ${postfixPageTitle}`,
    component: ChatBotComponent
  },
  {
    path: 'mom',
    title: `MoM ${postfixPageTitle}`,
    component: MomComponent
  },
  {
    path: '**',
    title: `Page Not Found ${postfixPageTitle}`,
    component: NotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
