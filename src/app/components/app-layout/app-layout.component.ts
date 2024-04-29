import { Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';

import { FacadeService } from '@src/app/services/facade.service';
import { StorageKeys } from '@src/app/constants/storage-keys';
import { IResponse } from '@src/interfaces/response.interface';


@Component({
  selector: 'app-app-layout',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss']
})
export class AppLayoutComponent implements OnDestroy {

  constructor(
    private _router: Router,
    protected _facadeService: FacadeService,
    private _fb: FormBuilder
  ) {
    this.routerSubscription = this._router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe({
      next: (event: any) => {
        if ('urlAfterRedirects' in event) {
          const restrictUris = ['/auth', '/sign-document', '/canvas', '/workflow/details'];
          const isRestrictUri = restrictUris.some((restrictUri: string) => event.urlAfterRedirects.startsWith(restrictUri));

          // && _facadeService.appService.isHeaderShow === false
          if (!isRestrictUri && _facadeService.authService.isLoggedIn()) {
            // _facadeService.appService.setIsHeaderShow(true);
            this.isSidebarHidden = false;
            this.reportIssueForm = this._fb.group({
              issue: ['', [Validators.required, Validators.maxLength(250)]],
              description: ['', [Validators.required, Validators.maxLength(5000)]],
              routeName: [event.urlAfterRedirects ?? '', Validators.required],
              raisedBy: ['']
            });
          } else {
            this.isSidebarHidden = true;
          }

          if (!isRestrictUri && event.urlAfterRedirects && event.urlAfterRedirects !== this.reportIssueForm.value.routeName) {
            this.reportIssueForm.patchValue({
              routeName: event.urlAfterRedirects
            });
          }

          if (event.urlAfterRedirects.includes('/projects/')) {
            this.projectColor = parseInt(localStorage.getItem(StorageKeys.PROJECT_COLOR) ?? '1');
          } else {
            this.projectColor = 1;
          }
        }
      },
      error: (err) => {
        console.error('There is an error while navigation end', err);
      }
    });
  }

  protected routerSubscription: Subscription;
  protected toggleReportIssue: boolean = false;
  protected reportIssueForm!: FormGroup;
  protected projectColor!: number;

  protected isSidebarHidden = false;


  @ViewChild('reportIssueContainer') reportIssueContainer!: ElementRef;
  @ViewChild('reportIssueIconWrap') reportIssueIconWrap!: ElementRef;

  @HostListener('document:click', ['$event.target'])
  clickOut(target: any) {
    if (this.reportIssueContainer && this.reportIssueIconWrap && !this.reportIssueContainer.nativeElement.contains(target) && !this.reportIssueIconWrap.nativeElement.contains(target) && this.toggleReportIssue) {
      this.resetReportIssueFrom();
    }
  }

  get issue(): FormControl {
    return this.reportIssueForm.get('issue') as FormControl;
  }

  get description(): FormControl {
    return this.reportIssueForm.get('description') as FormControl;
  }

  submitIssue(): void {
    if (!this.reportIssueForm.value.raisedBy) {
      this.reportIssueForm.patchValue({
        raisedBy: this._facadeService.authService.getCurrentUser()._id ?? ''
      });
    }

    if (this.reportIssueForm.invalid) {
      this.reportIssueForm.markAllAsTouched();
      this.reportIssueForm.updateValueAndValidity();
      return;
    }

    this._facadeService.reportIssueService.create(this.reportIssueForm.value).subscribe({
      next: (res: IResponse) => {
        if (res.code === "CREATED") {
          this.resetReportIssueFrom();
          this._facadeService.appService.openToaster('Report issue submitted.', 'success');
        }
      },
      error: (err: any) => {
        console.error('Error while submitting report issue', err.error);
      }
    });
  }

  onCloseReportIssue(): void {
    this.resetReportIssueFrom();
  }

  resetReportIssueFrom(): void {
    this.toggleReportIssue = false;
    this.reportIssueForm?.reset({
      raisedBy: this.reportIssueForm.value.raisedBy ?? '',
      routeName: this.reportIssueForm.value.routeName ?? ''
    });
  }


  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

}
