import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { ApiResponse } from 'src/app/Models/ApiResponse/api-response';
import { BagCounterDetails } from 'src/app/Models/Cart/bag-counter-details';
import { CartDetails } from 'src/app/Models/Cart/cart-details';
import { CartWithTotalDetails } from 'src/app/Models/Cart/cart-with-total-details';
import { PriceDetails } from 'src/app/Models/Cart/price-details';
import { UpdateCartDetails } from 'src/app/Models/Cart/update-cart-details';
import { CartService } from 'src/app/Services/Cart/cart.service';
import { CommonService } from 'src/app/Services/Common/common.service';
import { CustomToasterService } from 'src/app/Services/Custom-Toaster/custom-toaster.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {

  // Variable declaration //
  deleteStatus: boolean = false;
  errorMessage: string = null;
  currentQuantity: string = null;
  isLoading: boolean = false;
  finalTotalQuantity: number = 0;

  // Constructor initiliasation //
  constructor(private commonService: CommonService,
    public cartService: CartService,
    private toaster: CustomToasterService,
    private logger: NGXLogger,
    private router: Router) { }

  // On load function //
  ngOnInit(): void {
    this.commonService.scrollToTop();
    this.showAllCartItemsDetails();
  }

  //*******************Methods**********************//

  // Method for showing all cart items list //
  showAllCartItemsDetails() {
    try {
      // Log information about fetching cart items list //
      this.commonService.scrollToTop();
      this.logger.info('Starting loading cart item list in cart component method showAllCartItemsDetails');
      this.isLoading = true;
      const currentUser = this.commonService.getAvailableTokensDetails();
      if (currentUser != null) {
        // Fetch a address from server //
        this.cartService.getProductsCartDetails(currentUser.userId)
          .subscribe({
            next: (response: ApiResponse<CartWithTotalDetails>) => {
              // Handle 200 status code //
              if (response.statusCode === 200 && response.data != null) {
                // Log information about a successful cart items fecthing //
                this.isLoading = false;
                this.logger.info('cart items list fetching successfull in cart component method showAllCartItemsDetails..showing all cart items');
                this.cartService.currentCartDetails = response.data.cartDetails;
                this.cartService.currentPriceDetails = response.data.priceDetails;
                this.getBagCounterDetails();
              }
              else if (response.statusCode === 200 && response.data == null) {
                this.isLoading = false;
                this.logger.info('cart items list fetching failed in cart component method showAllCartItemsDetails..fail to show all cart items');
                this.cartService.currentCartDetails = [];
                this.cartService.currentPriceDetails = null;
                this.getBagCounterDetails();
              }
            },
            error: (error) => {
              // Log information about an error during cart items list //
              this.isLoading = false;
              let errorMessage: string;
              let baseMessage = 'An error occurred during cart items list fetching in cart component method showAllCartItemsDetails';
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
              else if (error.error.statusCode == 404) {
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
    } catch (error) {
      // Log information about an unexpected exception //
      this.isLoading = false;
      this.logger.error('Unexpected error in cart component method showAllCartItemsDetails : ' + error.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }

  //Method for delete cart item //
  deleteCartItem(cartId: number): void {
    try {
      // Log information about starting deletion of cart item //
      this.logger.info('Starting deletion of cart item in cart components method deleteCartItem');
      // Send a deletion request to the server
      this.cartService.deleteCartItemById(cartId)
        .subscribe({
          next: () => {
            // Handle 204 status code //
            {
              // Log information about a successful cart item deletion //
              this.deleteStatus = true;
              this.logger.info('cart item deletion successful in cart components method deleteCartItem');
              this.toaster.showSuccess("cart item removed successfully");
              this.getBagCounterDetails();
              this.showAllCartItemsDetails();
            }
          },
          error: (error) => {
            this.deleteStatus = true;
            let errorMessage: string;
            let baseMessage = 'An error occurred during cart deletion in cart component method deleteCartItem';
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
      // Log information about an unexpected exception
      this.deleteStatus = true;
      this.logger.error('Unexpected error during cart item deletion in cart component method deleteCartItem : ', error.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }

  // Method for adjust increase cart details //
  increaseCartDetails(cartDetails: CartDetails, priceDetails: PriceDetails): void {
    try {
      this.logger.info('Updating cart item details in cart component method increaseCartDetails');

      if (cartDetails !== null && priceDetails !== null) {
        if (cartDetails.currentQuant == 0.25) {
          this.finalTotalQuantity = 0.25
        }
        else if (cartDetails.currentQuant == 0.50) {
          this.finalTotalQuantity = 0.50
        }
        else {
          this.finalTotalQuantity = 1
        }
        const updateCart: UpdateCartDetails = {
          cartId: cartDetails.cartId,
          productName: cartDetails.productName,
          price: cartDetails.price,
          quantity: cartDetails.quantity,
          userId: cartDetails.userId,
          subTotal: priceDetails.subTotal,
          increaseOrDecrease: 'I',
          totalQuant: this.finalTotalQuantity
        };
        this.logger.info('Updating cart item details API call in cart component method increaseCartDetails');
        if (updateCart.quantity >= 10) {
          this.toaster.showWarning("Maximum 10 items can be added for an order..");
          return
        }
        this.isLoading = true;
        this.cartService.updateCartDetails(updateCart)
          .subscribe({
            next: (response: ApiResponse<string>) => {
              // Handle 200 status code //
              if (response.statusCode === 200) {
                // Log information about a successful update cart items //
                this.logger.info('Updating cart item details sucessfull in cart component method increaseCartDetails..showing all cart items');
                this.showAllCartItemsDetails();
                this.isLoading = false;
                if (cartDetails.quantity < 10) {
                  this.toaster.showSuccess(response.message);
                }
              }
            },
            error: (error) => {
              // Log information about an error during update cart items  //
              let errorMessage: string;
              this.isLoading = false;
              let baseMessage = 'An error occurred during update cart items list in cart component method increaseCartDetails';
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
              else if (error.error.statusCode == 500) {
                this.logger.error(errorMessage);
                this.toaster.showError(error.error.message);
              }
              else if (error.error.statusCode == 404) {
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
    }
    catch (error) {
      // Log information about an unexpected exception //
      this.isLoading = false;
      this.logger.error('Unexpected error during update cart item in cart component method increaseCartDetails : ', error.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }

  // Method for adjust decrease cart details //
  decreaseCartDetails(cartDetails: CartDetails, priceDetails: PriceDetails): void {
    try {
      this.logger.info('Updating cart item details in cart component method decreaseCartDetails');
      if (cartDetails !== null && priceDetails !== null) {
        if (cartDetails.currentQuant == 0.25) {
          this.finalTotalQuantity = 0.25
        }
        else if (cartDetails.currentQuant == 0.50) {
          this.finalTotalQuantity = 0.50
        }
        else {
          this.finalTotalQuantity = 1
        }
        const updateCart: UpdateCartDetails = {
          cartId: cartDetails.cartId,
          productName: cartDetails.productName,
          price: cartDetails.price,
          quantity: cartDetails.quantity,
          userId: cartDetails.userId,
          subTotal: priceDetails.subTotal,
          increaseOrDecrease: 'D',
          totalQuant: this.finalTotalQuantity
        };
        this.logger.info('Updating cart item details API call in cart component method decreaseCartDetails');
        this.isLoading = true;
        this.cartService.updateCartDetails(updateCart)
          .subscribe({
            next: (response: ApiResponse<string>) => {
              // Handle 200 status code //
              if (response.statusCode === 200) {
                // Log information about a successful update cart items //
                this.logger.info('Updating cart item details sucessfull in cart component method decreaseCartDetails..showing all cart items');
                this.showAllCartItemsDetails();
                this.isLoading = false;
                if (cartDetails.quantity <= 10) {
                  this.toaster.showSuccess(response.message);
                }
              }
            },
            error: (error) => {
              // Log information about an error during update cart items  //
              this.isLoading = false;
              let errorMessage: string;
              let baseMessage = 'An error occurred during update cart items list in cart component method decreaseCartDetails';
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
              else if (error.error.statusCode == 500) {
                this.logger.error(errorMessage);
                this.toaster.showError(error.error.message);
              }
              else if (error.error.statusCode == 404) {
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
    }
    catch (error) {
      // Log information about an unexpected exception //
      this.isLoading = false;
      this.logger.error('Unexpected error during update cart item in cart component method decreaseCartDetails : ', error.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }

  // Method for get bag counter details //
  getBagCounterDetails(): void {
    const currentLoggedInUser = this.commonService.getAvailableTokensDetails();
    if (currentLoggedInUser != null) {
      this.cartService.getBagCounterDetails(currentLoggedInUser.userId)
        .subscribe({
          next: (counter: ApiResponse<BagCounterDetails>) => {
            // Log information about a successful bag counter fetching //
            this.logger.info('Bag counter fetching successfull in cart components method deleteCartItem');

            // Handle 200 status code  //
            if (counter.statusCode === 200 && counter.data != null) {
              this.logger.info('Saving bag counter details in cart components method deleteCartItem');
              this.commonService.cartCount = counter.data.cartCounter;
            }
            else if (counter.statusCode === 200 && counter.data == null) {
              this.commonService.cartCount = 0;
            }
          },
          error: (error) => {
            // Log information about an error during bag counter fetching //
            let errorMessage: string;
            let baseMessage = 'An error occurred during get bag counter details in cart component method deleteCartItem';
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
    }
  }
}