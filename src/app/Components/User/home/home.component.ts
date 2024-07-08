import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { ApiResponse } from 'src/app/Models/ApiResponse/api-response';
import { AddCartDetails } from 'src/app/Models/Cart/add-cart-details';
import { BagCounterDetails } from 'src/app/Models/Cart/bag-counter-details';
import { BestSellerProductsDetails } from 'src/app/Models/Home/best-seller-products-details';
import { TopProductsDetails } from 'src/app/Models/Home/top-products-details';
import { AuthService } from 'src/app/Services/Auth/auth.service';
import { CartService } from 'src/app/Services/Cart/cart.service';
import { CommonService } from 'src/app/Services/Common/common.service';
import { CustomToasterService } from 'src/app/Services/Custom-Toaster/custom-toaster.service';
import { HomeService } from 'src/app/Services/Home/home.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  // Variable Declaration //
  topCombineProducts: TopProductsDetails[] = [];
  topcategoryWiseData: TopProductsDetails[] = [];
  bestSellerProducts: BestSellerProductsDetails[] = [];
  IsVegOrFruitdata: string = null;
  finalPrice: number = 0;
  cartDetails: AddCartDetails = null;
  isLoading: boolean = false;
  isBestSellerLoading: boolean = false;


  // Constructor Initilisation //
  constructor(private homeService: HomeService,
    private logger: NGXLogger,
    private toaster: CustomToasterService,
    private commonService: CommonService,
    private cartService: CartService,
    private router: Router,
    private authService: AuthService) { }

  // On load event //
  ngOnInit(): void {
    this.commonService.scrollToTop();
    this.showAllTopProducts();
    this.showAllBestSellerProducts();
    this.authService.getCurrentBagCounterDetails();
  }

  //*************Methods**********//

  // Method for get top products details //
  showAllTopProducts(): void {
    try {
      this.isLoading = true;
      // Log information about fetching top product list //
      this.logger.info('Starting loading top product list in home component method showAllTopProducts');
      // Fetch a product from server //
      this.homeService.getTopProducts("All Products")
        .subscribe({
          next: (productdata: ApiResponse<TopProductsDetails[]>) => {
            // Handle 200 status code //
            if (productdata.statusCode === 200) {
              // Log information about a successful product fetching //
              this.logger.info('Top product list fetching successfull in home component method showAllTopProducts..showing all top products');
              if (productdata.data != null) {
                this.topCombineProducts = productdata.data;
                this.isLoading = false;
                this.topCombineProducts.forEach(element => {
                  if (element.stockQuantity <= 0) {
                    element.isQuantityAvailable = "Out of stock";
                  }
                });
              }
              else {
                this.topCombineProducts = [];
                this.isLoading = false;
              }
            }
          },
          error: (error) => {
            // Log information about an error during top product fetching //
            this.isLoading = false;
            let errorMessage: string;
            let baseMessage = 'An error occurred during top product fetching in home component method showAllTopProducts';
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
      this.logger.error('Unexpected error top product fetching in home component method showAllTopProducts : ' + error.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }

  // Method for get best seller products details //
  showAllBestSellerProducts(): void {
    try {
      this.isBestSellerLoading = true;
      // Log information about fetching best seller product list //
      this.logger.info('Starting loading best seller product list in home component method showAllBestSellerProducts');
      // Fetch a product from server //
      this.homeService.getBestSellerProducts()
        .subscribe({
          next: (productdata: ApiResponse<BestSellerProductsDetails[]>) => {
            // Handle 200 status code //
            if (productdata.statusCode === 200) {
              // Log information about a successful best seller product fetching //
              this.logger.info('Best seller product list fetching successfull in home component method showAllBestSellerProducts..showing all best seller products');
              if (productdata.data != null) {
                this.bestSellerProducts = productdata.data;
                this.isBestSellerLoading = false;
              }
              else {
                this.bestSellerProducts = [];
                this.isBestSellerLoading = false;
              }
            }
          },
          error: (error) => {
            // Log information about an error during best seller product fetching //
            this.isBestSellerLoading = false;
            let errorMessage: string;
            let baseMessage = 'An error occurred during best seller product fetching in home component method showAllBestSellerProduct';
            if (error.error && error.error.message) {
              errorMessage = baseMessage + error.error.message;
            }
            else {
              errorMessage = baseMessage;
            }
            if (error.error.statusCode == 500) {
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
      this.logger.error('Unexpected error best seller product fetching in home component method showAllBestSellerProduct : ' + error.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }

  // Method for get categorywise top products details //
  onCategoryClick(category: string): TopProductsDetails[] {
    try {
      // Log information about fetching top product list by category //
      this.isLoading = true;
      this.logger.info('Starting loading top product list by category in home component method onCategoryClick');
      // Fetch a product from server //
      this.homeService.getTopProducts(category)
        .subscribe({
          next: (productdata: ApiResponse<TopProductsDetails[]>) => {
            // Handle 200 status code //
            if (productdata.statusCode === 200) {
              // Log information about a successful product by category fetching //         
              if (category == 'Vegetables') {
                if (productdata.data != null) {
                  this.topCombineProducts = productdata.data;
                  this.IsVegOrFruitdata = 'Vegetables';
                  this.isLoading = false;
                }
              }
              else {
                if (productdata.data != null) {
                  this.topCombineProducts = productdata.data;
                  this.IsVegOrFruitdata = 'Fruits';
                  this.isLoading = false;
                }
              }
              this.logger.info("All top products details for respective category are fetched sucessfully in home component method onCategoryClick");
            }
          },
          error: (error) => {
            // Log information about an error during top product by category fetching //
            this.isLoading = false;
            let errorMessage: string;
            let baseMessage = 'An error occurred during top product by category fetching in home component method onCategoryClick';
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
              this.commonService.scrollToTop();
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
      this.logger.error('Unexpected error top product by category fetching in home component method showAllBestSellerProducts : ' + error.message);
      this.toaster.showError('An unexpected error try again later');
    }
    return this.topCombineProducts
  }

  // Method for price dropdown change //
  onDropdownChange(event: Event, topProductData: TopProductsDetails = null, bestSellerProductData: BestSellerProductsDetails = null) {
    this.logger.info('Starting dropdown change in home component method onDropdownChange');
    if (topProductData != null) {
      topProductData.isAddedToCart = false;
      const selectedValue = (event.target as HTMLSelectElement).value;
      topProductData.selectedOption = selectedValue;
    }
    if (bestSellerProductData != null) {
      bestSellerProductData.isAddedToCart = false;
      const selectedValue = (event.target as HTMLSelectElement).value;
      bestSellerProductData.selectedOption = selectedValue;
    }
    this.logger.info('Completed dropdown change in home component method onDropdownChange');
  }

  // Method for calculate price //
  calculatePrice(topProductData: TopProductsDetails = null, bestSellerProductData: BestSellerProductsDetails = null): number {
    this.logger.info('Starting calculate price in home component method calculatePrice');
    if (topProductData != null) {
      switch (topProductData.selectedOption) {
        case '1':
          return topProductData.price; // 1 Kg
        case '2':
          return topProductData.price / 2; // 500 gm
        case '3':
          return topProductData.price / 4; // 250 gm
        default:
          return topProductData.price;
      }
    }
    if (bestSellerProductData != null) {
      switch (bestSellerProductData.selectedOption) {
        case '1':
          return bestSellerProductData.price; // 1 Kg
        case '2':
          return bestSellerProductData.price / 2; // 500 gm
        case '3':
          return bestSellerProductData.price / 4; // 250 gm
        default:
          return bestSellerProductData.price;
      }
    }
    this.logger.info('Completed calculate price in home component method calculatePrice');
    return 0;
  }

  // Method for add respective cart to item //
  addToCart(topProductData: TopProductsDetails = null, bestSellerProductData: BestSellerProductsDetails = null): void {
    try {
      const currentLoggedInUser = this.commonService.getAvailableTokensDetails();
      if (currentLoggedInUser == null) {
        this.logger.warn('User is not logged in home component method addToCart');
        this.toaster.showWarning('Kindly login to purchase product..!!');
      }
      if (currentLoggedInUser != null) {
        this.logger.info('User is logged in sucessfull in home component method addToCart');
        if (topProductData != null) {
          topProductData.isAddedToCart = true;

          if (topProductData.selectedOption === '1') {
            this.finalPrice = topProductData.price;
          }
          else if (topProductData.selectedOption === '2') {
            this.finalPrice = topProductData.price / 2;
          }
          else if (topProductData.selectedOption === '3') {
            this.finalPrice = topProductData.price / 4;
          }
          else {
            this.finalPrice = topProductData.price;
          }
          this.logger.info('Creating top product data in home component method addToCart..');
          this.cartDetails =
          {
            productImage: topProductData.productImage,
            productName: topProductData.productName,
            price: this.finalPrice,
            subTotal: this.finalPrice,
            userId: currentLoggedInUser.userId,
            currentQuant: 1
          }
        }
        this.logger.info('Creating top product data sucessfull in home component method addToCart..');
        if (bestSellerProductData != null) {
          bestSellerProductData.isAddedToCart = true;

          if (bestSellerProductData.selectedOption === '1') {
            this.finalPrice = bestSellerProductData.price;
          }
          else if (bestSellerProductData.selectedOption === '2') {
            this.finalPrice = bestSellerProductData.price / 2;
          }
          else if (bestSellerProductData.selectedOption === '3') {
            this.finalPrice = bestSellerProductData.price / 4;
          }
          else {
            this.finalPrice = bestSellerProductData.price;
          }
          this.logger.info('Creating best seller product data in home component method addToCart..');
          this.cartDetails =
          {
            productImage: bestSellerProductData.image,
            productName: bestSellerProductData.productName,
            price: this.finalPrice,
            subTotal: this.finalPrice,
            userId: currentLoggedInUser.userId,
            currentQuant: 1
          }
          this.logger.info('Creating best seller product data sucessfull in home component method addToCart..');
        }

        this.cartService.createCartDetails(this.cartDetails)
          .subscribe({
            next: (response: ApiResponse<string>) => {
              // Log information about a successful cart creation //
              this.logger.info('Cart creation successful in home component method addToCart..');
              // Handle 201 status code //
              if (response.statusCode === 201) {
                this.logger.info('Item added successfully in home component method addToCart..');
                this.toaster.showSuccess(response.message);
              }
              this.cartService.getBagCounterDetails(currentLoggedInUser.userId)
                .subscribe({
                  next: (counter: ApiResponse<BagCounterDetails>) => {
                    // Log information about a successful bag counter fetching //
                    this.logger.info('Bag counter fetching successfull in home component method addToCart');

                    // Handle 200 status code  //
                    if (counter.statusCode === 200 && counter.data != null) {
                      this.logger.info('Saving bag counter details in home component method addToCart');
                      this.commonService.cartCount = counter.data.cartCounter;
                    }
                    else if (counter.statusCode === 200 && counter.data == null) {
                      this.commonService.cartCount = 0;
                    }
                  },
                  error: (error) => {
                    // Log information about an error during bag counter fetching //
                    let errorMessage: string;
                    let baseMessage = 'An error occurred during get bag counter details in home component method addToCart';
                    if (error.error && error.error.message) {
                      errorMessage = baseMessage + error.error.message;
                    }
                    else {
                      errorMessage = baseMessage;
                    }
                    // Handle different HTTP status codes
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
              if (topProductData != null) {
                topProductData.isAddedToCart = false;
              }
              if (bestSellerProductData != null) {
                bestSellerProductData.isAddedToCart = false;
              }
              let errorMessage = 'An error occurred during cart creation API call in home component method addToCart..';
              if (error.error && error.error.message) {
                errorMessage = error.error.message;
              }
              // Handle different HTTP status codes //
              if (error.error.statusCode == 400) {
                this.logger.error(error.error.message);
                this.toaster.showError(error.error.message);
              }
              else if (error.error.statusCode == 409) {
                this.logger.warn(error.error.message);
                this.toaster.showWarning(error.error.message);
                if (topProductData != null) {
                  topProductData.isAddedToCart = false;
                }
                if (bestSellerProductData != null) {
                  bestSellerProductData.isAddedToCart = false;
                }
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
                this.logger.error('Error during cart creation in home component method addToCart : ' + errorMessage);
                this.toaster.showError('Server error try again later');
              }
            }
          });
      }
    }
    catch (error) {
      if (topProductData != null) {
        topProductData.isAddedToCart = false;
      }
      if (bestSellerProductData != null) {
        bestSellerProductData.isAddedToCart = false;
      }
      this.logger.error('Unexpected error during add to cart in home component method addToCart : ' + error.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }

  // Method for navigate to specific product details //
  navigateToDetails(event: Event, prodId: number, prodPrice: number, prodQuantity: string): void {
    this.logger.info('Navigating to specific component starts in home component method navigateToDetails');
    event.preventDefault();
    const productWithQuantityDetails =
    {
      productId: prodId,
      price: prodPrice,
      selectedOption: prodQuantity
    };
    this.router.navigate(['/shop-details', prodId], { state: productWithQuantityDetails });
    this.logger.info('Navigating to specific component completed in home component method navigateToDetails');
  }
}
