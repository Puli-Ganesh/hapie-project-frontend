import { Injectable } from '@angular/core';

import { HttpClientService } from '../http-client/http-client.service';

@Injectable({
  providedIn: 'root'
})
export class SignedDocumentService {

  constructor(
    private _httpClientService: HttpClientService
  ) { }

  private endPoint = 'signed-document';


  getById(id: string) {
    return this._httpClientService.get(`${this.endPoint}/${id}`);
  }

  getSignLink(body: any) {
    return this._httpClientService.post(body, `${this.endPoint}/get-sign-link`);
  }
}
