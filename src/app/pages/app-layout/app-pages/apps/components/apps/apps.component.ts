import { Component, OnInit } from '@angular/core';
import { ConfigService } from '@src/app/config/config.service';
import { AppConfig } from '@src/app/constants/appConfig';

import { NodeImages } from '@src/app/constants/node-images';
import { FacadeService } from '@src/app/services/facade.service';

@Component({
  selector: 'app-apps',
  templateUrl: './apps.component.html',
  styleUrls: ['./apps.component.scss']
})
export class AppsComponent implements OnInit {

  constructor(
    protected _facadeService: FacadeService,
    protected _appConfig: AppConfig,
    protected _configService: ConfigService
  ) { }

  protected appList: Array<any> = [];
  private readonly _nodeImages = NodeImages;

  protected currentUser: any;
  protected isRequestAlive: boolean = false;


  ngOnInit(): void {
    this.getRootObject();
    this.currentUser = this._facadeService.authService.getCurrentUser();
  }

  getRootObject() {
    return new Promise((resolve: any, reject: any) => {
      this._facadeService.appsService.getList().subscribe({
        next: (res: any) => {
          if (res.code == 'OK') {
            this.appList = res.data;
            if (this.appList?.length) {
              this.appList = this.appList.filter((app: any) => app.title !== 'Start');
              for (const app of this.appList) {
                if (this._nodeImages.NODES[app.title]) {
                  app.src = this._nodeImages.NODES[app.title];
                }
              }
            }
          }
          resolve();
        },
        error: (err: any) => {
          console.log('There is an error while getting root object', err);
          reject();
        }
      });
    });
  }

  commonOnClickFn(app: any) {
    const holdApp = this.appList.find((appItem: any) => appItem.title == app.title);

    switch (holdApp?.title) {
      case 'Zoom':
        this.manageZoom(holdApp);
        break;

      case 'Meet':
        this.manageGoogle(holdApp);
        break;

      case 'Teams':
        this.manageTeams(holdApp);
        break;
      default:
        if (holdApp) {
          holdApp.isAdded = !holdApp?.isAdded;
        }
        break;
    }
  }

  commonRemoveApp(appDetails: any) {
    if (this.isRequestAlive) { return; }

    console.log('Removing app');
    this.isRequestAlive = true;
    this._facadeService.appsService.removeApp({ appName: appDetails.title }).subscribe({
      next: (res: any) => {
        this.isRequestAlive = false;
        if (res.code === "OK") {
          appDetails.isAdded = false;
        }
      },
      error: (err: any) => {
        this.isRequestAlive = false;
        console.log('Error while removing app', err);
      }
    });
  }

  manageZoom(appDetails: any) {
    if (this.isRequestAlive) return;

    if (!appDetails?.isAdded) {
      console.log('Adding app');
      if (this.currentUser?._id && this._appConfig.serverURL) {
        appDetails.isAdded = !appDetails?.isAdded;
        const redirectUrl = `${this._appConfig.serverURL}/api/zoom-meeting/auth-callback`.replace(':', '%3A').replace(/\//g, '%2F');
        window.open(`https://zoom.us/oauth/authorize?response_type=code&client_id=m2EfYhQxR4ahRSckotyf0w&redirect_uri=${redirectUrl}?ngf_user_id=${this.currentUser._id}`);
      }
    } else {
      this.commonRemoveApp(appDetails);
    }
  }

  manageGoogle(appDetails: any) {
    if (this.isRequestAlive) return;

    if (!appDetails?.isAdded) {
      console.log('Adding app');
      if (this.currentUser?._id && this._appConfig.serverURL) {
        appDetails.isAdded = !appDetails?.isAdded;
        window.open(`${this._configService.getBaseURL}/auth/login-with-google/${this.currentUser._id}`);
      }
    } else {
      this.commonRemoveApp(appDetails);
    }
  }

  manageTeams(appDetails: any) {
    if (this.isRequestAlive) return;

    if (!appDetails?.isAdded) {
      console.log('Adding app');
      if (this.currentUser?._id && this._appConfig.serverURL) {
        this._facadeService.authService.loginWithMicrosoft().subscribe({
          next: (res: any) => {
            window.open(res.data.url);
          },
          error: (err: any) => {
            appDetails.isAdded = false;
          }
        });
      }
    } else {
      this.commonRemoveApp(appDetails);
    }
  }

}
