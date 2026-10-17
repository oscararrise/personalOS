# PersonalOS

Aplicación web personal (en construcción) con Django REST Framework, PostgreSQL existente y un frontend React planificado.

## Estado
- API de tareas, notas y hábitos con aislamiento por usuario.
- Inicio y cierre de sesión usando usuarios Django.
- Falta implementar frontend, pruebas en el servidor y configurar el servidor web.

## Desarrollo local / Debian
Sigue [DEPLOY.md](DEPLOY.md). Para ver rutas disponibles cuando funcione la API, visita `/api/` después de autenticarte.

## Seguridad
No subas `.env`, credenciales, volcados de base de datos ni claves API. Antes de publicar, configura HTTPS, CSRF y limitación de intentos de acceso. El inicio de sesión por código temporal todavía está pendiente.
