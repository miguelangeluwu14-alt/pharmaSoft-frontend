import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../../core/auth/auth-service';
import { PerfilUsuario, Permiso } from '../../../../core/auth/auth.model';
import { mensajeError } from '../../../../core/utils/http-error';

interface ModuloPermisos {
  nombre: string;
  items: { codigo: Permiso; descripcion: string }[];
}

@Component({
  selector: 'app-mi-cuenta',
  standalone: true,
  templateUrl: './mi-cuenta.html',
  styleUrl: './mi-cuenta.css'
})
export class MiCuenta implements OnInit {
  protected readonly auth = inject(AuthService);
  protected readonly perfil = signal<PerfilUsuario | null>(null);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  // Se usa el catálogo completo de permisos, no solo los de la sesión.
  protected readonly modulos: ModuloPermisos[] = [
    { nombre: 'Catálogo', items: [
      { codigo: 'CATALOGO_LEER', descripcion: 'Consultar categorías y productos' },
      { codigo: 'CATALOGO_ESCRIBIR', descripcion: 'Crear, modificar y dar de baja' }
    ] },
    { nombre: 'Clientes', items: [
      { codigo: 'CLIENTES_LEER', descripcion: 'Consultar clientes' },
      { codigo: 'CLIENTES_ESCRIBIR', descripcion: 'Registrar y editar clientes' }
    ] },
    { nombre: 'Ventas', items: [
      { codigo: 'VENTAS_LEER', descripcion: 'Consultar ventas' },
      { codigo: 'VENTAS_REGISTRAR', descripcion: 'Registrar ventas' }
    ] },
    { nombre: 'Reportes', items: [
      { codigo: 'REPORTES_VER', descripcion: 'Consultar reportes' }
    ] },
    { nombre: 'Usuarios', items: [
      { codigo: 'USUARIOS_ADMINISTRAR', descripcion: 'Administrar usuarios' }
    ] }
  ];

  protected readonly permisosCambiaron = computed(() => {
    const datos = this.perfil();
    const sesion = this.auth.sesion();
    if (!datos || !sesion) return false;

    const normalizar = (valores: string[]) =>
      [...new Set(valores)].sort().join('|');

    return normalizar(datos.permisos) !== normalizar(sesion.permisos)
      || normalizar(datos.roles) !== normalizar(sesion.roles);
  });

  ngOnInit(): void {
    this.cargarPerfil();
  }

  protected cargarPerfil(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.auth.obtenerPerfil().subscribe({
      next: datos => {
        this.perfil.set(datos);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.perfil.set(null);
        this.error.set(mensajeError(err));
        this.cargando.set(false);
      }
    });
  }
}
