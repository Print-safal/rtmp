import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = () => {

  console.log('AUTH GUARD EXECUTED');

  const auth = inject(AuthService);
  const router = inject(Router);

  console.log(auth.isLoggedIn());

  if (auth.isLoggedIn()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};