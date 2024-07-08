import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProductDetails } from 'src/app/Models/Products/product-details';
import { ProductService } from 'src/app/Services/Products/products.service';
import { CustomToasterService } from 'src/app/Services/Custom-Toaster/custom-toaster.service';
import { NGXLogger } from 'ngx-logger';
import { ApiResponse } from 'src/app/Models/ApiResponse/api-response';
import { CommonService } from 'src/app/Services/Common/common.service';
@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent {
  // Variable declaration //
  productList: ProductDetails[] = [];
  deleteStatus: boolean = false;
  isLoading: boolean = false;
  currentPage: number = 1;
  ordersPerPage: number = 9;

  // Constructor Initilisation //
  constructor(public productService: ProductService,
    private toaster: CustomToasterService,
    private router: Router,
    private logger: NGXLogger,
    private commonService: CommonService) { }

  // On load event //
  ngOnInit() {
    this.commonService.scrollToTop();
    this.showAllProducts();
  }

  // Method for showing all products //
  showAllProducts() {
    try {
      // Log information about fetching product list //
      this.logger.info('Starting loading product list in product list component method showAllProducts');
      this.isLoading = true;
      // Fetch a product from server //
      this.productService.getAllProducts()
        .subscribe({
          next: (response: ApiResponse<ProductDetails[]>) => {

            // Handle 200 status code
            if (response.statusCode === 200) {
              this.isLoading = false;
              // Log information about a successful product fecthing //
              this.logger.info('Product list fetching successfull..showing all products in product list component method showAllProducts');
              if (response.data != null) {
                this.productList = response.data;
              }
              else {
                this.commonService.scrollToTop();
                this.productList = [];
              }
            }
          },
          error: (error) => {
            this.isLoading = false;
            // Log information about an error during product fetching //
            let errorMessage = 'An error occurred during product fetching API call..';
            let baseMessage = 'An error occurred during category deletion in product list component method showAllProducts';
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
      this.isLoading = false;
      // Log information about an unexpected exception //
      this.logger.error('Unexpected error product fecthing in product list component method showAllProducts' + error.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }

  // Method for handle to open modal //
  handleModalOpen(): void {
    this.deleteStatus = false;
  }

  // Method for deletion of product //
  deleteProduct(productId: number) {
    try {
      // Log information about starting deletion of product //
      this.logger.info('Starting deletion of product in product list component method deleteProduct');
      // Send a deletion request to the server //
      this.productService.deleteProductById(productId)
        .subscribe({
          next: () => {
            // Handle 204 status code //
            {
              // Log information about a successful product deletion //          
              this.logger.info('product deletion successful in product list component method deleteProduct');
              this.deleteStatus = true;
              this.toaster.showSuccess("Product deleted successfully");
              this.commonService.scrollToTop();
              this.showAllProducts();
            }
          },
          error: (error) => {
            // Log information about an error during product deletion //
            this.deleteStatus = true;
            let errorMessage = 'An error occurred during product deletion API call..';
            let baseMessage = 'An error occurred during product deletion in product list component method deleteProduct';
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
              this.logger.warn(error.error.message);
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
      this.deleteStatus = true;
      this.logger.error('Unexpected error during product deletion in product list component method deleteProduct : ' + error.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }

  // Method for update product //
  goToUpdateProduct(productId: number) {
    this.router.navigate(['/admin-portal/update-product', productId]);
  }

  // Method for get max pages //
  get maxPages(): number {
    return Math.ceil(this.productList.length / this.ordersPerPage);
  }

  // Method for get paginatedOrders //
  get paginatedOrders(): ProductDetails[] {
    const startIndex = (this.currentPage - 1) * this.ordersPerPage;
    const endIndex = Math.min(startIndex + this.ordersPerPage, this.productList.length);
    return this.productList.slice(startIndex, endIndex);
  }

  // Method for clicking on the next page //
  nextPage(): void {
    this.commonService.scrollToTop();
    if (this.currentPage < this.maxPages) {
      this.currentPage++;
    }
  }

  // Method for clicking on the previous page //
  previousPage(): void {
    this.commonService.scrollToTop();
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
}
