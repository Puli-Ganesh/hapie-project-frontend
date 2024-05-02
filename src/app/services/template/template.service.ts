import { Injectable } from '@angular/core';
import { IResponse } from '@src/interfaces/response.interface';
import { Observable } from 'rxjs';
import { HttpClientService } from '../http-client/http-client.service';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {

  constructor(
    private _httpClientService: HttpClientService
  ) { }

  private readonly endPoint = 'template';

  create(body: any): Observable<IResponse> {
    return this._httpClientService.post(body, `${this.endPoint}/create`);
  }

  createBlank(body: any): Observable<IResponse> {
    return this._httpClientService.post(body, `${this.endPoint}/create-blank`);
  }

  getTemplate(): Observable<IResponse> {
    return this._httpClientService.get(`${this.endPoint}`);
  }

  updateById(id: string, body: any): Observable<IResponse> {
    return this._httpClientService.put(body, `${this.endPoint}/update/${id}`);
  }

  getByPageNumber(pageNumber: any): Observable<IResponse> {
    return this._httpClientService.get(`${this.endPoint}/${pageNumber}`);
  }

  deleteById(id: any): Observable<IResponse> {
    return this._httpClientService.delete(`${this.endPoint}/${id}`);
  }

  getMasterTemplatesList() {
    return this._httpClientService.get(`${this.endPoint}/master-list`);
  }

  getList(workspaceId: string | undefined = undefined): Observable<IResponse> {
    return this._httpClientService.get(`${this.endPoint}/list${(workspaceId ? `/${workspaceId}` : '')}`);
  }

  getTemplateListForProject(projectId: string = ''): Observable<IResponse> {
    return this._httpClientService.get(`${this.endPoint}/option-list-for-project${(projectId ? `/${projectId}` : '')}`);
  }

  getListByProjectId(projectId: string): Observable<IResponse> {
    return this._httpClientService.get(`${this.endPoint}/list-by-project/${projectId}`);
  }

  saveModifiedTemplate(body: any) {
    return this._httpClientService.post(body, `${this.endPoint}/save-modified-template`);
  }

  getListByWorkspaceId(body: any): Observable<IResponse> {
    return this._httpClientService.post(body, `${this.endPoint}/list-by-workspaceId`);
  }

  getShareCanvasList(body: any): Observable<IResponse> {
    return this._httpClientService.post(body, `${this.endPoint}/share-canvas-list`);
  }
}
