import { inject, Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { Observable } from 'rxjs';

interface TokenPayload {
  exp: number; // timestamp em segundos
  iat: number; // timestamp em segundos
}

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> | Promise<boolean> {

    const authData = sessionStorage.getItem('token');

    if(!authData) {
        this.router.navigate(['/login']);
        return false;
    }
    
    try {
      const user = JSON.parse(authData);

      // Verifica se o token existe
      if (!user.token) {
        this.router.navigate(['/login']);
        return false;
      }

      // Verifica se o token expirou
      const now = new Date();
      const expiration = new Date(user.dataExpiracao);
      if (expiration <= now) {
        this.router.navigate(['/login']);
        return false;
      }

      return true; // Está autenticado e com token válido
      
    } catch (error) {
      this.router.navigate(['/login']);
      return false;
    }
  }
}