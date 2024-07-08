import { Component, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { ApiResponse } from 'src/app/Models/ApiResponse/api-response';
import { RegisterUser } from 'src/app/Models/Auth/register-user';
import { AuthService } from 'src/app/Services/Auth/auth.service';
import { CommonService } from 'src/app/Services/Common/common.service';
import { CustomToasterService } from 'src/app/Services/Custom-Toaster/custom-toaster.service';
import { HomeService } from 'src/app/Services/Home/home.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  //  Variable Declaration //
  userRegisterForm: UntypedFormGroup;
  adminRegisterForm: UntypedFormGroup;
  showRegisterButton: boolean = true;
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
  isLoading: boolean = false;


  // Constructor Initilization //
  constructor(private formBuilder: UntypedFormBuilder,
    public userService: AuthService,
    private logger: NGXLogger,
    public commonService: CommonService,
    public homeService: HomeService,
    private toaster: CustomToasterService,
    private router: Router
  ) { }

  // On Load Function //
  ngOnInit() {

    // Dynamic check for admin form //
    if (this.commonService.isUserOrAdmin === 'admin') {
      this.adminRegisterForm = this.formBuilder.group({
        AdminName: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]],
        Email: ['', [Validators.required, Validators.email]],
        Password: ['', Validators.required],
        ConfirmPassword: ['', [Validators.required, Validators.minLength(5)]],
      });
    }
    // Dynamic check for user form //
    else {
      this.userRegisterForm = this.formBuilder.group({
        UserName: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]],
        Email: ['', [Validators.required, Validators.email]],
        Password: ['', Validators.required],
        ConfirmPassword: ['', [Validators.required, Validators.minLength(5)]],
      });
    }
    // Subscribe to password value changes for custom validation //
    if (this.commonService.isUserOrAdmin === 'admin') {
      this.adminRegisterForm.get('Password').valueChanges.subscribe((value) => {
        this.validatePassword(value);
      });
    }
    else {
      this.userRegisterForm.get('Password').valueChanges.subscribe((value) => {
        this.validatePassword(value);
      });
    }
  }

  //***********Methods**********************//

  // Method to get form control //
  get f(): { [key: string]: AbstractControl } {
    if (this.commonService.isUserOrAdmin === 'admin') {
      return this.adminRegisterForm.controls;
    }
    else {
      return this.userRegisterForm.controls;
    }
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
    if (this.commonService.isUserOrAdmin === 'admin') {
      const password = this.adminRegisterForm.get('Password').value;
      const confirmPassword = this.adminRegisterForm.get('ConfirmPassword').value;
      this.logger.info('Password entered:', password);
      this.logger.info('Confirm password entered:', confirmPassword);

      if (password === confirmPassword) {
        this.logger.info('Passwords match!');
        return true;
      } else {
        this.logger.warn('Passwords do not match!');
        return false;
      }
    }
    else {
      const password = this.userRegisterForm.get('Password').value;
      const confirmPassword = this.userRegisterForm.get('ConfirmPassword').value;
      this.logger.info('Password entered:', password);
      this.logger.info('Confirm password entered:', confirmPassword);

      if (password === confirmPassword) {
        this.logger.info('Passwords match!');
        return true;
      } else {
        this.logger.warn('Passwords do not match!');
        return false;
      }
    }
  }

  // Method to show and hide password //
  togglePassword(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  // Method for register a new user//
  onSubmit(): void {
    this.submitted = true;
    try {
      // Log information about starting the form submission //
      this.logger.info('Starting onSubmit call in register component method');
      this.isLoading = true;
      this.commonService.scrollToTop();
      // Submission  for userRegisterForm //
      if (this.commonService.isUserOrAdmin === 'user') {
        // Stop here if the form is invalid //
        if (this.userRegisterForm.invalid) {
          // Display an error message and log a warning //
          this.toaster.showError('Please fill in all required fields.');
          this.logger.warn('Form submission aborted due to invalid form.');
          return;
        }
        // Create a user object from the form values //
        const user: RegisterUser = {
          userName: this.f['UserName'].value,
          email: this.f['Email'].value,
          userPassword: this.f['Password'].value,
          userRole: 'user'
        };

        // Log the created user object //
        this.logger.info('User object created in register component method onSubmit : ', user);

        // Send a registration request to the server //
        this.userService.registerUser(user)
          .subscribe({
            next: (response: ApiResponse<string>) => {
              // Log information about a successful user registration //
              this.logger.info('User registration successful in register component method onSubmit Redirecting to user login page.');

              // Handle 201 status code //
              if (response.statusCode === 201) {
                this.toaster.showSuccess(response.message);
                this.isLoading = false;
                this.router.navigate(['/login']);

              }
            },
            error: (error) => {
              // Log information about an error during user registration //
              this.commonService.scrollToTop();
              this.isLoading = false;
              let errorMessage: string;
              let baseMessage = 'An error occurred during user registration in home component method onSubmit';
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
              else if (error.error.statusCode == 409) {
                this.logger.error(errorMessage);
                this.toaster.showWarning(error.error.message);
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
      }
      // Submission  for adminRegisterForm //
      else {
        // Stop here if the form is invalid //
        if (this.adminRegisterForm.invalid) {
          // Display an error message and log a warning //
          this.toaster.showError('Please fill in all required fields.');
          this.logger.warn('Form submission aborted due to invalid form.');
          return;
        }

        // Create a admin object from the form values //
        const admin: RegisterUser = {
          userName: this.f['AdminName'].value,
          email: this.f['Email'].value,
          userPassword: this.f['Password'].value,
          userRole: 'admin'
        };

        // Log the created user object //
        this.logger.info('Admin object created in register component Onsubmit method : ', admin);

        // Send a registration request to the server //
        this.userService.registerUser(admin)
          .subscribe({
            next: (response: ApiResponse<string>) => {
              // Log information about a successful admin registration
              this.logger.info('Admin registration successful in register component Onsubmit method.Redirecting to admin login page.');

              // Handle 201 status code //
              if (response.statusCode === 201) {
                this.toaster.showSuccess(response.message);
                this.isLoading = false;
                this.router.navigate(['/admin-portal/login']);
                this.commonService.scrollToTop();
              }

            },
            error: (error) => {
              // Log information about an error during admin registration //
              this.commonService.scrollToTop();
              this.isLoading = false;
              let errorMessage: string;
              let baseMessage = 'An error occurred during admin registration in home component method onSubmit';
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
              else if (error.error.statusCode == 409) {
                this.logger.error(errorMessage);
                this.toaster.showWarning(error.error.message);
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

      }
    } catch (error) {
      // Log information about an unexpected exception //
      this.isLoading = false;
      this.commonService.scrollToTop();
      this.logger.error('Unexpected error during registration process in home component method onSubmit : ' + error.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }
}