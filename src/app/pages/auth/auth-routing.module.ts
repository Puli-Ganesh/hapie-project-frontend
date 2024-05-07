import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AuthLayoutComponent } from './components/auth-layout/auth-layout.component';
import { MicrosoftResponseComponent } from './components/microsoft-response/microsoft-response.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { SetupProfileComponent } from './components/setup-profile/setup-profile.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { AuthRedirectComponent } from './components/auth-redirect/auth-redirect.component';

const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        title: 'Redirect | NexGex Force',
        component: AuthRedirectComponent,
      },
      {
        path: 'login',
        title: 'Sign in | NexGen Force',
        component: LoginComponent
      },
      {
        path: 'microsoft-response',
        title: 'Sign in | NexGen Force',
        component: MicrosoftResponseComponent
      },
      {
        path: 'forgot-password',
        title: 'Forgot Password | NexGen Force',
        component: ForgotPasswordComponent
      },
      {
        path: 'reset-password/:token',
        title: 'Reset Password | NexGen Force',
        component: ResetPasswordComponent
      },
      {
        path: 'setup-profile/:token',
        title: 'Profile Setup | NexGen Force',
        component: SetupProfileComponent
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
