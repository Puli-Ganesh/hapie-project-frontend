import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client/http-client.service';
import { IResponse } from '@src/interfaces/response.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShareCanvasService {

  constructor(
    private _httpClientService: HttpClientService,
  ) { }

  private readonly endPoint = 'share-canvas';


  requestEditAccess(body: any): Observable<IResponse> {
    return this._httpClientService.post(body, `${this.endPoint}/request-edit-access`);
  }

  updateRequirement(body: { categoryId: string, requirementId: string, accessToken: string, requirementContent: string }): Observable<IResponse> {
    return this._httpClientService.put(body, `${this.endPoint}/update-requirement`);
  }

  deleteRequirement(body: { categoryId: string, requirementId: string, accessToken: string }): Observable<IResponse> {
    return this._httpClientService.post(body, `${this.endPoint}/delete-requirement`);
  }

  addRequirement(body: any): Observable<IResponse> {
    return this._httpClientService.post(body, `${this.endPoint}/add-requirement`);
  }
}
