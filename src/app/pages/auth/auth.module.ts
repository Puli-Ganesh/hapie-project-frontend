import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AuthLayoutComponent } from './components/auth-layout/auth-layout.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { LoginComponent } from './components/login/login.component';
import { MicrosoftResponseComponent } from './components/microsoft-response/microsoft-response.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { SetupProfileComponent } from './components/setup-profile/setup-profile.component';

import { AuthRoutingModule } from './auth-routing.module';
import { AuthRedirectComponent } from './components/auth-redirect/auth-redirect.component';
import { SharedModule } from '@src/app/shared/shared.module';


@NgModule({
  declarations: [
    AuthLayoutComponent,
    ForgotPasswordComponent,
    LoginComponent,
    MicrosoftResponseComponent,
    ResetPasswordComponent,
    SetupProfileComponent,
    AuthRedirectComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class AuthModule { }
