import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TeamRoutingModule } from './team-routing.module';

import { TeamComponent } from './components/team/team.component';
import { AddMemberComponent } from './components/add-member/add-member.component';
import { SharedModule } from '@src/app/shared/shared.module';


@NgModule({
  declarations: [
    TeamComponent,
    AddMemberComponent
  ],
  imports: [
    CommonModule,
    TeamRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule
  ]
})
export class TeamModule { }
