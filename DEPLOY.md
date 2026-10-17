# Despliegue en Debian con PostgreSQL existente

Usa **una base y un rol nuevos** en el PostgreSQL ya instalado; no reutilices la base `agro_platform`.

## Base de datos

```bash
sudo -u postgres psql
CREATE ROLE personalos LOGIN PASSWORD 'CAMBIAR_POR_CLAVE_LARGA';
CREATE DATABASE personalos OWNER personalos;
\q
```

## Preparación

```bash
git clone https://github.com/oscararrise/personalOS.git
cd personalOS
cp .env.example .env
nano .env
```

Configura `DATABASE_URL=postgresql://personalos:CLAVE@HOST_POSTGRES:5432/personalos`, según tu instalación. Si PostgreSQL corre en el host y la aplicación en Docker, `localhost` dentro del contenedor **no es el host**; ajusta conectividad `host-gateway`, `pg_hba.conf` y `listen_addresses` de forma restringida. No abras el puerto 5432 a Internet.

## Servicio web

Construye el frontend y backend con Docker y publica el proxy del frontend solo en `127.0.0.1:8085`; conecta el Nginx existente mediante un virtual host HTTPS y reenvía `X-Forwarded-Proto`. Configura `ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS` y un código de acceso seguro antes de publicarlo. No uses una contraseña o token permanente compartido en URLs.

**Estado:** documentación de preparación. Verificar configuración final del servidor, autenticación, migraciones, backup y HTTPS antes de exponerlo públicamente.
