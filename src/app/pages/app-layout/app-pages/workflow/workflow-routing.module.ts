import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkflowComponent } from './components/workflow/workflow.component';
import { WorkflowDetailsComponent } from './components/workflow-details/workflow-details.component';

const routes: Routes = [
  {
    path: '',
    component: WorkflowComponent,
  },
  {
    path: 'details/:workflowId',
    component: WorkflowDetailsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowRoutingModule { }
