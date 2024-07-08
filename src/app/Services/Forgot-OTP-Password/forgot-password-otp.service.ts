import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiResponse } from 'src/app/Models/ApiResponse/api-response';
import { AddForgotPasswordDetails } from 'src/app/Models/Forgot-Password/add-forgot-password-details';
import { AddOTPDetails } from 'src/app/Models/OTP/add-otpdetails';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ForgotPasswordOTPService {
  // Variable declaration //
  secretKey: string = 'mySecretkey';

  // Constructor Iniliazation //
  constructor(private logger: NGXLogger,
    private http: HttpClient) { }

  //*************Methods**********//

  // Method for send password resent link //
  sendPasswordResetLink(forgotPasswordData: AddForgotPasswordDetails): Observable<ApiResponse<string>> {
    // Log the start of sending password reset link //
    this.logger.info('Sending password reset link for email in forgot password OTP service method sendPasswordResetLink : ', forgotPasswordData.email);
    // Make HTTP GET request to send password reset link //
    return this.http.post<ApiResponse<string>>(`${environment.WebapiUrl}/authenticatication/forgot-password`, forgotPasswordData)
      .pipe(
        catchError((error) => {
          let errorMessage = 'An error occurred in sending password reset link for email';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.logger.error('Error in forgot password OTP service method sendPasswordResetLink :', errorMessage);
          return throwError(() => error);
        })
      );
  }

  // Method for send OTP to user //
  sendOTPToUser(OTPDetails: AddOTPDetails): Observable<ApiResponse<string>> {
    // Log the start of sending OTP to user//
    this.logger.info('Sending OTP for email in in forgot password OTP service method sendOTPToUser : ', OTPDetails.email);

    // Make HTTP GET request to send OTP //
    return this.http.post<ApiResponse<string>>(`${environment.WebapiUrl}/authenticatication/send-OTP-details`, OTPDetails)
      .pipe(
        catchError((error) => {
          let errorMessage = 'An error occurred in Sending OTP for email';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.logger.error('Error in forgot password OTP service method sendOTPToUser :', errorMessage);
          return throwError(() => error);
        })
      );
  }
}
