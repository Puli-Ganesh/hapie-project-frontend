import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client/http-client.service';
import { Observable } from 'rxjs';

import { IResponse } from '@src/interfaces/response.interface';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(
    private _httpClientService: HttpClientService
  ) { }

  protected readonly endPoint: string = 'category';


  updateCategory(id: string, body: any): Observable<IResponse> {
    return this._httpClientService.put(body, `${this.endPoint}/${id}`);
  }

  updateCategoryBulk(body: Array<{ _id: string, requirements: Array<string> }>): Observable<IResponse> {
    return this._httpClientService.put(body, `${this.endPoint}/bulk`);
  }

  addRequirement(body: any): Observable<IResponse> {
    return this._httpClientService.post(body, `${this.endPoint}/add-requirement`);
  }

  updateRequirement(body: any): Observable<IResponse> {
    return this._httpClientService.put(body, `${this.endPoint}/update-requirement`);
  }

  deleteRequirement(categoryId: string, requirementId: string): Observable<IResponse> {
    return this._httpClientService.delete(`${this.endPoint}/delete-requirement/${categoryId}/${requirementId}`);
  }
}
