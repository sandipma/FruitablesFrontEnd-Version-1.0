import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminRoleGuardGuard } from 'src/app/AuthGuard/Admin/admin-role-guard';
import { AdminOrdersComponent } from 'src/app/Components/Admin/admin-orders/admin-orders.component';
import { AdminSectionComponent } from 'src/app/Components/Admin/base/admin-section.component';
import { AddCategoryComponent } from 'src/app/Components/Admin/category/add-category/add-category.component';
import { CategoryListComponent } from 'src/app/Components/Admin/category/category-list/category-list.component';
import { HomeComponent } from 'src/app/Components/Admin/home/home.component';
import { OrderDetailsComponent } from 'src/app/Components/Admin/order-details/order-details.component';
import { AddProductsComponent } from 'src/app/Components/Admin/products/add-products/add-products.component';
import { ProductListComponent } from 'src/app/Components/Admin/products/product-list/product-list.component';
import { ConfirmOTPComponent } from 'src/app/Components/Shared/confirm-otp/confirm-otp.component';
import { ForgotPasswordComponent } from 'src/app/Components/Shared/forgot-password/forgot-password.component';
import { LoginComponent } from 'src/app/Components/Shared/login/login.component';
import { RegisterComponent } from 'src/app/Components/Shared/register/register.component';
import { ResetPasswordComponent } from 'src/app/Components/Shared/reset-password/reset-password.component';
import { SendOTPComponent } from 'src/app/Components/Shared/send-OTP/send-otp.component';

const routes: Routes = [
  {
    path: '',
    component: AdminSectionComponent,

    children: [
      { path: '', component: HomeComponent },
      { path: 'add-product', component: AddProductsComponent, canActivate: [AdminRoleGuardGuard] },
      { path: 'product-list', component: ProductListComponent},
      { path: 'update-product/:id', component: AddProductsComponent, canActivate: [AdminRoleGuardGuard] },
      { path: 'add-category', component: AddCategoryComponent, canActivate: [AdminRoleGuardGuard] },
      { path: 'category-list', component: CategoryListComponent, canActivate: [AdminRoleGuardGuard] },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
      { path: 'send-OTP', component: SendOTPComponent },
      { path: 'confirm-OTP/:email', component: ConfirmOTPComponent },
      { path: 'admin-orders', component: AdminOrdersComponent, canActivate: [AdminRoleGuardGuard] },
      { path: 'view-details/:id', component: OrderDetailsComponent , canActivate: [AdminRoleGuardGuard]},
      { path: '**', redirectTo: 'not-found', pathMatch: 'full' }, // Redirect to NotFoundComponent for unmatched paths
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
