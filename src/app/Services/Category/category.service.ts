import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiResponse } from 'src/app/Models/ApiResponse/api-response';
import { AddCategoryDetails } from 'src/app/Models/Category/add-category-details';
import { CategoryDetails } from 'src/app/Models/Category/category-details';
import { CategoryWithProductCount } from 'src/app/Models/Category/category-with-product-count';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  // Constructor Initilisation //
  constructor(private http: HttpClient,
    private logger: NGXLogger) { }

  //*************Methods**********//

  // Method for get all categories //
  getAllCategories(): Observable<ApiResponse<CategoryDetails[]>> {
    return this.http.get<ApiResponse<CategoryDetails[]>>(`${environment.WebapiUrl}/category/get-all-categories`)
      .pipe(
        catchError((error) => {
          let errorMessage = 'An error occurred during fetching category API call..';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.logger.error('Error in category service method getAllCategories : ', errorMessage);
          return throwError(() => error);
        })
      );
  }

  // Method for get all categories with products count//
  getCategoryWithProductsCount(): Observable<ApiResponse<CategoryWithProductCount[]>> {
    return this.http.get<ApiResponse<CategoryWithProductCount[]>>(`${environment.WebapiUrl}/category/get-category-with-products-counts`)
      .pipe(
        catchError((error) => {
          let errorMessage = 'An error occurred during category with products count API call..';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.logger.error('Error in category service method getCategoryWithProductsCount :', errorMessage);
          return throwError(() => error);
        })
      );
  }

  // Method for create a new category //
  createNewCategory(addNewCategory: AddCategoryDetails): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${environment.WebapiUrl}/category/create-category`, addNewCategory)
      .pipe(
        catchError((error) => {
          let errorMessage = 'An error occurred during create category API call..';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.logger.error('Error in category service method createNewCategory :', errorMessage);
          return throwError(() => error);
        })
      );
  }

  // Method for delete specific category by Id//
  deleteCategoryById(categoryId: number): Observable<void> {
    const url = `${environment.WebapiUrl}/category/delete-category/${categoryId}`;
    return this.http.delete<void>(url)
      .pipe(
        catchError((error) => {
          let errorMessage = 'An error occurred during category deletion API call..';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.logger.error('Error in category service method deleteCategoryById :', errorMessage);
          return throwError(() => error);
        })
      );
  }
}
