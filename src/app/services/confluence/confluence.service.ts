import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client/http-client.service';

@Injectable({
  providedIn: 'root'
})
export class ConfluenceService {

  constructor(
    private _httpClientService: HttpClientService,
  ) { }

  private readonly endPoint: string = 'confluence';


  chat(body: any) {
    return this._httpClientService.post(body, `${this.endPoint}/chat`);
  }
}
