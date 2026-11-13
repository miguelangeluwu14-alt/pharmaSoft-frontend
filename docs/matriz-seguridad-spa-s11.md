# Sesión 11 - Matriz de seguridad SPA (Reto 02)

**Estudiante:** Miguel Ángel Zambrano Pérez  
**Sistema:** PharmaSoft - Angular 22 / Spring Boot  
**Fecha de ejecución:** _____________________  
**Backend:** _____________________  
**Navegador:** _____________________

> **Estado real de esta entrega:** matriz PREPARADA PARA EJECUTAR, no pruebas aprobadas.
> Antes de entregar, ejecutar **cada** caso, sustituir `Sin ejecutar` por lo observado,
> establecer `Pasa` o `Falla`, y adjuntar una captura real en `docs/evidencias/`.
> No usar capturas fabricadas ni publicar nunca el JWT completo.

## Casos base de la guía (16)

| ID | Grupo | Usuario | Precondición y pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia |
|---|---|---|---|---|---|---|---|
| L-01 | Login | Invitado | Sin sesión. Enviar formulario vacío; luego solo usuario; inspeccionar Red. | Aparecen validaciones; no se ejecuta POST. | Sin ejecutar | Pendiente | `evidencias/L-01_login.png` (pendiente) |
| L-02 | Login | Inexistente, admin e inactivo | Intentar usuario inexistente, clave incorrecta de admin y usuario inactivo, uno por uno. | Mismo mensaje genérico; se borra contraseña, se conserva usuario. | Sin ejecutar | Pendiente | `evidencias/L-02_errores.png` (pendiente) |
| L-03 | Login | admin | Con datos correctos, pulsar Ingresar dos veces rápidamente; mirar Red. | Solo un POST `/auth/login`; botón deshabilitado. | Sin ejecutar | Pendiente | `evidencias/L-03_doble-click.png` (pendiente) |
| L-04 | Login | admin | Abrir `/login?returnUrl=https://sitio-falso.com`, iniciar sesión. | Redirección interna a `/inicio`, nunca al dominio externo. | Sin ejecutar | Pendiente | `evidencias/L-04_return-url.png` (pendiente) |
| S-01 | Sesión | admin | Iniciar sesión, pulsar F5 y después cerrar completamente el navegador y abrirlo de nuevo. | F5 conserva sesión; nueva sesión de navegador solicita login. | Sin ejecutar | Pendiente | `evidencias/S-01_persistencia.png` (pendiente) |
| S-02 | Sesión | admin | Cambiar `expiraEn` por una fecha pasada dentro de `pharmasoft.sesion`, guardar y pulsar F5. | Se descarta la sesión y aparece login. | Sin ejecutar | Pendiente | `evidencias/S-02_vencida.png` (pendiente) |
| S-03 | Sesión | admin | Poner texto no JSON como valor de `pharmasoft.sesion` y pulsar F5. | La SPA no falla; aparece login y se elimina el dato corrupto. | Sin ejecutar | Pendiente | `evidencias/S-03_json-danado.png` (pendiente) |
| S-04 | Sesión | admin | Abrir dos pestañas de la SPA; cerrar sesión en A y navegar por B. | Registrar comportamiento real y explicar aislamiento de `sessionStorage` por pestaña. | Sin ejecutar | Pendiente | `evidencias/S-04_dos-pestanas.png` (pendiente) |
| I-01 | Interceptor | admin | En Red observar GET `/productos`, POST `/auth/login` y un recurso de otro dominio. | Bearer solo en solicitudes a la API que lo requieren; no en login ni externos. | Sin ejecutar | Pendiente | `evidencias/I-01_headers.png` (pendiente) |
| I-02 | Interceptor | admin | Con sesión activa detener el backend; abrir Productos; reiniciar backend al acabar. | Se informa error de conexión y la sesión no se cierra ante error de red. | Sin ejecutar | Pendiente | `evidencias/I-02_backend-caido.png` (pendiente) |
| I-03 | Interceptor | admin | Alterar token de sesión para una nueva solicitud y navegar a `/ventas`; inspeccionar Red. | HTTP 401, login con aviso de expiración y `returnUrl` hacia ventas. | Sin ejecutar | Pendiente | `evidencias/I-03_red.png` (pendiente) |
| G-01 | Guards | Invitado | Sin sesión, escribir `/productos/1/editar`, `/ventas/nueva` y `/inicio`. | Login y `returnUrl` adecuado en cada ruta. | Sin ejecutar | Pendiente | `evidencias/G-01_rutas.png` (pendiente) |
| G-02 | Guards | vendedor y almacen | Vendedor intenta `/categorias/nuevo` y `/productos/1/editar`; almacenero `/ventas/nueva`. | Se muestra 403 en las tres rutas protegidas. | Sin ejecutar | Pendiente | `evidencias/G-02_denegado.png` (pendiente) |
| M-01 | Menú | admin, vendedor, almacen, supervisor | Ingresar por separado con cada rol; comparar menú y botones con sus permisos. | Solo las opciones permitidas por los permisos de cada usuario. | Sin ejecutar | Pendiente | `evidencias/M-01_roles.png` (pendiente) |
| M-02 | Menú | admin y almacen | Salir de admin e ingresar inmediatamente como almacen, sin F5. | El menú se recalcula sin recargar la página. | Sin ejecutar | Pendiente | `evidencias/M-02_cambio-rol.png` (pendiente) |
| E-01 | 401/403 | vendedor | En un entorno de pruebas, forzar una acción sin permiso sobre **datos de prueba**; observar petición y sesión. | Backend rechaza con 403, se muestra mensaje y sesión permanece. | Sin ejecutar | Pendiente | `evidencias/E-01_403.png` (pendiente) |

