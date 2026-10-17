# PersonalOS Frontend

React + TypeScript + Vite + Tailwind CSS. Primera interfaz funcional de tareas, notas y hábitos.

## Arranque (una vez levantado Django en 127.0.0.1:8091)

```bash
cd ~/apps/personalOS/frontend
npm install
npm run dev
```

Vite sirve en `127.0.0.1:5173` y reenvía `/api/` a Django. Usa un túnel SSH para abrir la aplicación desde tu PC:

```bash
ssh -L 5173:127.0.0.1:5173 -L 8091:127.0.0.1:8091 oscar@IP_SERVIDOR
```

Abre `http://127.0.0.1:5173` en tu PC. Para que las cookies de inicio de sesión funcionen sobre HTTP local, arranca Django en modo `DJANGO_DEBUG=true` **solo durante las pruebas**, escuchando exclusivamente en `127.0.0.1`.

El frontend no contiene secretos; utiliza sesión HttpOnly y envía CSRF. Pendiente: modo PWA, funciones de edición avanzada, entrenamiento, nutrición y asistente de IA.
