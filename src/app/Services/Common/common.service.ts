import { Injectable } from '@angular/core';
import { AccessTokenDetails } from 'src/app/Models/Auth/access-token-details';
import { RefreshTokenDetails } from 'src/app/Models/Auth/refresh-token-details';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  // Variable Declaration //
  isUserOrAdmin: string = null;
  cartCount: number = 0;

  // Constructor Initilisation //
  constructor() {
  }

  //*************Methods**********//

  // Method for scroll to top //
  scrollToTop(): void {
    window.scrollTo(0, 0);
  }

  // Method for get available token //
  getAvailableTokensDetails(): AccessTokenDetails | RefreshTokenDetails {
    let currentAccessToken = localStorage.getItem('authToken');
    let currentRefreshToken = localStorage.getItem('refreshToken');
    let currentAdminAccessToken = localStorage.getItem('adminAuthToken');
    let currentAdminRefreshToken = localStorage.getItem('adminRefreshToken');
    if (currentAccessToken) {
      const accessToken: AccessTokenDetails = JSON.parse(currentAccessToken);
      return accessToken;
    }
    else if (currentRefreshToken) {
      const refreshToken: RefreshTokenDetails = JSON.parse(currentRefreshToken);
      return refreshToken;

    }
    else if (currentAdminAccessToken) {
      const adminAccessToken: AccessTokenDetails = JSON.parse(currentAdminAccessToken);
      return adminAccessToken;
    }
    else if (currentAdminRefreshToken) {
      const adminRefreshToken: RefreshTokenDetails = JSON.parse(currentAdminRefreshToken);
      return adminRefreshToken;
    }
    return null;
  }

  // Method for set values user or admin in local storage //
  setUserOrAdmin(userType: string): void {
    if (userType === 'admin') {
      localStorage.setItem('admin', userType);
    }
    else {
      localStorage.setItem('user', userType);
    }
  }

  // Method for clear user or admin from local storage //
  clearUserOrAdmin(): void {
    if (localStorage.getItem('admin')) {
      localStorage.removeItem('admin');
    }
    else {
      localStorage.removeItem('user');
    }
  }

  // Method for set values user or admin in local staorage //
  getUserOrAdmin(): void {
    if (localStorage.getItem('admin')) {
      this.isUserOrAdmin = localStorage.getItem('admin');
    }
    else {
      this.isUserOrAdmin = localStorage.getItem('user');
    }
  }
}
