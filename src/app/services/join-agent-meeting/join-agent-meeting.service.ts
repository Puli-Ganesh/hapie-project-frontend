import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpClientService } from '../http-client/http-client.service';
import { IResponse } from '@src/interfaces/response.interface';


@Injectable({
  providedIn: 'root'
})
export class JoinAgentMeetingService {

  constructor(
    private _httpClientService: HttpClientService
  ) { }

  private readonly endPoint = 'join-agent-meeting';


  create(body: any): Observable<IResponse> {
    return this._httpClientService.post(body, `${this.endPoint}/create`);
  }

  delete(id: string): Observable<IResponse> {
    return this._httpClientService.delete(`${this.endPoint}/${id ?? ''}`);
  }

}
