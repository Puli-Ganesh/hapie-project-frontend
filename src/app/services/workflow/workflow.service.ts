import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client/http-client.service';

@Injectable({
  providedIn: 'root'
})
export class WorkflowService {

  private endPoint = 'workflow';

  constructor(
    private _httpClientService: HttpClientService
  ) { }

  getRootObject() {
    return this._httpClientService.get(`${this.endPoint}/get-root-object`);
  }

  getList() {
    return this._httpClientService.get(`${this.endPoint}`);
  }

  getAggregateList() {
    return this._httpClientService.get(`${this.endPoint}/agg-list`);
  }

  getMasterList() {
    return this._httpClientService.get(`${this.endPoint}/master-list`);
  }

  getById(id: string) {
    return this._httpClientService.get(`${this.endPoint}/${id}`);
  }
  
  create(body: any) {
    return this._httpClientService.post(body, `${this.endPoint}`);
  }
  
  update(id: string, body: any) {
    return this._httpClientService.put(body, `${this.endPoint}/${id}`);
  }

  updateWorkflowNodeConfig(body: { workflowId: string, nodeId: number, config: any }) {
    return this._httpClientService.put(body, `${this.endPoint}/update-workflow-node-config`);
  }

  deleteById(id: string) {
    return this._httpClientService.delete(`${this.endPoint}/${id}`);
  }
}
