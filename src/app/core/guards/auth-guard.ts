import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth-service';

/**
 * Solo deja pasar si hay sesión.
 * Si no hay sesión, envía al login y guarda la ruta solicitada.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);

  if (auth.autenticado()) {
    return true;
  }

  return inject(Router).createUrlTree(
    ['/login'],
    {
      queryParams: {
        returnUrl: state.url
      }
    }
  );
};

/**
 * El login solo puede abrirlo quien no ha iniciado sesión.
 */
export const invitadoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);

  return auth.autenticado()
    ? inject(Router).createUrlTree(['/inicio'])
    : true;
};