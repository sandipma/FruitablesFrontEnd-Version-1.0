import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from 'src/app/Components/Shared/login/login.component';
import { RegisterComponent } from 'src/app/Components/Shared/register/register.component';
import { ForgotPasswordComponent } from 'src/app/Components/Shared/forgot-password/forgot-password.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ResetPasswordComponent } from 'src/app/Components/Shared/reset-password/reset-password.component';
import { SharedRoutingModule } from './shared-routing.module';
import { GoogleLoginProvider, SocialAuthServiceConfig, SocialLoginModule } from '@abacritt/angularx-social-login';
import { ConfirmOTPComponent } from 'src/app/Components/Shared/confirm-otp/confirm-otp.component';
import { SendOTPComponent } from 'src/app/Components/Shared/send-OTP/send-otp.component';


@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    ResetPasswordComponent,
    ForgotPasswordComponent,
    ConfirmOTPComponent,
    SendOTPComponent
  ],

  imports: [
    CommonModule,
    SharedRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SocialLoginModule
  ],
  providers: [

    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '129674012722-0km1i2d1bnulsjou29ou07il6himj8uc.apps.googleusercontent.com',
              {
                oneTapEnabled: false,
              }
            )
          },
        ],
        onError: (err) => {
          console.error(err);
        }
      } as SocialAuthServiceConfig,
    },
  ],
})
export class SharedModule { }
