import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiResponse } from 'src/app/Models/ApiResponse/api-response';
import { AddProductRating } from 'src/app/Models/Products/add-product-rating';
import { ProductRatingDetails } from 'src/app/Models/Shop-Details/product-rating-details';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShopDetailsService {

  // Constructor Initilisation //
  constructor(private http: HttpClient,
    private logger: NGXLogger) { }

  //*************Methods**********// 

  // Method for create product specific rating //
  createProductRating(productRating: AddProductRating): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${environment.WebapiUrl}/shopdetails/productratings`, productRating)
      .pipe(
        catchError((error) => {
          let errorMessage = 'An error occurred during create product rating API call';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.logger.error('Error in shop details service method createProductRating :', errorMessage);
          return throwError(() => error);
        })
      );
  }

  // Method for get products with it's specific rating //
  getProductsAndRating(productId: number): Observable<ApiResponse<ProductRatingDetails>> {
    return this.http.get<ApiResponse<ProductRatingDetails>>(`${environment.WebapiUrl}/shopDetails/products-and-rating/${productId} `)
      .pipe(
        catchError((error) => {
          let errorMessage = 'An error occurred during get product rating API call';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.logger.error('Error in shop details service method getProductsAndRating :', errorMessage);
          return throwError(() => error);
        })
      );
  }

  // Method for check product purchasing //
  checkProductPurchasing(userId: number, productId: number): Observable<ApiResponse<string>> {
    const url = `${environment.WebapiUrl}/shopdetails/check-purchasing?userId=${userId}&productId=${productId}`;
    return this.http.get<ApiResponse<string>>(url)
      .pipe(
        catchError((error) => {
          let errorMessage = 'An error occurred during check product and rating API call';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.logger.error('Error in shop details service method checkProductPurchasing :', errorMessage);
          return throwError(() => error);
        })
      );
  }
}
