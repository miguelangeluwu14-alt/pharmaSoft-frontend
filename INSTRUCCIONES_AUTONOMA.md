# PharmaSoft - Actividad autónoma S11 (Reto 02)

**Autor:** Miguel Ángel Zambrano Pérez  
**Fecha límite de la guía:** 28/10/2026, 23:59.

## ¿Qué contiene este ZIP?

- Todo el código Angular del frontend de la sesión 11, con aviso de expiración.
- Ruta autenticada `/mi-cuenta` con consulta a `GET /api/v1/auth/me`.
- `docs/matriz-seguridad-spa-s11.md`: 24 casos con pasos y esperados, **sin resultados inventados**.
- `docs/informe-s11.md` y `.pdf`: borrador de 2-3 páginas. C1 y C2 se completan tras las pruebas.
- `docs/evidencias/`: directorio donde añadirás tus capturas reales.

## MUY IMPORTANTE: conserva tu repositorio Git de VS Code

Esta descarga es una copia de archivos, **no contiene `.git` ni los commits**.
Ya tienes la rama `feature/seguridad-spa-pruebas-zambrano` en:

`C:\Users\Administrator\Desktop\PharmaFrontend_S11_Corregido\pharma-frontend`

**No borres ni sustituyas la carpeta `.git` de tu proyecto original.**
Para seguir aprovechando la rama y tus commits, lleva a esa carpeta únicamente
los archivos que figuran en la sección siguiente y fusiona las nuevas carpetas.
Si modificaste un archivo local después de recibir el ZIP anterior, compáralo
antes de sobrescribirlo y haz una copia de seguridad.

## Archivos nuevos o cambiados

### Seguridad y aviso de sesión

1. `src/app/core/auth/auth.model.ts`
2. `src/app/core/auth/auth-service.ts`
3. `src/app/core/interceptors/auth-interceptor.ts`
4. `src/app/shared/components/aviso-sesion/aviso-sesion.ts`
5. `src/app/shared/components/aviso-sesion/aviso-sesion.html`
6. `src/app/shared/components/aviso-sesion/aviso-sesion.css`
7. `src/app/layout/main-layout/main-layout.ts`
8. `src/app/layout/main-layout/main-layout.html`

### Mi cuenta y prueba de doble clic

9. `src/app/features/auth/pages/mi-cuenta/mi-cuenta.ts`
10. `src/app/features/auth/pages/mi-cuenta/mi-cuenta.html`
11. `src/app/features/auth/pages/mi-cuenta/mi-cuenta.css`
12. `src/app/app.routes.ts`
13. `src/app/layout/header/header.html`
14. `src/app/layout/header/header.css`
15. `src/app/features/auth/pages/login/login.ts`

### Entregables

16. Copia la carpeta `docs/` completa al repositorio local.
17. Conserva este archivo `INSTRUCCIONES_AUTONOMA.md`.

No es necesario copiar `node_modules`, `dist` ni archivos temporales.

## Comprobación en Windows

En la terminal, desde el proyecto Git original:

```powershell
git branch
npm ci
npm run build
ng serve -o
```

`npm ci` funciona cuando existe `package-lock.json`, como ocurre en este ZIP.
Si ya tienes `node_modules` correctamente instalado, puedes omitir `npm ci`.

Mantén IntelliJ ejecutando el backend de la sesión 10 (puerto 8080) y Oracle.
Al entrar a `/mi-cuenta`, revisa en F12 > Red la petición `GET /api/v1/auth/me`.
Si el backend no dispone de ese endpoint, debes tener la versión segura de la
sesión 10; esta guía no pide modificarlo.

## Pruebas y seguridad

1. Ejecuta y documenta los 20 casos de Parte A y los cuatro B-01..B-04.
2. Configura **temporalmente** `app.jwt.expiracion-minutos: 3` en el backend.
   Tras la prueba **restaura 60** y reinicia.
3. Nombra capturas con ID, guarda las imágenes en `docs/evidencias/` y borra
   cualquier token completo antes de compartir o subir archivos a GitHub.
4. Corrige la matriz con resultados obtenidos y `Pasa` / `Falla` reales.
5. Por cada fallo, documenta severidad, captura, archivo/método causante y arreglo.
6. Actualiza los totales C1/C2 de `docs/informe-s11.md` y regenera su PDF.

## Commits en DÍAS DISTINTOS (obligatorio según la guía)

No cambies la fecha del sistema ni falsifiques fechas de commits.
Una secuencia posible, si todavía no has realizado commits para el Reto 02:

**Día 1:**

```powershell
git add docs/matriz-seguridad-spa-s11.md docs/evidencias/README.md
git commit -m "test(auth): preparar matriz de pruebas de la SPA segura"
```

**Día 2:**

```powershell
git add src/app/core/auth src/app/core/interceptors/auth-interceptor.ts src/app/shared/components/aviso-sesion src/app/layout/main-layout
git commit -m "feat(auth): aviso previo a la expiracion de sesion"
```

**Día 3:**

```powershell
git add src/app/features/auth/pages/mi-cuenta src/app/app.routes.ts src/app/layout/header src/app/features/auth/pages/login/login.ts
git commit -m "feat(auth): pagina Mi cuenta con perfil del servidor"
```

El informe final y las capturas también deben quedar versionados, con otro
commit real cuando termines las pruebas:

```powershell
git add docs INSTRUCCIONES_AUTONOMA.md
git commit -m "docs(test): agregar evidencias e informe de seguridad"
git push -u origin feature/seguridad-spa-pruebas-zambrano
```

Abre un Pull Request hacia `develop`, y entrega en el aula virtual el PDF final
con nombre `Zambrano_LP2_S11_Autonoma.pdf`.

> No marques como realizadas las 24 pruebas solo por tener el código. Es preciso
> ejecutarlas y capturar su resultado en tu propio navegador/backend.
