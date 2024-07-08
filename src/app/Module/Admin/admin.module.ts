import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from 'src/app/Components/Admin/home/home.component';
import { AddProductsComponent } from 'src/app/Components/Admin/products/add-products/add-products.component';
import { ProductListComponent } from 'src/app/Components/Admin/products/product-list/product-list.component';
import { AddCategoryComponent } from 'src/app/Components/Admin/category/add-category/add-category.component';
import { CategoryListComponent } from 'src/app/Components/Admin/category/category-list/category-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminSectionComponent } from 'src/app/Components/Admin/base/admin-section.component';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ProductrunPipe } from 'src/app/Pipes/ProductTrunc/productrun.pipe';
import { AdminOrdersComponent } from 'src/app/Components/Admin/admin-orders/admin-orders.component';
import { OrderDetailsComponent } from 'src/app/Components/Admin/order-details/order-details.component';

@NgModule({
  declarations: [
    ProductrunPipe,
    HomeComponent,
    AddProductsComponent,
    ProductListComponent,
    AddCategoryComponent,
    CategoryListComponent,
    AdminSectionComponent,
    AdminOrdersComponent,
    OrderDetailsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    AdminRoutingModule,
    HttpClientModule,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA // Add CUSTOM_ELEMENTS_SCHEMA here
  ]
})
export class AdminModule { }
