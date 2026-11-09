import { Component, inject, input, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Router } from '@angular/router';

import { AuthService } from '../../../../core/auth/auth-service';
import { mensajeError } from '../../../../core/utils/http-error';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  private readonly fb =
    inject(NonNullableFormBuilder);

  private readonly auth =
    inject(AuthService);

  private readonly router =
    inject(Router);

  readonly returnUrl = input<string>();

  readonly expirada = input<string>();

  protected readonly enviando =
    signal(false);

  protected readonly error =
    signal<string | null>(null);

  protected readonly verClave =
    signal(false);

  protected readonly form =
    this.fb.group({
      username: [
        '',
        [
          Validators.required,
          Validators.maxLength(50)
        ]
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.maxLength(72)
        ]
      ]
    });

  ingresar(): void {

    // Impide emitir dos POST si se activa dos veces antes de que
    // Angular actualice el estado visual del botón.
    if (this.enviando()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.error.set(null);

    this.auth
      .login(this.form.getRawValue())
      .subscribe({

        next: () => {
          this.router.navigateByUrl(
            this.destino()
          );
        },

        error: (
          err: HttpErrorResponse
        ) => {

          this.enviando.set(false);

          this.form.controls
            .password.reset();

          this.error.set(
            mensajeError(err)
          );
        }
      });
  }

  protected cambiarVisibilidad(): void {
    this.verClave.set(
      !this.verClave()
    );
  }

  private destino(): string {

    const url =
      this.returnUrl();

    if (
      url &&
      url.startsWith('/') &&
      !url.startsWith('//')
    ) {
      return url;
    }

    return '/inicio';
  }
}
