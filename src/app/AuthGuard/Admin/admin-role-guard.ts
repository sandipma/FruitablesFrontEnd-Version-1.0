import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from 'src/app/Services/Auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminRoleGuardGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    
   if(this.authService.isAdminTokenExists() || this.authService.isAdminRefreshTokenExists())
   {
    return true;
   }
   this.router.navigate(['/admin-portal/login']);
   
   return false;
  }
}
