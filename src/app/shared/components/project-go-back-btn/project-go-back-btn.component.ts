import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Routes } from '@src/app/constants/routes';
import { FacadeService } from '@src/app/services/facade.service';

@Component({
  selector: 'app-project-go-back-btn',
  templateUrl: './project-go-back-btn.component.html',
  styleUrls: ['./project-go-back-btn.component.scss']
})
export class ProjectGoBackBtnComponent {

  constructor(
    private _router: Router,
    private _facadeService: FacadeService
  ) {
    this.isExportedProject = !!this._facadeService.appService.exportedProjectId;
  }

  protected readonly appRoutes = Routes;
  protected isExportedProject: boolean = false;

  @Input('navigateTo') navigateTo: string = this.appRoutes.PROJECTS;
  @Input('parseUrl') parseUrl: boolean = false;
  @Input('skipNavigation') skipNavigation: boolean = false;
  @Output('onClick') clickEvent: EventEmitter<'skip' | 'navigate'> = new EventEmitter<'skip' | 'navigate'>();


  onGoBack() {
    if (this.skipNavigation) {
      this.clickEvent.emit('skip');
    } else {
      if (this.parseUrl) {
        this._router.navigateByUrl(this._facadeService.appService.getReplacedUrl(this.navigateTo));
      } else {
        this._router.navigateByUrl(this.navigateTo);
      }
      this.clickEvent.emit('navigate');
    }
  }
}
