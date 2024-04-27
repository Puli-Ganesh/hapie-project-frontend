
import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client/http-client.service';
import { Observable } from 'rxjs';

import { IResponse } from '@src/interfaces/response.interface';

@Injectable({
  providedIn: 'root'
})
export class CompareVideoService {

  constructor(
    private _httpClientService: HttpClientService
  ) { }

  protected readonly endPoint: string = 'compare-video';


  getData(projectId: string, workspaceId: string = ''): Observable<IResponse> {
    return this._httpClientService.get(`${this.endPoint}/data/${projectId}${(workspaceId ? `/${workspaceId}` : '')}`);
  }

  getCategoryPromptList(templateId: string, projectId: string): Observable<IResponse> {
    return this._httpClientService.get(`${this.endPoint}/get-category-prompt-list/${templateId}/${projectId}`);
  }

  toggleRequirementApproval(categoryId: string, requirementId: string, flag: boolean): Observable<IResponse> {
    const body = { categoryId, requirementId, flag };
    return this._httpClientService.post(body, `${this.endPoint}/toggle-requirement-approval`);
  }

  getSummariesFromAI(categories: any): Observable<IResponse> {
    const dataToSend = {
      categories: categories
    };
    return this._httpClientService.post(dataToSend, `${this.endPoint}/get-summaries-from-ai`);
  }

  createAIRequirement(categoryId: string, requirementStr: string): Observable<IResponse> {
    const dataToSend = {
      _id: categoryId,
      requirement: requirementStr
    };
    return this._httpClientService.post(dataToSend, `${this.endPoint}/create-ai-requirement`);
  }
}
