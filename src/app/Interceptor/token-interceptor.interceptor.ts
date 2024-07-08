import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NGXLogger } from 'ngx-logger';
import { AccessTokenDetails } from '../Models/Auth/access-token-details';
import { RefreshTokenDetails } from '../Models/Auth/refresh-token-details';
import { AuthService } from '../Services/Auth/auth.service';

@Injectable()
export class TokenInterceptorInterceptor implements HttpInterceptor {
  tokenExpireTime: Date;
  adminTokenExpireTime: Date;
  refreshtokenExpireTime: Date;
  adminRefreshTokenExpireTime: Date;
  
  constructor(
    private authService: AuthService,
    private logger:NGXLogger
  ) { }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const existingToken: AccessTokenDetails = JSON.parse(localStorage.getItem('authToken'));
    const existingAdminToken: AccessTokenDetails = JSON.parse(localStorage.getItem('adminAuthToken'));
    const existingRefreshToken: RefreshTokenDetails = JSON.parse(localStorage.getItem('refreshToken'));
    const existingAdminRefreshToken: RefreshTokenDetails = JSON.parse(localStorage.getItem('adminRefreshToken'));
    const currentDateTime = new Date();
    
    this.logger.info("Token interceptor start to excuate..");

    if (request.url.includes('https://api.postalpincode.in/pincode')) {
      // If it matches, simply return the request without any modification
      return next.handle(request);
    }
    if (existingToken != null) {
      this.tokenExpireTime = new Date(existingToken.accessTokenTimePeriod);
    }
    if (existingAdminToken != null) {
      this.adminTokenExpireTime = new Date(existingAdminToken.accessTokenTimePeriod);
    }
    if (existingRefreshToken != null) {
      this.refreshtokenExpireTime = new Date(existingRefreshToken.refreshTokenTimePeriod);
    }
    if (existingAdminRefreshToken != null) {
      this.adminRefreshTokenExpireTime = new Date(existingAdminRefreshToken.refreshTokenTimePeriod);
    }

    if (existingToken && this.tokenExpireTime > currentDateTime) {
      this.authService.setLoggedInUserName();
      request = this.addToken(request, existingToken.accessToken);
    }
    if (existingAdminToken &&  this.adminTokenExpireTime > currentDateTime) {
      this.authService.setLoggedInUserName();
      request = this.addToken(request, existingAdminToken.accessToken);
    }
    if (existingRefreshToken && this.refreshtokenExpireTime > currentDateTime) 
     { 
      this.authService.setLoggedInUserName();
      request = this.addToken(request, existingRefreshToken.refreshToken);
    } 
    if (existingAdminRefreshToken && this.adminRefreshTokenExpireTime  > currentDateTime) 
     { 
      this.authService.setLoggedInUserName();
      request = this.addToken(request, existingAdminRefreshToken.refreshToken);
    }
    if (existingRefreshToken && this.refreshtokenExpireTime < currentDateTime && this.authService.isLogOutDone === false) 
    {
      this.authService.isLogOutDone = true;
      this.authService.logout();
 
    }
    if (existingAdminRefreshToken && this.adminRefreshTokenExpireTime  < currentDateTime && this.authService.isLogOutDone === false) 
    {
      this.authService.isLogOutDone = true;
      this.authService.logout(); 
    }

    this.logger.info("Token interceptor execuated successfully");

    return next.handle(request).pipe(
      catchError(error => {
        return throwError(error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}
