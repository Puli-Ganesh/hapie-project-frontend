import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

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

}