import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiResponse } from 'src/app/Models/ApiResponse/api-response';
import { AllShopDetails } from 'src/app/Models/Shop/all-shop-details';
import { ShopData } from 'src/app/Models/Shop/shop-data';
import { ShopFilterCriterio } from 'src/app/Models/Shop/shop-filter-criterio';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShopService {

  // Variable declaration //
  pageNumber: number = 1;
  pageSize: number = 9;
  sortData: string = null;
  currentShopData: ShopData = null;
  sortValue: string = 'Popularity';
  categoryName: string = 'Fruits'
  priceValue: number = 500;
 
  // Constructor Initilisation //
  constructor(private http: HttpClient,
    private logger: NGXLogger) {

  }

  //***************Methods*********************//

  // Method for get all shop details //
  getAllShopDetails(shopCriterio:ShopFilterCriterio): Observable<ApiResponse<AllShopDetails[]>> {
    let httpParams = new HttpParams()
    .set('categoryName', shopCriterio.categoryName)
    .set('priceValue', shopCriterio.priceValue)
    .set('sortValue', shopCriterio.sortValue);

    return this.http.get<ApiResponse<AllShopDetails[]>>(`${environment.WebapiUrl}/shop/get-all-shop-details`,{ params: httpParams })
      .pipe(
        catchError((error) => {
          let errorMessage = 'An error occurred in fetch all shop details API call';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.logger.error('Error in shop service method getAllShopDetails :', errorMessage);
          return throwError(() => error);
        })
      );
  }
}
