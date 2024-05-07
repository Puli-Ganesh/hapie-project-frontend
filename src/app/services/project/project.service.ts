import { Injectable } from '@angular/core';
import { StorageKeys } from '@src/app/constants/storage-keys';
import { IResponse } from '@src/interfaces/response.interface';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClientService } from '../http-client/http-client.service';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(
    private _httpClientService: HttpClientService,
    private _authService: AuthService
  ) {
    const projectId = localStorage.getItem(StorageKeys.PROJECT_ID);
    if (projectId) {
      this.selectProject(projectId);
    }
  }

  private readonly endPoint: string = 'projects';

  private projectsList = new BehaviorSubject<any[]>([]);
  public projectsList$ = this.projectsList.asObservable();
  private _projectDetails = new BehaviorSubject<any>(null);
  public projectDetails$ = this._projectDetails.asObservable();

  updateProjectsList() {
    const userId = this._authService.getCurrentUser()?._id;
    if (!userId) return;

    this.getListByUserId(userId).subscribe({
      next: (res: any) => {
        this.projectsList.next([...res.data.projects])
      },
      error: (err: any) => {
        console.log('There is an error while fetching projects list', err);
        this.projectsList.next([]);
      }
    });
  }

  async selectProject(projectId: string) {
    this.getProject(projectId).subscribe({
      next: (res: any) => {
        localStorage.setItem(StorageKeys.PROJECT_ID, projectId);
        this._projectDetails.next(res.data);
      },
      error: (err: any) => {
        console.log('There is an error while fetching project details', err);
        this._projectDetails.next(null);
      }
    });
  }

  removeSelectedProject() {
    localStorage.removeItem(StorageKeys.PROJECT_ID);
    // this._projectId.next('');
  }

  getListByUserId(userId: string): Observable<IResponse> {
    return this._httpClientService.get(`${this.endPoint}/list-by-user/${userId}`);
  }

  getList(workspaceId: string = ''): Observable<IResponse> {
    return this._httpClientService.get(`${this.endPoint}/list${(workspaceId ? `/${workspaceId}` : '')}`);
  }

  getOptionList(workspaceId: string = ''): Observable<IResponse> {
    return this._httpClientService.get(`${this.endPoint}/options${(workspaceId ? `/${workspaceId}` : '')}`);
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
