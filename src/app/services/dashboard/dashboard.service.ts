import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client/http-client.service';
import { Observable } from 'rxjs';

import { IResponse } from '@src/interfaces/response.interface';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(
    private _httpClientService: HttpClientService
  ) { }

  private readonly endPoint = 'dashboard';


  getData(projectId: string): Observable<IResponse> {
    return this._httpClientService.get(`${this.endPoint}/data/${projectId}`);
  }

  getCalendarData(body: { startDate: string, endDate: string }): Observable<IResponse> {
    return this._httpClientService.post(body, `${this.endPoint}/get-calendar-data`);
  }

  createMeeting(body: any): Observable<IResponse> {
    return this._httpClientService.post(body, `${this.endPoint}/create-meeting`);
  }
}
