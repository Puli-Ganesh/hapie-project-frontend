import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { jwtDecode } from "jwt-decode";
import { StorageKeys } from '@src/app/constants/storage-keys';

export type ToasterType = 'success' | 'danger';
export interface Toaster {
  message: string,
  type: ToasterType,
  duration?: number
}

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor() { }

  protected headerStatus: boolean = false;
  public toasters$: Subject<Toaster> = new Subject<Toaster>();
  public clearToasters$: Subject<boolean> = new Subject<boolean>();

  setIsHeaderShow(flag: boolean) {
    this.headerStatus = flag;
  }

  get isHeaderShow(): boolean {
    return this.headerStatus;
  }

  openToaster(message: string, type: ToasterType, duration: number = 3000) {
    this.toasters$.next({
      message,
      type,
      duration
    });
  }

  clearToasters() {
    this.clearToasters$.next(true);
  }

  private decodeTokenData: any;
  decodeToken() {
    try {
      if (!this.decodeTokenData && localStorage.getItem(StorageKeys.USER_TOKEN)) {
        this.decodeTokenData = jwtDecode<any>(localStorage.getItem(StorageKeys.USER_TOKEN)!)?.user;
      }
      return this.decodeTokenData;
    } catch (error) {
      console.log('Error while decoding', error);
      this.decodeTokenData = null;
      return;
    }
  }

  get exportedProjectId(): string {
    return this.decodeToken()?.projectId ?? '';
  }

  getReplacedUrl(url: string): string {
    const exportedProjectId = this.exportedProjectId;
    if (exportedProjectId) {
      if (url.startsWith('/auth/')) {
        return `/${exportedProjectId}${url}`;
      }
      return url.replace('/project/', `/${exportedProjectId}/`);
    }
    return url;
  }
}