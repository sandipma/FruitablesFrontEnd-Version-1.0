import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { ApiResponse } from 'src/app/Models/ApiResponse/api-response';
import { AddCartDetails } from 'src/app/Models/Cart/add-cart-details';
import { BagCounterDetails } from 'src/app/Models/Cart/bag-counter-details';
import { AddProductRating } from 'src/app/Models/Products/add-product-rating';
import { ProductDetail } from 'src/app/Models/Shop-Details/product-detail';
import { ProductRatingDetails } from 'src/app/Models/Shop-Details/product-rating-details';
import { RatingsDetails } from 'src/app/Models/Shop-Details/ratings-details';
import { AuthService } from 'src/app/Services/Auth/auth.service';
import { CartService } from 'src/app/Services/Cart/cart.service';
import { CommonService } from 'src/app/Services/Common/common.service';
import { CustomToasterService } from 'src/app/Services/Custom-Toaster/custom-toaster.service';
import { ProductService } from 'src/app/Services/Products/products.service';
import { ShopService } from 'src/app/Services/Shop/shop.service';
import { ShopDetailsService } from 'src/app/Services/ShopDetails/shop-details.service';

@Component({
  selector: 'app-shopdetails',
  templateUrl: './shopdetails.component.html',
  styleUrls: ['./shopdetails.component.css']
})
export class ShopdetailsComponent implements OnInit {

  // Variable Declaration //
  reviewForm: FormGroup;
  selectedStars: number[] = [];
  checkCountStar: number = 0;
  starValueCheck: boolean;
  isRateProductClicked: boolean;
  loogedInUserId: number;
  productRatingDetails: ProductRatingDetails;
  productDetails: ProductDetail;
  retingDetails: RatingsDetails[] = [];
  isLoading: boolean = false;
  isProductPurchased: string = null;
  checkRatingOnSubmit: boolean = false;
  receivedData: any;
  finalPrice: number = 0;
  currentQuant: number = 0;


  // Constructor Initilization //
  constructor(public productService: ProductService,
    private fb: FormBuilder,
    public authService: AuthService,
    private toaster: CustomToasterService,
    private router: Router,
    private route: ActivatedRoute,
    public shopDetailService: ShopDetailsService,
    private logger: NGXLogger,
    public shopService: ShopService,
    public commonService: CommonService,
    public cartService: CartService) {
    this.starValueCheck = false;
    this.isRateProductClicked = false;
    this.loogedInUserId = 0;
  }

  // On Load Function //
  ngOnInit(): void {
    this.receivedData = this.route.snapshot.paramMap.get('prodId');
    this.receivedData = history.state;
    this.reviewForm = this.fb.group({
      reviewText: [{ value: '', disabled: true }, Validators.required]
    });
    this.commonService.scrollToTop();
    this.showProductWithRating();
  }

  //***********Methods**********************//

  // Getter for easy access to form fields in the template //
  get f(): { [key: string]: AbstractControl } {
    return this.reviewForm.controls;
  }

