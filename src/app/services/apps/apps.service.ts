import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IResponse } from '@src/interfaces/response.interface';
import { HttpClientService } from '../http-client/http-client.service';


@Injectable({
  providedIn: 'root'
})
export class AppsService {


  constructor(
    private _httpClientService: HttpClientService
  ) { }

  private readonly endPoint = 'apps';


  getList(): Observable<IResponse> {
    return this._httpClientService.get(`${this.endPoint}/list`);
  }

  removeApp(body: { appName: string }): Observable<IResponse> {
    return this._httpClientService.post(body, `${this.endPoint}/remove-app`);
  }
}
