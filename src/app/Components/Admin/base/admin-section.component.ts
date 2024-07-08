import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { RefreshTokenDetails } from 'src/app/Models/Auth/refresh-token-details';
import { AuthService } from 'src/app/Services/Auth/auth.service';
import { CommonService } from 'src/app/Services/Common/common.service';

@Component({
  selector: 'app-admin-section',
  templateUrl: './admin-section.component.html',
  styleUrls: ['./admin-section.component.css']
})
export class AdminSectionComponent {
  // Variable declaration //
  adminRefreshTokenExpireTime: Date;

  // constructor initialization //
  constructor(

    public commonService: CommonService,
    public authService: AuthService,
    public logger: NGXLogger,
    public router:Router
  ) {
    this.commonService.clearUserOrAdmin();
    this.commonService.setUserOrAdmin('admin');
    this.commonService.getUserOrAdmin();
    this.authService.setLoggedInUserName();
  }
  // on load event //
  ngOnInit() {
    this.commonService.scrollToTop();
    this.logger.info('Starting check admin token exists in admin section component method ngOnInit');
    if (localStorage.getItem('adminRefreshToken')) {
      const existingAdminRefreshToken: RefreshTokenDetails = JSON.parse(localStorage.getItem('adminRefreshToken'));
      const currentDateTime = new Date();
      if (existingAdminRefreshToken != null) {
        this.adminRefreshTokenExpireTime = new Date(existingAdminRefreshToken.refreshTokenTimePeriod);
      }
      if (existingAdminRefreshToken && this.adminRefreshTokenExpireTime < currentDateTime && this.authService.isLogOutDone === false) {
        this.authService.isLogOutDone = true;
        this.authService.logout();
      }
    }
    this.logger.info('Completed check admin token exists in admin section component method ngOnInit');
  }

  // Method Change active anchor for link //
  isActive(route: string): boolean {
    return this.router.url === route;
  }

  // Method for close navbar //
  closeNavbar() {
    // Get the navbar collapse element //
    const navbarCollapse = document.getElementById('adminNavbarCollapse');
    // Check if the navbar is collapsed //
    if (navbarCollapse.classList.contains('show')) {
      // Close the navbar //
      navbarCollapse.classList.remove('show');
    }
  }
}
