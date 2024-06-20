import { Component, OnInit } from '@angular/core';

import { NodeImages } from '@src/app/constants/node-images';
import { FacadeService } from '@src/app/services/facade.service';

@Component({
  selector: 'app-apps',
  templateUrl: './apps.component.html',
  styleUrls: ['./apps.component.scss']
})
export class AppsComponent implements OnInit {

  constructor(
    protected _facadeService: FacadeService
  ) { }

  protected appList: Array<any> = [];
  private readonly _nodeImages = NodeImages;

  ngOnInit(): void {
    this.getRootObject();
  }

  getRootObject() {
    return new Promise((resolve: any, reject: any) => {
      this._facadeService.workflowService.getRootObject().subscribe({
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
      })
    });
  }

}