  // Method for show products with it's rating //
  showProductWithRating(): void {
    try {
      this.logger.info('Starting fetching product with its rating in Shop details component method showProductWithRating');
      this.commonService.scrollToTop();
      // Send a request to the server //
      this.shopDetailService.getProductsAndRating(this.receivedData.productId)
        .subscribe({
          next: (response: ApiResponse<ProductRatingDetails>) => {
            // Log information about a successful product with its rating //

            this.logger.info('Product with its rating fetching successfull in Shop details component method showProductWithRating');
            // Handle 200 status code  //
            if (response.statusCode === 200) {
              this.logger.info('Saving product with its rating..');
              if ((response.data.prodDetails != null) || (response.data.retDetails.length != 0)) {

                this.productDetails = response.data.prodDetails;
                this.productDetails.price = this.receivedData.price;
                this.productDetails.selectedOption = this.receivedData.selectedOption;
                this.retingDetails = response.data.retDetails;
              }
            }
          },
          error: (error) => {
            // Log information about an error during fetching product with its rating //
            let errorMessage: string;
            let baseMessage = 'An error occurred during fetching product with its rating in Shop details component method showProductWithRating';
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
            else if (error.error.statusCode === 401) {
              this.logger.error("User un-authorized please log in")
              this.toaster.showError("Your session expired. Please log in.");
              this.router.navigate(['/login']);
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
      this.logger.error('Unexpected error during product with its rating in Shop details component method showProductWithRating : ' + error.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }

  // Method for On submit //
  onSubmit(): void {
    try {
      // Log information about starting the form submission //
      this.logger.info('Starting submit process in Shop details component method onSubmit');
      this.isLoading = true;

      // Stop here if the form is invalid //
      if (this.reviewForm.invalid) {
        // Display an error message and log a warning //
        this.toaster.showError('Please fill in all required fields.');
        this.logger.warn('Form submission aborted due to invalid form.');
        return;
      }
      // Find currently logged in user //
      const user = this.commonService.getAvailableTokensDetails();

      // Create a product rating object from the form values //
      const productRating: AddProductRating = {

        review: this.f['reviewText'].value,
        rate: this.checkCountStar,
        userId: user.userId,
        productId: this.receivedData.productId
      };
      if (this.checkCountStar === 0) {
        this.checkRatingOnSubmit = true;
        return;
      }
      // Log the created product rating object //
      this.logger.info('Product-rating object created in Shop details component method onSubmit : ', productRating);
      // Send a registration request to the server //
      this.shopDetailService.createProductRating(productRating)
        .subscribe({
          next: (response: ApiResponse<string>) => {
            // Log information about a successful product-rating insertion //
            this.logger.info('Product-rating insertion successful in Shop details component method onSubmit');

            // Handle 201 status code //
            if (response.statusCode === 201) {
              this.toaster.showSuccess(response.message);
              this.isLoading = false;
              this.reviewForm.reset();
              this.reviewForm.disable();
              this.selectedStars = [];
              this.refreshReview();
            }
          },
          error: (error) => {
            // Log information about an error during product-rating insertion //
            this.isLoading = false;
            let errorMessage: string;
            let baseMessage = 'An error occurred product rating insertion process in Shop details component method onSubmit';
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
            else if (error.error.statusCode == 400 && error.error.message.includes('You have not purchased this product.')) {
              this.logger.error(errorMessage);
              this.isProductPurchased = 'Yes';
            }
            else if (error.error.statusCode == 404) {
              this.logger.error(errorMessage);
              this.toaster.showError(error.error.message);
            }
            else if (error.error.statusCode == 500) {
              this.logger.error(errorMessage);
              this.toaster.showError(error.error.message);
            }
            else if (error.error.statusCode === 401) {
              this.logger.error("User un-authorized please log in")
              this.toaster.showError("Your session expired. Please log in.");
              this.router.navigate(['/login']);
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
      this.logger.error('Unexpected error during product-rating insertion process in Shop details component method onSubmit : ' + error.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }

  // Method for toggle start click //
  toggleStar(star: number): void {
    this.logger.info('Starting toggle star in Shop details component method toggleStar');
    const index = this.selectedStars.indexOf(star);
    if (this.starValueCheck) {
      if (index !== -1) {
        this.selectedStars.splice(index, 1);
        this.checkCountStar = this.checkCountStar - 1;
      } else {
        this.selectedStars.push(star);
        this.checkCountStar = this.checkCountStar + 1;
      }
    }
    this.logger.info('Completing toggle star in Shop details component method toggleStar');
  }

  // Method for check star selected or not //
  isStarSelected(star: number): boolean {
    return this.selectedStars.includes(star);
  }

  // Method for on rate click //
  onRateClick(): void {
    try {
      if (this.authService.isTokenExists() === true || this.authService.isRefreshTokenExists() === true) {
        this.logger.info('Check product purchasing start in shop details component method onRateClick');
        // Find currently logged in user //
        const user = this.commonService.getAvailableTokensDetails();
        // Send a registration request to the server //
        this.shopDetailService.checkProductPurchasing(user.userId, this.receivedData.productId)
          .subscribe({
            next: (response: ApiResponse<string>) => {
              // Log information about a successful check //
              this.logger.info('Check product purchasing completed in shop details component method onRateClick');
              if (response.statusCode === 200) {
                this.reviewForm.get('reviewText').enable();
                this.starValueCheck = true;
                this.isRateProductClicked = true;
              }
            },
            error: (error) => {
              // Log information about an error during check product purchasing //
              let errorMessage: string;
              let baseMessage = 'An error occurred during check product purchasing in Shop details component method onRateClick';
              if (error.error && error.error.message) {
                errorMessage = baseMessage + error.error.message;
              }
              else {
                errorMessage = baseMessage;
              }
              if (error.error.statusCode == 404) {
                this.logger.error(errorMessage);
                this.toaster.showError(error.error.message);
              }
              else if (error.error.statusCode == 400) {
                this.logger.error(errorMessage);
                this.toaster.showError(error.error.message);
              }
              else if (error.error.statusCode == 500) {
                this.logger.error(errorMessage);
                this.toaster.showError(error.error.message);
              }
              else if (error.error.statusCode === 401) {
                this.logger.error("User un-authorized please log in")
                this.toaster.showError("Your session expired. Please log in.");
                this.router.navigate(['/login']);
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
      else {
        this.router.navigate(['/login']);
      }
    }
    catch (error) {
      // Log information about an unexpected exception //
      this.logger.error('Unexpected error during check product purchasing in Shop details component method onRateClick :' + error.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }

  // Method for add respective cart to item //
  addToCart(productDet: ProductDetail): void {
    try {
      this.logger.info('Add to cart process start in shop details component method addToCart');
      const currentLoggedInUser = this.commonService.getAvailableTokensDetails();
      if (currentLoggedInUser == null) {
        this.toaster.showWarning('Kindly login to purchase product..!!');
      }
      if (currentLoggedInUser != null) {
        productDet.isAddedToCart = true;

        if (productDet.selectedOption === '1') {

          this.finalPrice = productDet.price;
          this.currentQuant = 1;
        }
        else if (productDet.selectedOption === '2') {
          this.finalPrice = productDet.price / 2;
          this.currentQuant = 0.50;
        }
        else if (productDet.selectedOption === '3') {
          this.finalPrice = productDet.price / 4;
          this.currentQuant = 0.25;
        }
        else {
          this.finalPrice = productDet.price;
          this.currentQuant = 1;
        }
        const addToCart: AddCartDetails =
        {
          productImage: productDet.image,
          productName: productDet.productName,
          price: this.finalPrice,
          subTotal: this.finalPrice,
          userId: currentLoggedInUser.userId,
          currentQuant: this.currentQuant
        }
        this.logger.info('Processing request to server in shop details component method addToCart');
        this.cartService.createCartDetails(addToCart)
          .subscribe({
            next: (response: ApiResponse<string>) => {
              // Log information about a successful cart creation //
              this.logger.info('Cart creation successful in shop details component method addToCart');
              // Handle 201 status code //
              if (response.statusCode === 201) {
                this.logger.info('Cart created successfully..');
                this.toaster.showSuccess(response.message);
              }

              this.cartService.getBagCounterDetails(currentLoggedInUser.userId)
                .subscribe({
                  next: (counter: ApiResponse<BagCounterDetails>) => {
                    // Log information about a successful bag counter fetching //
                    this.logger.info('Bag counter fetching successfull  in shop details component method addToCart');
                    // Handle 200 status code  //
                    if (counter.statusCode === 200) {
                      this.logger.info('Saving bag counter details ..');
                      if (counter.data != null) {
                        this.commonService.cartCount = counter.data.cartCounter;
                      }
                      else {
                        this.commonService.cartCount = 0;
                      }
                    }
                  },
                  error: (error) => {
                    // Log information about an error during bag counter fetching //
                    let errorMessage: string;
                    let baseMessage = 'An error occurred during bag counter fetching in Shop details component method addToCart';
                    if (error.error && error.error.message) {
                      errorMessage = baseMessage + error.error.message;
                    }
                    else {
                      errorMessage = baseMessage;
                    }
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
                    else if (error.error.statusCode === 401) {
                      this.logger.error("User un-authorized please log in")
                      this.toaster.showError("Your session expired. Please log in.");
                      this.router.navigate(['/login']);
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
            },
            error: (error: any) => {
              // Log information about an error during cart creation //
              let errorMessage: string;
              productDet.isAddedToCart = false;
              let baseMessage = 'An error occurred during cart creation in Shop details component method addToCart';
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
              else if (error.error.statusCode == 409) {
                this.logger.warn(error.error.message);
                this.toaster.showWarning(error.error.message);
                productDet.isAddedToCart = false;
              }
              else if (error.error.statusCode == 500) {
                this.logger.error(error.error.message);
                this.toaster.showError(error.error.message);
              }
              else if (error.error.statusCode === 401) {
                this.logger.error("User un-authorized please log in")
                this.toaster.showError("Your session expired. Please log in.");
                this.router.navigate(['/login']);
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
    }
    catch (error) {
      this.logger.error('Unexpected error during in Shop details component method addToCart : ' + error.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }

  // Method for refresh review //
  refreshReview(): void {
    this.showProductWithRating();
  }

  // Method for calculate price //
  calculatePrice(data: ProductDetail): number {
    switch (data.selectedOption) {
      case '1':
        return data.price; // 1 Kg
      case '2':
        return data.price / 2; // 500 gm
      case '3':
        return data.price / 4; // 250 gm
      default:
        return data.price;
    }
  }

  // Method for price dropdown change //
  onDropdownChange(event: Event, data: ProductDetail) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    data.selectedOption = selectedValue;
    data.isAddedToCart = false;
  }
}
