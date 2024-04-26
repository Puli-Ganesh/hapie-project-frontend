import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AppConfig } from '@src/app/constants/appConfig';
import { Regex } from '@src/app/constants/regex';
import { Routes } from '@src/app/constants/routes';
import { FacadeService } from '@src/app/services/facade.service';
import { IResponse } from '@src/interfaces/response.interface';

export interface ILoginCredentials {
  email: string,
  password: string
}


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(
    private _formBuilder: FormBuilder,
    private _facadeService: FacadeService,
    private _router: Router,
    private _appConfig: AppConfig
  ) {
    this.loginForm = this._formBuilder.group({
      email: [null, [
        Validators.required,
        Validators.pattern(Regex.EMAIL),
        Validators.maxLength(254)
      ]],
      password: [null, [
        Validators.required,
      ]],
    });
  }

  protected readonly appRoutes = Routes;
  protected isRequestAlive: boolean = false;

  protected loginForm: FormGroup;
  protected isPasswordEyeOpen: boolean = false;
  protected serverError: string | null = null;
  client: any;

  ngOnInit(): void {
    // navigating user to home page if already logged in.
    if (this._facadeService.authService.isLoggedIn()) {
      this._router.navigateByUrl(this.appRoutes.HOME);
    } else {
      localStorage.clear();
    }

    // @ts-ignore
    this.client = google.accounts.oauth2.initTokenClient({
      client_id: this._appConfig.googleClientId,
      scope: `https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/meetings.space.readonly https://www.googleapis.com/auth/drive.readonly`,
      callback: (res: any) => {
        if (res.access_token) {
          this.loginUserWithGoogle(res.access_token);
        }
      },
    });

  }

  get email(): AbstractControl | null {
    return this.loginForm.get('email');
  }
  get password(): AbstractControl | null {
    return this.loginForm.get('password');
  }

  onLogin() {
    this.isRequestAlive = true;
    this.serverError = '';
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.isRequestAlive = false;
      return this.loginForm.updateValueAndValidity();
    }

    // logging user in
    const userCredentials: ILoginCredentials = {
      email: this.loginForm.value.email.toLowerCase().trim(),
      password: this.loginForm.value.password.trim()
    };
    this._facadeService.authService.login(userCredentials).subscribe({
      next: (res: IResponse) => {
        this.isRequestAlive = false;
        // after successfully login navigating user
        if (res.code == "OK") {
          this.serverError = '';
          this._router.navigateByUrl(this.appRoutes.HOME);
        }
        this._facadeService.appService.clearToasters();
      },
      error: (err: any) => {
        this.isRequestAlive = false;
        if (err.error.code === "E_BAD_REQUEST") {
          this._facadeService.appService.openToaster('Wrong credentials. Please try again.', 'danger');
        }
      }
    });

  }

  onLoginWithMicrosoft() {
    this._facadeService.authService.loginWithMicrosoft().subscribe({
      next: (res: any) => {
        window.location.href = res.data.url;
      }
    });
  }

  onLoginWithGoogle() {
    this.client.requestAccessToken();
  }

  loginUserWithGoogle(accessToken: string) {
    this.isRequestAlive = true;

    this._facadeService.authService.loginWithGoogle({ accessToken }).subscribe({
      next: (res: any) => {
        this.isRequestAlive = false;
        if (res.code == 'OK') {
          this._facadeService.authService.setSession(res);
          this._router.navigateByUrl(Routes.HOME);
        }
      },
      error: (err: any) => {
        this.isRequestAlive = false;
        if (err.error.code == 'E_USER_NOT_FOUND') {
          this.serverError = 'You are not registered yet. Contact support to register.';
          this._facadeService.appService.openToaster('You are not registered yet. Contact support to register.', 'danger')
        }
        if (err.error.code == 'E_INTERNAL_SERVER_ERROR') {
          this.serverError = err.error.message ?? 'Something bad happened on server.';
        }
      }
    });

  }

}