## Cuatro casos propios (cada uno de un grupo diferente)

| ID | Grupo | Usuario | Precondición y pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia |
|---|---|---|---|---|---|---|---|
| L-05 | Login | admin | Intentar clave incorrecta; corregir la clave y volver a ingresar sin recargar. | La clave se limpia tras el error y el segundo intento válido inicia sesión. | Sin ejecutar | Pendiente | `evidencias/L-05_reintento.png` (pendiente) |
| S-05 | Sesión | admin | Cerrar sesión manualmente, pulsar Atrás y escribir `/inicio`. | No recupera datos protegidos sin volver a iniciar sesión. | Sin ejecutar | Pendiente | `evidencias/S-05_salida.png` (pendiente) |
| I-04 | Interceptor | vendedor | Hacer una petición **GET** a un recurso administrativo restringido, si existe, sin cambiar la sesión. | HTTP 403, no cierra la sesión, token no se borra. | Sin ejecutar | Pendiente | `evidencias/I-04_403-sesion.png` (pendiente) |
| G-03 | Guards | admin | Con sesión activa escribir `/login` en la barra. | `invitadoGuard` redirige a `/inicio`. | Sin ejecutar | Pendiente | `evidencias/G-03_invitado.png` (pendiente) |

## Parte B - Aviso de expiración (4 casos adicionales)

Conservar respaldo de `application-dev.yaml`. Configurar temporalmente
`app.jwt.expiracion-minutos: 3`, reiniciar el backend e ingresar de nuevo.
**Restaurar 60 al terminar.** No editar `expiraEn` para extender un token.

| ID | Grupo | Usuario | Precondición y pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia |
|---|---|---|---|---|---|---|---|
| B-01 | Aviso | admin | Iniciar sesión de tres minutos y observar al quedar dos minutos. | Aparece aviso visible cuando restan ≤120 s. | Sin ejecutar | Pendiente | `evidencias/B-01_aparece.png` (pendiente) |
| B-02 | Aviso | admin | Verificar `mm:ss` al inicio y al cabo de varios segundos. | La cuenta disminuye cada segundo (sin valores negativos). | Sin ejecutar | Pendiente | `evidencias/B-02_reloj.png` (pendiente) |
| B-03 | Aviso | admin | Pulsar ×, esperar unos segundos, después salir e iniciar nueva sesión. | Se oculta durante esa sesión; vuelve a ser elegible en la próxima. | Sin ejecutar | Pendiente | `evidencias/B-03_ocultar.png` (pendiente) |
| B-04 | Aviso | admin | No intervenir y esperar vencimiento real del token. | Se limpia sesión, se detiene temporizador y vuelve al login con aviso. | Sin ejecutar | Pendiente | `evidencias/B-04_expira.png` (pendiente) |

## Resumen de ejecución (completar al terminar)

| Grupo | Casos | Pasa | Falla | Pendiente |
|---|---:|---:|---:|---:|
| Login | 5 | 0 | 0 | 5 |
| Sesión | 5 | 0 | 0 | 5 |
| Interceptor | 4 | 0 | 0 | 4 |
| Guards | 3 | 0 | 0 | 3 |
| Menú | 2 | 0 | 0 | 2 |
| 401/403 | 1 | 0 | 0 | 1 |
| Aviso | 4 | 0 | 0 | 4 |
| **TOTAL** | **24** | **0** | **0** | **24** |

> El total de 24 incluye los 20 casos de la Parte A y los cuatro B-01..B-04.
> Actualiza el resumen cuando registres los resultados obtenidos.
