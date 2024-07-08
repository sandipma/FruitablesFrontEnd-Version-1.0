
import { SocialUser } from '@abacritt/angularx-social-login';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { Subject } from 'rxjs';
import { ApiResponse } from 'src/app/Models/ApiResponse/api-response';
import { AccessTokenDetails } from 'src/app/Models/Auth/access-token-details';
import { LoginDetails } from 'src/app/Models/Auth/login-details';
import { loginUser } from 'src/app/Models/Auth/loginUser';
import { RefreshTokenDetails } from 'src/app/Models/Auth/refresh-token-details';
import { TokenDetails } from 'src/app/Models/Auth/token-details';
import { AuthService } from 'src/app/Services/Auth/auth.service';
import { CommonService } from 'src/app/Services/Common/common.service';
import { CustomToasterService } from 'src/app/Services/Custom-Toaster/custom-toaster.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {

  // Variable Declaration //
  userLoginForm: UntypedFormGroup;
  adminLoginForm: UntypedFormGroup;
  submitted = false;
  isWorking = false;
  googleMail: string = null;
  authChangeSub = new Subject<boolean>();
  extAuthChangeSub = new Subject<SocialUser>();
  authChanged = this.authChangeSub.asObservable();
  extAuthChanged = this.extAuthChangeSub.asObservable();
  isLoading: boolean = false;


  // Password validation variables //
  passwordValid = false;
  requiredValid = false;
  email: string;
  socialData: SocialUser;
  loginUserdata: ApiResponse<LoginDetails> = null;
  googleUserdata: ApiResponse<TokenDetails> = null;
  tokenExpireTime: Date;
  refreshtokenDetails: RefreshTokenDetails = null;

  // Constructor Initialization //
  constructor(
    private formBuilder: UntypedFormBuilder,
    public authService: AuthService,
    private toaster: CustomToasterService,
    private router: Router,
    private logger: NGXLogger,
    public commonService: CommonService
  ) 
  {}

  // On Load Event //
  ngOnInit() {
    this.logger.info('Initializing login component method ngOnInit');
    // Dynamic check for user login form //
    if (this.commonService.isUserOrAdmin === 'user') {
      this.userLoginForm = this.formBuilder.group({
        UserName: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]],
        Password: ['', Validators.required],
      });
    
      // Subscribe to password value changes for custom validation //
      this.userLoginForm.get('Password').valueChanges.subscribe((value) => {
        this.validatePassword(value);
      });
    }
    // Dynamic check for user admin form //
    else {
      this.adminLoginForm = this.formBuilder.group({
        AdminName: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]],
        Password: ['', Validators.required],
      });

      // Subscribe to password value changes for custom validation //
      this.adminLoginForm.get('Password').valueChanges.subscribe((value) => {
        this.validatePassword(value);
      });
    }
  }

  // Getter for easy access to form fields in the template //
  get f() {
    if (this.commonService.isUserOrAdmin === 'user') {
      return this.userLoginForm.controls;
    }
    else {
      return this.adminLoginForm.controls;
    }
  }

  // Form submission logic for login //
  onSubmit() {
    this.logger.info('Starting onSubmit call for login in login component method onSubmit');
    this.submitted = true;
    this.commonService.scrollToTop();
    try {
      if (this.commonService.isUserOrAdmin === 'user') {
        // Stop here if the form is invalid //
        if (this.userLoginForm.invalid) {
          this.logger.error('Form submission aborted due to invalid form.');
          this.toaster.showError('Please fill in all required fields.');
          return;
        }
        else {
          let adminAccessToken: AccessTokenDetails = JSON.parse(localStorage.getItem('adminAuthToken'))
          let adminRefreshToken: RefreshTokenDetails = JSON.parse(localStorage.getItem('adminRefreshToken'))

          const currentDateTime = new Date();
          if (adminAccessToken || adminRefreshToken) {
            this.tokenExpireTime = new Date(adminRefreshToken.refreshTokenTimePeriod);
            if (this.tokenExpireTime > currentDateTime) {
              this.toaster.showWarning("Admin session is going on can't login ..try after sometime");
              return;
            }
            this.authService.logout();
          }
          // Create a user object from the form values //
          const user: loginUser = {
            userName: this.f['UserName'].value,
            password: this.f['Password'].value,
            userOrAdmin:this.commonService.isUserOrAdmin
          };
          this.logger.info('User Login object created in login component method onSubmit : ', user);
          this.isLoading = true;
          // Login user //
          this.authService.loginUser(user).subscribe({
            next: (logindata: ApiResponse<TokenDetails>) => {

              if (logindata.statusCode == 200) {
                this.logger.info('Login successfull in login component method onSubmit');
                this.toaster.showSuccess(logindata.message);
                this.router.navigate(['/']);
                this.isLoading = false;
              }
            },
            error: (error: any) => {
              // Log information about an error during user login process //
              let errorMessage: string;
              let baseMessage = 'An error occurred during user log in - in login component method onSubmit';
              if (error.error && error.error.message) {
                errorMessage = baseMessage + error.error.message;
              }
              else {
                errorMessage = baseMessage;
              }
              this.isLoading = false;
              // Handle different HTTP status codes //
              if (error.error.statusCode == 400) {
                this.logger.error(errorMessage);
                this.toaster.showError(error.error.message);
              }
              else if (error.error.statusCode == 500) {
                this.logger.error(errorMessage);
                this.toaster.showError(error.error.message);
              }
              else if (error.error.statusCode == 404) {
                this.logger.error(errorMessage);
                this.toaster.showError(error.error.message);
              }
              else {
                this.logger.error(errorMessage);
                this.toaster.showError('Server error try again later');
              }
            },
          });
        }
      }
      else {
        // Stop here if the form is invalid //
        if (this.adminLoginForm.invalid) {
          this.logger.error('Form submission aborted due to invalid form.');
          this.toaster.showError('Please fill in all required fields.');
          return;
        }
        else {
          let accessToken: AccessTokenDetails = JSON.parse(localStorage.getItem('authToken'))
          let refreshToken: RefreshTokenDetails = JSON.parse(localStorage.getItem('refreshToken'))

          if (accessToken || refreshToken) {
            this.authService.logout();
          }
          // Create a admin object from the form values
          const admin: loginUser = {
            userName: this.f['AdminName'].value,
            password: this.f['Password'].value,
            userOrAdmin:this.commonService.isUserOrAdmin
          };
          this.logger.info('Admin Login object created in login component method onSubmit:', admin);
          this.isLoading = true;
          // Login user
          this.authService.loginUser(admin).subscribe({
            next: (logindata: ApiResponse<TokenDetails>) => {

              if (logindata.statusCode == 200) {
                this.logger.info('Login successfull...');
                this.toaster.showSuccess(logindata.message);
                this.router.navigate(['/admin-portal']);
                this.isLoading = false;
              }
            },
            error: (error: any) => {
             // Log information about an error during user login process //
             this.commonService.scrollToTop();
             let errorMessage: string;
             let baseMessage = 'An error occurred during admin log in - in login component method onSubmit';
             if (error.error && error.error.message) {
               errorMessage = baseMessage + error.error.message;
             }
             else {
               errorMessage = baseMessage;
             }
             this.isLoading = false;
             // Handle different HTTP status codes //
             if (error.error.statusCode == 400) {
               this.logger.error(errorMessage);
               this.toaster.showError(error.error.message);
             }
             else if (error.error.statusCode == 500) {
               this.logger.error(errorMessage);
               this.toaster.showError(error.error.message);
             }
             else if (error.error.statusCode == 404) {
               this.logger.error(errorMessage);
               this.toaster.showError(error.error.message);
             }
             else {
               this.logger.error(errorMessage);
               this.toaster.showError('Server error try again later');
             }
           },
         });

        }
      }
    } catch (exception) {
      this.isLoading = false;
      this.commonService.scrollToTop();
      this.logger.error('Unexpected error during login process : ', exception.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }

  // Ggoogle submission logic //
  onGoogleLogin() {
    this.authService.signInWithGoogle();
  }

  // Custom password validation logic //
  validatePassword(value: string) {
    this.logger.info('Validating password in login component validatePassword method');

    this.requiredValid = value.length > 0;
    this.passwordValid = this.requiredValid;

    this.logger.debug('Required Valid:', this.requiredValid);
    this.logger.debug('Password Valid:', this.passwordValid);

    this.logger.info('Validating completed in login component validatePassword method');

  }

  // Method for on forgot password click //
  onForgotPasswordClick():void
  {

    if(this.commonService.isUserOrAdmin ==='user')
      {
       
        this.router.navigate(['/forgot-password']);
      }
      else
      {
        this.router.navigate(['/admin-portal/forgot-password']);
      }
  }

  // Method for on OTP login click //
  onOTPClick():void
  {
    if(this.commonService.isUserOrAdmin ==='user')
      {
       
        this.router.navigate(['/send-OTP']);
      }
      else
      {
        this.router.navigate(['/admin-portal/send-OTP']);
      }
  }
}
