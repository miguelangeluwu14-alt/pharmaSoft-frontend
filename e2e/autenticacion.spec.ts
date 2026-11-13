import { expect, test } from '@playwright/test';
import { iniciarSesion, credenciales } from './apoyo';

test.describe('Autenticación (3)', () => {
  test('sin sesión, /ventas redirige al login y conserva returnUrl', async ({ page }) => {
    await page.goto('/ventas');
    await expect(page).toHaveURL(/\/login\?returnUrl=%2Fventas/);
  });

  test('credenciales incorrectas muestran un error de autenticación', async ({ page }) => {
    const { usuario } = credenciales('admin');
    await page.goto('/login');
    await page.getByLabel('Usuario').fill(usuario);
    await page.getByLabel('Contraseña', { exact: true }).fill('clave-incorrecta-prueba-s14');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect(page.getByRole('alert')).toContainText(/credencial|usuario|contraseña|autenticaci|401/i);
  });

  test('después de iniciar sesión vuelve a la URL solicitada', async ({ page }) => {
    await iniciarSesion(page, 'vendedor', '/ventas');
    await expect(page).toHaveURL(/\/ventas(?:\?.*)?$/);
  });
});
