import { Injectable } from '@angular/core';
import { StorageKeys } from '@src/app/constants/storage-keys';
import { IResponse } from '@src/interfaces/response.interface';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClientService } from '../http-client/http-client.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(
    private _httpClientService: HttpClientService
  ) {
    const projectId = localStorage.getItem(StorageKeys.PROJECT_ID);
    if (projectId) {
      this._projectId.next(projectId);
    }
  }

  private readonly endPoint: string = 'projects';

  private _projectId = new BehaviorSubject<string>('');
  public projectId$ = this._projectId.asObservable();

  selectProject(projectId: string) {
    this._projectId.next(projectId);
  }

  removeSelectedProject() {
    localStorage.removeItem(StorageKeys.PROJECT_ID);
    this._projectId.next('');
  }

  getListByUserId(userId: string): Observable<IResponse> {
    return this._httpClientService.get(`${this.endPoint}/list-by-user/${userId}`);
  }

  getList(workspaceId: string = ''): Observable<IResponse> {
    return this._httpClientService.get(`${this.endPoint}/list${(workspaceId ? `/${workspaceId}` : '')}`);
  }

  getProjectData(projectId: string): Observable<IResponse> {
    return this._httpClientService.get(`${this.endPoint}/${projectId}`);
  }

  getProject(projectId: string): Observable<IResponse> {
    return this._httpClientService.get(`${this.endPoint}/${projectId}`);
  }

  getProjectsByPage(pageNumber: number): Observable<IResponse> {
    return this._httpClientService.get(`${this.endPoint}/pagination/${pageNumber}`);
  }

  createProject(projectDetails: any): Observable<IResponse> {
    return this._httpClientService.postMultipart(projectDetails, this.endPoint);
  }

  updateProject(projectId: string, updateProjectDetails: any): Observable<IResponse> {
    return this._httpClientService.putMultipart(updateProjectDetails, `${this.endPoint}/${projectId}`);
  }

  updateMembers(body: any) {
    return this._httpClientService.put(body, `${this.endPoint}/update-members`);
  }

  deleteProject(projectId: string): Observable<IResponse> {
    return this._httpClientService.delete(`${this.endPoint}/${projectId}`);
  }
}
