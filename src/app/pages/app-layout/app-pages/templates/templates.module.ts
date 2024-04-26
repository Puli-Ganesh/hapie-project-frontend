import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TemplatesRoutingModule } from './templates-routing.module';
import { TemplatesComponent } from './components/templates/templates.component';
import { SharedModule } from '@src/app/shared/shared.module';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    TemplatesComponent
  ],
  imports: [
    CommonModule,
    TemplatesRoutingModule,
    SharedModule,
    FormsModule
  ]
})
export class TemplatesModule { }
