import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { ApiResponse } from 'src/app/Models/ApiResponse/api-response';
import { AddCartDetails } from 'src/app/Models/Cart/add-cart-details';
import { BagCounterDetails } from 'src/app/Models/Cart/bag-counter-details';
import { CategoryWithProductCount } from 'src/app/Models/Category/category-with-product-count';
import { AllShopDetails } from 'src/app/Models/Shop/all-shop-details';
import { ShopFilterCriterio } from 'src/app/Models/Shop/shop-filter-criterio';
import { CartService } from 'src/app/Services/Cart/cart.service';
import { CategoryService } from 'src/app/Services/Category/category.service';
import { CommonService } from 'src/app/Services/Common/common.service';
import { CustomToasterService } from 'src/app/Services/Custom-Toaster/custom-toaster.service';
import { ShopService } from 'src/app/Services/Shop/shop.service';


@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit {

  // Variable Declaration //
  allProducts: AllShopDetails[] = [];
  filteredProducts: AllShopDetails[] = [];
  currentProducts: AllShopDetails[] = [];
  catWithProductCountDetailsList: CategoryWithProductCount[] = [];
  products: string[] = [];
  ordersPerPage: number = 9;
  searchKeywords: string = null;
  isAddedToCart: boolean = false;
  finalPrice: number = 0;
  cartDetails: AddCartDetails = null;
  currentPage: number = 1;
  searchBar: string = null;
  selectedFruitIndex: number | null = null;
  isLoading: boolean = false;

  // Constructor Initilisation //
  constructor(public shopService: ShopService,
    private toaster: CustomToasterService,
    private router: Router,
    private categoryService: CategoryService,
    private commonService: CommonService,
    private logger: NGXLogger,
    private cartService: CartService) {
    this.products = Array.from({ length: 50 }, (_, i) => `Product ${i + 1}`);
  }

  // On Load Function //
  ngOnInit(): void {

    this.commonService.scrollToTop();

    const filterCriterio: ShopFilterCriterio = {
      categoryName: this.shopService.categoryName,
      priceValue: this.shopService.priceValue,
      sortValue: this.shopService.sortValue
    };

    this.getAllShopProducts(filterCriterio);

    this.getCategoryAndProductCount();
  }

  //**********************Methods**********************//

  // Method for navigate to specific product details //
  navigateToDetails(event: Event, prodId: number, prodPrice: number, prodQuantity: string): void {
    event.preventDefault();
    const productWithQuantityDetails =
    {
      productId: prodId,
      price: prodPrice,
      selectedOption: prodQuantity
    };
    this.router.navigate(['/shop-details', prodId], { state: productWithQuantityDetails });
  }

  // Method to get all shop details with products //
  getAllShopProducts(ShopFilterCriterio: ShopFilterCriterio): void {
    try {
      this.logger.info('Starting fetching all products in shop component method getAllShopProducts ...');
      this.isLoading = true;
      // Send a request to the server //
      this.shopService.getAllShopDetails(ShopFilterCriterio)
        .subscribe({
          next: (response: ApiResponse<AllShopDetails[]>) => {
            // Log information about a successful all shop products fetching //
            this.logger.info('All shop wise product fetching successfull in shop component method getAllShopProducts..');

            // Handle 200 status code  //
            if (response.statusCode === 200) {
              if (response.data != null) {
                this.logger.info('Saving all shop  wise product in shop component method getAllShopProducts..');
                this.allProducts = response.data;
                this.currentProducts = response.data;
                this.isLoading = false;
                this.allProducts.forEach(element => {
                  if (element.stockQuantity <= 0) {
                    element.isQuantityAvailable = "Out of stock";
                  }
                });
                this.commonService.scrollToTop();
              }
              else {
                this.allProducts = [];
                this.commonService.scrollToTop();
              }
            }
          },
          error: (error) => {
            // Log information about an error all shop details wise product //
            this.isLoading = false;
            let errorMessage: string;
            let baseMessage = 'An error occurred during All shop wise product fetching in shop component method getAllShopProducts';
            if (error.error && error.error.message) {
              errorMessage = baseMessage + error.error.message;
            }
            else {
              errorMessage = baseMessage;
            }
            if (error.error.statusCode == 400) {
              this.logger.error(errorMessage);
              this.toaster.showError(error.error.message);
            }
            else if (error.error.statusCode == 500) {
              this.logger.error(errorMessage);
              this.toaster.showError(error.error.message);
            }
            else if (error.error.statusCode === 401) {
              this.logger.error("User un-authorized please log in")
              this.toaster.showError("Your session expired. Please log in.");
              this.router.navigate(['/login']);
            }
            else if (error.error.statusCode === 403) {
              this.logger.error("Permission denied error..");
              this.toaster.showError("You do not have permission to access this resource.");
            }
            else {
              this.logger.error(errorMessage);
              this.toaster.showError('Server error try again later');
            }
          }
        });

    } catch (error) {
      // Log information about an unexpected exception //
      this.isLoading = false;
      this.logger.error('Unexpected error during during All shop wise product fetching in shop component method getAllShopProducts :' + error.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }

  // Method for get category with product count //
  getCategoryAndProductCount(): void {
    try {
      this.logger.info('Starting fetching category with product count in shop component method getCategoryAndProductCount');
      // Send a request to the server //
      this.categoryService.getCategoryWithProductsCount()
        .subscribe({
          next: (response: ApiResponse<CategoryWithProductCount[]>) => {
            // Log information about a successful category with product fetching //
            this.logger.info('Catgegory with product count fetching successfull in shop component method getCategoryAndProductCount..');
            // Handle 200 status code  //
            if (response.statusCode === 200) {
              if (response.data != null) {
                this.logger.info('Saving catgegory with product count in shop component method getCategoryAndProductCount..');
                this.catWithProductCountDetailsList = response.data;
              }
              else {
                this.logger.error('No catgegory found with product count in shop component method getCategoryAndProductCount..');
                this.catWithProductCountDetailsList = [];
              }
            }
          },
          error: (error) => {
            // Log information about an error during category with product count //
            let errorMessage = 'An error occurred during category with products count..';
            if (error.error && error.error.message) {
              errorMessage = error.error.message;
            }
            // Handle different HTTP status codes
            if (error.error.statusCode == 500) {
              this.logger.error(error.error.message);
              this.toaster.showError(error.error.message);
            }
            else if (error.error.statusCode === 401) {
              this.logger.error("User un-authorized please log in")
              this.toaster.showError("Your session expired. Please log in.");
              this.router.navigate(['/login']);
            }
            else if (error.error.statusCode === 403) {
              this.logger.error("Permission denied error..");
              this.toaster.showError("You do not have permission to access this resource.");
            }
            else {
              this.logger.error('Server error during category with product count in shop component method getCategoryAndProductCount : ' + errorMessage);
              this.toaster.showError('Server error try again later');
            }
          }
        });

    } catch (error) {
      // Log information about an unexpected exception
      this.logger.error('Unexpected error during category with product count  in shop component method getCategoryAndProductCount : ' + error.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }

  // Method for category click //
  onCategoryClick(index: number, event: MouseEvent, categoryName: string): void {
    this.commonService.scrollToTop();
    event.preventDefault();
    this.searchBar = null;
    this.currentPage = 1;
    this.selectedFruitIndex = index;
    if (this.shopService.categoryName != categoryName) {
      this.shopService.categoryName = categoryName;
      this.shopService.priceValue = 500;
      this.shopService.sortValue = 'Popularity';
      const filterCriterio: ShopFilterCriterio = {
        categoryName: categoryName,
        priceValue: 500,
        sortValue: 'Popularity'
      };

      this.getAllShopProducts(filterCriterio);
    }
    else {
      const filterCriterio: ShopFilterCriterio = {
        categoryName: this.shopService.categoryName,
        priceValue: this.shopService.priceValue,
        sortValue: this.shopService.sortValue
      };
      this.getAllShopProducts(filterCriterio);
    }

  }


  // Method for search a product//
  onSearch(event: Event): void {
    this.commonService.scrollToTop();
    event.preventDefault();
    this.currentPage = 1;
    const searchKeywordLower = this.searchBar.toLowerCase();
    if (searchKeywordLower != "") {
      this.filteredProducts = this.currentProducts
        .filter(item => {
          const productNameLower = item.productName.toLowerCase();
          return productNameLower.includes(searchKeywordLower);
        });
      this.allProducts = this.filteredProducts;
    }
    else {
      this.allProducts = [];
    }
  }

  // Method for on price range slider change //
  onPriceRangeChange(event: Event): void {
    event.preventDefault();
    this.commonService.scrollToTop();
    this.searchBar = null;
    const filterCriterio: ShopFilterCriterio = {
      categoryName: this.shopService.categoryName,
      priceValue: this.shopService.priceValue,
      sortValue: this.shopService.sortValue
    };

    this.shopService.priceValue = this.shopService.priceValue;
    this.getAllShopProducts(filterCriterio);
  }

  // Method for add respective cart to item //
  addToCart(data: AllShopDetails): void {
    try {
      const currentLoggedInUser = this.commonService.getAvailableTokensDetails();
      if (currentLoggedInUser == null) {
        this.logger.warn('User is not logged in shop component method addToCart');
        this.toaster.showWarning('Kindly login to purchase product..!!');
      }
      if (currentLoggedInUser != null) {
        this.logger.info('User is logged in sucessfull in shop component method addToCart');
        if (data != null) {
          data.isAddedToCart = true;

          if (data.selectedOption === '1') {
            this.finalPrice = data.price;
          }
          else if (data.selectedOption === '2') {
            this.finalPrice = data.price / 2;
          }
          else if (data.selectedOption === '3') {
            this.finalPrice = data.price / 4;
          }
          else {
            this.finalPrice = data.price;
          }
          this.logger.info('Creating top product data in shop component method addToCart..');
          this.cartDetails =
          {
            productImage: data.imageData,
            productName: data.productName,
            price: this.finalPrice,
            subTotal: this.finalPrice,
            userId: currentLoggedInUser.userId,
            currentQuant: 1
          }
        }
        this.logger.info('Creating top product data sucessfull in shop component method addToCart..');

        this.cartService.createCartDetails(this.cartDetails)
          .subscribe({
            next: (response: ApiResponse<string>) => {
              // Log information about a successful cart creation //
              this.logger.info('Cart creation successful in shop component method addToCart..');
              // Handle 201 status code //
              if (response.statusCode === 201) {
                this.logger.info('Item added successfully in shop component method addToCart..');
                this.toaster.showSuccess(response.message);
              }
              this.cartService.getBagCounterDetails(currentLoggedInUser.userId)
                .subscribe({
                  next: (counter: ApiResponse<BagCounterDetails>) => {
                    // Log information about a successful bag counter fetching //
                    this.logger.info('Bag counter fetching successfull in shop component method addToCart..');

                    // Handle 200 status code  //
                    if (counter.statusCode === 200) {
                      this.logger.info('Saving bag counter details in shop component method addToCart..');
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
                    let errorMessage = 'An error occurred during bag counter fetching in shop component method addToCart..';
                    if (error.error && error.error.message) {
                      errorMessage = error.error.message;
                    }
                    // Handle different HTTP status codes
                    if (error.error.statusCode == 400) {
                      this.logger.error(error.error.message);
                      this.toaster.showError(error.error.message);
                    }
                    else if (error.error.statusCode == 404) {
                      this.logger.error(error.error.message);
                      this.toaster.showError(error.error.message);
                    }
                    else if (error.error.statusCode == 500) {
                      this.logger.error(error.error.message);
                      this.toaster.showError(error.error.message);
                    }
                    else if (error.error.statusCode === 401) {
                      this.logger.error("User un-authorized please log in")
                      this.toaster.showError("Your session expired. Please log in.");
                      this.router.navigate(['/login']);
                    }
                    else if (error.error.statusCode === 403) {
                      this.logger.error("Permission denied error..");
                      this.toaster.showError("You do not have permission to access this resource.");
                    }
                    else {
                      this.logger.error('Server error during bag counter fetching in shop component method addToCart : ' + errorMessage);
                      this.toaster.showError('Server error try again later');
                    }
                  }
                });
            },
            error: (error: any) => {
              // Log information about an error during cart creation //
              data.isAddedToCart = false;
              let errorMessage = 'An error occurred during cart creation API call in shop component method addToCart..';
              if (error.error && error.error.message) {
                errorMessage = error.error.message;
              }
              // Handle different HTTP status codes //
              if (error.error.statusCode == 400) {
                this.logger.error(error.error.message);
                this.toaster.showError(error.error.message);
              }
              else if (error.error.statusCode == 404) {
                this.logger.error(error.error.message);
                this.toaster.showError(error.error.message);
              }
              else if (error.error.statusCode == 409) {
                this.logger.warn(error.error.message);
                this.toaster.showWarning(error.error.message);
                data.isAddedToCart = false;
              }
              else if (error.error.statusCode == 500) {
                this.logger.error(error.error.message);
                this.toaster.showError(error.error.message);
              }
              else if (error.error.statusCode === 401) {
                this.logger.error("User un-authorized please log in")
                this.toaster.showError("Your session expired. Please log in.");
                this.router.navigate(['/login']);
              }
              else if (error.error.statusCode === 403) {
                this.logger.error("Permission denied error..");
                this.toaster.showError("You do not have permission to access this resource.");
              }
              else {
                this.logger.error('Error during cart creation in shop component method addToCart : ' + errorMessage);
                this.toaster.showError('Server error try again later');
              }
            }
          });
      }
    }
    catch (error) {
      data.isAddedToCart = false;
      this.logger.error('Unexpected error during add to cart in shop component method addToCart : ' + error.message);
      this.toaster.showError('An unexpected error try again later');
    }
  }

  // Method for sorting product on different criteria //
  onSortChange(event: Event) {
    this.commonService.scrollToTop();

    this.searchBar = null;

    event.preventDefault();

    const selectedSortValue = (event.target as HTMLSelectElement).value;

    this.currentPage = 1;

    const filterCriterio: ShopFilterCriterio = {
      categoryName: this.shopService.categoryName,
      priceValue: this.shopService.priceValue,
      sortValue: selectedSortValue
    };

    this.shopService.sortValue = selectedSortValue;
    this.getAllShopProducts(filterCriterio);
  }

  // Method for getting max pages //
  get maxPages(): number {
    return Math.ceil(this.allProducts.length / this.ordersPerPage);
  }

  // Method for getting paginated orders //
  get paginatedOrders(): AllShopDetails[] {
    const startIndex = (this.currentPage - 1) * this.ordersPerPage;
    const endIndex = Math.min(startIndex + this.ordersPerPage, this.allProducts.length);
    return this.allProducts.slice(startIndex, endIndex);
  }

  // Method for clicking on the next page //
  nextPage(): void {
    this.commonService.scrollToTop();
    if (this.currentPage < this.maxPages) {
      this.currentPage++;
    }
  }

  // Method for clicking on the previous page //
  previousPage(): void {
    this.commonService.scrollToTop();
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // Method for price dropdown change //
  onDropdownChange(event: Event, data: AllShopDetails) {
    this.logger.info('Starting dropdown change in shop component method onDropdownChange');
    if (data != null) {
      data.isAddedToCart = false;
      const selectedValue = (event.target as HTMLSelectElement).value;
      data.selectedOption = selectedValue;
    }
    this.logger.info('Completed dropdown change in shop component method onDropdownChange');
  }

  // Method for calculate price //
  calculatePrice(data: AllShopDetails): number {
    this.logger.info('Starting calculate price in shop component method calculatePrice');
    if (data != null) {
      switch (data.selectedOption) {
        case '1':
          return data.price; // 1 Kg
        case '2':
          return data.price / 2; // 500 gm
        case '3':
          return data.price / 4; // 250 gm
        default:
          return data.price;
      }
    }
    this.logger.info('Completed calculate price in shop component method calculatePrice');
    return 0;
  }
}
