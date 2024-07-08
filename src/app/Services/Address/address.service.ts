import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Observable, catchError, throwError } from 'rxjs';
import { AddAddressDetails } from 'src/app/Models/Address/add-address-details';
import { AddressDetails } from 'src/app/Models/Address/address-details';
import { PostalResponse } from 'src/app/Models/Address/postal-response';
import { ApiResponse } from 'src/app/Models/ApiResponse/api-response';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  // Variable declaration //
  deleteStatus: boolean = false;

  // Constructor Initilisation //
  constructor(private http: HttpClient,
    private logger: NGXLogger) { }

  //************Methods*****************//

  // Method for create address details //
  createAddressDetails(createAddressDetails: AddAddressDetails): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${environment.WebapiUrl}/address/create-new-address`, createAddressDetails)
      .pipe(
        catchError((error) => {
          let errorMessage = 'An error occurred during create address details API call..';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.logger.error('Error in address service method createAddressDetails :', errorMessage);
          return throwError(() => error);
        })
      );
  }

  // Method for get all address details //
  getAllAddressDetailsByUserId(userId: number): Observable<ApiResponse<AddressDetails[]>> {
    return this.http.get<ApiResponse<AddressDetails[]>>(`${environment.WebapiUrl}/address/get-all-addresses/${userId}`)
      .pipe(
        catchError((error) => {
          let errorMessage = 'An error occurred during get all address details by user Id API call..';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.logger.error('Error in address service method getAllAddressDetailsByUserId :', errorMessage);
          return throwError(() => error);
        })
      );
  }

  // Method for delete specific address  by Id //
  deleteAddressById(addressId: number): Observable<void> {
    const url = `${environment.WebapiUrl}/address/delete-address/${addressId}`;
    return this.http.delete<void>(url)
      .pipe(
        catchError((error) => {
          let errorMessage = 'An error occurred during delete address by Id API call..';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.logger.error('Error in address service method deleteAddressById :', errorMessage);
          return throwError(() => error);
        })
      );
  }

  // Method for get city,state and country details postal code from  http://www.postalpincode.in //
  getCityAndStateByPostalCode(postalCode: number): Observable<PostalResponse> {

    return this.http.get<PostalResponse>(`${environment.postalapiUrl}/${postalCode}`)
      .pipe(
        catchError((error) => {
          let errorMessage = 'An error occurred during get city and state details by postal code API call.';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.logger.error('Error in address service method getCityAndStateByPostalCode:', errorMessage);
          return throwError(() => error);
        })
      );
  }


  // Method for update address selection by Id//
  UpdateAddressSelectionById(addressId: number, isSelected: string): Observable<ApiResponse<string>> {
    const url = `${environment.WebapiUrl}/address/update-address-selection/${addressId}?isSelected=${isSelected}`;
    return this.http.patch<ApiResponse<string>>(url, {})
      .pipe(
        catchError((error) => {
          let errorMessage = 'An error occurred during update address selection by Id code API call..';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.logger.error('Error in address service method UpdateAddressSelectionById:', errorMessage);
          return throwError(() => error);
        })
      );
  }

  // Method for handle to open modal //
  handleModalOpen(): void {
    this.deleteStatus = false;
  }
}
