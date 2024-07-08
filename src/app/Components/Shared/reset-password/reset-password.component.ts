import { Component } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { ApiResponse } from 'src/app/Models/ApiResponse/api-response';
import { ResetPassword } from 'src/app/Models/Reset-Password/reset-password';
import { CommonService } from 'src/app/Services/Common/common.service';
import { CustomToasterService } from 'src/app/Services/Custom-Toaster/custom-toaster.service';
import { ResetPasswordService } from 'src/app/Services/Reset-Password/reset-password.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {

  // Variable declarartion //
  userId: string = "";
  code: string = "";
  encodedCode: string = "";
  isLoading: boolean = false;
  passwordResetForm: UntypedFormGroup;
  submitted = false;
  isWorking = false;
  passwordValid = false;
  requiredValid = false;
  minLengthValid = false;
  requiresDigitValid = false;
  requiresUppercaseValid = false;
  requiresLowercaseValid = false;
  requiresSpecialCharsValid = false;
  passwordVisible: boolean = false;

  // Constructor initialization //
  constructor(private activeRout: ActivatedRoute,
    public resetPasswordService: ResetPasswordService,
    private toaster: CustomToasterService,
    private logger: NGXLogger,
    private commonService: CommonService,
    private formBuilder: UntypedFormBuilder) { }


  // On Load event //
  ngOnInit() {
    this.commonService.scrollToTop();
    // Reactive form Initilization //
    this.passwordResetForm = this.formBuilder.group({
      Password: ['', Validators.required],
      ConfirmPassword: ['', [Validators.required, Validators.minLength(5)]],
    });

    // Get the query string parameter from url //
    this.activeRout.queryParams.subscribe(params => {
      this.userId = params['userId'];
      this.code = params['code'];
    });
    // Encoded the code to send appropriately for verfication //
    this.encodedCode = encodeURIComponent(this.code);

    // Track changes for password chnages for validation //
    this.passwordResetForm.get('Password').valueChanges.subscribe((value) => {
      this.validatePassword(value);
    });
  }

  //*************Methods**********************//

  // Method to get form control //
  get f(): { [key: string]: AbstractControl } {
    return this.passwordResetForm.controls;
  }

  // Method to validate password //
  validatePassword(value: string) {
    this.logger.info('Starting validatePassword');
    this.logger.debug('Input Value:', value);

    this.requiredValid = value.length > 0;
    this.logger.debug('Required Valid:', this.requiredValid);

    this.minLengthValid = value.length >= 8;
    this.logger.debug('Min Length Valid:', this.minLengthValid);

    this.requiresDigitValid = /\d/.test(value);
    this.logger.debug('Requires Digit Valid:', this.requiresDigitValid);

    this.requiresUppercaseValid = /[A-Z]/.test(value);
    this.logger.debug('Requires Uppercase Valid:', this.requiresUppercaseValid);

    this.requiresLowercaseValid = /[a-z]/.test(value);
    this.logger.debug('Requires Lowercase Valid:', this.requiresLowercaseValid);

    this.requiresSpecialCharsValid = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    this.logger.debug('Requires Special Chars Valid:', this.requiresSpecialCharsValid);

    this.passwordValid =
      this.requiredValid &&
      this.minLengthValid &&
      this.requiresDigitValid &&
      this.requiresUppercaseValid &&
      this.requiresLowercaseValid &&
      this.requiresSpecialCharsValid;

    this.logger.info('Validation completed. Password Valid:', this.passwordValid);
  }

  // Method to validate password and confirm password //
  matchPassword(): boolean {

    const password = this.passwordResetForm.get('Password').value;
    const confirmPassword = this.passwordResetForm.get('ConfirmPassword').value;
    this.logger.info('Password entered in reset password component method matchPassword : ', password);
    this.logger.info('Confirm password entered in reset password component method matchPassword : ', confirmPassword);
    if (password === confirmPassword) {
      this.logger.info('Passwords match in reset password component method matchPassword!');
      return true;
    } else {
      this.logger.warn('Passwords do not match in reset password component method matchPassword!');
      return false;
    }
  }

  // Method to show and hide password //
  togglePassword(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  // Method for password reset //
  onSubmit(): void {
    this.submitted = true;
    try {
      // Log information about starting the form submission //
      this.logger.info('Starting onSubmit in reset password component method onSubmit');
      this.isLoading = true;
      this.commonService.scrollToTop();
      // Stop here if the form is invalid //
      if (this.passwordResetForm.invalid) {
        // Display an error message and log a warning //
        this.toaster.showError('Please fill in all required fields.');
        this.logger.warn('Form submission aborted due to invalid form.');
        return;
      }
      // Create a user object from the form values //
      const resetPassword: ResetPassword = {
        password: this.f['Password'].value,
        userId: this.userId,
        code: this.code,
      };
      // Log the created resetPassword object //
      this.logger.info('Reset password object created in reset password component method onSubmit : ', resetPassword);

      // Send a registration request to the server //
      this.resetPasswordService.resetPassword(resetPassword)
        .subscribe({
          next: (response: ApiResponse<string>) => {
            // Log information about a successful reset password //
            this.logger.info('Password reset successful in reset password component method onSubmit');

            // Handle 200 status code //
            if (response.statusCode === 200) {
              this.toaster.showSuccess(response.message);
              this.isLoading = false;
              // Close the window after 10 seconds //
              setTimeout(() => {
                window.close();
              }, 3000); // 3000 milliseconds = 3 seconds //
            }
          },
          error: (error) => {
            // Log information about an error during reset password //
            this.commonService.scrollToTop();
            let errorMessage: string;
            let baseMessage = 'An error occurred during reset password in reset password component method onSubmit';
            if (error.error && error.error.message) {
              errorMessage = baseMessage + error.error.message;
            }
            else {
              errorMessage = baseMessage;
            }
            this.isLoading = false;
            // Handle different HTTP status codes //
            if (error.error.statusCode == 400 && error.message.includes('User with the provided User Id does not exist.')) {
              if (this.commonService.isUserOrAdmin == 'user') {
                this.logger.error(errorMessage);
                this.toaster.showError(error.error.message);
              }
              else {
                this.logger.error('Admin with the provided Admin Id does not exist.');
                this.toaster.showError('Admin with the provided Admin Id does not exist');
              }
            }
            else if (error.error.statusCode == 400) {
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
      this.commonService.scrollToTop();
      this.logger.error('Unexpected error during in reset password component method onSubmit : ' + error.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }
}
