import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { HttpClientService } from '../http-client/http-client.service';
import { IResponse } from '@src/interfaces/response.interface';
import { StorageKeys } from '@src/app/constants/storage-keys';


@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {

  constructor(
    private _httpClientService: HttpClientService
  ) { }

  private readonly endPoint = 'workspaces';
  private workspaceName = new Subject();
  public workspaceName$ = this.workspaceName.asObservable();

  setWorkspaceName(workspaceName: string) {
    localStorage.setItem(StorageKeys.WORKSPACE_NAME, workspaceName || '');
    this.workspaceName.next(workspaceName);
  }

  getList(): Observable<IResponse> {
    return this._httpClientService.get(`${this.endPoint}/list`);
  }

  getOptions(): Observable<IResponse> {
    return this._httpClientService.get(`${this.endPoint}/options`);
  }

  getWorkspacesByPage(pageNumber: number): Observable<IResponse> {
    return this._httpClientService.get(`${this.endPoint}/pagination/${pageNumber}`);
  }

  deleteWorkspace(workspaceId: string): Observable<IResponse> {
    return this._httpClientService.delete(`${this.endPoint}/${workspaceId}`);
  }
}
