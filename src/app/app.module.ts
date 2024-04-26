import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AppConfig } from './constants/appConfig';
import { FacadeService } from './services/facade.service';
import { AppLayoutComponent } from './components/app-layout/app-layout.component';
import { HeaderComponent } from './components/header/header.component';
import { LeftSideNavComponent } from './components/left-side-nav/left-side-nav.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { SharedModule } from './shared/shared.module';
import { CommonOutletComponent } from './components/common-outlet/common-outlet.component';

@NgModule({
  declarations: [
    AppComponent,
    AppLayoutComponent,
    HeaderComponent,
    LeftSideNavComponent,
    NotFoundComponent,
    CommonOutletComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    SharedModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    { provide: AppConfig, useClass: AppConfig },
    { provide: FacadeService, useClass: FacadeService },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
