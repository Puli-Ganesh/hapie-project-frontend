import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs';

import { Regex } from '@src/app/constants/regex';
import { Routes } from '@src/app/constants/routes';
import { FacadeService } from '@src/app/services/facade.service';

@Component({
  selector: 'app-setup-profile',
  templateUrl: './setup-profile.component.html',
  styleUrls: ['../login/login.component.scss', './setup-profile.component.scss']
})
export class SetupProfileComponent implements OnInit {

  constructor(
    private _formBuilder: FormBuilder,
    private _activatedRoute: ActivatedRoute,
    private _facadeService: FacadeService,
    private _router: Router
  ) {
    this.userForm = this._formBuilder.group({
      firstName: ['', [
        Validators.required,
        Validators.maxLength(30)
      ]],
      lastName: ['', [
        Validators.required,
        Validators.maxLength(30)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(Regex.PASSWORD)
      ]],
      confirmPassword: ['', [
        Validators.required,
        (value: any) => this.validateConfirmPassword(value)
      ]]
    });

    this._activatedRoute.paramMap.subscribe({
      next: (res: any) => {
        this.token = res.params.token;
        this.id = this.token.slice(-24);
      }
    });
  }

  protected id: any
  protected token: any;
  protected userForm: FormGroup;
  protected readonly appRoutes = Routes;


  ngOnInit(): void {
    this.userForm.get('password')?.valueChanges?.pipe(
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


  get firstName() {
    return this.userForm.get('firstName');
  }
  get lastName() {
    return this.userForm.get('lastName');
  }
  get password() {
    return this.userForm.get('password');
  }
  get confirmPassword() {
    return this.userForm.get('confirmPassword');
  }

  onSetup() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return this.userForm.updateValueAndValidity();
    }

    const body = {
      id: this.id,
      token: this.token,
      firstName: this.userForm.value.firstName,
      lastName: this.userForm.value.lastName,
      password: this.userForm.value.password
    };

    this._facadeService.authService.setupProfile(body).subscribe({
      next: (res: any) => {
        this._router.navigateByUrl(this.appRoutes.LOGIN);
        this._facadeService.appService.openToaster('Profile setup saved.', 'success');
      },
      error: (err: any) => {
        console.error(err.error);
        this._facadeService.appService.openToaster('Profile setup error', 'danger');
      }
    });
  }

  private validateConfirmPassword(control: AbstractControl): ValidationErrors | null {
    return !this.userForm || control.value === this.userForm.controls['password'].value ? null : { confirm: true };
  }

}
