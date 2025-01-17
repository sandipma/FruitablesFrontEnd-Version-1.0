import { Injectable } from '@angular/core';
import { CanActivate, Router} from '@angular/router';
import { AuthService } from 'src/app/Services/Auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserRoleGuard implements CanActivate {

  constructor(private router: Router,
              private authService :AuthService) {}

  canActivate(): boolean {
    
   if((this.authService.isTokenExists() || this.authService.isRefreshTokenExists()))
   {
    return true;
   }
   
    this.router.navigate(['/login']);
  
   return false;
  }
}

