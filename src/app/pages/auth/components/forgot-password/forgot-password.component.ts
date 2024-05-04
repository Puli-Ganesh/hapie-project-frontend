import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Regex } from '@src/app/constants/regex';
import { Routes } from '@src/app/constants/routes';
import { FacadeService } from '@src/app/services/facade.service';


@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['../login/login.component.scss', './forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  constructor(
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _facadeService: FacadeService

  ) {
    this.forgotPassForm = this._formBuilder.group({
      email: ['', [
        Validators.required,
        Validators.pattern(Regex.EMAIL),
        Validators.maxLength(254)
      ]]
    });
  }

  protected readonly appRoutes = Routes;
  protected forgotPassForm!: FormGroup;
  protected isRequestAlive = false;
  protected isForgetPasswordLinkSendSuccessfully: boolean = false;
  protected serverError: string | null = null;



  ngOnInit(): void {
    if (this._facadeService.authService.isLoggedIn()) {
      this._router.navigateByUrl(this.appRoutes.PROJECTS);
    } else {
      localStorage.clear();
    }
  }

  get email(): AbstractControl | null {
    return this.forgotPassForm.get('email');
  }

  onForgotPassword() {
    if (this.isRequestAlive || this.isForgetPasswordLinkSendSuccessfully) {
      return;
    }

    this.isRequestAlive = true;
    this.serverError = '';
    if (this.forgotPassForm.invalid) {
      this.forgotPassForm.markAllAsTouched();
      this.isRequestAlive = false;
      return this.forgotPassForm.updateValueAndValidity();
    }

    this._facadeService.authService.forgotPassword(this.forgotPassForm.value.email).subscribe({
      next: (res: any) => {
        this.isRequestAlive = false;
        if (res.code == "OK") {
          this.isForgetPasswordLinkSendSuccessfully = true;
          this.serverError = '';
          this._facadeService.appService.openToaster('We sent your reset password link on email, Please check it.', 'success', 10000);
        }
      },
      error: (err: any) => {
        this.isRequestAlive = false;
        if (["E_BAD_REQUEST", "E_USER_NOT_FOUND"].includes(err.error.code)) {
          this.serverError = err.error.message;
        } else if (err.error.message) {
          this._facadeService.appService.openToaster(err.error.message, 'danger');
        }
      }
    });
  }

}
