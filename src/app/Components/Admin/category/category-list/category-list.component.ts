
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { ApiResponse } from 'src/app/Models/ApiResponse/api-response';
import { CategoryDetails } from 'src/app/Models/Category/category-details';
import { CategoryService } from 'src/app/Services/Category/category.service';
import { CommonService } from 'src/app/Services/Common/common.service';
import { CustomToasterService } from 'src/app/Services/Custom-Toaster/custom-toaster.service';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent {

  // Variable declaration //
  categoryList: CategoryDetails[] = [];
  isLoading: boolean = false;
  deleteStatus: boolean = false;

  // Constructor Initilisation //
  constructor(
    private logger: NGXLogger,
    private commonService: CommonService,
    private toaster: CustomToasterService,
    private categoryService: CategoryService,
    private router:Router
  ) { }

  //On load function
  ngOnInit() {
    this.showAllCategories();
    this.commonService.scrollToTop();
  }

  //Method for showing all categories //
  showAllCategories() {
    try {
      this.isLoading = true;
      // Log information about fetching category list //
      this.logger.info('Starting loading category list in category list component method showAllCategories');

      // Fetch a category from server //
      this.categoryService.getAllCategories()
        .subscribe({
          next: (response: ApiResponse<CategoryDetails[]>) => {

            // Handle 200 status code
            if (response.statusCode === 200) {
              this.isLoading = false;
              // Log information about a successful category fecthing //
              this.logger.info('Category list fetching successfull in category list component method showAllCategories..showing all categories');
              if (response.data != null) {
                this.categoryList = response.data;
              }
              else {
                this.commonService.scrollToTop();
                this.categoryList = [];
              }
            }
          },
          error: (error) => {
            // Handle different HTTP status codes //
            this.isLoading = false;
            let errorMessage: string = null;
            let baseMessage = 'An error occurred during category fetching in category list component method showAllCategories';
            if (error.error && error.error.message) {
              errorMessage = baseMessage + error.error.message;
            }
            else {
              errorMessage = baseMessage;
            }
            if (error.error.statusCode == 500) {
              this.logger.error(error.error.message);
              this.toaster.showError(error.error.message);
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
      this.logger.error('Unexpected error during category fecthing in category list component method showAllCategories : ', error.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }

  // Method for deletion of category //
  deleteCategory(categoryId: number) {
    try {
      // Log information about starting deletion of category //
      this.logger.info('Starting deletion of category in category list component method deleteCategory');
      // Send a deletion request to the server
      this.categoryService.deleteCategoryById(categoryId)
        .subscribe({
          next: () => {
            // Handle 204 status code
            {
              // Log information about a successful category deletion    
              this.deleteStatus = true;
              this.logger.info('category deletion successful in category list component method deleteCategory..');
              this.toaster.showSuccess("Category deleted successfully");
              this.commonService.scrollToTop();
              this.showAllCategories();
            }
          },
          error: (error) => {
            this.deleteStatus = true;
            let errorMessage: string = null;
            let baseMessage = 'An error occurred during category deletion in category list component method deleteCategory';
            if (error.error && error.error.message) {
              errorMessage = baseMessage + error.error.message;
            }
            else {
              errorMessage = baseMessage;
            }
            // Handle different HTTP status codes
            if (error.error.statusCode == 400 || error.error.statusCode == 500) {
              this.logger.error(error.error.message);
              this.toaster.showError(error.error.message);
            }
            else if (error.error.statusCode == 404) {
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
      // Log information about an unexpected exception
      this.deleteStatus = true;
      this.logger.error('Unexpected error during category deletion in category list component method deleteCategory : ', error.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }

  // Method for handle to open modal //
  handleModalOpen(): void {
    this.deleteStatus = false;
  }
}
