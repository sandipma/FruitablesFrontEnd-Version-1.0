import { GoogleLoginProvider, SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Observable, Subject, catchError, tap, throwError } from 'rxjs';
import { ApiResponse } from 'src/app/Models/ApiResponse/api-response';
import { AccessTokenDetails } from 'src/app/Models/Auth/access-token-details';
import { loginUser } from 'src/app/Models/Auth/loginUser';
import { RefreshTokenDetails } from 'src/app/Models/Auth/refresh-token-details';
import { RegisterUser } from 'src/app/Models/Auth/register-user';
import { TokenDetails } from 'src/app/Models/Auth/token-details';
import { environment } from 'src/environments/environment';
import { CustomToasterService } from '../Custom-Toaster/custom-toaster.service';
import { Router } from '@angular/router';
import { CommonService } from '../Common/common.service';
import { BagCounterDetails } from 'src/app/Models/Cart/bag-counter-details';
import { CartService } from '../Cart/cart.service';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Variable Declaration //
  loggedInUserName: string;
  googleMail: string = null;
  authTokenString: string = null;;
  adminAuthTokenString: string = null;
  refreshTokenString: string = null;
  adminRefreshTokenString: string = null;
  isLogOutDone: boolean = false;
  currentUserAccessToken: AccessTokenDetails = null;
  currentUserRefreshToken: RefreshTokenDetails = null;
  currentAdminAccessToken: AccessTokenDetails = null;
  currentAdminRefreshToken: RefreshTokenDetails = null;
  authChangeSub = new Subject<boolean>();
  extAuthChangeSub = new Subject<SocialUser>();
  authChanged = this.authChangeSub.asObservable();
  extAuthChanged = this.extAuthChangeSub.asObservable();
  isgoogleLoading: boolean = false;
  currentAccessToken: AccessTokenDetails = null;


  // Constructor Initilisation //
  constructor(private http: HttpClient,
    private logger: NGXLogger,
    private externalAuthService: SocialAuthService,
    private toaster: CustomToasterService,
    private router: Router,
    private commonService: CommonService,
    private cartService: CartService) {

    // API call for google login //
    this.externalAuthService.authState.subscribe({
      next: (user: SocialUser) => {
        console.log(user);
        this.googleMail = user.email;
        this.isgoogleLoading = true;
        this.commonService.scrollToTop();
        this.loginWithGoogleUser(this.googleMail).subscribe({
          next: (data: ApiResponse<TokenDetails>) => {
            console.log(data);
            if (data.statusCode == 200) {
              this.isgoogleLoading = false;
              this.logger.info('Login with Google user successful in auth service method constructor');
              this.toaster.showSuccess(data.message);
              this.router.navigate(['/']);
            }
          },
          error: (error: any) => {
            // Handle different HTTP status codes //
            this.commonService.scrollToTop();
            let errorMessage: string;
            let baseMessage = 'An error occurred during google login in auth service component constructor';
            if (error.error && error.error.message) {
              errorMessage = baseMessage + error.error.message;
            }
            else {
              errorMessage = baseMessage;
            }
            this.isgoogleLoading = false;
            if (error.error.statusCode == 400) {
              this.logger.error(errorMessage);
              this.toaster.showError(error.error.message);
            } else if (error.error.statusCode == 500) {
              this.logger.error(errorMessage);
              this.toaster.showError(error.error.message);
            }
            else if (error.error.statusCode == 404) {
              this.logger.error(errorMessage);
              this.toaster.showError(error.error.message);
              // this.router.navigate(['/register']);
            }
            else {
              this.logger.error(errorMessage);
              this.toaster.showError('Server error try again later');
            }
          },
        });
      },
      error: (error: any) => {
        this.isgoogleLoading = false;
        this.commonService.scrollToTop();
        this.logger.error('Unexpected error during google login in auth service constructor : ', + error.message);
        this.toaster.showError('An unexpected error try again later');
      }
    });
  }

  //*************Methods**********//

  // Method for register a new user //
  registerUser(user: RegisterUser): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${environment.WebapiUrl}/authenticatication/register-user`, user)
      .pipe(
        catchError((error) => {
          let errorMessage = 'An error occurred in register API call';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.logger.error('Error in auth service method registerUser :', errorMessage);
          return throwError(() => error);
        })
      );
  }

  // Method for login user //
  loginUser(login: loginUser): Observable<ApiResponse<TokenDetails>> {
    return this.http.post<ApiResponse<TokenDetails>>(`${environment.WebapiUrl}/authenticatication/login-user`, login)
      .pipe(
        tap((response: ApiResponse<TokenDetails>) => {
          this.isLogOutDone = false;
          this.saveTokenDetails(response);
          this.setLoggedInUserName();
        }),
        catchError((error) => {
          let errorMessage = 'An error occurred in login user API call';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.logger.error('Error in in auth service method loginUser :', errorMessage);
          return throwError(() => error);
        })
      );
  }

  // Method for login google user //
  loginWithGoogleUser(gmail: string): Observable<ApiResponse<TokenDetails>> {
    const body = { Email: gmail };
    return this.http.post<ApiResponse<TokenDetails>>(`${environment.WebapiUrl}/authenticatication/google-login`, body)
      .pipe(
        tap((response: ApiResponse<TokenDetails>) => {
          this.isLogOutDone = false;
          this.saveTokenDetails(response);
          this.setLoggedInUserName();
        }),
        catchError((error) => {
          let errorMessage = 'An error occurred in login with google API call';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.logger.error('Error in in auth service method loginWithGoogleUser :', errorMessage);
          return throwError(() => error);
        })
      );
  }

  // Method for save token details on login //
  saveTokenDetails(response: ApiResponse<TokenDetails>): void {
    try {

      //  Save the new authToken to localStorage //
      if (this.commonService.isUserOrAdmin === 'user') {
        // Remove existing authToken from localStorage, if any
        const existingToken = localStorage.getItem('authToken');
        if (existingToken) {
          this.logger.info('Removing existing authToken from localStorage in auth service method saveTokenDetails');
          localStorage.removeItem('authToken');
        }

        // Remove existing refreshToken from localStorage, if any
        const existingRefreshToken = localStorage.getItem('refreshToken');
        if (existingRefreshToken) {
          this.logger.info('Removing existing refreshToken from localStorage in auth service method saveTokenDetails');
          localStorage.removeItem('refreshToken');
        }

        this.logger.info('Saving new authToken to localStorage in auth service method saveTokenDetails');
        localStorage.setItem('authToken', JSON.stringify(response.data.accessTokenDetails));
        this.logger.info('Saving new refreshToken to localStorage in auth service method saveTokenDetails');
        localStorage.setItem('refreshToken', JSON.stringify(response.data.refreshTokenDetails));
      } else {
        // Remove existing adminAuthToken from localStorage, if any
        const existingAdminToken = localStorage.getItem('adminAuthToken');
        if (existingAdminToken) {
          this.logger.info('Removing existing adminAuthToken from localStorage in auth service method saveTokenDetails');
          localStorage.removeItem('adminAuthToken');
        }

        // Remove existing adminRefreshToken from localStorage, if any
        const existingAdminRefreshToken = localStorage.getItem('adminRefreshToken');
        if (existingAdminRefreshToken) {
          this.logger.info('Removing existing adminRefreshToken from localStorage in auth service method saveTokenDetails');
          localStorage.removeItem('adminRefreshToken');
        }

        this.logger.info('Saving new adminAuthToken to localStorage in auth service method saveTokenDetails');
        localStorage.setItem('adminAuthToken', JSON.stringify(response.data.accessTokenDetails));
        this.logger.info('Saving new adminRefreshToken to localStorage in auth service method saveTokenDetails');
        localStorage.setItem('adminRefreshToken', JSON.stringify(response.data.refreshTokenDetails));
      }
    } catch (error) {
      this.logger.error('An error occurred while saving token details in auth service method saveTokenDetails : ', error);
    }
  }

  // Method for delete all tokens from localstorage//
  deleteAllTokens(): void {
    try {
      this.logger.info('Deleting all tokens from localStorage in auth service method deleteAllTokens starts');
      // Check if tokens are exits first //
      const existingToken = localStorage.getItem('authToken');
      const existingRefreshToken = localStorage.getItem('refreshToken');
      const existingAdminToken = localStorage.getItem('adminAuthToken');
      const existingAdminRefreshToken = localStorage.getItem('adminRefreshToken');

      // if tokens are exits then delete //
      if (existingToken) {
        localStorage.removeItem('authToken');
      }
      if (existingRefreshToken) {
        localStorage.removeItem('refreshToken');
      }
      if (existingAdminToken) {
        localStorage.removeItem('adminAuthToken');
      }
      if (existingAdminRefreshToken) {
        localStorage.removeItem('adminRefreshToken');
      }
    } catch (error) {
      this.logger.error('Error deleting tokens : ', error.message);
    }
    this.logger.info('Deleting all tokens from localStorage in auth service method deleteAllTokens end');
  }

  // Check access token exists for current user or not //
  isTokenExists(): boolean {

    // Log start of authToken check //
    this.logger.info('Checking if authToken exists in auth service method isTokenExists');

    this.authTokenString = localStorage.getItem('authToken');

    if (this.authTokenString == null) {
      // Log authToken not found //
      this.logger.warn('authToken not found in localStorage in auth service method isTokenExists');
      return false;
    }

    try {
      if (this.authTokenString) {
        this.currentUserAccessToken = JSON.parse(this.authTokenString);
      }

      const tokenExpireTime = new Date(this.currentUserAccessToken.accessTokenTimePeriod);
      const currentDateTime = new Date();

      if (tokenExpireTime > currentDateTime) {
        // Log authToken found //
        this.logger.info('authToken found in localStorage in auth service method isTokenExists');
        return true;
      } else {
        // Log authToken expired //
        this.logger.warn('authToken expired:', tokenExpireTime, currentDateTime);
        return false;
      }
    } catch (error) {
      // Log authToken parsing error //
      this.logger.error('Error in auth service method isTokenExists  : parsing token..');
      return false;
    }
  }

  // Check refresh token exists for current user or not //
  isRefreshTokenExists(): boolean {
    // Log start of token check //
    this.logger.info('Checking if refreshToken exists in auth service method isRefreshTokenExists');

    // Retrieve refreshTokenString from localStorage //
    this.refreshTokenString = localStorage.getItem('refreshToken');

    // Check if refreshTokenString is null //
    if (this.refreshTokenString == null) {
      // Log refresh token not found
      this.logger.warn('Refresh token not found in localStorage in auth service method isRefreshTokenExists');
      return false;
    }

    try {
      if (this.refreshTokenString) {
        this.currentUserRefreshToken = JSON.parse(this.refreshTokenString);
      }

      const tokenExpireTime = new Date(this.currentUserRefreshToken.refreshTokenTimePeriod);
      const currentDateTime = new Date();

      // Check if refresh token is still valid //
      if (tokenExpireTime > currentDateTime) {
        // Log refresh token found and valid //
        this.logger.info('Refresh token found and valid in auth service method isRefreshTokenExists');
        return true;
      } else {
        // Log refresh token expired //
        this.logger.warn('Refresh token expired:', tokenExpireTime, currentDateTime);
        return false;
      }
    } catch (error) {
      // Log error parsing refresh token //
      this.logger.error('Error in auth service method isRefreshTokenExists : parsing token..');
      return false;
    }
  }

  // Check admin access token exists for current admin or not //
  isAdminTokenExists(): boolean {

    // Log start of adminAuthToken check //
    this.logger.info('Checking if adminAuthToken exists in auth service method isAdminTokenExists');

    this.adminAuthTokenString = localStorage.getItem('adminAuthToken');
    if (this.adminAuthTokenString == null) {
      // Log adminAuthToken not found //
      this.logger.warn('adminAuthToken not found in localStorage in auth service method isAdminTokenExists');
      return false;
    }
    try {

      if (this.adminAuthTokenString) {
        this.currentAdminAccessToken = JSON.parse(this.adminAuthTokenString);
      }
      const tokenExpireTime = new Date(this.currentAdminAccessToken.accessTokenTimePeriod);
      const currentDateTime = new Date();

      if (tokenExpireTime > currentDateTime) {
        // Log adminAuthToken found //
        this.logger.info('adminAuthToken found in localStorage in auth service method isAdminTokenExists');
        return true;
      } else {
        // Log adminAuthToken expired //
        this.logger.warn('adminAuthToken expired:', tokenExpireTime, currentDateTime);
        return false;
      }
    } catch (error) {
      // Log adminAuthToken parsing error //
      this.logger.error('Error in auth service method isAdminTokenExists : parsing token..');
      return false;
    }
  }

  // Check admin refresh token exists for current admin or not //
  isAdminRefreshTokenExists(): boolean {
    // Log start of adminRefreshToken check //
    this.logger.info('Checking if adminRefreshToken exists in auth service method isAdminRefreshTokenExists');

    this.adminRefreshTokenString = localStorage.getItem('adminRefreshToken');
    // Check if adminRefreshTokenString is null //
    if (this.adminRefreshTokenString == null) {
      // Log admin refresh token not found
      this.logger.warn('Admin refresh token not found in localStorage in auth service method isAdminRefreshTokenExists');
      return false;
    }

    try {

      if (this.adminRefreshTokenString) {
        this.currentAdminRefreshToken = JSON.parse(this.adminRefreshTokenString);
      }

      const tokenExpireTime = new Date(this.currentAdminRefreshToken.refreshTokenTimePeriod);
      const currentDateTime = new Date();

      // Check if admin refresh token is still valid //
      if (tokenExpireTime > currentDateTime) {
        // Log adminRefreshToken found and valid
        this.logger.info('Admin refresh token found and valid in auth service method isAdminRefreshTokenExists');
        return true;
      } else {
        // Log admin refresh token expired //
        this.logger.warn('Admin refresh token expired:', tokenExpireTime, currentDateTime);
        return false;
      }
    } catch (error) {
      // Log error parsing admin refresh token//
      this.logger.error('Error in auth service isAdminRefreshTokenExists method : parsing token..');
      return false;
    }
  }

  // Method for logging Out //
  logout(): void {
    // Log start of logout process //
    this.logger.info('Starting logout process in auth service method logout');


    let accessToken = localStorage.getItem('authToken');

    let adminAccessToken = localStorage.getItem('adminAuthToken');


    if (accessToken) {

      this.currentAccessToken = JSON.parse(accessToken);
    }
    if (adminAccessToken) {

      this.currentAccessToken = JSON.parse(adminAccessToken);
    }

    const userEmail = this.currentAccessToken.email;
    const requestBody = { Email: userEmail };
    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    try {
      this.http.delete<ApiResponse<string>>(`${environment.WebapiUrl}/authenticatication/logout`, { headers, body: requestBody })
        .subscribe({
          next: (data: ApiResponse<string>) => {

            // Log access token logout successful //
            if (data.statusCode === 200) {
              this.deleteAllTokens();

              this.logger.info('Logout successful in auth service method logout');
              if (this.commonService.isUserOrAdmin === 'user') {
                this.getCurrentBagCounterDetails();
                this.router.navigate(['/login']);
              }
              else {
                this.router.navigate(['/admin-portal/login']);
              }
            }
          },
          error: (error) => {
            let errorMessage: string;
            let baseMessage = 'An error occurred during logout process in auth service method logout';
            if (error.error && error.error.message) {
              errorMessage = baseMessage + error.error.message;
            }
            else {
              errorMessage = baseMessage;
            }
            // Handle different HTTP status codes //
            if (error.error.statusCode == 400 || error.error.statusCode == 500) {
              this.logger.error(errorMessage);
              this.toaster.showError(error.error.message);
            }
            else {
              this.logger.error(errorMessage);
              this.toaster.showError('Server error try again later');
            }
          }
        });
    } catch (error) {
      // Log a logout error //
      this.logger.error('Unexpected error during in auth service method logout : ', error.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }

  //Method for sign in with google //
  signInWithGoogle(): void {
    // Log start of Google sign-in process
    this.logger.info('Starting Google sign-in process in auth service method signInWithGoogle...');
    this.externalAuthService.signIn(GoogleLoginProvider.PROVIDER_ID);
    this.logger.info('End Google sign-in process in auth service method signInWithGoogle...');
  }

  //Method for sign out with google //
  signOutExternal = () => {
    this.logger.info('Starting Google sign-out process in auth service method signOutExternal...');
    this.externalAuthService.signOut();
    this.logger.info('End Google sign-out process in auth service method signOutExternal...');
  }

  // Method for setting the logged-in user name
  setLoggedInUserName(): void {
    try {
      if (localStorage.getItem('authToken') !== null) {
        const authToken = JSON.parse(localStorage.getItem('authToken'));
        if (authToken !== null && authToken.userName !== undefined) {
          this.loggedInUserName = authToken.userName;
          return;
        }
      }
      if (localStorage.getItem('adminAuthToken') !== null) {
        const adminAuthToken = JSON.parse(localStorage.getItem('adminAuthToken'));
        if (adminAuthToken !== null && adminAuthToken.userName !== undefined) {
          this.loggedInUserName = adminAuthToken.userName;
          return;
        }
      }
      if (localStorage.getItem('refreshToken') !== null) {
        const refreshToken = JSON.parse(localStorage.getItem('refreshToken'));
        if (refreshToken !== null && refreshToken.userName !== undefined) {
          this.loggedInUserName = refreshToken.userName;
          return;
        }
      }
      if (localStorage.getItem('adminRefreshToken') !== null) {
        const adminRefreshToken = JSON.parse(localStorage.getItem('adminRefreshToken'));
        if (adminRefreshToken !== null && adminRefreshToken.userName !== undefined) {
          this.loggedInUserName = adminRefreshToken.userName;
          return;
        }
      }
    } catch (error) {
      this.logger.error('Error occurred while setting logged-in user name in auth service method setLoggedInUserName : ', error.message);
    }
  }

  // Method for get exist token in lacalstorage //
  getExistingToken(): AccessTokenDetails | RefreshTokenDetails | null {
    try {
      let accessToken: AccessTokenDetails;
      let refreshToken: RefreshTokenDetails;

      if (localStorage.getItem('authToken') !== null) {
        accessToken = JSON.parse(localStorage.getItem('authToken'));
        return accessToken;
      }
      if (localStorage.getItem('adminAuthToken') !== null) {
        accessToken = JSON.parse(localStorage.getItem('adminAuthToken'));
        return accessToken;
      }
      if (localStorage.getItem('refreshToken') !== null) {
        refreshToken = JSON.parse(localStorage.getItem('refreshToken'));
        return refreshToken;
      }
      if (localStorage.getItem('adminRefreshToken') !== null) {
        refreshToken = JSON.parse(localStorage.getItem('adminRefreshToken'));
        return refreshToken;
      }
      return null;
    } catch (error) {
      this.logger.error('Error occurred while getting existing token in auth service method getExistingToken  : ', error.message);
      return null;
    }
  }

  // Method for refresh bag counter //
  getCurrentBagCounterDetails(): void {
    // Get Current logged in user details //
    try {
      let authTokenString: string = localStorage.getItem('authToken');
      let refreshTokenString: string = localStorage.getItem('refreshToken');
      let currentUserId: number = 0;
      if ((authTokenString != null) || (refreshTokenString != null)) {
        if (authTokenString) {
          currentUserId = JSON.parse(authTokenString).userId;
        }
        else if (refreshTokenString) {
          currentUserId = JSON.parse(refreshTokenString).userId;
        }
        this.cartService.getBagCounterDetails(currentUserId)
          .subscribe({
            next: (counter: ApiResponse<BagCounterDetails>) => {
              // Log information about a successful bag counter fetching //
              this.logger.info('Bag counter fetching successfull in auth service method getCurrentBagCounterDetails..');
              // Handle 200 status code  //
              if (counter.statusCode === 200) {
                this.logger.info('Saving bag counter details ..');
                if (counter.data != null) {
                  this.commonService.cartCount = counter.data.cartCounter;
                }
                else {
                  this.commonService.cartCount = 0;
                }
              }
            },
            error: (error) => {
              // Log information about an error during bag counter fetching //
              let errorMessage: string;
              let baseMessage = 'An error occurred during bag counter fetching in auth service method getCurrentBagCounterDetails';
              if (error.error && error.error.message) {
                errorMessage = baseMessage + error.error.message;
              }
              else {
                errorMessage = baseMessage;
              }
              // Handle different HTTP status codes //
              if (error.error.statusCode == 400) {
                this.logger.error(errorMessage);
                this.toaster.showError(error.error.message);
              }
              else if (error.error.statusCode == 404) {
                this.logger.error(errorMessage);
                this.toaster.showError(error.error.message);
              }
              else if (error.error.statusCode == 500) {
                this.logger.error(errorMessage);
                this.toaster.showError(error.error.message);
              }
              else {
                this.logger.error(errorMessage);
                this.toaster.showError('Server error try again later');
              }
            }
          });
      }
      else if (!authTokenString && !refreshTokenString) {
        this.commonService.cartCount = 0;
      }
    }
    catch (exception) {
      this.logger.error('Unexpected error during in auth service method getCurrentBagCounterDetails : ' + exception.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }
}
