import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ConfigService } from '@src/app/config/config.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }),
  withCredentials: false,
};


@Injectable({
  providedIn: 'root'
})
export class HttpClientService {
  public lng: string;

  constructor(
    private _configService: ConfigService,
    private _httpClient: HttpClient,
    @Inject(LOCALE_ID) locale: string
  ) {
    this.lng = locale;
  }

  /**
   * full URl
   *
   * @param resource
   */
  fullRequestURL(resource: string | number): string {
    return `${this._configService.getBaseURL}/${resource}`;
  }


  // CRUD in httpCLient
  /**
   * get method
   *
   * @param resource
   * @param params
   */
  get<T>(resource: string | number, params?: {}): Observable<T> {
    if (params) {
      resource += this.getArgs(params);
    }
    return this._httpClient.get<T>(this.fullRequestURL(resource), httpOptions);
  }

  /**
   * post method
   *
   * @param body
   * @param resource
   * @param params
   */
  post<T>(body: any = {}, resource: string | number, params?: {}): Observable<T> {
    if (params) {
      resource += this.getArgs(params);
    }
    return this._httpClient.post<T>(this.fullRequestURL(resource), body, httpOptions);
  }

  /**
   * put method
   *
   * @param body
   * @param resource
   */
  put<T>(body: any = {}, resource: string | number): Observable<T> {
    return this._httpClient.put<T>(this.fullRequestURL(resource), body, httpOptions);
  }

  /**
   * delete method
   *
   * @param params
   * @param resource
   */
  delete<T>(resource: string | number, params?: {}): Observable<T> {
    if (params) {
      resource += this.getArgs(params);
    }
    return this._httpClient.delete<T>(this.fullRequestURL(resource), httpOptions);
  }

  /**
   * post method
   *
   * @param body
   * @param resource
   * @param params
   */
  postMultipart<T>(body: any = {}, resource: string | number, params?: {}): Observable<T> {
    if (params) {
      resource += this.getArgs(params);
    }
    return this._httpClient.post<T>(this.fullRequestURL(resource), body);
  }

  /**
   * put method
   *
   * @param body
   * @param resource
   */
  putMultipart<T>(body: any = {}, resource: string | number): Observable<T> {
    return this._httpClient.put<T>(this.fullRequestURL(resource), body);
  }

  /** helper functions
   * convert get header params to query string
   *
   * @param params
   */
  getArgs(options: any): string {
    if (!options) {
      return '';
    }
    var args = '?';
    Object.keys(options).forEach((key) => {
      args += this.optionToString(key, options[key]);
    });
    return args;
  }

  /**
   * convert options to string
   *
   * @param key
   * @param value
   */
  optionToString(key: string, value: any): string {
    if (!value) {
      return '';
    }
    var str = '';
    if (value instanceof Array) {
      value.forEach((element, index) => {
        str += `${key}[${index}]=${element}&`;
      });
    } else if (value instanceof Object) {
      Object.keys(value).forEach((element) => {
        if (value instanceof Object) {
          str += this.serializeObject(value[element], `${key}[${element}]`);
        } else {
          str += `${key}[${element}]=${value[element]}&`;
        }
      });
    } else {
      str += `${key}=${value}&`;
    }
    return str;
  }

  /**
   * serializing
   *
   * @param obj
   * @param parentSerialized
   */
  private serializeObject(obj: any, parentSerialized: string): string {
    var str = '';
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      if (value instanceof Object) {
        str += `${this.serializeObject(value, `${parentSerialized}[${key}]`)}`;
      } else {
        str += `${parentSerialized}[${key}]=${value}&`;
      }
    });
    return str;
  }

}