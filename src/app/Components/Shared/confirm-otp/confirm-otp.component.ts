import { Component } from '@angular/core';
import { UntypedFormBuilder, AbstractControl, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { Subscription, tap } from 'rxjs';
import { ApiResponse } from 'src/app/Models/ApiResponse/api-response';
import { CommonService } from 'src/app/Services/Common/common.service';
import { CustomToasterService } from 'src/app/Services/Custom-Toaster/custom-toaster.service';
import { ForgotPasswordOTPService } from 'src/app/Services/Forgot-OTP-Password/forgot-password-otp.service';
import { ResetPasswordService } from 'src/app/Services/Reset-Password/reset-password.service';
import { TimerService } from 'src/app/Services/Timer/timer.service';
import * as CryptoJS from 'crypto-js';
import { ConfirmOTP } from 'src/app/Models/OTP/confirm-otp';
import { TokenDetails } from 'src/app/Models/Auth/token-details';
import { AddOTPDetails } from 'src/app/Models/OTP/add-otpdetails';

@Component({
  selector: 'app-confirm-otp',
  templateUrl: './confirm-otp.component.html',
  styleUrls: ['./confirm-otp.component.css']
})
export class ConfirmOTPComponent {
  // Variable declaration //
  OTPForm: UntypedFormGroup;
  isLoading: boolean = false;
  isWorking: boolean = false;
  userEmail: string;
  timerSubscription: Subscription;
  decryptedEmail: string;
  // Constructor initialization //
  constructor(
    public resetPasswordService: ResetPasswordService,
    private logger: NGXLogger,
    private toaster: CustomToasterService,
    private commonService: CommonService,
    private formBuilder: UntypedFormBuilder,
    public timerService: TimerService,
    private route: ActivatedRoute,
    private forgotPasswordOTPService: ForgotPasswordOTPService,
    private router: Router
  ) { }

  // On Load event //
  ngOnInit() {
    this.commonService.scrollToTop();
    this.startTimer();
    this.userEmail = this.route.snapshot.params['email'];
    const decryptedBytes = CryptoJS.AES.decrypt(this.userEmail, this.forgotPasswordOTPService.secretKey);
    this.decryptedEmail = decryptedBytes.toString(CryptoJS.enc.Utf8);
    // Reactive form Initilization //
    this.OTPForm = this.formBuilder.group({
      OTP: ['', [Validators.required, this.OTPValidator(), this.numberValidator()]],
    });
  }

  //*************Methods**********************// 

  // Method to get form control //
  get f(): { [key: string]: AbstractControl } {
    return this.OTPForm.controls;
  }

  // Custom validator function for OTP check //
  OTPValidator(): ValidatorFn {
    this.logger.info('Starting OTP validator in confirm otp component method OTPValidator');
    return (control: AbstractControl): { [key: string]: any } | null => {
      const otp = control.value;
      // Regular expression to match 6-digit numeric OTP //
      const Pattern = /^[0-9]{4}$/;
      // Check if otp matches the pattern //
      if (!Pattern.test(otp)) {
        this.logger.info('Completed OTP validator in confirm otp component method OTPValidator');
        // Return validation error if OTP doesn't match pattern //
        return { 'invalidOTPCode': true };

      }
      // Return null if OTP is valid //
      return null;
    };

  }

  // Custom validator function for numeric input check //
  numberValidator(): ValidatorFn {
    this.logger.info('Starting number validator in confirm otp component method numberValidator');
    return (control): { [key: string]: any } | null => {
      const value = control.value;
      if (isNaN(value)) {
        this.logger.info('Completed number validator in confirm otp component method numberValidator');
        return { 'notANumber': true };
      }
      return null;
    };
  }

  // Method for password reset //
  onSubmit(): void {
    if (this.timerService.remainingTime === 0) {
      this.toaster.showError("Invalid OTP");
    }
    //this.submitted = true;
    try {
      // Log information about starting the form submission //
      this.logger.info('Starting submitting in confirm otp component method onSubmit');
      this.isLoading = true;
      // Stop here if the form is invalid //
      if (this.OTPForm.invalid) {
        // Display an error message and log a warning //
        this.toaster.showError('Please fill in all required fields.');
        this.logger.warn('Form submission aborted due to invalid form.');
        return;
      }
      // Create a OTP object from the form values //
      const confirmOTP: ConfirmOTP = {
        email: this.decryptedEmail,
        OTP: this.f['OTP'].value,
        userRole: this.commonService.isUserOrAdmin
      };

      // Log the created confirm OTP object //
      this.logger.info('Confirm OTP object created in confirm otp component method onSubmit : ', confirmOTP);

      // Send a confirm OTP request to the server //
      this.resetPasswordService.confirmOTP(confirmOTP)
        .subscribe({
          next: (response: ApiResponse<TokenDetails>) => {
            // Log information about a successful OTP confirmation //
            this.logger.info('OTP validated successful in confirm otp component method onSubmit');

            // Handle 200 status code //
            if (response.statusCode === 200) {
              this.toaster.showSuccess(response.message);
              this.isLoading = false;
              if (this.commonService.isUserOrAdmin === 'user') {
                this.router.navigate(['/'])
              }
              else {
                this.router.navigate(['/admin-portal'])
              }
            }
          },
          error: (error) => {
            // Log information about an error during confirm OTP //
            this.isLoading = false;
            let errorMessage: string;
            let baseMessage = 'An error occurred during confirm OTP in confirm otp component method onSubmit';
            if (error.error && error.error.message) {
              errorMessage = baseMessage + error.error.message;
            }
            else {
              errorMessage = baseMessage;
            }
           
            // Handle different HTTP status codes //
            if (error.error.statusCode == 400) {
              this.logger.error(errorMessage);
              this.toaster.showError(error.error.message);
            }
            else if (error.error.statusCode == 500) {
              this.logger.error(errorMessage);
              this.toaster.showError(error.error.message);
            }
            else {
              this.logger.error(errorMessage);
              this.toaster.showError('Server error try again later');
            }
          }
        });
    } catch (error) {
      // Log information about an unexpected exception //
      this.isLoading = false;
      this.logger.error('Unexpected error during confirm OTP in confirm otp component method onSubmit : ' + error.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }
  
  // Method for resend OTP to user //
  resendOTP(event: MouseEvent): void {
    try
    {
      event.preventDefault();
    this.isLoading = true;
    // Create a OTPDetails object from the form values //
    const OTPDetails: AddOTPDetails = {
      email: this.decryptedEmail,
      userRole: this.commonService.isUserOrAdmin
    };
    //Send request to server //
    this.forgotPasswordOTPService.sendOTPToUser(OTPDetails)
      .pipe(
        tap({
          next: (response: ApiResponse<string>) => {
            // Log information about a successful OTP to user //
            this.logger.info('Sent OTP to user successfully in confirm otp component method resendOTP ');

            // Handle 200 status code //
            if (response.statusCode === 200) {
              this.isLoading = false;
              this.startTimer();
              this.toaster.showSuccess(response.message);
            }
          },
          error: (error) => {
            // Log information about an error during send OTP to user //
            this.isLoading = false;
            let errorMessage: string;
            let baseMessage = 'An error occurred during send OTP to user in confirm otp component method resendOTP';
            if (error.error && error.error.message) {
              errorMessage = baseMessage + error.error.message;
            }
            else {
              errorMessage = baseMessage;
            }
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
    catch(error)
    {
       // Log information about an unexpected exception //
       this.isLoading = false;
       this.logger.error('Unexpected error during resend OTP in confirm otp component method resendOTP : ' + error.message);
       this.toaster.showError('An unexpected error try again later');
    }
  }

  // Method for start timer //
  startTimer(): void {
    this.logger.info('Starting timer in confirm otp component method startTimer');
    this.timerSubscription = this.timerService.startTimer().subscribe(time => {
      this.timerService.remainingTime = time;
      if (time === 0) {
        // Handle OTP expiry here
        this.timerSubscription.unsubscribe();
      }
    });
    this.logger.info('Completed timer in confirm otp component method startTimer');
  }

  // Method for on destroy for unsubcribe timer subcription //
  ngOnDestroy(): void {
    this.logger.info('Starting ng destroy in confirm otp component method ngOnDestroy');
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    this.logger.info('Completed ng destroy in confirm otp component method ngOnDestroy');
  }
}
