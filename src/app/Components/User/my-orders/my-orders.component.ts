import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { ApiResponse } from 'src/app/Models/ApiResponse/api-response';
import { UpdateOrderStatus } from 'src/app/Models/Order/update-order-status';
import { UserOrderDetails } from 'src/app/Models/Order/user-order-details';
import { ProductDetails } from 'src/app/Models/Products/product-details';
import { CommonService } from 'src/app/Services/Common/common.service';
import { CustomToasterService } from 'src/app/Services/Custom-Toaster/custom-toaster.service';
import { OrderService } from 'src/app/Services/Order/order.service';
import { ProductService } from 'src/app/Services/Products/products.service';

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.css']
})
export class MyOrdersComponent {

  // Variable declaration //
  currentUserName: string = null;
  orders: UserOrderDetails[] = [];
  filteredOrders: UserOrderDetails[] = [];
  searchOrderName: string = null;
  currentPage: number = 1;
  ordersPerPage: number = 5;
  originalOrders: UserOrderDetails[] = [];
  currentProductsList: ProductDetails[] = [];

  // Constructor  initialisation //
  constructor(private commonService: CommonService,
    private logger: NGXLogger,
    private orderService: OrderService,
    private toaster: CustomToasterService,
    private productService: ProductService,
    private router: Router) {
  }

  // On load event //
  ngOnInit(): void {
    this.currentUserName = this.commonService.getAvailableTokensDetails().userName;
    this.commonService.scrollToTop();
    this.showAllOrders();
  }
  //*********Methods******************//

  // Method for showing all users order list //
  showAllOrders() {
    try {
      this.logger.info('Starting loading orders list in my orders component method showAllOrders');
      const currentUserId = this.commonService.getAvailableTokensDetails().userId;
      this.orderService.getOrderDetailsByUserId(currentUserId)
        .subscribe({
          next: (response: ApiResponse<UserOrderDetails[]>) => {
            if (response.statusCode === 200 && response.data != null) {
              this.logger.info('Orders list fetching successful..showing all orders in my orders component method showAllOrders');
              this.orders = response.data;
              this.originalOrders = response.data;
              this.filteredOrders = response.data;
              this.currentPage = 1; // Reset to first page
            }
            else if (response.statusCode === 200 && response.data == null) {
              this.orders = [];
              this.originalOrders = [];
              this.filteredOrders = [];
            }
          },
          error: (error) => {
            let errorMessage: string;
            let baseMessage = 'An error occurred during orders list fetching in my orders component method showAllOrders';
            if (error.error && error.error.message) {
              errorMessage = baseMessage + error.error.message;
            } else {
              errorMessage = baseMessage;
            }
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
    } catch (error) {
      this.logger.error('Unexpected error orders fetching in my orders component method showAllOrders: ' + error.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }

  // Method for updating order status //
  updateOrderStatus(productName: string, orderStatus: string, event: Event) {
    try {
      event.preventDefault();
      this.logger.info('Starting updating order status in my orders component method updateOrderStatus');
      const currentUserId = this.commonService.getAvailableTokensDetails().userId;
      // Create a update order status object from the form values //
      const updatedOrderStatus: UpdateOrderStatus = {
        userId: currentUserId,
        productName: productName,
        orderStatus: orderStatus,
        orderId: null,
        updateByAdminId: null
      };

      // Log the created update order status object //
      this.logger.info('update user object created in my orders component method updateOrderStatus : ', updatedOrderStatus);
      // Fetch a address from server //
      this.orderService.updateOrderStatus(updatedOrderStatus)
        .subscribe({
          next: (response: ApiResponse<string>) => {

            // Handle 200 status code
            if (response.statusCode === 200) {
              // Log information about a successful updating order status //
              this.logger.info('Updating order status successfull..in my orders component method updateOrderStatus');
              this.toaster.showSuccess('Order cancelled !!')
              this.showAllOrders();
              this.commonService.scrollToTop();
            }
          },
          error: (error) => {
            // Log information about an error during updating order status //
            let errorMessage: string;
            let baseMessage = 'An error occurred during updating order status in my orders component method updateOrderStatus';
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
      // Log information about an unexpected exception //
      this.logger.error('Unexpected error update order status in my orders component method updateOrderStatus : ' + error.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }

  // Method for search functionality
  onSearch(productName: string): void {
    this.searchOrderName = productName;
    this.currentPage = 1; // Reset to first page

    if (!productName) {
      this.filteredOrders = this.originalOrders;
    } else {
      const searchKeywordLower = productName.toLowerCase();
      this.filteredOrders = this.originalOrders.filter(item => {
        const productNameLower = item.productName.toLowerCase();
        return productNameLower.includes(searchKeywordLower);
      });
    }
  }

  // Getter for paginated orders
  get paginatedOrders(): UserOrderDetails[] {
    const startIndex = (this.currentPage - 1) * this.ordersPerPage;
    const endIndex = startIndex + this.ordersPerPage;
    return this.filteredOrders.slice(startIndex, endIndex);
  }

  // Method for clicking on the next page
  nextPage(): void {
    if ((this.currentPage * this.ordersPerPage) < this.filteredOrders.length) {
      this.currentPage++;
    }
    this.commonService.scrollToTop();
  }

  // Method for clicking on the previous page
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
    this.commonService.scrollToTop();
  }

  // Method for rate a product //
  rateProduct(productName: string): void {
    try {
      this.logger.info('Starting rating product in my orders component method rateProduct');
      this.productService.getAllProducts()
        .subscribe({
          next: (response: ApiResponse<ProductDetails[]>) => {
            if (response.statusCode === 200 && response.data != null) {
              this.logger.info('Product list fetching successful..fetched product list in my orders component method rateProduct');
              this.currentProductsList = response.data;
              const prodData = this.currentProductsList.find(product => product.productName === productName);
              const productWithQuantityDetails =
              {
                productId: prodData.productId,
                price: prodData.price
              };
              this.logger.info('Completed rating product in my orders component method rateProduct');
              this.router.navigate(['/shop-details', prodData.productId], { state: productWithQuantityDetails });
            }
          },
          error: (error) => {
            let errorMessage: string;
            let baseMessage = 'An error occurred during rate product in my orders component method rateProduct';
            if (error.error && error.error.message) {
              errorMessage = baseMessage + error.error.message;
            } else {
              errorMessage = baseMessage;
            }
            if (error.error.statusCode == 500) {
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
      this.logger.error('Unexpected error during rate product in my orders component method rateProduct: ' + error.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }
}
