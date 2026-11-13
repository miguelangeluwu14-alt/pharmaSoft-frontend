import { expect, test } from '@playwright/test';
import { iniciarSesion } from './apoyo';

/** Requiere datos de prueba con un cliente y un producto activo con stock >= 2. */
test('flujo principal: vendedor registra venta y stock baja en Catálogo', async ({ page }) => {
  await iniciarSesion(page, 'vendedor', '/ventas/nueva');
  const textoCliente = process.env.E2E_CLIENTE_BUSQUEDA ?? 'Mamani';
  const textoProducto = process.env.E2E_PRODUCTO_BUSQUEDA ?? 'Paracetamol';

  await page.getByTestId('buscar-cliente').fill(textoCliente);
  await expect(page.getByTestId('opcion-cliente').first()).toBeVisible();
  await page.getByTestId('opcion-cliente').first().click();

  await page.getByTestId('buscar-producto').fill(textoProducto);
  const opcion = page.getByTestId('opcion-producto').first();
  await expect(opcion).toBeVisible();
  const stockAntes = Number(await opcion.getAttribute('data-stock'));
  expect(stockAntes).toBeGreaterThanOrEqual(2);
  await opcion.click();
  await page.getByTestId('cantidad').last().fill('2');
  await expect(page.getByTestId('total-venta')).not.toContainText('0.00');

  await page.getByRole('button', { name: 'Revisar venta' }).click();
  const registro = page.waitForResponse(r => r.url().endsWith('/api/v1/ventas')
      && r.request().method() === 'POST');
  await page.getByRole('button', { name: 'Confirmar venta' }).click();
  expect((await registro).status()).toBe(201);
  await expect(page.getByText(/Venta registrada correctamente/i)).toBeVisible();
  await page.goto('/productos?pagina=0&tamanio=100&orden=nombre&dir=asc');
  const fila = page.getByTestId('tabla-productos').locator('tbody tr', { hasText: textoProducto }).first();
  await expect(fila).toBeVisible();
  await expect(fila.locator('td').nth(3)).toHaveText(String(stockAntes - 2));
});
