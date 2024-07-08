import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Observable, catchError, throwError } from 'rxjs';
import { OverAllReview } from 'src/app/Models/About-Us/over-all-review';
import { ApiResponse } from 'src/app/Models/ApiResponse/api-response';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AboutUsService {

  // Constructor Initilisation //
  constructor(private http: HttpClient,
    private logger: NGXLogger) { }

  //************Methods*****************//

  // Method for overall review details //
  getOverAllReview(): Observable<ApiResponse<OverAllReview>> {
    return this.http.get<ApiResponse<OverAllReview>>(`${environment.WebapiUrl}/aboutUs/get-overall-review`)
      .pipe(
        catchError((error) => {
          let errorMessage = 'An error occurred during get all review details API call..';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.logger.error('Error in about us service method getOverAllReview :', errorMessage);
          return throwError(() => error);
        })
      );
  }
}
