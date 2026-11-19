# Guía de trabajo del equipo

El profesor evalúa los aportes individuales a partir de GitHub. Estas reglas hacen que cada aporte quede identificado.

## Antes de empezar

- Cada integrante trabaja con **su propia cuenta de GitHub**.
- Configura tu correo en git con el mismo correo de tu cuenta de GitHub, para que tus commits queden a tu nombre:
  ```
  git config --global user.name "Tu nombre"
  git config --global user.email "correo-de-tu-cuenta-github"
  ```
- Nunca subas contraseñas, claves ni archivos `.env`. Las variables secretas se configuran en el proveedor de despliegue.

## Ramas

- `main` es la rama estable. Después del commit inicial no se hacen cambios directos en ella.
- Una rama por tarea de Linear, con el código de la tarea:
  `feature/ECO-8-api-vehiculos`, `fix/ECO-4-error-login`, `docs/ECO-1-readme`.

## Commits

- En español, en imperativo y breves: `Agrega validación de placa única`.
- Commits pequeños y frecuentes, no uno solo al final.

## Pull requests

1. Sube tu rama y abre un pull request hacia `main`.
2. Completa la plantilla: tarea de Linear, qué cambia y cómo probarlo.
3. Pide revisión al líder (Integrante 1) o a otra persona del equipo.
4. Se fusiona cuando la revisión esté aprobada y la aplicación siga funcionando.

## Entregas

- Cada entrega se publica con un release en GitHub: `semana-1`, `semana-2`, `semana-3`, `semana-4`.
- El release debe corresponder exactamente al código que muestra la evidencia.
- Capturas y videos van en `docs/evidencia/`, nunca en un ZIP ni por correo.
- El líder publica el enlace del repositorio y del release en el foro antes del cierre (lunes, 11:59 p. m.) y envía las credenciales por Teams.
