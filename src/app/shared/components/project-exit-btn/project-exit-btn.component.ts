import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Routes } from '@src/app/constants/routes';
import { FacadeService } from '@src/app/services/facade.service';

@Component({
  selector: 'app-project-exit-btn',
  templateUrl: './project-exit-btn.component.html',
  styleUrls: ['./project-exit-btn.component.scss']
})
export class ProjectExitBtnComponent {

  constructor(
    private _router: Router,
    private _facadeService: FacadeService
  ) {
    this.exportedProjectId = this._facadeService.appService.exportedProjectId;
  }

  protected readonly appRoutes = Routes;
  protected exportedProjectId!: string;

  @Input('navigateTo') navigateTo = this.appRoutes.PROJECTS;
  @Output('onClick') clickEvent: EventEmitter<boolean> = new EventEmitter<boolean>();


  onExit() {
    if (this.exportedProjectId) {
      this._router.navigateByUrl(this.navigateTo);
      this.clickEvent.emit(true);
    } else {
      this._router.navigateByUrl(`/${this.exportedProjectId}`);
      this.clickEvent.emit(true);
    }
  }

}
