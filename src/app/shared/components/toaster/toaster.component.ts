import { Component } from '@angular/core';
import { FacadeService } from '@src/app/services/facade.service';

@Component({
  selector: 'app-toaster',
  templateUrl: './toaster.component.html',
  styleUrls: ['./toaster.component.scss']
})
export class ToasterComponent {

  constructor(
    public _facadeService: FacadeService
  ) {

    this._facadeService.appService.toasters$.subscribe({
      next: (toaster: any) => {
        this.toasters.push(toaster)
        this.setToasterInterval();
      }
    });

    this._facadeService.appService.clearToasters$.subscribe({
      next: (needClear: boolean) => {
        if (needClear) {
          clearInterval(this.toasterIntervalId);
          this.toasterIntervalId = null;
          this.toasters = [];
        }
      }
    });
  }

  setToasterInterval() {
    if (!this.toasterIntervalId) {
      this.toasterIntervalId = setInterval(() => {
        for (let i = 0; i < this.toasters.length; i++) {
          this.toasters[i].duration -= 100;
          if (this.toasters[i].duration <= 0) {
            this.toasters.splice(i, 1);
            if (!this.toasters.length) {
              clearInterval(this.toasterIntervalId);
              this.toasterIntervalId = null;
            }
          }
        }
      }, 100);
    }
  }

  toasterIntervalId: any;
  toasters: any[] = [];

}
