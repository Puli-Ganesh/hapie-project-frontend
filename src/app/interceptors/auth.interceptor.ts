import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { StorageKeys } from '../constants/storage-keys';
import { AuthService } from '../services/auth/auth.service';
import { Router } from '@angular/router';
import { Routes } from '../constants/routes';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private _authService: AuthService,
    private _router: Router
  ) { }

  protected readonly appRoutes = Routes;

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const authToken = localStorage.getItem(StorageKeys.USER_TOKEN);
    if (authToken) {
      const parsedToken = JSON.parse(authToken);
      request = request.clone({ headers: request.headers.set('Authorization', `${parsedToken}`) });
    }

    return next.handle(request).pipe(tap({
      error: (err: any) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status == 401) {
            this._authService.logOut();
            this._router.navigateByUrl(this.appRoutes.LOGIN);
          }
        }
      }
    }));
  }
}
