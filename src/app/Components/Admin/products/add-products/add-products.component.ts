
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { ApiResponse } from 'src/app/Models/ApiResponse/api-response';
import { CategoryDetails } from 'src/app/Models/Category/category-details';
import { ProductDetails } from 'src/app/Models/Products/product-details';
import { AuthService } from 'src/app/Services/Auth/auth.service';
import { CategoryService } from 'src/app/Services/Category/category.service';
import { CommonService } from 'src/app/Services/Common/common.service';
import { CustomToasterService } from 'src/app/Services/Custom-Toaster/custom-toaster.service';
import { ProductService } from 'src/app/Services/Products/products.service';

@Component({
  selector: 'app-add-products',
  templateUrl: './add-products.component.html',
  styleUrls: ['./add-products.component.css']
})
export class AddProductsComponent {

  // Variable declaration //
  categoryList: CategoryDetails[] = []
  productDetail: ProductDetails = null;
  productForm: FormGroup = null;
  selectedFile: File = null;
  categories: CategoryDetails[] = [];
  isWorking: boolean = false;
  productId: number = 0;
  fileName: string = null;
  isAddOrUpdate: string = null;
  isImageValid: boolean = false;
  fileUploadErrorMessage: string = null;
  isLoading: boolean = false;
  adminId: number = 0;

  // Constructor Initilisation //
  constructor(private fb: FormBuilder,
    public productService: ProductService,
    private toaster: CustomToasterService,
    private router: Router,
    private categoryService: CategoryService,
    private logger: NGXLogger,
    private route: ActivatedRoute,
    private commonService: CommonService) { }

  // On load event //
  ngOnInit() {
    this.showAllCategories();
    try {
      // Setting initial form value for validation //
      this.productId = +this.route.snapshot.paramMap.get('id');
      if (this.productId === 0) {
        this.productForm = this.fb.group({
          CategoryId: [null, Validators.required],
          ProductName: ['', [Validators.required, Validators.maxLength(255)]],
          ProductDescription: ['', [Validators.required, Validators.minLength(150)]],
          Price: ['', [Validators.required, this.priceRangeValidator]],
          StockQuantity: ['', [Validators.required, this.stockQuantityRangeValidator]]
        });
        this.isAddOrUpdate = 'Add';
      } else {
        this.productService.getAllProducts().subscribe((productList: ApiResponse<ProductDetails[]>) => {
          this.productDetail = productList.data.find(product => product.productId === this.productId);
          if (this.productDetail) {
            this.isImageValid = true;
            this.isAddOrUpdate = 'Update';
            this.selectedFile = this.convertBase64ToFile(this.productDetail.imageData, this.productDetail.imageName);
            this.fileName = this.productDetail.imageName;
            this.productForm = this.fb.group({
              CategoryId: [this.productDetail.categoryId, Validators.required],
              ProductName: [this.productDetail.productName, [Validators.required, Validators.maxLength(255)]],
              ProductDescription: [this.productDetail.productDescription, [Validators.required, Validators.minLength(150)]],
              Price: [this.productDetail.price, [Validators.required, this.priceRangeValidator]],
              StockQuantity: [this.productDetail.stockQuantity, [Validators.required, this.stockQuantityRangeValidator]]
            });
          }
        });
      }
    } catch (error) {
      if (this.isAddOrUpdate === 'Add') {
        this.logger.error('Error while product creation in add product component method ngOnInit : ' + error.message);
        this.toaster.showError('Error while product creation..');
      }
      else {
        this.logger.error('Error while updating product in add product component method ngOnInit : ' + error.message);
        this.toaster.showError('Error while updating product..');
      }
    }
  }

  // Method for price validation //
  priceRangeValidator(control: AbstractControl): { [key: string]: any } | null {
    const value = control.value;
    // Check if the value is a valid number //
    if (isNaN(value)) {
      return { 'invalidNumber': true };
    }
    // Check if the value is within the desired range //
    if (value < 1 || value > 999999.99) {
      return { 'invalidRange': true };
    }
    return null;
  }

  // Method for stock quantity validation //
  stockQuantityRangeValidator(control: AbstractControl): { [key: string]: any } | null {
    const value = control.value;
    // Check if the value is a valid number //
    if (isNaN(value)) {
      return { 'invalidNumber': true };
    }
    // Check if the value is within the desired range //
    if (value < 1 || value > 10000) {
      return { 'invalidRange': true };
    }
    return null;
  }

