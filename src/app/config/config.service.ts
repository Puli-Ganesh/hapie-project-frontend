import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor() {
    if (!environment.settings.apiPort) {
      this._apiURL = `${environment.settings.apiProtocol}://${environment.settings.apiHost}/api`;
    } else {
      this._apiURL = `${environment.settings.apiProtocol}://${environment.settings.apiHost}:${environment.settings.apiPort}/api`;
    }
  }

  protected _apiURL: string;

  get getBaseURL(): string {
    return this._apiURL;
  }
}
