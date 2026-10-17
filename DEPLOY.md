# Instalación inicial en Debian con PostgreSQL existente

La base de datos `personalos` y el rol `personalos` se crean una sola vez en PostgreSQL. No ejecutes nuevamente los CREATE ROLE/CREATE DATABASE si ya existen.

## Paso 1: entorno
```bash
cd ~/apps/personalOS
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r backend/requirements.txt
cp -n .env.example .env
chmod 600 .env
```

Edita `.env` localmente sin compartir secretos. Para probar en el host Debian, configura DATABASE_URL con **127.0.0.1**, no con `host.docker.internal`. Introduce las contraseñas URL-encoded si contienen `@`, `#`, `%`, `/` o `:`. Nunca uses la contraseña de ejemplo.

```bash
nano .env
set -a; source .env; set +a
cd backend
python manage.py check
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 127.0.0.1:8091
```

`runserver` es exclusivamente para pruebas locales. Accede a `http://127.0.0.1:8091/admin/` desde túnel SSH si necesitas comprobar el login.

## Pruebas
Para que las pruebas no alteren la base existente:
```bash
cd ~/apps/personalOS
source .venv/bin/activate
cd backend
DATABASE_URL=sqlite:////tmp/personalos-tests.sqlite3 DJANGO_DEBUG=true python manage.py test
```
El runner Django crea una base de pruebas temporal independiente.

## Pendiente para producción
Antes de publicar: completar frontend y autenticación, HTTPS, Nginx, rate limiting, respaldos automáticos y configurar Gunicorn en systemd. No abras el puerto PostgreSQL 5432 a Internet.

La configuración `compose.yaml` todavía no está validada contra el PostgreSQL instalado en el host; para la primera prueba recomendamos el entorno virtual.
