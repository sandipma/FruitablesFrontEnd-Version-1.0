import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiResponse } from 'src/app/Models/ApiResponse/api-response';
import { BestSellerProductsDetails } from 'src/app/Models/Home/best-seller-products-details';
import { TopProductsDetails } from 'src/app/Models/Home/top-products-details';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  // Variable Declaration //
  initialData: number = 0;
  initialName: string = null;

  // Constructor Initilisation //
  constructor(private http: HttpClient, private logger: NGXLogger) { }

  //*************Methods**********************//

  // Method for get top products on home screen...//
  getTopProducts(category: string): Observable<ApiResponse<TopProductsDetails[]>> {
    return this.http.get<ApiResponse<TopProductsDetails[]>>(`${environment.WebapiUrl}/home/top-products?vegOrFruits=${category}`)
      .pipe(
        catchError((error) => {
          let errorMessage = 'An error occurred in fetch top products API call';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.logger.error('Error in home service method getTopProducts :', errorMessage);
          return throwError(() => error);
        })
      );
  }

  // Method for get best seller products on home screen...//
  getBestSellerProducts(): Observable<ApiResponse<BestSellerProductsDetails[]>> {
    return this.http.get<ApiResponse<BestSellerProductsDetails[]>>(`${environment.WebapiUrl}/home/bestseller-products`)
      .pipe(
        catchError((error) => {
          let errorMessage = 'An error occurred in fetch best seller products API call';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.logger.error('Error in home service method getBestSellerProducts :', errorMessage);
          return throwError(() => error);
        })
      );
  }
}
