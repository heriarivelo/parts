// role.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    const requiredRoles = next.data['roles'] as Array<string>;
    const user = this.authService.currentUserValue;
    
    if (user && requiredRoles.includes(user.role)) {
      return true;
    }
    
    this.router.navigate(['/']);
    return false;
  }
}