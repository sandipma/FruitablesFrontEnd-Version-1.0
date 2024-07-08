import { Component, HostListener } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { CustomToasterService } from './Services/Custom-Toaster/custom-toaster.service';
import { CartService } from './Services/Cart/cart.service';
import { CommonService } from './Services/Common/common.service';
import { ApiResponse } from './Models/ApiResponse/api-response';
import { BagCounterDetails } from './Models/Cart/bag-counter-details';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  // Variable Declaration //
  title = 'FruitStoreUI';

  // Constructor Initilisation //
  constructor(private router: Router,
    private cartService: CartService,
    private commonService:CommonService,
    private logger: NGXLogger,
    private toaster: CustomToasterService) {

  }

  // Listen for route navigation events //
  @HostListener('window:scroll', ['$event'])
  onScroll(event) {
    if (event.currentTarget.pageYOffset === 0) {
      // Scroll to top when pageYOffset is 0 //
      window.scrollTo(0, 0);
    }
  }
  // On load event //
  ngOnInit(): void {
    try {    
      // Scroll to top when a route navigation is complete //
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          window.scrollTo(0, 0);
        }
      });
    }
    catch (error) {
      this.logger.error('Unexpected error app ngOnInit initialisation : ', error.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }
}


