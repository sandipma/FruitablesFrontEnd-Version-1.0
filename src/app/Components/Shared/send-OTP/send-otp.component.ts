import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { Subscription, tap } from 'rxjs';
import { ApiResponse } from 'src/app/Models/ApiResponse/api-response';
import { SendOTPDetails } from 'src/app/Models/Send-OTP/send-otpdetails';
import { CommonService } from 'src/app/Services/Common/common.service';
import { CustomToasterService } from 'src/app/Services/Custom-Toaster/custom-toaster.service';
import { ForgotPasswordOTPService } from 'src/app/Services/Forgot-OTP-Password/forgot-password-otp.service';
import { TimerService } from 'src/app/Services/Timer/timer.service';
import * as CryptoJS from 'crypto-js';
@Component({
  selector: 'app-send-otp',
  templateUrl: './send-otp.component.html',
  styleUrls: ['./send-otp.component.css']
})
export class SendOTPComponent implements OnInit, OnDestroy {
  // Variable Declaration //
  timerSubscription: Subscription;
  isLoading: boolean = false;
  email: string;
  OTPForm: any;
  userEmail:string;
  OTPModel = {
    Email: ""
  }
  encryptedString: string;

  // Constructor Iniliazation //
  constructor(public commonService: CommonService,
    private toaster: CustomToasterService,
    private logger: NGXLogger,
    private timerService: TimerService,
    private forgotPasswordOTPService: ForgotPasswordOTPService,
    private router:Router) 
    { }

  // On load event //
  ngOnInit(): void {
    this.commonService.scrollToTop();
  }

  //*************Methods**********************//

  // Method for sending OTP to user //
  onSubmit(form: NgForm) {
    this.logger.info('Starting onSubmit OTP in send Otp component method onSubmit');
    this.isLoading = true;
    this.commonService.scrollToTop();
    try {
      this.logger.info('Sending OTP in send Otp component method onSubmit');
      this.userEmail = form.value.Email;
       this.encryptedString = CryptoJS.AES.encrypt(this.userEmail, this.forgotPasswordOTPService.secretKey).toString();
      // Create a OTP object from the form values //
      const OTPDetails: SendOTPDetails = {
        email: form.value.Email,
        userRole: this.commonService.isUserOrAdmin
      };
      //Send request to server //
      this.forgotPasswordOTPService.sendOTPToUser(OTPDetails)
        .pipe(
          tap({
            next: (response: ApiResponse<string>) => {
              // Log information about a successful send OTP //
              this.logger.info('Sent OTP in send Otp component method onSubmit');

              // Handle 200 status code //
              if (response.statusCode === 200) {
                this.isLoading = false;
                this.toaster.showSuccess(response.message);
                if(this.commonService.isUserOrAdmin ==='user')
                  {
                         
                    this.router.navigate(['/confirm-OTP',this.encryptedString ]); 
                  }
                  else
                  {
                    this.router.navigate(['/admin-portal//confirm-OTP',this.encryptedString]);
                  }
                  this.OTPModel.Email = '';
              }
            },
            error: (error) => {
              // Log information about an error during send Otp //
              this.isLoading = false;
              this.commonService.scrollToTop();
              let errorMessage: string;
              let baseMessage = 'An error occurred during sending OTP in send Otp component method onSubmit';
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
      // Log information about an unexpected exception //
      this.isLoading = false;
      this.commonService.scrollToTop();
      this.logger.error('Unexpected error sent OTP to user in send otp component method onSubmit : ', error.message);
      this.toaster.showError('An unexpected error try again later');
    }

  }

  // Method for start timer //
  startTimer(): void {
    this.logger.info('Starting timer in send otp component method startTimer');
    this.timerSubscription = this.timerService.startTimer().subscribe(time => {
      this.timerService.remainingTime = time;
      if (time === 0) {
        // Handle OTP expiry here //
        this.timerSubscription.unsubscribe();
      }
    });
    this.logger.info('Completed timer in send otp component method startTimer');
  }

  // Method for on destroy for unsubcribe timer subcription //
  ngOnDestroy(): void {
    this.logger.info('Starting ng destroy in send otp component method ngOnDestroy');
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    this.logger.info('Completed ng destroy in send otp component method ngOnDestroy');
  }
}
