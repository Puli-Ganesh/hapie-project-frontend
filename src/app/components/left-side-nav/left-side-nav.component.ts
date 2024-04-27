import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { Permissions } from '@src/app/constants/permissions';
import { Routes } from '@src/app/constants/routes';
import { FacadeService } from '@src/app/services/facade.service';

@Component({
  selector: 'app-left-side-nav',
  templateUrl: './left-side-nav.component.html',
  styleUrls: ['./left-side-nav.component.scss']
})
export class LeftSideNavComponent implements OnInit, OnDestroy {

  constructor(
    private _facadeService: FacadeService,
    private _router: Router
  ) {
    this.projectIdSubscription = this._facadeService.projectService.projectId$.subscribe({
      next: (projectId: string) => {
        this.projectId = projectId ?? '';
      }
    });
    this.userSubscription = this._facadeService.authService.getCurrentUser$().subscribe({
      next: (user: any) => {
        this.currentUser = user;
      }
    });
  }

  protected readonly permissions = Permissions;
  protected readonly appRoutes = Routes;
  protected projectId: any;
  protected currentUser: any;
  protected userSubscription!: Subscription;
  protected projectIdSubscription!: Subscription;

  protected selectedMenu: number = 1;
  protected isNavCollapsed: boolean = false;
  protected avatarMenu: boolean = false;
  @ViewChild('avatarToggler') avatarToggler!: ElementRef;
  @ViewChild('avatarMenuWrapper') avatarMenuWrapper!: ElementRef;


  ngOnInit(): void { }


  @HostListener('document:click', ['$event'])
  clickOut(event: any) {
    if (this.avatarToggler && !this.avatarToggler.nativeElement.contains(event.target) && this.avatarMenuWrapper && !this.avatarMenuWrapper.nativeElement.contains(event.target)) {
      this.avatarMenu = false;
    }
  }

  onLogout() {
    this._facadeService.authService.logOut();
    this._router.navigateByUrl(this.appRoutes.LOGIN);
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    this.projectIdSubscription?.unsubscribe();
    this._facadeService.projectService.removeSelectedProject();
  }

}
