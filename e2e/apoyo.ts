import { expect, Page } from '@playwright/test';

type Rol = 'admin' | 'vendedor' | 'almacen';
const VARIABLES = {
  admin: ['E2E_ADMIN_USER', 'E2E_ADMIN_PASSWORD'],
  vendedor: ['E2E_VENDEDOR_USER', 'E2E_VENDEDOR_PASSWORD'],
  almacen: ['E2E_ALMACEN_USER', 'E2E_ALMACEN_PASSWORD'],
} as const;

/** Credenciales únicamente en el entorno local; no se versionan claves. */
export function credenciales(rol: Rol): { usuario: string; clave: string } {
  const [u, c] = VARIABLES[rol];
  const usuario = process.env[u] ?? rol;
  const clave = process.env[c];
  if (!clave) throw new Error(`Configure la variable ${c} en PowerShell antes de ejecutar Playwright`);
  return { usuario, clave };
}

export async function iniciarSesion(page: Page, rol: Rol, ruta = '/inicio') {
  const { usuario, clave } = credenciales(rol);
  await page.goto(ruta);
  await expect(page).toHaveURL(/\/login/);
  await page.getByLabel('Usuario').fill(usuario);
  await page.getByLabel('Contraseña', { exact: true }).fill(clave);
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible();
}
