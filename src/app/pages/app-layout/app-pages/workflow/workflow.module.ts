import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkflowRoutingModule } from './workflow-routing.module';
import { WorkflowComponent } from './components/workflow/workflow.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WorkflowDetailsComponent } from './components/workflow-details/workflow-details.component';
import { SharedModule } from '@src/app/shared/shared.module';


@NgModule({
  declarations: [
    WorkflowComponent,
    WorkflowDetailsComponent
  ],
  imports: [
    CommonModule,
    WorkflowRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    FormsModule
  ]
})
export class WorkflowModule { }
