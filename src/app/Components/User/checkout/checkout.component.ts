import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { AddAddressDetails } from 'src/app/Models/Address/add-address-details';
import { AddressDetails } from 'src/app/Models/Address/address-details';
import { PostalResponse } from 'src/app/Models/Address/postal-response';
import { ApiResponse } from 'src/app/Models/ApiResponse/api-response';
import { BagCounterDetails } from 'src/app/Models/Cart/bag-counter-details';
import { CartDetails } from 'src/app/Models/Cart/cart-details';
import { CartWithTotalDetails } from 'src/app/Models/Cart/cart-with-total-details';
import { PriceDetails } from 'src/app/Models/Cart/price-details';
import { AddOrderDetails } from 'src/app/Models/Order/add-order-details';
import { CompleteOrder } from 'src/app/Models/Order/complete-order';
import { OrderCartDetails } from 'src/app/Models/Order/order-cart-details';
import { OrderDetails } from 'src/app/Models/Order/order-details';
import { AddressService } from 'src/app/Services/Address/address.service';
import { CartService } from 'src/app/Services/Cart/cart.service';
import { CommonService } from 'src/app/Services/Common/common.service';
import { CustomToasterService } from 'src/app/Services/Custom-Toaster/custom-toaster.service';
import { OrderService } from 'src/app/Services/Order/order.service';
import { WindowRefServiceService } from 'src/app/Services/WindowRefService/window-ref-service.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  //Variable declaration //
  addressList: AddressDetails[] = [];
  postalText: string = null;
  cityText: string = null;
  stateText: string = null;
  countryText: string = null;
  city: string = null;
  state: string = null;
  country: string = null;
  isdisbaled: boolean = false;
  deleteStatus: boolean = false;
  errorMessage: string = null;
  isFormVisible: boolean = false;
  addressForm: UntypedFormGroup;
  modeOfPayment: string = null;
  processedOrder: OrderDetails = null;
  finalOrderCartDetails: OrderCartDetails[] = [];
  paymentCheckCounter: number = 0;
  addAddressLoading: boolean = false;
  onOrderPlacedLoading: boolean = false;


  // Constructor initiliasation //
  constructor(private logger: NGXLogger,
    private toaster: CustomToasterService,
    public addressService: AddressService,
    public commonService: CommonService,
    public formBuilder: FormBuilder,
    public cartService: CartService,
    private orderService: OrderService,
    public winRef: WindowRefServiceService,
    private router: Router) { }

  // On load function //
  ngOnInit(): void {
    this.addressForm = this.formBuilder.group({
      FirstName: ['', Validators.required],
      LastName: ['', Validators.required],
      Address: ['', Validators.required],
      PostalCode: ['', [Validators.required, this.postalCodeValidator(), this.numberValidator()]],
      Mobile: ['', [Validators.required, this.mobileValidator(), this.numberValidator()]],
      Email: ['', [Validators.required, Validators.email]]
    });
    this.commonService.scrollToTop();
    this.showAllAddress();
    this.showAllCartItemsDetails();
  }

  /*******************Methods**********************/

  // Method for showing all address list //
  showAllAddress() {
    try {
      // Log information about fetching address list //
      this.logger.info('Starting loading address list in check out component method showAllAddress');
      const currentLoggedInUserId = this.commonService.getAvailableTokensDetails().userId;
      // Fetch a address from server //
      this.addressService.getAllAddressDetailsByUserId(currentLoggedInUserId)
        .subscribe({
          next: (response: ApiResponse<AddressDetails[]>) => {

            // Handle 200 status code
            if (response.statusCode === 200 && response.data != null) {
              // Log information about a successful address fecthing //
              this.logger.info('Address list fetching successfull..showing all address in check out component method showAllAddress');
              this.addressList = response.data;
              if (this.addressList.length === 1) {
                this.commonService.scrollToTop();
                this.addressList.forEach(element => {
                  element.isCurrentSelected = 'Y';
                });
              }
            }
            else if (response.statusCode === 200 && response.data == null) {
              this.addressList = [];
            }
          },
          error: (error) => {
            // Log information about an error during address fetching //
            let errorMessage: string;
            let baseMessage = 'An error occurred during address list fetching in check out component method showAllAddress';
            if (error.error && error.error.message) {
              errorMessage = baseMessage + error.error.message;
            }
            else {
              errorMessage = baseMessage;
            }
            if (error.error.statusCode == 400) {
              this.logger.error(error.error.message);
              this.toaster.showError(error.error.message);
            }
            else if (error.error.statusCode == 404) {
              this.logger.error(error.error.message);
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
    } catch (error) {
      this.logger.error('Unexpected error address fecthing in check out component method showAllAddress : ' + error.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }

  // Method for change in postal code //
  handlePostalCodeChange(event: Event): void {
    const postalCodeValue = (event.target as HTMLInputElement).value;
    const postalCode = +postalCodeValue;
    try {
      // Log information about chane in postal code //
      this.logger.info('Starting fetching city state and country in check out component method handlePostalCodeChange');

      // Fetch a  city state and country from server //
      this.addressService.getCityAndStateByPostalCode(postalCode)
        .subscribe({
          next: (response: PostalResponse) => {

            // Handle response //
            if (response[0].Status === 'Success' && response[0].PostOffice != null) {

              // Log information about a successful city state and country fecthing //
              this.logger.info('City state and country fetching successfull..showing all list in check out component method handlePostalCodeChange');
              this.cityText = response[0].PostOffice[0].Block;
              this.stateText = response[0].PostOffice[0].State;
              this.countryText = response[0].PostOffice[0].Country;
              this.isdisbaled = true;
            }
            else if (response[0].Status === 'Error' && response[0].PostOffice == null) {
              // Log information about a unsuccessful  city state and country fecthing //        
              this.logger.info('City state and country fetching failed...no list available in check out component method handlePostalCodeChange');
              this.cityText = '';
              this.stateText = '';
              this.countryText = '';
              this.isdisbaled = false;
            }

          },
        });

    } catch (error: any) {
      // Log information about an unexpected exception //
      this.isdisbaled = false;
      this.logger.error('Unexpected error city state and country in check out component method handlePostalCodeChange' + error.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }

  //Method for address checkbox checked uncheked event //
  onAddressCheckBoxChange(event: Event, address: AddressDetails): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      try {
        address.isCurrentSelected = 'Y';
        this.addressService.UpdateAddressSelectionById(address.addressId, address.isCurrentSelected)
          .subscribe({
            next: (response: ApiResponse<string>) => {
              // Log information about a successful update address selection //
              this.logger.info('Update address selection successful in check out component method onAddressCheckBoxChange');

              // Handle 200 status code //
              if (response.statusCode === 200) {
                this.toaster.showSuccess(response.message);
              }
            },
            error: (error) => {
              // Log information about an error during update address selection //
              let errorMessage: string;
              let baseMessage = 'An error occurred during update address selection in check out component method onAddressCheckBoxChange';
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
              if (error.error.statusCode == 404) {
                this.logger.error(error.error.message);
                this.toaster.showError(error.error.message);
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
      } catch (error) {
        // Log information about an error during update address selection //
        this.logger.error('Error during update address selection in check out component method onAddressCheckBoxChange : ' + error.message);
        this.toaster.showError('An unexpected error try again later');
      }
    }
  }

  //Method for delete address details//
  deleteAddressDetails(addressId: number): void {
    try {
      // Log information about starting deletion of address //
      this.logger.info('Starting deletion of address in check out component method deleteAddressDetails');
      // Send a deletion request to the server
      this.addressService.deleteAddressById(addressId)
        .subscribe({
          next: () => {
            // Handle 204 status code
            {
              // Log information about a successful address deletion    
              this.deleteStatus = true;
              this.logger.info('Address deletion successful in check out component method deleteAddressDetails');
              this.toaster.showSuccess("Address deleted successfully");
              this.commonService.scrollToTop();
              this.showAllAddress();
            }
          },
          error: (error) => {
            this.deleteStatus = true;
            let errorMessage: string;
            let baseMessage = 'An error occurred during address deletion in check out component method deleteAddressDetails';
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
      this.deleteStatus = true;
      this.logger.error('Unexpected error during address deletion in check out component method deleteAddressDetails : ', error.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }

  // Method for add address click //
  addAddressClick() {
    this.isFormVisible = !this.isFormVisible;
  }

  //Method for Onsubmit //
  onSubmit(): void {
    try {
      // Log information about starting the form submission //
      this.logger.info('Starting onSubmit in check out component method onSubmit');
      this.commonService.scrollToTop();
      this.addAddressLoading = true;
      // Stop here if the form is invalid //
      if (this.addressForm.invalid) {
        // Display an error message and log a warning //
        this.toaster.showError('Please fill in all required fields.');
        this.logger.warn('Form submission aborted due to invalid form.');
        return;
      }
      const currentUser = this.commonService.getAvailableTokensDetails();
      if (currentUser != null) {
        // Create a addressForm object from the form values //
        const address: AddAddressDetails = {
          firstName: this.f['FirstName'].value,
          lastName: this.f['LastName'].value,
          streetAddress: this.f['Address'].value,
          postalCode: this.f['PostalCode'].value,
          userRole: 'user',
          city: this.cityText,
          state: this.stateText,
          country: this.countryText,
          phoneNumber: this.f['Mobile'].value,
          email: this.f['Email'].value,
          userId: currentUser.userId,
        };
        // Log the created address object //
        this.logger.info('Address object created in check out component method onSubmit :', address);
        // Send a registration request to the server //
        this.addressService.createAddressDetails(address)
          .subscribe({
            next: (response: ApiResponse<string>) => {
              // Log information about a successful address creation //
              this.logger.info('Address creation successful in check out component method onSubmit');
              // Handle 201 status code //
              if (response.statusCode === 201) {
                this.toaster.showSuccess(response.message);
                this.addAddressLoading = false;
                this.isFormVisible = false;
                this.showAllAddress();
                this.addressForm.reset();
                this.postalText = null;
                this.cityText = null;
                this.stateText = null;
                this.countryText = null;
                this.f['PostalCode'].enable();
                this.isdisbaled = false;
              }
            },
            error: (error) => {
              // Log information about an error during address creation //
              let errorMessage: string;
              this.addAddressLoading = false;
              let baseMessage = 'An error occurred during address creation in check out component method onSubmit';
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
      // Log information about an unexpected exception //
      this.addAddressLoading = false;
      this.logger.error('Unexpected error during address creation in check out component method onSubmit :' + error.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }

  // Method to get form control //
  get f(): { [key: string]: AbstractControl } {
    return this.addressForm.controls;
  }

  // Custom validator function for mobile number check //
  mobileValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const mobileNumber = control.value;
      // Regular expression to match 10-digit numeric mobile numbers //
      const mobilePattern = /^[0-9]{10}$/;

      // Check if mobile number matches the pattern //
      if (!mobilePattern.test(mobileNumber)) {
        // Return validation error if mobile number doesn't match pattern //
        return { 'invalidMobile': true };
      }
      // Return null if mobile number is valid //
      return null;
    };
  }

  // Custom validator function for postal code check //
  postalCodeValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const postalCode = control.value;
      // Regular expression to match 6-digit numeric postal codes //
      const postalPattern = /^[0-9]{6}$/;
      // Check if postal code matches the pattern
      if (!postalPattern.test(postalCode)) {
        // Return validation error if postal code doesn't match pattern //
        return { 'invalidPostalCode': true };
      }
      // Return null if postal code is valid //
      return null;
    };
  }

  // Custom validator function for numeric input check //
  numberValidator(): ValidatorFn {
    return (control): { [key: string]: any } | null => {
      const value = control.value;
      if (isNaN(value)) {
        return { 'notANumber': true };
      }
      return null;
    };
  }

  // Method for order processing and payment i.e COD or Online //
  onPlaceOrderClick(cartDetails: CartDetails[], priceDetails: PriceDetails): void {
    try {
      if (this.addressList.length == 0) {
        this.logger.error('Address is not selected in check out component method onPlaceOrderClick');
        this.toaster.showWarning("Kindly Select Address For Delivery..");
        return;
      }

      if (this.modeOfPayment == null) {
        this.logger.error('Mode of payment is not selected in check out component method onPlaceOrderClick');
        this.toaster.showWarning("Kindly Select Mode Of Payment..");
        return;
      }

      // Log information about starting the form submission //
      this.logger.info('Starting onSubmit in check out component method onPlaceOrderClick');
      this.onOrderPlacedLoading = true;
      // Get current logged in user //
      const currentUser = this.commonService.getAvailableTokensDetails();
      // Create a order cart details object from the form values //
      cartDetails.forEach(element => {
        const orderCartDetails: OrderCartDetails = {
          productImage: element.productImage,
          productName: element.productName,
          price: element.price,
          quantity: element.quantity
        };
        this.finalOrderCartDetails.push(orderCartDetails);
      });
      if (currentUser != null) {
        // Create a order object from the form values //
        const order: AddOrderDetails = {
          cartDetails: this.finalOrderCartDetails,
          subTotal: priceDetails.subTotal,
          charges: priceDetails.charges,
          total: priceDetails.total,
          userId: currentUser.userId,
          modeOfPayment: this.modeOfPayment
        };

        // Log the created order object //
        this.logger.info('order object created in check out component method onPlaceOrderClick :', order);

        // Send a registration request to the server //
        this.orderService.createOrderDetails(order)
          .subscribe({
            next: (response: ApiResponse<OrderDetails>) => {
              // Log information about a successful order creation //
              this.logger.info('Order processing and payment successful in check out component method onPlaceOrderClick');

              // Handle 201 status code //
              if (response.statusCode === 201) {
                if (this.modeOfPayment === 'Cash-On-Delivery') {
                  this.router.navigate(['/order-sucess']);
                  this.isFormVisible = false;
                  this.processedOrder = response.data;
                  this.onOrderPlacedLoading = false;
                  this.getBagCounterDetails();
                }
                else {
                  this.payWithRazor(response.data.amountDue, response.data.orderId, response.data.razorPayOrderId);
                  this.isFormVisible = false;
                  this.processedOrder = response.data;
                  this.onOrderPlacedLoading = false;
                }
              }
            },
            error: (error) => {
              // Log information about an error during order creation //
              this.onOrderPlacedLoading = false;
              let errorMessage: string;
              let baseMessage = 'An error occurred during order creation in checkout component method onPlaceOrderClick';
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
      // Log information about an unexpected exception //
      this.onOrderPlacedLoading = false;
      this.logger.error('Unexpected error during order processing and payment in checkout component method onPlaceOrderClick :' + error.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }

  // Method for change pay online checkbox //
  onPayOnlineChange(event: any): void {
    const paymentMethod = (event.target as HTMLInputElement).value;
    if (paymentMethod != null) {
      this.modeOfPayment = paymentMethod;
      this.toaster.showWarning("Heads up !! All online sales are final and non-refundable..");
    }
  }

  // Method for change pay cash on delivery checkbox //
  onCashOnDeliveryChange(event: any): void {
    const paymentMethod = (event.target as HTMLInputElement).value;
    if (paymentMethod != null) {
      this.modeOfPayment = paymentMethod;
    }
  }

  // Method for order payment in razorpay gateway //
  payWithRazor(amount: number, orderId: number, razorpayOrderId: string) {
    try {
      const options: any = {
        key: environment.razorPayKey,
        amount: amount * 100,
        currency: 'INR',
        name: 'Fruitables Payment',
        description: 'Fruitables payment section',
        image: 'assets/featur-1.jpg',
        order_id: razorpayOrderId,
        modal: {
          // We should prevent closing of the form when esc key is pressed.
          escape: false,
        },
        notes: {
          'Fruitables': 'Added payment for fruitables'
        },
        theme: {
          color: '#0c238a'
        }
      };

      // Get current logged in user //
      const currentUser = this.commonService.getAvailableTokensDetails();
      if (currentUser != null) {
        options.handler = ((response: any) => {
          options.response = response;

          // Create a complete order object from the form values //
          const completeOrder: CompleteOrder = {
            orderId: orderId,
            razorpayOrderId: razorpayOrderId,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            modeOfPayment: this.modeOfPayment,
            userId: currentUser.userId,
          };
          // Send a registration request to the server //
          this.orderService.completeOrder(completeOrder)
            .subscribe({
              next: (response: ApiResponse<string>) => {
                // Log information about a successful order process and payment creation //
                this.logger.info('Order process and payment creation successful in check out component method payWithRazor');
                // Handle 200 status code //
                if (response.statusCode === 200) {
                  this.toaster.showSuccess(response.message);
                  this.getBagCounterDetails();
                  this.router.navigate(['/order-sucess']);
                }
              },
              error: (error) => {
                // Log information about an error during order process and payment creation //

                let errorMessage: string;
                let baseMessage = 'An error occurred during order process and payment creation in checkout component method payWithRazor';
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
        });
        options.modal.ondismiss = (() => {
          // handle the case when user closes the form while transaction is in progress //
          this.toaster.showError('Transaction cancelled');

          this.logger.error('Transaction cancelled in check out component method payWithRazor');
        });
        //invoke the JS library. This service implemeted above was dependecy injected //
        const rzp = new this.winRef.nativeWindow.Razorpay(options);
        rzp.open();
      }

    }
    catch (e: any) {

      this.toaster.showError("Something went wrong");
      this.logger.error('unexpected error in check out component method payWithRazor');
    }
  }

  // Method for show all cart details //
  showAllCartItemsDetails() {
    try {
      // Log information about fetching cart items list //
      this.commonService.scrollToTop();
      this.logger.info('Starting loading cart item list in checkout component method showAllCartItemsDetails');
      //this.isLoading = true;
      const currentUser = this.commonService.getAvailableTokensDetails();
      if (currentUser != null) {
        // Fetch a address from server //
        this.cartService.getProductsCartDetails(currentUser.userId)
          .subscribe({
            next: (response: ApiResponse<CartWithTotalDetails>) => {
              // Handle 200 status code //
              if (response.statusCode === 200 && response.data != null) {
                // Log information about a successful cart items fecthing //
                //this.isLoading = false;
                this.logger.info('cart items list fetching successfull in checkout component method showAllCartItemsDetails..showing all cart items');
                this.commonService.scrollToTop();
                this.cartService.currentCartDetails = response.data.cartDetails;
                this.cartService.currentPriceDetails = response.data.priceDetails;
              }
            },
            error: (error) => {
              // Log information about an error during cart items list //
              // this.isLoading = false;
              let errorMessage: string;
              let baseMessage = 'An error occurred during cart items list fetching in checkout component method showAllCartItemsDetails';
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
                this.cartService.currentCartDetails = [];
                this.cartService.currentPriceDetails = null;
                this.commonService.cartCount = 0;
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
      //this.isLoading = false;
      this.logger.error('Unexpected error in checkout component method showAllCartItemsDetails : ' + error.message);
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
            this.logger.info('Bag counter fetching successfull in checkout components method getBagCounterDetails');

            // Handle 200 status code  //
            if (counter.statusCode === 200 && counter.data != null) {
              this.logger.info('Saving bag counter details in checkout components method getBagCounterDetails');
              this.commonService.cartCount = counter.data.cartCounter;
            }
            else if (counter.statusCode === 200 && counter.data == null) {
              this.commonService.cartCount = 0;
            }
          },
          error: (error) => {
            // Log information about an error during bag counter fetching //
            let errorMessage: string;
            let baseMessage = 'An error occurred during get bag counter details in checkout components method getBagCounterDetails';
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


