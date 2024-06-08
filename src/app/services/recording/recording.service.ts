import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpClientService } from '../http-client/http-client.service';

@Injectable({
  providedIn: 'root'
})
export class RecordingService {

  constructor(
    private _httpClient: HttpClient,
    private _httpClientService: HttpClientService
  ) { }

  private readonly endPoint: string = 'recording';

  uploadRecording(data: any): Observable<any> {
    const url = this._httpClientService.fullRequestURL(`${this.endPoint}/upload`);
    return this._httpClient.post(url, data, {
      reportProgress: true,
      observe: 'events',
    });
  }

  uploadRecordingByUrl(body: any): Observable<any> {
    return this._httpClientService.post(body, `${this.endPoint}/upload-by-url`);
  }

  list(data: any): Observable<any> {
    return this._httpClientService.post(data, `${this.endPoint}/list`);
  }

  findById(id: string): Observable<any> {
    return this._httpClientService.get(`${this.endPoint}/find-by-id/${id}`);
  }

  getMomData(recordingId: string): Observable<any> {
    return this._httpClientService.get(`${this.endPoint}/mom-data/${recordingId}`);
  }

  deleteById(id: string): Observable<any> {
    return this._httpClientService.delete(`${this.endPoint}/${id}`);
  }
}
