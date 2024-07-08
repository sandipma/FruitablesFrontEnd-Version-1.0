import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/Services/Auth/auth.service';
import { CartService } from 'src/app/Services/Cart/cart.service';
import { CommonService } from 'src/app/Services/Common/common.service';

@Component({
  selector: 'app-user-section',
  templateUrl: './user-section.component.html',
  styleUrls: ['./user-section.component.css']
})
export class UserSectionComponent {

  // constructor initialization //
  constructor(
    public commonService: CommonService,
    public authService: AuthService,
    public cartService: CartService,
    private router: Router) {
    this.commonService.clearUserOrAdmin();
    this.commonService.setUserOrAdmin('user');
    this.commonService.getUserOrAdmin();
    this.authService.setLoggedInUserName();

  }

  // on load event //
  ngOnInit() {

  }

  // Method Change active anchor for link //
  isActive(route: string): boolean {
    return this.router.url === route;
  }

  // Method for close navbar //
  closeNavbar() {
    // Get the navbar collapse element //
    const navbarCollapse = document.getElementById('userNavbarCollapse');
    // Check if the navbar is collapsed //
    if (navbarCollapse.classList.contains('show')) {
      // Close the navbar //
      navbarCollapse.classList.remove('show');
    }
  }

  // Method for on shopping cart click //
  OnBagClick(event: Event): void {
    event.preventDefault();
    const curretUserDetails = this.commonService.getAvailableTokensDetails();
    if (curretUserDetails != null) {
      this.router.navigate(['/cart']);
    }
    else {
      this.router.navigate(['/login']);
    }
  }
}
