# PharmaSoft - Sesión 11

Se completó el Paso 10 de la guía de seguridad del frontend sobre el proyecto recibido.

## Cambios

- `SiPermiso` ya estaba creada y se conservó.
- Categorías: crear, editar, eliminar y la columna de acciones solo aparecen con `CATALOGO_ESCRIBIR`.
- Productos: crear, editar, dar de baja y la columna de acciones solo aparecen con `CATALOGO_ESCRIBIR`.
- Ventas: «Nueva venta» solo aparece con `VENTAS_REGISTRAR`.
- Se mantienen los guards de las rutas y los controles de seguridad del backend.

## Uso en Visual Studio Code (Windows)

1. Abre la carpeta `pharma-frontend`.
2. En la terminal ejecuta `npm ci` para instalar las dependencias compatibles con tu PC.
3. Ejecuta `ng serve -o`.
4. Mantén PharmaBackend y Oracle en ejecución.

## Comprobaciones

- Se comprobó TypeScript con `tsc --noEmit` sin errores.
- Se comprobó la compilación de plantillas con `ngc --noEmit` sin errores.
- El build completo no se ejecutó en el entorno de revisión porque el ZIP original tenía módulos nativos de Windows que no funcionan en Linux.
- Las pruebas manuales con diferentes usuarios, conexiones a Oracle y capturas del Paso 11 deben ejecutarse en tu equipo.

**Nota:** este ZIP no contiene `node_modules`, cachés ni el repositorio `.git`; es una copia limpia del código fuente y la configuración, no reemplaza tu historial Git.
