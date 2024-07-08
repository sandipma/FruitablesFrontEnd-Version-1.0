import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiResponse } from 'src/app/Models/ApiResponse/api-response';
import { ProductDetails } from 'src/app/Models/Products/product-details';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // Constructor Initilisation //
  constructor(private http: HttpClient,
    private logger: NGXLogger) { }

  // Method for create & update products //
  createUpdateProduct(createUpdateProducts: FormData): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${environment.WebapiUrl}/products/create-update-products`, createUpdateProducts)
      .pipe(
        catchError((error) => {
          let errorMessage = 'An error occurred during create update product API call..';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.logger.error('Error in product service method createUpdateProduct :', errorMessage);
          return throwError(() => error);
        })
      );
  }

  // Method for get all products //
  getAllProducts(): Observable<ApiResponse<ProductDetails[]>> {
    return this.http.get<ApiResponse<ProductDetails[]>>(`${environment.WebapiUrl}/products/get-all-products`)
      .pipe(
        catchError((error) => {
          let errorMessage = 'An error occurred during get all products API call..';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.logger.error('Error in product service method getAllProducts :', errorMessage);
          return throwError(() => error);
        })
      );
  }

  // Method for delete specific product by Id //
  deleteProductById(productId: number): Observable<void> {
    const url = `${environment.WebapiUrl}/products/delete-products/${productId}`;
    return this.http.delete<void>(url)
      .pipe(
        catchError((error) => {
          let errorMessage = 'An error occurred during delete product by Id API call..';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.logger.error('Error in product service method deleteProductById :', errorMessage);
          return throwError(() => error);
        })
      );
  }
}


