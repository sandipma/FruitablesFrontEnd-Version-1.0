import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { ApiResponse } from 'src/app/Models/ApiResponse/api-response';
import { TokenDetails } from 'src/app/Models/Auth/token-details';
import { ConfirmOTP } from 'src/app/Models/OTP/confirm-otp';
import { ResetPassword } from 'src/app/Models/Reset-Password/reset-password';
import { environment } from 'src/environments/environment';
import { AuthService } from '../Auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ResetPasswordService {

  // Constructor Iniliazation //
  constructor(private http: HttpClient,
    private logger: NGXLogger,
    private authService: AuthService) { }

  //*************Methods**********//

  // Method for reset password //
  resetPassword(resPassword: ResetPassword): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${environment.WebapiUrl}/authenticatication/reset-password`, resPassword)
      .pipe(
        catchError((error) => {
          let errorMessage = 'An error occurred for reset password';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.logger.error('Error in reset password service method resetPassword :', errorMessage);
          return throwError(() => error);
        })
      );
  }

  // Method for confirm OTP //
  confirmOTP(confirmOTP: ConfirmOTP): Observable<ApiResponse<TokenDetails>> {
    return this.http.post<ApiResponse<TokenDetails>>(`${environment.WebapiUrl}/authenticatication/confirm-OTP-details`, confirmOTP)
      .pipe(
        tap((response: ApiResponse<TokenDetails>) => {
          this.authService.isLogOutDone = false;
          this.authService.saveTokenDetails(response);
          this.authService.setLoggedInUserName();
        }),
        catchError((error) => {
          let errorMessage = 'An error occurred during confirmOTP';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.logger.error('Error in reset password service method confirmOTP :', errorMessage);
          return throwError(() => error);
        })
      );
  }
}


