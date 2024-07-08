import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { ToastrModule } from 'ngx-toastr';
import { SharedModule } from './Module/Shared/shared.module';
import { AdminModule } from './Module/Admin/admin.module';
import { UserModule } from './Module/User/user.module';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NotFoundComponent } from './Components/NotFound/not-found.component';
import { FAQComponent } from './Components/User/faq/faq.component';
import { PrivacyPolicyComponent } from './Components/User/privacy-policy/privacy-policy.component';
import { GroupByOrdersPipe } from './Pipes/GroupByOrders/group-by-orders.pipe';
import { CommonModule } from '@angular/common';
import { TokenInterceptorInterceptor } from './Interceptor/token-interceptor.interceptor';
@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
    FAQComponent,
    PrivacyPolicyComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ToastrModule,
    RouterModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-center',
      timeOut: 5000
    }),
    CommonModule,
    AdminModule,
    UserModule,
    SharedModule,
    LoggerModule.forRoot({
      level: NgxLoggerLevel.DEBUG
    })
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorInterceptor,
      multi: true
    },
    GroupByOrdersPipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
