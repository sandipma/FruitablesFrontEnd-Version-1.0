import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from 'src/app/Components/User/home/home.component';
import { ContactComponent } from 'src/app/Components/User/contact/contact.component';
import { CartComponent } from 'src/app/Components/User/cart/cart.component';
import { CheckoutComponent } from 'src/app/Components/User/checkout/checkout.component';
import { ShopComponent } from 'src/app/Components/User/shop/shop.component';
import { ShopdetailsComponent } from 'src/app/Components/User/shop-details/shopdetails.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserSectionComponent } from 'src/app/Components/User/base/user-section.component';
import { UserRoutingModule } from './user-routing.module';
import { SummaryPipe } from 'src/app/Pipes/SummaryTrunc/summary.pipe';
import { HttpClientModule } from '@angular/common/http';
import { OrderSuccessComponent } from 'src/app/Components/User/order-success/order-success.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { AboutUsComponent } from 'src/app/Components/User/about-us/about-us.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { MyOrdersComponent } from 'src/app/Components/User/my-orders/my-orders.component';
import { GroupByOrdersPipe } from 'src/app/Pipes/GroupByOrders/group-by-orders.pipe';

@NgModule({
  declarations: [
    SummaryPipe,
    GroupByOrdersPipe,
    HomeComponent,
    CartComponent,
    ShopComponent,
    ShopdetailsComponent,
    CheckoutComponent,
    UserSectionComponent,
    OrderSuccessComponent,
    ContactComponent,
    AboutUsComponent,
    MyOrdersComponent
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    HttpClientModule,
    GoogleMapsModule,
    NgxPaginationModule
  ]
})
export class UserModule { }
