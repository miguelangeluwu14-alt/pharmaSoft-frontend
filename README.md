# PharmaSoft - Frontend

## 1. Descripcion
Aplicacion web para gestionar categorias, productos y ventas.
Desarrollada con Angular 22 y desplegada mediante Nginx.

## 2. Arquitectura
Navegador -> Nginx/Angular -> Spring Boot -> Oracle
                                    |
                                    +-> Redis

## 3. Puertos locales
- Frontend y Nginx: http://localhost:8082
- API Spring Boot: http://localhost:8081
- Redis: 6379

Nginx distribuye los archivos de Angular y redirige
las solicitudes /api/ hacia el backend.

## 4. Configuracion
El frontend consume la API mediante rutas /api/v1/.

Las credenciales de Oracle, Redis y JWT deben
permanecer en el backend y no incluirse en Angular.

## 5. Compilacion
Desde la carpeta del frontend:

npm ci
npm run build -- --configuration production

La compilacion genera los archivos de distribucion.

## 6. Despliegue local
Construir la imagen:

docker build -t pharma-frontend:local .

Desde el repositorio del backend:

docker compose up -d --no-deps --force-recreate frontend

Verificar: http://localhost:8082

## 7. Optimizacion y cache
- Carga diferida de modulos mediante lazy loading.
- Archivos JavaScript y CSS con nombres versionados.
- Recursos estaticos con cache de larga duracion.
- index.html con Cache-Control: no-cache.
- Respuestas de la API sin almacenamiento en cache del navegador.
- Mensajes de error con codigo de seguimiento requestId.

## 8. Recuperacion y rollback
1. Identificar una version estable en Git.
2. Restaurar el codigo o imagen Docker correspondiente.
3. Reconstruir el frontend.
4. Actualizar el contenedor Nginx.
5. Verificar inicio de sesion, productos y ventas.

## 9. Lista de verificacion
- Compilacion de produccion satisfactoria.
- Rutas y carga diferida verificadas.
- Cache del navegador comprobada.
- Conexion con la API funcional.
- Mensajes de error y requestId verificados.
- Ausencia de credenciales en el frontend.
- Procedimiento de rollback documentado.

## 10. Recomendaciones para produccion
1. Utilizar HTTPS.
2. Implementar monitoreo de errores del navegador.
3. Automatizar despliegues y conservar versiones estables.

El despliegue actual corresponde a un entorno local de pruebas.
