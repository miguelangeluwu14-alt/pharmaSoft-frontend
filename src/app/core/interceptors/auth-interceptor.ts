import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const token = inject(AuthService).token();
  const baseApi = environment.apiUrl.replace(/\/$/, '');
  const esPeticionApi = req.url === baseApi || req.url.startsWith(`${baseApi}/`);
  const esLogin = req.url.split('?')[0] === `${baseApi}/auth/login`;

  // Nunca enviar el JWT a dominios externos ni al endpoint de login.
  if (!token || !esPeticionApi || esLogin) {
    return next(req);
  }

  // Agrega el token a las peticiones de nuestra API
  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
  );
};
