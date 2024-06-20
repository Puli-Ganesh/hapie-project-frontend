import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { FacadeService } from '@app/services/facade.service';
import { Routes } from '@app/constants/routes';
import { StorageKeys } from '../constants/storage-keys';
import { Location } from '@angular/common';

@Injectable({
	providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {

	constructor(
		private _facadeService: FacadeService,
		private _router: Router,
		private _location: Location
	) {
		this.isExportedProject = !!this._facadeService.appService.exportedProjectId;
		if (this.isExportedProject) {
			this.restrictedRoute = ['/project', this.appRoutes.PROJECTS, this.appRoutes.TEAM, this.appRoutes.APPS, this.appRoutes.TEMPLATES, this.appRoutes.WORKFLOWS];
		}
	}

	protected appRoutes = Routes;
	protected restrictedRoute: Array<string> = [];
	protected isExportedProject: boolean = false;

	canActivate(route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

		return this.isUserLoggedIn('parent', state);
	}

	canActivateChild(route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

		return this.isUserLoggedIn('child', state);
	}

	isUserLoggedIn(guard: 'parent' | 'child', state: RouterStateSnapshot) {
		const url = state.url;
		if (this._facadeService.authService.isLoggedIn()) {
			if (this.isExportedProject) {
				if (guard === 'parent') {
					const isRestrictedUrl = this.restrictedRoute.some((rUrl: string) => url.startsWith(rUrl));
					if (isRestrictedUrl) {
						this._router.navigateByUrl(this._facadeService.appService.getReplacedUrl(Routes.PROJECT_DASHBOARD));
						return false;
					}
				}
			} else {
				if (guard === 'child') {
					/** project child routes only. */
					if (state.url.match(/^\/([a-f\d]{24}|project)/i) && !localStorage.getItem(StorageKeys.PROJECT_ID)) {
						this._location.historyGo(1);
						return false;
					}
				}
			}

			return true;
		} else {
			const projectId = url.match(/^\/[a-f\d]{24}/)?.[0] ?? '';
			this._facadeService.appService.setIsHeaderShow(false);
			if (this.isExportedProject) {
				this._router.navigateByUrl(this._facadeService.appService.getReplacedUrl(Routes.LOGIN));
			} else {
				this._router.navigateByUrl(`${projectId}${Routes.LOGIN}`);
			}
			this._facadeService.authService.logOut();
			return false;
		}
	}
}
