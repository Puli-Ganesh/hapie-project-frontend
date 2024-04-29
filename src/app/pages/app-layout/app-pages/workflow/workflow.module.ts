import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkflowRoutingModule } from './workflow-routing.module';
import { WorkflowComponent } from './components/workflow/workflow.component';
import { FormsModule } from '@angular/forms';
import { WorkflowDetailsComponent } from './components/workflow-details/workflow-details.component';


@NgModule({
  declarations: [
    WorkflowComponent,
    WorkflowDetailsComponent
  ],
  imports: [
    CommonModule,
    WorkflowRoutingModule,
    FormsModule
  ]
})
export class WorkflowModule { }
