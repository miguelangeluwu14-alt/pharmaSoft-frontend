import { expect, test } from '@playwright/test';
import { iniciarSesion } from './apoyo';

test('Productos mantiene tamaño, página y orden en la URL, incluso tras F5', async ({ page }) => {
  await iniciarSesion(page, 'admin', '/productos?pagina=0&tamanio=10&orden=nombre&dir=asc');
  const tabla = page.getByTestId('tabla-productos');
  await expect(tabla).toBeVisible();
  await expect(tabla.locator('tbody tr')).toHaveCount(10);
  await expect(page.getByTestId('pagina-actual')).toHaveText(/Página 1 de/);
  const peticion = page.waitForResponse(r => r.url().includes('/api/v1/productos')
      && r.url().includes('pagina=1') && r.request().method() === 'GET');
  await page.getByRole('button', { name: 'Siguiente' }).click();
  expect((await peticion).status()).toBe(200);
  await expect(page).toHaveURL(/pagina=1/);
  await expect(page.getByTestId('pagina-actual')).toHaveText(/Página 2 de/);
  await page.reload();
  await expect(page.getByTestId('pagina-actual')).toHaveText(/Página 2 de/);
});
