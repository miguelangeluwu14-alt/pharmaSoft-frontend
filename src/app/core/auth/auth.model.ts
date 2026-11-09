/** Permisos que emite PharmaBackend. */
export type Permiso =
  | 'CATALOGO_LEER'
  | 'CATALOGO_ESCRIBIR'
  | 'CLIENTES_LEER'
  | 'CLIENTES_ESCRIBIR'
  | 'VENTAS_LEER'
  | 'VENTAS_REGISTRAR'
  | 'REPORTES_VER'
  | 'USUARIOS_ADMINISTRAR';

/** Lo que se envía a POST /auth/login. */
export interface LoginRequest {
  username: string;
  password: string;
}

/** Lo que devuelve POST /auth/login. */
export interface LoginResponse {
  token: string;
  tipo: string;
  expiraEnSegundos: number;
  username: string;
  nombreCompleto: string;
  roles: string[];
  permisos: Permiso[];
}

/** Sesión guardada en el navegador. */
export interface Sesion {
  token: string;
  expiraEn: number;
  username: string;
  nombreCompleto: string;
  roles: string[];
  permisos: Permiso[];
}

/** Perfil que entrega GET /api/v1/auth/me (no contiene el token). */
export interface PerfilUsuario {
  username: string;
  nombreCompleto: string;
  roles: string[];
  permisos: Permiso[];
}
