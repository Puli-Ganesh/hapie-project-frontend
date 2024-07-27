import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Routes } from '@src/app/constants/routes';
import { StorageKeys } from '@src/app/constants/storage-keys';
import { FacadeService } from '@src/app/services/facade.service';

@Component({
  selector: 'app-microsoft-response',
  templateUrl: './microsoft-response.component.html',
  styleUrls: ['./microsoft-response.component.scss']
})
export class MicrosoftResponseComponent implements OnInit {

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _facadeService: FacadeService,
    private _router: Router
  ) { }


  protected readonly appRoutes = Routes;
  protected isLoggingIn: boolean = false;
  protected serverError: string = '';

  ngOnInit(): void {
    this._activatedRoute.params.subscribe((data: any) => {
      if (data.code) {
        this.isLoggingIn = true;
        const body: any = { code: decodeURIComponent(data.code), state: data.state };
        this._facadeService.authService.loginWithGoogle(body).subscribe({
          next: (res: any) => {
            this.isLoggingIn = false;

            this._facadeService.authService.setSession(res);
            this._router.navigateByUrl(this.appRoutes.PROJECTS);
          },
          error: (err: any) => {
            this.isLoggingIn = false;
            if (err.error.code == 'E_USER_NOT_FOUND') {
              this.serverError = 'You are not registered yet. Contact support to register.';
              this._facadeService.appService.openToaster('You are not registered yet. Contact support to register.', 'danger');
              this._router.navigateByUrl(this.appRoutes.LOGIN);
            }
            if (err.error.code == 'E_INTERNAL_SERVER_ERROR') {
              this.serverError = err.error.message ?? 'Something bad happened on server.';
            }
            console.error(err.error);
          }
        });
      }
    });

    this._activatedRoute.queryParams.subscribe({
      next: (res: any) => {
        if (!res.code) return;
        const projectId = sessionStorage.getItem(StorageKeys.SST.PROJECT_ID_FOR_MICROSOFT);

        const body: any = { code: res.code };
        if (this._facadeService.authService.isLoggedIn()) {
          this._facadeService.authService.acquireTokenViaApp(body).subscribe({
            next: (res: any) => {
              if (res.code === 'OK') {
                this._router.navigateByUrl(this.appRoutes.APPS);
              }
            },
            error: (err: any) => {
              console.error(err.error);
            }
          });
        } else {
          if (projectId) {
            body.projectId = projectId;
          }

          this.isLoggingIn = true;
          this._facadeService.authService.acquireToken(body).subscribe({
            next: (res: any) => {
              this.isLoggingIn = false;

              this._facadeService.authService.setSession(res);
              if (projectId) {
                sessionStorage.removeItem(StorageKeys.SST.PROJECT_ID_FOR_MICROSOFT);
                this._router.navigateByUrl(`/${projectId}`).then(() => {
                  /** navigated based on project access via projectDetails$ observable subscription on project select */
                  this._facadeService.projectService.selectProject(projectId);
                });
              } else {
                this._router.navigateByUrl(this.appRoutes.PROJECTS);
              }
            },
            error: (err: any) => {
              this.isLoggingIn = false;
              if (err.error.code == 'E_USER_NOT_FOUND') {
                this.serverError = 'You are not registered yet. Contact support to register.';
                this._facadeService.appService.openToaster('You are not registered yet. Contact support to register.', 'danger');
                if (projectId) {
                  this._router.navigateByUrl(`/${projectId}${this.appRoutes.LOGIN}`);
                } else {
                  this._router.navigateByUrl(this.appRoutes.LOGIN);
                }
              }
              if (err.error.code == 'E_INTERNAL_SERVER_ERROR') {
                this.serverError = err.error.message ?? 'Something bad happened on server.';
              }
              console.error(err.error);
            }
          });
        }
      }
    });
  }

}
