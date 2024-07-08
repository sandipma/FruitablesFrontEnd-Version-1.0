import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/Components/User/home/home.component';
import { CartComponent } from 'src/app/Components/User/cart/cart.component';
import { CheckoutComponent } from 'src/app/Components/User/checkout/checkout.component';
import { ContactComponent } from 'src/app/Components/User/contact/contact.component';
import { LoginComponent } from 'src/app/Components/Shared/login/login.component';
import { RegisterComponent } from 'src/app/Components/Shared/register/register.component';
import { ResetPasswordComponent } from 'src/app/Components/Shared/reset-password/reset-password.component';
import { ShopComponent } from 'src/app/Components/User/shop/shop.component';
import { ShopdetailsComponent } from 'src/app/Components/User/shop-details/shopdetails.component';
import { ForgotPasswordComponent } from 'src/app/Components/Shared/forgot-password/forgot-password.component';
import { UserSectionComponent } from 'src/app/Components/User/base/user-section.component';
import { OrderSuccessComponent } from 'src/app/Components/User/order-success/order-success.component';
import { ConfirmOTPComponent } from 'src/app/Components/Shared/confirm-otp/confirm-otp.component';
import { AboutUsComponent } from 'src/app/Components/User/about-us/about-us.component';
import { FAQComponent } from 'src/app/Components/User/faq/faq.component';
import { PrivacyPolicyComponent } from 'src/app/Components/User/privacy-policy/privacy-policy.component';
import { SendOTPComponent } from 'src/app/Components/Shared/send-OTP/send-otp.component';
import { MyOrdersComponent } from 'src/app/Components/User/my-orders/my-orders.component';
import { UserRoleGuard } from 'src/app/AuthGuard/User/user-role-guard';

const routes: Routes = [
  {
    path: '',
    component: UserSectionComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
      { path: 'cart', component: CartComponent ,canActivate: [UserRoleGuard]},
      { path: 'shop', component: ShopComponent ,canActivate: [UserRoleGuard]},
      { path: 'shop-details/:prodId', component: ShopdetailsComponent,canActivate: [UserRoleGuard] },
      { path: 'checkout', component: CheckoutComponent,canActivate: [UserRoleGuard] },
      { path: 'contact', component: ContactComponent },
      { path: 'order-sucess', component: OrderSuccessComponent ,canActivate: [UserRoleGuard]},
      { path: 'about-us', component: AboutUsComponent },
      { path: 'FAQ', component: FAQComponent },
      { path: 'privacy-policy', component: PrivacyPolicyComponent },
      { path: 'confirm-OTP/:email', component: ConfirmOTPComponent },
      { path: 'send-OTP', component: SendOTPComponent },
      { path: 'my-orders', component: MyOrdersComponent,canActivate: [UserRoleGuard] },
      { path: '**', redirectTo: 'not-found', pathMatch: 'full' }, // Redirect to NotFoundComponent for unmatched paths
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
