import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Observable, catchError, throwError } from 'rxjs';
import { AdminOrder } from 'src/app/Models/Admin-Order/admin-order';
import { ApiResponse } from 'src/app/Models/ApiResponse/api-response';
import { AddOrderDetails } from 'src/app/Models/Order/add-order-details';
import { CompleteOrder } from 'src/app/Models/Order/complete-order';
import { OrderDetails } from 'src/app/Models/Order/order-details';
import { UpdateOrderStatus } from 'src/app/Models/Order/update-order-status';
import { UserOrderDetails } from 'src/app/Models/Order/user-order-details';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  // Constructor initilisation //
  constructor(private http: HttpClient, private logger: NGXLogger) { }

  // Method for create new order details //
  createOrderDetails(orderDetails: AddOrderDetails): Observable<ApiResponse<OrderDetails>> {
    return this.http.post<ApiResponse<OrderDetails>>(`${environment.WebapiUrl}/order/create-order-details`, orderDetails)
      .pipe(
        catchError((error) => {
          let errorMessage = 'An error occurred in create order deatils API call';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.logger.error('Error in order service method createOrderDetails :', errorMessage);
          return throwError(() => error);
        })
      );
  }

  // Method for complete order and payment details //
  completeOrder(completeOrderProcess: CompleteOrder): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${environment.WebapiUrl}/order/complete-order-process`, completeOrderProcess)
      .pipe(
        catchError((error) => {
          let errorMessage = 'An error occurred in complete order API call';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.logger.error('Error in order service method completeOrder :', errorMessage);
          return throwError(() => error);
        })
      );
  }

  // Method for fetching order details by user Id  //
  getOrderDetailsByUserId(userId: number): Observable<ApiResponse<UserOrderDetails[]>> {
    return this.http.get<ApiResponse<UserOrderDetails[]>>(`${environment.WebapiUrl}/order/get-order-details/${userId}`)
      .pipe(
        catchError((error) => {
          let errorMessage = 'An error occurred in fetching order details by user Id API call';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.logger.error('Error in order service method getOrderDetailsByUserId :', errorMessage);
          return throwError(() => error);
        })
      );
  }

  // Method for updating order status //
  updateOrderStatus(updateStatus: UpdateOrderStatus): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(`${environment.WebapiUrl}/order/update-order-status`, updateStatus)
      .pipe(
        catchError((error) => {
          let errorMessage = 'An error occurred in updating order status API call';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.logger.error('Error in order service method updateOrderStatus :', errorMessage);
          return throwError(() => error);
        })
      );
  }

  // Method for fetching all admin order details //
  getAllAdminOrders(): Observable<ApiResponse<AdminOrder[]>> {
    return this.http.get<ApiResponse<AdminOrder[]>>(`${environment.WebapiUrl}/adminorder/get-all-orders`)
      .pipe(
        catchError((error) => {
          let errorMessage = 'An error occurred in fetching all admin order details API call';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.logger.error('Error in order service method getAllAdminOrders :', errorMessage);
          return throwError(() => error);
        })
      );
  }
}
