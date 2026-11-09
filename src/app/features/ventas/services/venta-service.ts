import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { PaginaResponse } from '../../../core/models/pagina-response';

import {
  FiltroVentas,
  Venta,
  VentaRequest
} from '../models/venta.model';

interface VentaBackend {
  id: number;
  fecha?: string;
  fechaRegistro?: string;
  clienteId: number;
  clienteNombre: string;
  estado: 'REGISTRADA' | 'ANULADA';
  total: number;
  detalles: Venta['detalles'];
}

interface PaginaBackend {
  content?: VentaBackend[];
  contenido?: VentaBackend[];

  number?: number;
  pagina?: number;

  size?: number;
  tamanio?: number;

  totalElements?: number;
  totalElementos?: number;

  totalPages?: number;
  totalPaginas?: number;

  last?: boolean;
  ultima?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class VentaService {

  private readonly http = inject(HttpClient);

  private readonly url =
    `${environment.apiUrl}/ventas`;

  registrar(dto: VentaRequest): Observable<Venta> {

    return this.http
      .post<VentaBackend>(this.url, dto)
      .pipe(
        map(v => this.adaptarVenta(v))
      );
  }

  obtener(id: number): Observable<Venta> {

    return this.http
      .get<VentaBackend>(`${this.url}/${id}`)
      .pipe(
        map(v => this.adaptarVenta(v))
      );
  }

  buscar(
    filtro: FiltroVentas,
    pagina: number,
    tamanio: number
  ): Observable<PaginaResponse<Venta>> {

    let params = new HttpParams()
      .set('pagina', pagina)
      .set('tamanio', tamanio)
      .set('ordenarPor', 'fecha')
      .set('direccion', 'desc');

    if (filtro.clienteId != null) {
      params = params.set(
        'clienteId',
        filtro.clienteId
      );
    }

    if (filtro.estado) {
      params = params.set(
        'estado',
        filtro.estado
      );
    }

    if (filtro.desde) {
      params = params.set(
        'desde',
        filtro.desde
      );
    }

    if (filtro.hasta) {
      params = params.set(
        'hasta',
        filtro.hasta
      );
    }

    return this.http
      .get<VentaBackend[] | PaginaBackend>(
        `${this.url}/buscar`,
        { params }
      )
      .pipe(
        map(respuesta => {

          // Caso 1: El backend devuelve un arreglo
          if (Array.isArray(respuesta)) {

            const ventas = respuesta.map(
              v => this.adaptarVenta(v)
            );

            return {
              contenido: ventas,
              pagina: pagina,
              tamanio: tamanio,
              totalElementos: ventas.length,
              totalPaginas: ventas.length > 0 ? 1 : 0,
              ultima: true
            };
          }

          // Caso 2: El backend devuelve datos paginados
          const datos =
            respuesta.content ??
            respuesta.contenido ??
            [];

          const ventas = datos.map(
            v => this.adaptarVenta(v)
          );

          const paginaActual =
            respuesta.number ??
            respuesta.pagina ??
            pagina;

          const tamanioPagina =
            respuesta.size ??
            respuesta.tamanio ??
            tamanio;

          const totalElementos =
            respuesta.totalElements ??
            respuesta.totalElementos ??
            ventas.length;

          const totalPaginas =
            respuesta.totalPages ??
            respuesta.totalPaginas ??
            (ventas.length > 0 ? 1 : 0);

          const ultima =
            respuesta.last ??
            respuesta.ultima ??
            (
              totalPaginas === 0 ||
              paginaActual >= totalPaginas - 1
            );

          return {
            contenido: ventas,
            pagina: paginaActual,
            tamanio: tamanioPagina,
            totalElementos: totalElementos,
            totalPaginas: totalPaginas,
            ultima: ultima
          };
        })
      );
  }

  private adaptarVenta(v: VentaBackend): Venta {

    return {
      id: v.id,

      fecha:
        v.fecha ??
        v.fechaRegistro ??
        '',

      clienteId: v.clienteId,

      clienteNombre:
        v.clienteNombre,

      estado: v.estado,

      total: v.total,

      detalles:
        v.detalles ?? []
    };
  }
}