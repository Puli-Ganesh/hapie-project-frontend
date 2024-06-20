import { Injectable } from '@angular/core';
import { IResponse } from '@src/interfaces/response.interface';

import { AES } from 'crypto-js';
import * as moment from 'moment';
import { BehaviorSubject, Observable, Subject, tap } from 'rxjs';

import { HttpClientService } from '@app/services/http-client/http-client.service';
import { StorageKeys } from '@src/app/constants/storage-keys';
import { AppSocketService } from '../app-socket/app-socket.service';



@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private _httpClientService: HttpClientService,
    private _appSocketService: AppSocketService
  ) {
    this.encodeKey = `${window.screen.height}${window.screen.width}${window.screen.colorDepth}${new Date().getTime()}`;
    this.currentUser$.next(this.getCurrentUser())
  }

  private endPoint: string = 'auth';
  protected encodeKey: string;
  public currentUser$: Subject<any> = new BehaviorSubject(null);

  encodeData(data: any): string {
    return AES.encrypt(JSON.stringify(data), this.encodeKey).toString();
  }

  login(cred: { email: string, password: string }): Observable<IResponse> {
    const encryptedBody = {
      data: this.encodeData(cred),
      date: this.encodeKey,
    };
    return this._httpClientService.post(encryptedBody, `${this.endPoint}/login`).pipe(
      tap((res: any) => {
        this.setSession(res);
      }),
    );
  }

  loginWithMicrosoft() {
    return this._httpClientService.get(`${this.endPoint}/login-with-microsoft`);
  }

  loginWithGoogle(body: any) {
    return this._httpClientService.post(body, `${this.endPoint}/login-with-google`);
  }

  acquireToken(body: any) {
    return this._httpClientService.post(body, `${this.endPoint}/acquire-token`);
  }

  setSession(authResult: any) {
    const expiresIn = authResult.data.token.expiresIn * 1000;
    const expiresAt = moment().valueOf() + expiresIn;

    localStorage.setItem(StorageKeys.USER_TOKEN, JSON.stringify(authResult.data.token.accessToken));
    const userDetails = {
      ...authResult.data.user,
      type: authResult.data.role.type
    };
    localStorage.setItem(StorageKeys.USER_INFORMATION, JSON.stringify(userDetails));
    localStorage.setItem(StorageKeys.USER_TOKEN_EXPIRES_AT, JSON.stringify(expiresAt));

    this._appSocketService.establishSocketConnection();
    this._appSocketService.joinUserRoom(`user-${authResult.data.user._id}`);

    // if (authResult.data.workspaceName) {
    //   this._workspaceService.setWorkspaceName(authResult.data.workspaceName);
    // }
    this.currentUser$.next(this.getCurrentUser());
  }


  getCurrentUser() {
    const userInfo: string | null = localStorage.getItem(StorageKeys.USER_INFORMATION); return userInfo ? JSON.parse(userInfo) : null;
  }

  getCurrentUser$() {
    return this.currentUser$.asObservable();
  }

  setCurrentUser$(user: any): void {
    if (user && !Array.isArray(user) && typeof user === 'object') {
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        let isUserInfoUpdate = false;
        for (const key in user) {
          if (key in currentUser) {
            currentUser[key] = user[key];
            isUserInfoUpdate = true;
          }
        }

        if (isUserInfoUpdate) {
          localStorage.setItem(StorageKeys.USER_INFORMATION, JSON.stringify(currentUser));
          this.currentUser$.next(currentUser);
        }
      }
    }
  }

  getAuthToken(): string | null {
    const authToken: string | null = localStorage.getItem(StorageKeys.USER_TOKEN);
    return authToken ? JSON.parse(authToken) : null;
  }

  getExpiration() {
    let expiration = JSON.stringify(moment().valueOf() - 1000);
    if (localStorage.getItem(StorageKeys.USER_TOKEN_EXPIRES_AT)) {
      expiration = localStorage.getItem(StorageKeys.USER_TOKEN_EXPIRES_AT)!;
    }
    return moment(JSON.parse(expiration));
  }

  isLoggedIn() {
    return moment().isBefore(this.getExpiration());
  }

  resendResetPassword(id: any): Observable<any> {
    return this._httpClientService.get(`${this.endPoint}/resend-reset-password/${id}`);
  }

  forgotPassword(email: string): Observable<any> {
    const body = {
      data: this.encodeData({ email }),
      date: this.encodeKey
    };
    return this._httpClientService.post(body, `${this.endPoint}/forgot-password`);
  }

  resetPassword(body: any): Observable<any> {
    body = {
      data: this.encodeData(body),
      date: this.encodeKey
    };
    return this._httpClientService.post(body, `${this.endPoint}/reset-password`);
  }

  logOut() {
    const userData = this.getCurrentUser();
    localStorage.clear();
    if (userData?._id) {
      this._appSocketService.leaveUserRoom(`user-${userData._id}`);
      setTimeout(() => {
        this._appSocketService.disconnectSocketConnection();
      }, 100);
    }
    this.currentUser$.next(this.getCurrentUser());
  }

  setupProfile(body: any): Observable<any> {
    return this._httpClientService.post(body, `${this.endPoint}/setup-profile`);
  }

}