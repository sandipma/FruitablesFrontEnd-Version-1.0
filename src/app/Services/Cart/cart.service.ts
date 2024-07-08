import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiResponse } from 'src/app/Models/ApiResponse/api-response';
import { AddCartDetails } from 'src/app/Models/Cart/add-cart-details';
import { BagCounterDetails } from 'src/app/Models/Cart/bag-counter-details';
import { CartDetails } from 'src/app/Models/Cart/cart-details';
import { CartWithTotalDetails } from 'src/app/Models/Cart/cart-with-total-details';
import { PriceDetails } from 'src/app/Models/Cart/price-details';
import { UpdateCartDetails } from 'src/app/Models/Cart/update-cart-details';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Variable declaration //
  cartQuantity: number = 1;
  currentCartDetails: CartDetails[] = [];
  currentPriceDetails: PriceDetails = null;

  // Constructor Initilisation //
  constructor(private http: HttpClient,
    private logger: NGXLogger) { }

  // Method for create & update cart details //
  createCartDetails(createUpdateCartDetails: AddCartDetails): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${environment.WebapiUrl}/cart/create-cart-details`, createUpdateCartDetails)
      .pipe(
        catchError((error) => {
          let errorMessage = 'An error occurred in create cart details API call';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.logger.error('Error in cart service method createCartDetails : ', errorMessage);
          return throwError(() => error);
        })
      );
  }

  // Method for update cart details //
  updateCartDetails(updateCartDetails: UpdateCartDetails): Observable<ApiResponse<string>> {
    return this.http.patch<ApiResponse<string>>(`${environment.WebapiUrl}/cart/update-cart-details`, updateCartDetails)
      .pipe(
        catchError((error) => {
          let errorMessage = 'An error occurred in update cart details API call';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.logger.error('Error in cart service method updateCartDetails :', errorMessage);
          return throwError(() => error);
        })
      );
  }

  // Method for get all products cart details //
  getProductsCartDetails(userId: number): Observable<ApiResponse<CartWithTotalDetails>> {
    return this.http.get<ApiResponse<CartWithTotalDetails>>(`${environment.WebapiUrl}/cart/get-products-cart-detail/${userId}`)
      .pipe(
        catchError((error) => {
          let errorMessage = 'An error occurred in get all cart products details API call';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.logger.error('Error in cart service method getProductsCartDetails :', errorMessage);
          return throwError(() => error);
        })
      );
  }

  // Method for get bag counter details //
  getBagCounterDetails(userId: number): Observable<ApiResponse<BagCounterDetails>> {
    return this.http.get<ApiResponse<BagCounterDetails>>(`${environment.WebapiUrl}/cart/get-bag-counter-details/${userId}`)
      .pipe(
        catchError((error) => {
          let errorMessage = 'An error occurred in get bag counter details API call';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.logger.error('Error in cart service method getBagCounterDetails :', errorMessage);
          return throwError(() => error);
        })
      );
  }

  // Method for delete specific cart item  by Id //
  deleteCartItemById(cartId: number): Observable<void> {
    const url = `${environment.WebapiUrl}/cart/delete-products/${cartId}`;
    return this.http.delete<void>(url)
      .pipe(
        catchError((error) => {
          let errorMessage = 'An error occurred in delete cart item API call';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.logger.error('Error in cart service method deleteCartItemById : ', errorMessage);
          return throwError(() => error);
        })
      );
  }
}