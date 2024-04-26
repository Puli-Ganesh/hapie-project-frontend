import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IResponse } from '@src/interfaces/response.interface';
import { HttpClientService } from '../http-client/http-client.service';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private _httpClientService: HttpClientService
  ) { }

  private endPoint = 'users';

  getProfile(): Observable<IResponse> {
    return this._httpClientService.get(`${this.endPoint}/profile`);
  }

  sync(): Observable<IResponse> {
    return this._httpClientService.get(`${this.endPoint}/sync`);
  }

  getUsersByPage(pageNumber: any): Observable<any> {
    return this._httpClientService.get(`${this.endPoint}/${pageNumber}`);
  }

  getListByWorkspaceId(workspaceId = null): Observable<any> {
    let url = `${this.endPoint}/list-by-workspace`;
    if (workspaceId) {
      url += `/${workspaceId}`;
    }
    return this._httpClientService.get(url);
  }

  updateProfile(id: any, data: any): Observable<any> {
    return this._httpClientService.put(data, `${this.endPoint}/${id}`);
  }

  updateProfileNewAPI(id: any, data: any): Observable<any> {
    return this._httpClientService.putMultipart(data, `${this.endPoint}/update-profile/${id}`);
  }

  updateRoleWithProjectAccess(id: any, data: any): Observable<any> {
    return this._httpClientService.put(data, `${this.endPoint}/update-role-with-project-access/${id}`);
  }

  addNewUser(newUser: any): Observable<any> {
    return this._httpClientService.post(newUser, `${this.endPoint}/add-user`);
  }

  deleteUserById(id: string): Observable<any> {
    return this._httpClientService.delete(`${this.endPoint}/${id}`);
  }

  list(): Observable<any> {
    return this._httpClientService.get(`${this.endPoint}`);
  }

  inviteUser(body: any): Observable<any> {
    return this._httpClientService.post(body, `${this.endPoint}/invite-user`);
  }
}
