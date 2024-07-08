import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { ApiResponse } from 'src/app/Models/ApiResponse/api-response';
import { AddCategoryDetails } from 'src/app/Models/Category/add-category-details';
import { CategoryService } from 'src/app/Services/Category/category.service';
import { CommonService } from 'src/app/Services/Common/common.service';
import { CustomToasterService } from 'src/app/Services/Custom-Toaster/custom-toaster.service';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.css']
})
export class AddCategoryComponent {

  // Variable declaration //
  categoryForm: UntypedFormGroup = null;
  submitted: boolean = false;
  isWorking: boolean = false;
  adminId: number = 0;
  errorMessage: string = null;
  isLoading: boolean = false;

  //Constructor Initilisation
  constructor(private fb: FormBuilder,
    public categoryService: CategoryService,
    private toaster: CustomToasterService,
    private router: Router,
    private logger: NGXLogger,
    private commonService: CommonService
  ) { }

  // On load function //
  ngOnInit() {
    this.categoryForm = this.fb.group({
      CategoryName: ['', [Validators.required, Validators.maxLength(100)]],
      CategoryDescription: ['', [Validators.required]],
    });
  }
  //**********Methods*******************//
  // Method to get form control //
  get f(): { [key: string]: AbstractControl } {
    return this.categoryForm.controls;
  }

  // Method for create a new category //
  onSubmit(): void {
    this.submitted = true;
    this.isLoading = true;
    try {
      // Log information about starting the category form submission //
      this.logger.info('Starting onSubmit in add category component method onSubmit');

      // Stop here if the form is invalid
      if (this.categoryForm.invalid) {
        // Display an error message and log a warning
        this.toaster.showError('Please fill in all required fields.');
        this.logger.warn('Form submission aborted due to invalid form.');
        return;
      }
      this.commonService.scrollToTop();
      // Check for existing token //
      const adminId = this.commonService.getAvailableTokensDetails().userId;
      if (adminId) {
        this.adminId = adminId;
      }
      // Create a category object from the form values //
      const category: AddCategoryDetails = {
        adminId: this.adminId,
        categoryName: this.f['CategoryName'].value,
        categoryDescription: this.f['CategoryDescription'].value,

      };
      // Log the created category object //
      this.logger.info('Category object created in add category component method onSubmit :', category);

      // Send a create category request to the server //
      this.categoryService.createNewCategory(category)
        .subscribe({
          next: (response: ApiResponse<string>) => {
            // Log information about a successful category creation //
            this.logger.info('Category creation successful in add category component method onSubmit');

            // Handle 201 status code
            if (response.statusCode === 201) {
              this.toaster.showSuccess(response.message);
              this.isLoading = false;
            }
            this.router.navigate(['/admin-portal/category-list']);
          },
          error: (error) => {
            // Log information about an error during category creation //
            this.isLoading = false;
            let errorMessage: string = null;
            let baseMessage = 'An error occurred during category creation in add category component method onSubmit';
            if (error.error && error.error.message) {
              errorMessage = baseMessage + error.error.message;
            }
            else {
              errorMessage = baseMessage;
            }
            if (error.error.statusCode == 400 || error.error.statusCode == 500) {
              this.logger.error(error.error.message);
              this.toaster.showError(error.error.message);
            }

            else if (error.error.statusCode == 409) {
              this.logger.error(error.error.message);
              this.toaster.showWarning(error.error.message);
            }
            else if (error.error.statusCode === 401) {
              this.logger.error("User un-authorized please log in")
              this.toaster.showError("Your session expired. Please log in.");
              this.router.navigate(['/admin-portal/login']);
            }
            else if (error.error.statusCode === 403) {
              this.logger.error("Permission denied error..");
              this.toaster.showError("You do not have permission to access this resource.");
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
      this.logger.error('Unexpected error during category creation in add category component method onSubmit :', error.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }
}
