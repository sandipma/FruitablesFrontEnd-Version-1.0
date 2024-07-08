import { Component } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { OverAllReview } from 'src/app/Models/About-Us/over-all-review';
import { ApiResponse } from 'src/app/Models/ApiResponse/api-response';
import { AboutUsService } from 'src/app/Services/About-Us/about-us.service';
import { CustomToasterService } from 'src/app/Services/Custom-Toaster/custom-toaster.service';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.css']
})
export class AboutUsComponent {
  // Variable declaration //
  isLoading: boolean = false;
  overAllReview: OverAllReview = null;

  // Constructor initialization //
  constructor(
    public aboutUsService: AboutUsService,
    private logger: NGXLogger,
    private toaster: CustomToasterService)
    { }

  // On load event //
  ngOnInit() {
    this.showOverAllReview();
  }

  //*************Methods**********//

  // Method for showing over all review details //
  showOverAllReview() {
    try {
      // Log information about fetching over all review //
      this.logger.info('Starting loading over all review in about us component method showOverAllReview');
      this.isLoading = true;
      // Fetch a over all review from server //
      this.aboutUsService.getOverAllReview()
        .subscribe({
          next: (response: ApiResponse<OverAllReview>) => {
            // Handle 200 status code //
            if (response.statusCode === 200) {
              this.isLoading = false;
              // Log information about a successful overall review fecthing //
              this.logger.info('Over all review fetching successfull in about us component method showOverAllReview ..showing all review');
              if (response.data != null) {
                this.overAllReview = response.data;
              }
              else
              {
                this.overAllReview = null;
              }
            }
          },
          error: (error) => {
            this.isLoading = false;
            // Log information about an error overall review fecthing //
            let baseMessage = 'An error occurred during overall review fecthing API call in about us component method showOverAllReview';
            let errorMessage: string;
            if (error.error && error.error.message) {
              errorMessage = baseMessage + error.error.message;
            }
            else {
              errorMessage = baseMessage;
            }
            if (error.error.statusCode == 500) {
              this.logger.error(error.error.message);
              this.toaster.showError(error.error.message);
            }
            else {
              this.logger.error(errorMessage);
              this.toaster.showError('Server error try again later');
            }
          }
        });
    } catch (error) {
      this.isLoading = false;
      // Log information about an unexpected exception //
      this.logger.error('Unexpected error overall review fecthing in about us component method showOverAllReview : ' + error.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }
}
