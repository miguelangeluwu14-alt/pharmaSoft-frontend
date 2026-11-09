import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LoginRequest,
  LoginResponse,
  Permiso,
  PerfilUsuario,
  Sesion
} from './auth.model';

const CLAVE_SESION = 'pharmasoft.sesion';

/** El backend de /auth/me usa empleadoNombre; se normaliza para la SPA. */
interface RespuestaPerfil {
  username: string;
  nombreCompleto?: string;
  empleadoNombre?: string;
  roles: string[];
  permisos: Permiso[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly url = `${environment.apiUrl}/auth`;

  private readonly sesionActual =
    signal<Sesion | null>(this.leerSesionGuardada());

  private readonly segundosActuales = signal(0);
  private readonly avisoOculto = signal(false);

  private temporizador?: ReturnType<typeof setTimeout>;
  private intervalo?: ReturnType<typeof setInterval>;

  readonly sesion = this.sesionActual.asReadonly();
  readonly segundosRestantes = this.segundosActuales.asReadonly();

  readonly autenticado = computed(
    () => this.sesionActual() !== null
  );

  /** Verdadero cuando existe una sesión y le quedan dos minutos o menos. */
  readonly porVencer = computed(() =>
    this.autenticado() && this.segundosRestantes() <= 120
  );

  readonly mostrarAviso = computed(() =>
    this.porVencer() && !this.avisoOculto()
  );

  constructor() {
    const sesion = this.sesionActual();

    if (sesion) {
      this.programarExpiracion(sesion);
    }
  }

  login(credenciales: LoginRequest): Observable<Sesion> {

    return this.http
      .post<LoginResponse>(`${this.url}/login`, credenciales)
      .pipe(

        map(respuesta => ({
          token: respuesta.token,

          expiraEn:
            Date.now() +
            respuesta.expiraEnSegundos * 1000,

          username: respuesta.username,

          nombreCompleto:
            respuesta.nombreCompleto,

          roles: respuesta.roles,

          permisos: respuesta.permisos
        })),

        tap(sesion => this.iniciar(sesion))
      );
  }

  /** La respuesta es la información actual del servidor, no la copia local. */
  obtenerPerfil(): Observable<PerfilUsuario> {
    return this.http.get<RespuestaPerfil>(`${this.url}/me`).pipe(
      map(datos => ({
        username: datos.username,
        nombreCompleto: datos.nombreCompleto || datos.empleadoNombre || datos.username,
        roles: datos.roles,
        permisos: datos.permisos
      }))
    );
  }

  ocultarAviso(): void {
    this.avisoOculto.set(true);
  }

  cerrarSesion(
    motivo?: 'expirada',
    volverA?: string
  ): void {

    this.detenerTemporizadores();

    sessionStorage.removeItem(CLAVE_SESION);

    this.sesionActual.set(null);
    this.segundosActuales.set(0);
    this.avisoOculto.set(false);

    const queryParams:
      Record<string, string> = {};

    if (motivo) {
      queryParams['expirada'] = '1';
    }

    if (
      volverA &&
      volverA !== '/login'
    ) {
      queryParams['returnUrl'] = volverA;
    }

    this.router.navigate(
      ['/login'],
      { queryParams }
    );
  }

  token(): string | null {

    const sesion =
      this.sesionActual();

    if (
      sesion &&
      Date.now() < sesion.expiraEn
    ) {
      return sesion.token;
    }

    return null;
  }

  tienePermiso(
    permiso: Permiso
  ): boolean {

    return (
      this.sesionActual()
        ?.permisos
        .includes(permiso)
      ?? false
    );
  }

  private iniciar(
    sesion: Sesion
  ): void {

    sessionStorage.setItem(
      CLAVE_SESION,
      JSON.stringify(sesion)
    );

    this.sesionActual.set(sesion);
    this.avisoOculto.set(false);

    this.programarExpiracion(sesion);
  }

  private programarExpiracion(
    sesion: Sesion
  ): void {

    this.detenerTemporizadores();

    const restante =
      sesion.expiraEn -
      Date.now();

    if (restante <= 0) {
      this.cerrarSesion('expirada', this.router.url);
      return;
    }

    this.actualizarSegundos(sesion);

    this.intervalo = setInterval(() => {
      if (Date.now() >= sesion.expiraEn) {
        this.cerrarSesion('expirada', this.router.url);
        return;
      }

      this.actualizarSegundos(sesion);
    }, 1000);

    this.temporizador =
      setTimeout(
        () =>
          this.cerrarSesion(
            'expirada',
            this.router.url
          ),
        restante
      );
  }

  private actualizarSegundos(sesion: Sesion): void {
    this.segundosActuales.set(Math.max(
      0,
      Math.floor((sesion.expiraEn - Date.now()) / 1000)
    ));
  }

  private detenerTemporizadores(): void {
    clearTimeout(this.temporizador);
    clearInterval(this.intervalo);
    this.temporizador = undefined;
    this.intervalo = undefined;
  }

  private leerSesionGuardada():
    Sesion | null {

    try {

      const texto =
        sessionStorage
          .getItem(CLAVE_SESION);

      if (!texto) {
        return null;
      }

      const sesion =
        JSON.parse(texto) as Sesion;

      if (
        !sesion.token ||
        Date.now() >= sesion.expiraEn
      ) {

        sessionStorage
          .removeItem(CLAVE_SESION);

        return null;
      }

      return sesion;

    } catch {

      sessionStorage
        .removeItem(CLAVE_SESION);

      return null;
    }
  }
}
