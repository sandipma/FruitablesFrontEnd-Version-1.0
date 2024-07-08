import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NGXLogger } from 'ngx-logger';
import { Subscription, tap } from 'rxjs';
import { ApiResponse } from 'src/app/Models/ApiResponse/api-response';
import { CommonService } from 'src/app/Services/Common/common.service';
import { CustomToasterService } from 'src/app/Services/Custom-Toaster/custom-toaster.service';
import { ForgotPasswordOTPService } from 'src/app/Services/Forgot-OTP-Password/forgot-password-otp.service';
import { AddForgotPasswordDetails } from 'src/app/Models/Forgot-Password/add-forgot-password-details';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  // Variable Declaration //
  timerSubscription: Subscription;
  forgetPasswordModel = {
    Email: ""
  }
  isLoading: boolean = false;
  userEmail: string;
  email: string;

  // Constructor Iniliazation //
  constructor(
    private forgotPasswordOTPService: ForgotPasswordOTPService,
    private toaster: CustomToasterService,
    private logger: NGXLogger,
    public commonService: CommonService)
    { }

  // On load event //
  ngOnInit(): void {
    this.commonService.scrollToTop();
  }

  //*************Methods**********************//

  // Method for sending forgot password reset link //
  onSubmit(form: NgForm) {
    this.logger.info('Starting onSubmit forgot password link in forgot password component method onSubmit');
    this.isLoading = true;
    this.commonService.scrollToTop();
    try {
        this.logger.info('Sending password reset link in forgot password component method onSubmit');
        // Create a forgotPasswordDetails object from the form values //
        const forgotPasswordDetails: AddForgotPasswordDetails = {
          email: form.value.Email,
          userRole: this.commonService.isUserOrAdmin
        };
        //Send request to server //
        this.forgotPasswordOTPService.sendPasswordResetLink(forgotPasswordDetails)
          .pipe(
            tap({
              next: (response: ApiResponse<string>) => {
                // Log information about a successful password reset link //
                this.logger.info('Sent password reset link successfully in forgot password component method onSubmit');

                // Handle 200 status code //
                if (response.statusCode === 200) {
                  this.isLoading = false;
                  this.toaster.showSuccess(response.message);
                  this.forgetPasswordModel.Email = '';
        
                }
              },
              error: (error) => {
                // Log information about an error during password reset link
                this.isLoading = false;
                this.commonService.scrollToTop();
                let errorMessage: string;
                let baseMessage = 'An error occurred during Sending password reset link in forgot password component method onSubmit';
                if (error.error && error.error.message) {
                  errorMessage = baseMessage + error.error.message;
                }
                else {
                  errorMessage = baseMessage;
                }

                form.form.reset();
                // Handle different HTTP status codes //
                if (error.error.statusCode == 400) {
                  this.logger.error(errorMessage);
                  this.toaster.showError(error.error.message);
                }
                else if (error.error.statusCode == 404) {
                  this.logger.error(errorMessage);
                  this.toaster.showError(error.error.message);
                }
                else if (error.error.statusCode == 500) {
                  this.logger.error(errorMessage);
                  this.toaster.showError(error.error.message);
                }
                else if (error.error.statusCode == 503) {
                  this.logger.error(errorMessage);
                  this.toaster.showError(error.error.message);
                }
                else {
                  this.logger.error(errorMessage);
                  this.toaster.showError('Server error try again later');
                }
              }
            }),

          )
          .subscribe();
    }
    catch (error) {
      // Log information about an unexpected exception
      this.isLoading = false;
      this.commonService.scrollToTop();
      this.logger.error('Unexpected error in forgot password component method onSubmit : ', error.message);
      this.toaster.showError('An unexpected error try again later');
    }

  }
}

