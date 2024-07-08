import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { AddressDetails } from 'src/app/Models/Admin-Order/address-details';
import { AdminOrder } from 'src/app/Models/Admin-Order/admin-order';
import { OrderDetails } from 'src/app/Models/Admin-Order/order-details';
import { OrderStatusDetails } from 'src/app/Models/Admin-Order/order-status-details';
import { UserDetails } from 'src/app/Models/Admin-Order/user-details';
import { ApiResponse } from 'src/app/Models/ApiResponse/api-response';
import { UpdateOrderStatus } from 'src/app/Models/Order/update-order-status';
import { CommonService } from 'src/app/Services/Common/common.service';
import { CustomToasterService } from 'src/app/Services/Custom-Toaster/custom-toaster.service';
import { OrderService } from 'src/app/Services/Order/order.service';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.css']
})
export class OrderDetailsComponent {
  // Variable declaration //
  orderId: number;
  adminOrders: AdminOrder[] = [];
  detailsAdminOrders: AdminOrder[] = [];
  userDetails: UserDetails = null;
  addressDetails: AddressDetails = null;
  orderDetails: OrderDetails[] = [];
  orderStatusDetails: OrderStatusDetails[] = [];
  selectedOption: string = 'Placed';
  isAllCancelled: boolean = false;


  // Constructor  initialisation //
  constructor(private route: ActivatedRoute,
    private commonService: CommonService,
    private logger: NGXLogger,
    private orderService: OrderService,
    private toaster: CustomToasterService,
    private router: Router
  ) { }

  // On load event //
  ngOnInit() {
    this.commonService.scrollToTop();
    this.route.paramMap.subscribe(params => {
      this.orderId = parseInt(params.get('id'), 10);
    });
    this.getAllAdminOrders();
  }

  //*************Methods******************//
  // Method for showing all admin order list //
  getAllAdminOrders() {
    try {
      // Log information about fetching orders list //
      this.logger.info('Starting loading orders list in order details component method getAllAdminOrders');
      // Fetch a address from server //
      this.orderService.getAllAdminOrders()
        .subscribe({
          next: (response: ApiResponse<AdminOrder[]>) => {

            // Handle 200 status code
            if (response.statusCode === 200) {
              // Log information about a successful orders fecthing //
              this.logger.info('Orders list fetching successfull..showing all orders in order details component method getAllAdminOrders');
              if (response.data == null) {
                this.commonService.scrollToTop();
                this.adminOrders = [];
                return
              }
              this.adminOrders = response.data;
              let detailsAdminOrdersCount: number = 0;
              let statusCount: number = 0;
              this.detailsAdminOrders = this.adminOrders.filter(order => order.orderId === this.orderId);
              this.detailsAdminOrders.forEach(item => {
                if (item.razorPayOrderId == null) {
                  item.razorPayOrderId = 'No Id Availabe';
                }
                if (item.updateByAdminId == null) {
                  item.updateByAdminId = 'Status Not Updated By Admin'
                }
                this.userDetails = {
                  userId: item.userId,
                  userName: item.userName,
                  userEmail: item.userEmail
                };

                this.addressDetails = {
                  firstName: item.firstName,
                  lastName: item.lastName,
                  streetAddress: item.streetAddress,
                  postalCode: item.postalCode,
                  city: item.city,
                  state: item.state,
                  country: item.country,
                  phoneNumber: item.phoneNumber,
                  addressEmail: item.addressEmail
                };

                const order: OrderDetails = {
                  orderId: item.orderId,
                  productImage: item.productImage,
                  productName: item.productName,
                  price: item.price,
                  quantity: item.quantity,
                  subTotal: item.subTotal,
                  total: item.total,
                  receipt: item.receipt,
                  orderDetails: item.orderDetails,
                  razorPayOrderId: item.razorPayOrderId,
                  modeOfPayment: item.modeOfPayment
                };
                this.orderDetails.push(order);

                const orderStatus: OrderStatusDetails = {
                  orderStatusId: item.orderStatusId,
                  orderStatusDetails: item.orderStatusDetails,
                  updateByAdminId: item.updateByAdminId,
                  created_at: item.created_at,
                  updated_at: item.updated_at
                };
                this.orderStatusDetails.push(orderStatus);

                if (orderStatus.orderStatusDetails == 'Placed') {
                  this.selectedOption = 'Placed'
                }
                else if (orderStatus.orderStatusDetails == 'Confirmed') {
                  this.selectedOption = 'Confirmed'
                }
                else if (orderStatus.orderStatusDetails == 'Shipped') {
                  this.selectedOption = 'Shipped'
                }

                else if (orderStatus.orderStatusDetails == 'Out For Delivery') {
                  this.selectedOption = 'Out For Delivery'
                }

                else if (orderStatus.orderStatusDetails == 'Delivered') {
                  this.selectedOption = 'Delivered'
                }

                else {
                  this.selectedOption = 'Cancelled'
                }

              });
              detailsAdminOrdersCount = this.orderStatusDetails.length;
              this.orderStatusDetails.forEach(item => {
                if (item.orderStatusDetails == 'Cancelled') {
                  statusCount = statusCount + 1;
                }
                else {
                  this.selectedOption = item.orderStatusDetails;
                }
              }
              )
              if (detailsAdminOrdersCount == statusCount) {
                this.isAllCancelled = true;
              }
            }

          },
          error: (error) => {
            // Log information about an error during orders fetching //
            let errorMessage: string;
            let baseMessage = 'An error occurred during orders list fetching in order details component method getAllAdminOrders';
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
      this.logger.error('Unexpected error orders fecthing in order details component method getAllAdminOrders : ' + error.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }

  // Method for dropdown change //
  onDropdownChange(event: any, orderId: number, userId: number) {
    const selectedValue = event.target.value;
    // Log information about updating orders status //
    this.logger.info('Starting updating orders status in admin orders component method onDropdownChange');
    const currentLoggedInAdminId = this.commonService.getAvailableTokensDetails().userId;
    // Create a update order status object from the form values //
    const updatedObj: UpdateOrderStatus = {
      productName: null,
      orderId: orderId,
      orderStatus: selectedValue,
      userId: userId,
      updateByAdminId: currentLoggedInAdminId
    };

    // Log the update order status object //
    this.logger.info('Update order status object created in admin orders component method onDropdownChange : ', updatedObj);

    // Fetch a address from server //
    this.orderService.updateOrderStatus(updatedObj)
      .subscribe({
        next: (response: ApiResponse<string>) => {
          console.log(response);
          // Handle 200 status code
          if (response.statusCode === 200) {
            // Log information about a successful orders fecthing //
            this.logger.info('Update order status successfull..in admin orders component method onDropdownChange');
            this.toaster.showSuccess(response.message);
            window.location.reload();
          }
        },
        error: (error) => {
          // Log information about an error during orders fetching //
          let errorMessage: string;
          let baseMessage = 'An error occurred during update order status in admin orders component method onDropdownChange';
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
          else if (error.error.statusCode == 400) {
            this.logger.error(error.error.message);
            this.toaster.showError(error.error.message);
          }
          else if (error.error.statusCode == 404) {
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
  } catch(error) {
    // Log information about an unexpected exception //
    this.logger.error('Unexpected error update order status in admin orders component method onDropdownChange : ' + error.message);
    this.toaster.showError('An unexpected error try again later');
  }
}
