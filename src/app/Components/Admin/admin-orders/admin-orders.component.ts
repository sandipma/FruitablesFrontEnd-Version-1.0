import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { AdminOrder } from 'src/app/Models/Admin-Order/admin-order';
import { ApiResponse } from 'src/app/Models/ApiResponse/api-response';
import { CommonService } from 'src/app/Services/Common/common.service';
import { CustomToasterService } from 'src/app/Services/Custom-Toaster/custom-toaster.service';
import { OrderService } from 'src/app/Services/Order/order.service';

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css']
})
export class AdminOrdersComponent {
  // Variable declaration //
  adminOrders: AdminOrder[] = [];
  isLoading: boolean = false;
  currentPage: number = 1;
  ordersPerPage: number = 10;

  // Constructor  initialisation //
  constructor(public commonService: CommonService,
    private logger: NGXLogger,
    private orderService: OrderService,
    private toaster: CustomToasterService,
    private router: Router) {

  }

  // On load event //
  ngOnInit(): void {
    this.commonService.scrollToTop();
    this.showAllAdminOrders();
  }
  //*********Methods******************//

  // Method for showing all admin order list //
  showAllAdminOrders() {
    try {
      // Log information about fetching orders list //
      this.logger.info('Starting loading orders list in admin orders component method showAllAdminOrders');
      // Fetch a address from server //
      this.isLoading = true;
      this.orderService.getAllAdminOrders()
        .subscribe({
          next: (response: ApiResponse<AdminOrder[]>) => {

            // Handle 200 status code
            if (response.statusCode === 200) {
              // Log information about a successful orders fecthing //
              this.logger.info('Orders list fetching successfull..showing all orders in admin orders component method showAllAdminOrders');

              if (response.data != null) {
                this.adminOrders = response.data;
                this.isLoading = false;
              }
              else {
                this.adminOrders = [];
                this.isLoading = false;
              }
            }
          },
          error: (error) => {
            // Log information about an error during orders fetching //
            this.isLoading = false;
            let errorMessage: string;
            let baseMessage = 'An error occurred during orders list fetching in admin orders component method showAllAdminOrders';
            if (error.error && error.error.message) {
              errorMessage = baseMessage + error.error.message;
            }
            else {
              errorMessage = baseMessage;
            }
            if (error.error.statusCode === 401) {
              this.logger.error("User unAuthorized please log in")
              this.toaster.showError("Your session expired. Please log in.");
              this.router.navigate(['/admin-portal/login']);
            }
            else if (error.error.statusCode === 403) {
              this.logger.error("Permission denied error..");
              this.toaster.showError("You do not have permission to access this resource.");
            }
            else if (error.error.statusCode == 500) {
              this.logger.error(error.error.message);
              this.toaster.showError(error.error.message);
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
      this.logger.error('Unexpected error orders fecthing in admin orders component method showAllAdminOrders : ' + error.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }

  // Method for grouping orders by ID for all admin order list //
  groupByOrderId(orders: any[]): any[] {
    const groupedOrders = orders.reduce((acc, order) => {
      const key = order.orderId;
      if (!acc[key]) {
        acc[key] = { orderId: key, orders: [] };
      }
      acc[key].orders.push(order);
      return acc;
    }, {});
    return Object.values(groupedOrders);
  }

  // Method for check is last group check //
  isLastGroup(group: any, groups: any[]): boolean {
    return group === groups[groups.length - 1];
  }

  // Method for ordes status dropdown change //
  seeDetails(orderId: number): void {
    this.router.navigate(['/admin-portal/view-details', orderId.toString()]);
  }

  // Getter for paginated orders
  get paginatedOrders(): AdminOrder[] {
    const startIndex = (this.currentPage - 1) * this.ordersPerPage;
    const endIndex = startIndex + this.ordersPerPage;
    return this.adminOrders.slice(startIndex, endIndex);
  }

  // Method for clicking on the next page
  nextPage(): void {
    if ((this.currentPage * this.ordersPerPage) < this.adminOrders.length) {
      this.currentPage++;
    }
  }

  // Method for clicking on the previous page
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
}