  // On submit method //
  onSubmit() {
    try {
      // Stop here if the form is invalid //
      if (this.productForm.invalid) {
        // Display an error message and log a warning //
        this.toaster.showError('Please fill in all required fields.');
        this.logger.warn('Form submission aborted due to invalid form.');
        return;
      }
      this.commonService.scrollToTop();
      this.isLoading = true;

      // Check for existing token //
      const adminId = this.commonService.getAvailableTokensDetails().userId;
      if (adminId) {
        this.adminId = adminId;
      }
      // Create a product object from the form values //
      const productFormData = new FormData();
      productFormData.append('adminId', this.adminId.toString());
      productFormData.append('productId', this.productId.toString());
      productFormData.append('categoryId', this.productForm.get('CategoryId').value);
      productFormData.append('productName', this.productForm.get('ProductName').value);
      productFormData.append('productDescription', this.productForm.get('ProductDescription').value);
      productFormData.append('price', this.productForm.get('Price').value);
      productFormData.append('stockQuantity', this.productForm.get('StockQuantity').value);
      productFormData.append('imageData', this.selectedFile);

      // Log the created product object //
      this.logger.info('Product object created in add product component method onSubmit :', productFormData);
      // Send a registration request to the server //
      this.productService.createUpdateProduct(productFormData)
        .subscribe({
          next: (response: ApiResponse<string>) => {
            // Log information about a successful product creation/updation //
            this.logger.info('Product creation/updation successful in add product component method onSubmit...Redirecting to product list page.');
            // Handle 201 status code //
            if (response.statusCode === 201) {
              this.logger.info('Product created successfully in add product component method onSubmit Redirecting to product list page.');
              this.toaster.showSuccess(response.message);
              this.isLoading = false;
              this.router.navigate(['/admin-portal/product-list']);
            }
            else if (response.statusCode === 200) {
              this.logger.info('Product upadted successfully in add product component method onSubmit Redirecting to product list page.');
              this.toaster.showSuccess(response.message);
              this.isLoading = false;
              this.router.navigate(['/admin-portal/product-list']);
            }
          },
          error: (error: any) => {
            // Log information about an error during product creation/updation //
            this.isLoading = false;
            let errorMessage = 'An error occurred during product creation/updation API call..';
            let baseMessage = 'An error occurred during product creation/updation in add product component method onSubmit';
            if (error.error && error.error.message) {
              errorMessage = baseMessage + error.error.message;
            }
            else {
              errorMessage = baseMessage;
            }
            // Handle different HTTP status codes //
            if (error.error.statusCode == 400) {
              this.logger.error(error.error.message);
              this.toaster.showError(error.error.message);
            }
            else if (error.error.statusCode == 409) {
              this.logger.warn(error.error.message);
              this.toaster.showWarning(error.error.message);
            }
            else if (error.error.statusCode == 500) {
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
    }
    catch (error) {
      // Log information about an unexpected exception //
      this.isLoading = false;
      this.logger.error('Unexpected error during product creation/updation in add product component method onSubmit :' + error.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }

  // On file selected method //
  onFileSelected(event: any) {
    try {
      const file: File = event.target.files[0];
      this.selectedFile = file;
      this.fileUploadErrorMessage = '';
      // Check if file is selected //
      if (file) {
        this.isImageValid = true;
        this.fileName = file.name;
        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
          this.isImageValid = false;
          this.fileUploadErrorMessage = 'Invalid file format. Please upload a jpg or png Or jpeg file.'
          return;
        }
        // Check file resolution //
        const img = new Image();
        img.src = window.URL.createObjectURL(file);
        img.onload = () => {
          const width = img.naturalWidth;
          const height = img.naturalHeight;
          if ((width < 500 || width > 505) || (height < 500 || height > 505)) {
            this.isImageValid = false;
            this.fileUploadErrorMessage = 'Invalid image resolution. Please upload an image with resolution 500 x 500.'
          }
          return;
        };
      }
    } catch (error) {
      this.logger.error('Error during product image selection in add product component method onFileSelected : ' + error.message)
      this.toaster.showError('Error while uploading image..try later')
    }
  }

  //Method for showing all categories //
  showAllCategories() {
    try {
      // Log information about fetching category list //
      this.logger.info('Starting loading category list in add product component method showAllCategories');
      // Fetch a category from server //
      this.categoryService.getAllCategories()
        .subscribe({
          next: (response: ApiResponse<CategoryDetails[]>) => {
            // Handle 200 status code //
            if (response.statusCode === 200) {
              // Log information about a successful category fecthing //
              this.logger.info('Category list fetching successfull in add product component method showAllCategories..showing all categories');
              if (response.data != null) {
                this.categoryList = response.data;
              }
              else {
                this.logger.info('Category list fetching not found in add product component method showAllCategories');
                this.commonService.scrollToTop();
                this.categoryList = [];
              }
            }
          },
          error: (error) => {
            // Log information about an error during category fecthing //
            let errorMessage = 'An error occurred during category fecthing API call..';
            let baseMessage = 'An error occurred during category fecthing in add product component method showAllCategories';
            if (error.error && error.error.message) {
              errorMessage = baseMessage + error.error.message;
            }
            else {
              errorMessage = baseMessage;
            }
            // Handle different HTTP status codes //
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
      this.logger.error('Unexpected error during category fecthing in add product component method showAllCategories', error.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }

  // Method to get form control //
  get f(): { [key: string]: AbstractControl } {
    return this.productForm.controls;
  }

  // Method to convert base 64 to file //
  convertBase64ToFile(base64: string, filename: string): File {
    try {
      this.logger.info('Convert Base64 to file starts in add product component method convertBase64ToFile');
      // Determine the MIME type based on the file extension
      const mimeType = this.getMimeTypeFromExtension(filename);
      // Convert Base64 to Blob
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      // Create a File object from Blob
      const file = new File([blob], filename, { type: mimeType });
      this.logger.info('Convert Base64 to file complete in add product component method convertBase64ToFile');
      // Return the File object
      return file;
    } catch (error) {
      this.logger.error('Error converting Base64 to File: ' + error.message);
      throw new Error('Error while updating product..try again');
    }
  }

  // Method to get extension of file //
  getMimeTypeFromExtension(filename: string): string {
    const extension = filename.split('.').pop().toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      default:
        this.logger.error('Unsupported file extension');
        throw new Error('Unsupported file extension');
    }
  }
}
