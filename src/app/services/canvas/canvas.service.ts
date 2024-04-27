import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client/http-client.service';
import { Observable } from 'rxjs';

import { AES } from 'crypto-js';

import { IResponse } from '@src/interfaces/response.interface';

@Injectable({
  providedIn: 'root'
})
export class CanvasService {

  constructor(
    private _httpClientService: HttpClientService
  ) { }

  private readonly endPoint: string = 'canvas';


  encodeData(data: any): { data: any, date: string } {
    const encodeKey = `${window.screen.height}${window.screen.width}${window.screen.colorDepth}${new Date().getTime()}`;
    return {
      data: AES.encrypt(JSON.stringify(data), encodeKey).toString(),
      date: encodeKey
    };
  }

  getCanvasData(body: any): Observable<IResponse> {
    return this._httpClientService.post(body, `${this.endPoint}/data`);
  }

  getCategories(body: any): Observable<IResponse> {
    return this._httpClientService.post(body, `${this.endPoint}/get-categories`);
  }

  getShareCanvasData(body: any): Observable<IResponse> {
    return this._httpClientService.post(body, `${this.endPoint}/share-canvas-data`);
  }

  generateShareCanvasLink(data: any): Observable<any> {
    const decryptedBody = {
      ...this.encodeData({ data })
    };
    return this._httpClientService.post(decryptedBody, `${this.endPoint}/generate-share-canvas-link`);
  }

  saveCanvasData(body: any): Observable<IResponse> {
    return this._httpClientService.post(body, `${this.endPoint}/save-canvas-data`);
  }
}
