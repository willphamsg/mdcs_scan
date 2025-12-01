import { CanActivateFn, Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { inject } from '@angular/core';

export const DagwGuard: CanActivateFn = () => {
  if (environment.dagw) {
    return true;
  } else {
    inject(Router).navigate(['/sign-in']);
    return false;
  }
};

export const MdcsGuard: CanActivateFn = () => {
  if (environment.dagw) {
    inject(Router).navigate(['/sign-in']);
    return false;
  } else {
    return true;
  }
};
