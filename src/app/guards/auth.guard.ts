import { inject } from '@angular/core';
import { CanActivateFn, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';

export const AuthGuard: CanActivateFn = ():
  | Observable<boolean | UrlTree>
  | Promise<boolean | UrlTree>
  | boolean
  | UrlTree => {
  const service = inject(AuthService);
  if (environment.enableSSO) {
    return service.canActivateProtectedRoutes$.pipe(
      tap(x => console.log('You tried to go to  and this guard said ' + x))
    );
  }
  return service.isAuthenticated();
};
