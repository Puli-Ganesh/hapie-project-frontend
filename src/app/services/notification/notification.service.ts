import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client/http-client.service';
import { Observable, Subject } from 'rxjs';

import { IResponse } from '@src/interfaces/response.interface';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private _httpClientService: HttpClientService,
  ) { }

  private readonly endPoint = 'notifications';

  private newNotification: Subject<any> = new Subject<any>();
	public newNotification$: Observable<any> = this.newNotification.asObservable();
  public hasNewNotification: boolean = false;
  public notificationCount: number = 0;

  receivedNotification(notification: any) {
    this.hasNewNotification = true;
    this.notificationCount = this.notificationCount + 1;
    this.newNotification.next(notification);
  }

  markAllAsRead() {
    this.hasNewNotification = false;
    this.notificationCount = 0;
    this.newNotification.next(null);
  }

  getNotificationList(): Observable<IResponse> {
    return this._httpClientService.get(`${this.endPoint}/list`);
  }

  approveEditAccess(notificationId: string): Observable<IResponse> {
    return this._httpClientService.get(`${this.endPoint}/approve-edit-access/${notificationId}`);
  }

}
