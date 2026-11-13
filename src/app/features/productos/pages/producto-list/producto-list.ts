import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { PaginaResponse } from '../../../../core/models/pagina-response';
import { mensajeError } from '../../../../core/utils/http-error';
import { Categoria } from '../../../categorias/models/categoria.model';
import { CategoriaService } from '../../../categorias/services/categoria-service';
import { Direccion, OrdenProducto, Producto } from '../../models/producto.model';
import { ProductoService } from '../../services/producto-service';
import { SiPermiso } from '../../../../shared/directives/si-permiso';
import { Paginador } from '../../../../shared/components/paginador/paginador';

@Component({
  selector: 'app-producto-list',
  imports: [RouterLink, CurrencyPipe, SiPermiso, Paginador],
  templateUrl: './producto-list.html',
  styleUrl: './producto-list.css',
})
export class ProductoList implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private peticion?: Subscription;

  protected readonly pagina = signal(0);
  protected readonly tamanio = signal(20);
  protected readonly ordenarPor = signal<OrdenProducto>('nombre');
  protected readonly direccion = signal<Direccion>('asc');
  protected readonly resultado = signal<PaginaResponse<Producto> | null>(null);
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly categoriaFiltro = signal<number | null>(null);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly productos = computed(() => this.resultado()?.contenido ?? []);
  protected readonly categoriaDesdeUrl = computed(() =>
    this.categorias().find(c => c.id === this.categoriaFiltro()) ?? null);

  ngOnInit(): void {
    this.categoriaService.listar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: datos => this.categorias.set(datos),
      error: (err: HttpErrorResponse) => this.error.set(mensajeError(err)),
    });
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(q => {
      const pagina = Number(q.get('pagina') ?? 0);
      const tamanio = Number(q.get('tamanio') ?? 20);
      const orden = q.get('orden') ?? 'nombre';
      const dir = q.get('dir') ?? 'asc';
      const categoria = Number(q.get('categoriaId'));
      this.pagina.set(Number.isInteger(pagina) && pagina >= 0 ? pagina : 0);
      this.tamanio.set([10, 20, 50, 100].includes(tamanio) ? tamanio : 20);
      this.ordenarPor.set((['id', 'nombre', 'precio', 'stock'].includes(orden)
        ? orden : 'nombre') as OrdenProducto);
      this.direccion.set(dir === 'desc' ? 'desc' : 'asc');
      this.categoriaFiltro.set(q.get('categoriaId') !== null
        && Number.isInteger(categoria) && categoria > 0 ? categoria : null);
      this.cargar();
    });
    this.destroyRef.onDestroy(() => this.peticion?.unsubscribe());
  }

  cargar(): void {
    this.peticion?.unsubscribe();
    this.cargando.set(true);
    this.error.set(null);
    this.peticion = this.productoService
      .listar(this.pagina(), this.tamanio(), this.ordenarPor(),
        this.direccion(), this.categoriaFiltro())
      .subscribe({
        next: r => { this.resultado.set(r); this.cargando.set(false); },
        error: (err: HttpErrorResponse) => {
          this.error.set(mensajeError(err)); this.cargando.set(false);
        },
      });
  }

  irA(pagina: number): void { this.navegar({ pagina }); }
  cambiarTamanio(tamanio: number): void { this.navegar({ tamanio, pagina: 0 }); }
  ordenar(campo: OrdenProducto): void {
    const dir = this.ordenarPor() === campo && this.direccion() === 'asc' ? 'desc' : 'asc';
    this.navegar({ orden: campo, dir, pagina: 0 });
  }
  filtrarPorCategoria(valor: string): void {
    this.navegar({ categoriaId: valor || null, pagina: 0 });
  }
  private navegar(cambios: Record<string, string | number | null>): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: cambios, queryParamsHandling: 'merge' });
  }

  darDeBaja(producto: Producto): void {
    if (!confirm(`¿Dar de baja el producto "${producto.nombre}"?`)) return;
    this.productoService.darDeBaja(producto.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.cargar(),
      error: (err: HttpErrorResponse) => this.error.set(mensajeError(err)),
    });
  }
}
