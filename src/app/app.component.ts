import { Component } from '@angular/core';
import { AppConfig } from './constants/appConfig';

import { AES, enc } from 'crypto-js';

import { IResponse } from '@src/interfaces/response.interface';
import { AppSocketService } from './services/app-socket/app-socket.service';
import { FacadeService } from './services/facade.service';
import { CkEditorConfig } from './constants/ckEditorConfig';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
    protected _facadeService: FacadeService,
    private _appSocketService: AppSocketService,
    private _appConfig: AppConfig
  ) {
    this._facadeService.userService.sync().subscribe({
      next: (res: IResponse) => {
        if (res.code === "OK") {
          const data = JSON.parse(AES.decrypt(res.data.data, res.data.date).toString(enc.Utf8));
          if ('serverUrl' in data) {
            this._appConfig.clientURL = data.clientUrl;
            this._appConfig.serverURL = data.serverUrl;
            this._appConfig.googleClientId = data.googleClientId;

            CkEditorConfig.config.cloudServices.tokenUrl = data.ckEditorTokenUrl;
            CkEditorConfig.config.cloudServices.webSocketUrl = data.ckEditorWebSocketUrl;
            CkEditorConfig.config.cloudServices.uploadUrl = data.ckEditorUploadUrl;
            CkEditorConfig.config.licenseKey = data.ckEditorLicenseKey;

            const currentUser = this._facadeService.authService.getCurrentUser();
            if (currentUser?._id) {
              this._appSocketService.establishSocketConnection();
              this._appSocketService.joinUserRoom(`user-${currentUser._id}`)
            }
          }
        }
      }
    });
  }
}
