import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HomeRoutingModule } from './home-routing.module';

import { ProjectsComponent } from './components/projects/projects.component';
import { ManageProjectComponent } from './components/manage-project/manage-project.component';
import { SharedModule } from '@src/app/shared/shared.module';


@NgModule({
  declarations: [
    ProjectsComponent,
    ManageProjectComponent
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
