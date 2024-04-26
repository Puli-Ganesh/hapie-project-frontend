import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { FacadeService } from '@app/services/facade.service';
import { Routes } from '@app/constants/routes';

@Injectable({
	providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {

	constructor(
		private _facadeService: FacadeService,
		private _router: Router
	) { }

	canActivate(route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

		return this.isUserLoggedIn();
	}

	canActivateChild(route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

		return this.isUserLoggedIn();
	}

	isUserLoggedIn() {
		if (this._facadeService.authService.isLoggedIn()) {
			return true;
		}

		this._facadeService.authService.logOut();
		this._facadeService.appService.setIsHeaderShow(false);
		this._router.navigateByUrl(Routes.LOGIN);
		return false;
	}
}
