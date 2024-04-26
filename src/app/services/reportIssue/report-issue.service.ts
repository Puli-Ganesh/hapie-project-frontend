import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IResponse } from '@src/interfaces/response.interface';
import { HttpClientService } from '../http-client/http-client.service';

@Injectable({
  providedIn: 'root'
})
export class ReportIssueService {

  constructor(
    private _httpClientService: HttpClientService,
  ) { }

  protected endPoint: string = 'report-issue';

  getReportIssueList(): Observable<IResponse> {
    return this._httpClientService.get(`${this.endPoint}/list`);
  }

  create(body: any): Observable<IResponse> {
    return this._httpClientService.post(body, `${this.endPoint}`);
  }
}
