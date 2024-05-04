import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs';

import { Regex } from '@src/app/constants/regex';
import { Routes } from '@src/app/constants/routes';
import { FacadeService } from '@src/app/services/facade.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  constructor(
    private _formBuilder: FormBuilder,
    private _route: ActivatedRoute,
    private _router: Router,
    private _facadeService: FacadeService,
  ) {
    this.resetPasswordForm = this._formBuilder.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(Regex.PASSWORD),
      ]],
      confirmPassword: ['', [
        Validators.required,
        (value: any) => this.confirmPasswordValidator(value)
      ]],
    });
  }

  protected readonly appRoutes = Routes;

  protected isRequestAlive: boolean = false;
  protected resetPasswordForm: FormGroup;
  protected passwordToken: string = "";



  ngOnInit(): void {
    if (this._facadeService.authService.isLoggedIn()) {
      this._router.navigateByUrl(this.appRoutes.PROJECTS);
    } else {
      localStorage.clear();
    }
    this._route.params.subscribe((param: any) => {
      this.passwordToken = param['token'];
    });

    this.resetPasswordForm.get('password')?.valueChanges?.pipe(
      debounceTime(100),  // delay after every change to update your validations
      distinctUntilChanged(),  // only update validators when value change
      tap((value: string) => {
        if (value && this.confirmPassword?.value) {
          this.confirmPassword.setErrors({ confirm: true });
          this.confirmPassword.updateValueAndValidity();
        }
      })
    )?.subscribe();
  }


  get password(): AbstractControl | null {
    return this.resetPasswordForm.get('password');
  }
  get confirmPassword(): AbstractControl | null {
    return this.resetPasswordForm.get('confirmPassword');
  }


  onSubmit() {
    if (this.isRequestAlive || this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      this.resetPasswordForm.updateValueAndValidity();
      return;
    }

    const bodyToSend = {
      password: this.resetPasswordForm.value.password,
      resetToken: this.passwordToken,
      isInvited: false
    };
    this.isRequestAlive = true;
    this._facadeService.authService.resetPassword(bodyToSend).subscribe({
      next: (res: any) => {
        this.isRequestAlive = false;
        if (res.code == "OK") {
          this._facadeService.appService.openToaster('Your password change successfully.', 'success');
          this._router.navigateByUrl(this.appRoutes.LOGIN);
        }
      },
      error: (err: any) => {
        this.isRequestAlive = false;
        this._facadeService.appService.openToaster('Your reset password link has been expired.', 'danger');
      }
    });
  }

  private confirmPasswordValidator(control: AbstractControl): ValidationErrors | null {
    return !this.resetPasswordForm || control.value === this.resetPasswordForm.controls['password'].value ? null : { confirm: true };
  }

}
