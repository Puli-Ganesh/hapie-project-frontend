import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Routes } from '@src/app/constants/routes';
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
    this._activatedRoute.queryParams.subscribe({
      next: (res: any) => {
        this.isLoggingIn = true;

        this._facadeService.authService.acquireToken({ code: res.code }).subscribe({
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
  }

}
