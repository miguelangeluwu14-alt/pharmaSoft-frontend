# Informe de seguridad del frontend - Sesión 11 (Reto 02)

**Estudiante:** Miguel Ángel Zambrano Pérez  
**Curso:** Lenguaje de Programación II  
**Sistema:** PharmaSoft - Angular + Spring Boot  
**Estado:** BORRADOR. Completar resultados reales y evidencias antes de entregar.

## C1. Resumen de la verificación

El alcance incluye login, almacenamiento temporal de sesión, interceptores HTTP,
guards, menú por permisos y aviso previo al vencimiento. La matriz tiene 20
casos de la Parte A (16 establecidos en la guía y 4 propios de grupos distintos),
además de B-01 a B-04: **24 casos en total**. Cada caso requiere ejecución
manual, observación en F12 y una imagen que permita verificar el resultado.

**Estado de este borrador:** 0 casos ejecutados y 24 por verificar. Esto no
significa que fallen: los resultados aún no se han medido. No se anotan casos
aprobados sin evidencia. Al completar las pruebas, reemplazar esta frase por el
recuento real y actualizar la tabla.

| Grupo | Total | Pasan | Fallan | Pendientes |
|---|---:|---:|---:|---:|
| Login | 5 | 0 | 0 | 5 |
| Sesión | 5 | 0 | 0 | 5 |
| Interceptor | 4 | 0 | 0 | 4 |
| Guards | 3 | 0 | 0 | 3 |
| Menú | 2 | 0 | 0 | 2 |
| 401/403 | 1 | 0 | 0 | 1 |
| Aviso | 4 | 0 | 0 | 4 |
| **Total** | **24** | **0** | **0** | **24** |

**Consideración especial S-04:** `sessionStorage` pertenece a cada pestaña.
Por eso el cierre de sesión de una pestaña no garantiza cerrar las demás. El
resultado observado se anotará en S-04. Una alternativa para sincronizar cierres
es `BroadcastChannel`, siempre acompañada de validación en el backend.

## C2. Fichas de hallazgos (una por cada caso que falle)

**Todavía no hay hallazgos confirmados:** no se ha ejecutado la matriz en el
entorno local del estudiante. Si una prueba falla, crear una ficha nueva usando
este modelo y conservar la captura original en `docs/evidencias/`:

- **ID de caso:** [L-01 / S-02 / etc.]
- **Descripción:** [acción realizada y comportamiento observado]
- **Severidad:** [Alta / Media / Baja], con explicación del impacto.
- **Evidencia:** `docs/evidencias/[ID]_[descripcion].png`.
- **Causa probable:** [archivo y método, después de revisar el código].
- **Corrección propuesta:** [cambio concreto, responsable y cómo verificarlo].
- **Estado de corrección:** [No iniciada / Implementada / Verificada].

## C3. Preguntas de análisis

**1. Si menú, directiva y guards ya ocultan las acciones, ¿por qué el backend
debe validar cada permiso?**

Porque el frontend se ejecuta en la computadora del usuario: cualquiera puede
alterar el DOM, ejecutar una solicitud HTTP manual o modificar el código que
recibe. `permisoGuard` y `*appSiPermiso` mejoran la experiencia, pero no son una
barrera de seguridad. El backend debe validar el JWT y comprobar el permiso
en cada endpoint antes de leer o modificar datos. El caso E-01 se diseñó para
intentar una acción restringida como VENDEDOR: el resultado correcto es 403
sin modificar el recurso ni cerrar la sesión. Esta interpretación deberá
contrastarse con la captura real de E-01.

**2. ¿Qué ventajas y riesgos ofrece sessionStorage frente a localStorage y una
cookie HttpOnly? ¿Qué usaría en la botica?**

`sessionStorage` reduce la persistencia del token porque normalmente se elimina
al cerrar la pestaña y lo separa por pestaña, pero el JavaScript de la página
puede leerlo; ante XSS, un atacante podría extraerlo. `localStorage` también
es legible por JavaScript y suele persistir entre cierres del navegador, lo
que amplía el tiempo de exposición. Una cookie `HttpOnly; Secure; SameSite`
impide leer el token desde JavaScript y puede limitar CSRF si se configura
correctamente, aunque exige que el backend implemente autenticación y
protecciones CSRF apropiadas. Para una botica real elegiría cookies HttpOnly
con una política robusta en el servidor; en este laboratorio se usa
`sessionStorage` porque así está diseñada la API de la sesión 10. Además,
aplicaría CSP, validación de entradas y expiración corta.

**3. ¿Por qué el errorInterceptor cierra sesión ante 401 y no ante 403?**

Un 401 indica ausencia, vencimiento o invalidez de la autenticación: la SPA
elimina la sesión y vuelve al login para que el usuario ingrese de nuevo.
Un 403 significa que el usuario ya fue identificado, pero no tiene autorización
para la operación; por eso debe ver «Acceso denegado» conservando la sesión.
`errorInterceptor` en `core/interceptors/error-interceptor.ts` implementa el
cierre solamente para 401 que no procede de `/auth/login`. Si se cerrara por
403, un vendedor sería expulsado innecesariamente al abrir una acción
restringida; si no se cerrara por 401, la aplicación seguiría operando con un
token inválido y fallaría repetidamente.

**4. ¿Qué es una redirección abierta y cómo se evita en returnUrl?**

Una redirección abierta ocurre cuando una aplicación acepta un destino
controlado por terceros y manda allí al usuario, potencialmente a una página
de phishing. En el caso L-04 se intenta pasar
`returnUrl=https://sitio-falso.com`. El método `destino()` del componente
`features/auth/pages/login/login.ts` solo acepta rutas que empiezan con `/`
pero no con `//`. Ante una URL externa, usa `/inicio` como destino seguro.
Así el usuario autenticado no termina en un sitio ajeno. La captura de L-04
debe confirmar la URL final del navegador.

## Cambios implementados y verificación pendiente

- `AuthService` calcula `segundosRestantes` cada segundo y expone `porVencer`.
- `AvisoSesion` muestra `mm:ss`, permite salir u ocultar hasta la siguiente sesión.
- Los intervalos se cancelan en `cerrarSesion()`.
- La ruta `/mi-cuenta` está bajo `authGuard`, sin permiso adicional, y consulta
  `GET /api/v1/auth/me`; muestra roles y permisos actuales del servidor.
- Si roles o permisos difieren de los guardados, aparece un aviso de reingreso.

**Antes de entregar:** ejecutar toda la matriz, asociar evidencias reales,
registrar cada fallo y sus causas, actualizar los totales del resumen y
regenerar `docs/informe-s11.pdf` y `Zambrano_LP2_S11_Autonoma.pdf`.
