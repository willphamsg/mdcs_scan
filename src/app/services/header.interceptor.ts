import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const headerInterceptor: HttpInterceptorFn = (req, next) => {
  const oAuthService = inject(AuthService);
  const authToken = oAuthService.getToken();
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });

  return next(authReq).pipe();
};
