import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';

import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth-service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {

  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(

    catchError((err: HttpErrorResponse) => {

      // No cerramos sesión si el 401 viene del propio login,
      // porque ahí significa usuario o contraseña incorrectos.
      if (
        err.status === 401 &&
        !req.url.endsWith('/auth/login')
      ) {

        auth.cerrarSesion(
          'expirada',
          router.url
        );
      }

      return throwError(() => err);
    })
  );
};