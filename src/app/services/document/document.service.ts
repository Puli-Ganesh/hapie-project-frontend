import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client/http-client.service';
import { Observable } from 'rxjs';

import { IResponse } from '@src/interfaces/response.interface';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  constructor(
    private _httpClientService: HttpClientService
  ) { }

  private readonly endPoint = 'document';


  getData(projectId: string, workspaceId: string = ''): Observable<IResponse> {
    const params = `${projectId}${(workspaceId ? `/${workspaceId}` : '')}`;
    return this._httpClientService.get(`${this.endPoint}/data/${params}`);
  }

  getTemplateAndCategories(projectId: string, templateId: string): Observable<IResponse> {
    return this._httpClientService.get(`${this.endPoint}/template-and-category/${projectId}/${templateId}`);
  }

  categoryList(body: { projectId: string, templateId: string, latestMajor: number, latestMinor: number }): Observable<IResponse> {
    return this._httpClientService.post(body, `${this.endPoint}/category-list`);
  }

  migrateVersion(body: any): Observable<IResponse> {
    return this._httpClientService.post(body, `${this.endPoint}/migrate-version`);
  }

  migrateMinorVersion(body: any): Observable<IResponse> {
    return this._httpClientService.post(body, `${this.endPoint}/migrate-minor-version`);
  }
}
