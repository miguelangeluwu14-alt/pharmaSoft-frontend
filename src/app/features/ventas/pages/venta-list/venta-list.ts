import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { PaginaResponse } from '../../../../core/models/pagina-response';
import { mensajeError } from '../../../../core/utils/http-error';
import { Cliente } from '../../../clientes/models/cliente.model';
import { ClienteService } from '../../../clientes/services/cliente-service';
import { EstadoVenta, FiltroVentas, Venta } from '../../models/venta.model';
import { VentaService } from '../../services/venta-service';
import { SiPermiso } from '../../../../shared/directives/si-permiso';
import { Paginador } from '../../../../shared/components/paginador/paginador';

@Component({
  selector: 'app-venta-list',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe, SiPermiso, Paginador],
  templateUrl: './venta-list.html',
  styleUrl: './venta-list.css',
})
export class VentaList implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly ventaService = inject(VentaService);
  private readonly clienteService = inject(ClienteService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private peticion?: Subscription;

  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly resultado = signal<PaginaResponse<Venta> | null>(null);
  protected readonly pagina = signal(0);
  protected readonly tamanio = signal(20);
  protected readonly orden = signal('fecha');
  protected readonly dir = signal<'asc' | 'desc'>('desc');
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly filtros = this.fb.group({
    clienteId: this.fb.control<number | null>(null),
    estado: this.fb.control<EstadoVenta | null>(null),
    desde: this.fb.control<string | null>(null),
    hasta: this.fb.control<string | null>(null),
  });
  protected readonly ahora = signal(new Date());
  protected readonly totalPagina = computed(() =>
    (this.resultado()?.contenido ?? [])
      .filter(v => v.estado === 'REGISTRADA')
      .reduce((suma, v) => suma + v.total, 0));

  protected resumenFiltros(): string {
    const f = this.filtros.getRawValue();
    const cliente = this.clientes().find(c => c.id === f.clienteId);
    return [cliente ? `cliente ${cliente.apellidos}, ${cliente.nombres}` : '',
      f.estado ? `estado ${f.estado}` : '', f.desde ? `desde ${f.desde}` : '',
      f.hasta ? `hasta ${f.hasta}` : ''].filter(Boolean).join(' · ') || 'ninguno (todas las ventas)';
  }

  imprimirConsulta(): void {
    this.ahora.set(new Date());
    setTimeout(() => window.print());
  }

  ngOnInit(): void {
    this.clienteService.listar(0, 100).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: p => this.clientes.set(p.contenido),
      error: (err: HttpErrorResponse) => this.error.set(mensajeError(err)),
    });
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(q => {
      const pagina = Number(q.get('pagina') ?? 0);
      const tamanio = Number(q.get('tamanio') ?? 20);
      this.pagina.set(Number.isInteger(pagina) && pagina >= 0 ? pagina : 0);
      this.tamanio.set([10, 20, 50, 100].includes(tamanio) ? tamanio : 20);
      const orden = q.get('orden') ?? 'fecha';
      this.orden.set(['id', 'fecha', 'total', 'estado'].includes(orden) ? orden : 'fecha');
      this.dir.set(q.get('dir') === 'asc' ? 'asc' : 'desc');
      const id = Number(q.get('clienteId'));
      const estado = q.get('estado');
      this.filtros.patchValue({
        clienteId: q.has('clienteId') && Number.isInteger(id) && id > 0 ? id : null,
        estado: estado === 'REGISTRADA' || estado === 'ANULADA' ? estado : null,
        desde: q.get('desde'), hasta: q.get('hasta'),
      }, { emitEvent: false });
      this.cargar();
    });
    this.destroyRef.onDestroy(() => this.peticion?.unsubscribe());
  }

  buscar(): void {
    const f = this.filtros.getRawValue();
    if (f.desde && f.hasta && f.desde > f.hasta) {
      this.error.set('La fecha «desde» no puede ser posterior a la fecha «hasta».');
      return;
    }
    this.navegar({ clienteId: f.clienteId, estado: f.estado,
      desde: f.desde || null, hasta: f.hasta || null, pagina: 0 });
  }
  limpiar(): void { this.filtros.reset(); this.buscar(); }
  irA(pagina: number): void { this.navegar({ pagina }); }
  cambiarTamanio(tamanio: number): void { this.navegar({ tamanio, pagina: 0 }); }
  ordenarPor(campo: string): void {
    const dir = this.orden() === campo && this.dir() === 'asc' ? 'desc' : 'asc';
    this.navegar({ orden: campo, dir, pagina: 0 });
  }
  private navegar(cambios: Record<string, string | number | null>): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: cambios, queryParamsHandling: 'merge' });
  }
  private cargar(): void {
    this.peticion?.unsubscribe();
    this.cargando.set(true);
    this.error.set(null);
    this.peticion = this.ventaService.buscar(this.filtros.getRawValue(),
      this.pagina(), this.tamanio(), this.orden(), this.dir())
      .subscribe({
        next: r => { this.resultado.set(r); this.cargando.set(false); },
        error: (err: HttpErrorResponse) => {
          this.error.set(mensajeError(err)); this.cargando.set(false);
        },
      });
  }
}
