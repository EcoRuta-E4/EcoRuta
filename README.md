# EcoRuta (antes Tura Limpia)

Aplicación web para gestionar y consultar la recolección de basura en Buenaventura. El administrador registra vehículos, conductores, barrios y rutas con su trazado en el mapa, y programa los servicios. El ciudadano consulta cuándo pasa el camión por su barrio.

**Equipo:** Empresa 4 · Seminario de Actualización I · Ingeniería de Sistemas · Universidad del Pacífico

> El proyecto se llamaba **Tura Limpia** y el equipo lo renombró **EcoRuta**. La lista de chequeo del profesor sigue usando el nombre original.

## Alcance

1. **Panel administrativo (entregas del profesor):** acceso de administrador, vehículos, conductores, barrios, rutas con mapa, turnos y programación, dashboard.
2. **Simulación de camiones (propia):** dos camiones virtuales recorren el trazado guardado y envían su posición a un endpoint, como lo haría un GPS real.
3. **Panel ciudadano (propio):** página pública y de solo lectura donde se elige el barrio y se ven rutas, horarios, puntos de recolección y, si hay un servicio en curso, el camión y una hora estimada de paso.

## Integrantes y responsabilidades

| # | Rol | Responsable de | Integrante | GitHub |
|---|-----|----------------|------------|--------|
| 1 | Líder y coordinación | Repositorio, README, releases, revisión de pull requests y evidencia | Victor Manuel Vera Angulo | @VictorManuelVera |
| 2 | Backend 1 (líder de backend) | Autenticación, seguridad, vehículos, endpoint de posiciones y simulación | Andres Fernando Fernández Riascos | @AFdez11 |
| 3 | Backend 2 | Conductores, barrios, rutas, programación, validaciones e indicadores | Rubén Alberto Camacho Benitez | @RCamaB22 |
| 4 | Base de datos y despliegue | PostgreSQL en Neon, migraciones, datos de prueba y publicación | Victor Manuel Vera Angulo | @VictorManuelVera |
| 5 | Frontend 1 (líder de frontend) | Login, dashboard, vehículos, barrios y rutas | Walter David Estupiñán Castillo | @LicWalter |
| 6 | Frontend 2 | Proyecto base del frontend, conductores, mapa, programación y simulación en el mapa | Johan Alexander Murillo Sinisterra | @johanmurillo067-prog |
| 7 | Calidad y evidencia | Pruebas, capturas, instrucciones de verificación y video | Jhon Leyner Orobio Paredes | @Dancenot0 |
| 8 | Panel ciudadano | Diseño y construcción del panel ciudadano y puntos de recolección | Luis David Arias Isaza | @PapiBufff |

## Tecnologías

| Capa | Tecnología |
|------|------------|
| Frontend | React con HTML y CSS (componentes JSX), Vite y React Router |
| Estilos | Tailwind CSS o CSS propio (por elegir) |
| Mapa | Leaflet y React Leaflet, con mapas de OpenStreetMap, centrado en Buenaventura |
| Backend | Node.js con Express (API REST) |
| Acceso a datos | pg (node-postgres) y node-pg-migrate para las migraciones |
| Seguridad | JWT para la sesión, bcrypt para las contraseñas y Zod para validar los datos |
| Base de datos | PostgreSQL alojado en Neon (migraciones que crean la base desde cero) |
| Pruebas | Vitest y Supertest para los endpoints; registro de pruebas manuales en `docs/pruebas.md` |
| Despliegue | Netlify (frontend) y Render (backend) |

**Sobre el frontend:** React no reemplaza a HTML ni a CSS, los organiza en componentes. Cada componente devuelve etiquetas HTML escritas en JSX, y los estilos siguen siendo CSS. Hay un solo `index.html` y React cambia lo que se muestra en cada pantalla.

## Estructura del repositorio

```
backend/              API y lógica de negocio
frontend/             Interfaz web (panel administrativo y panel ciudadano)
database/migrations/  Migraciones que crean la base de datos desde cero
database/seeds/       Datos de prueba o script de carga
docs/evidencia/       Capturas y videos de cada entrega
.github/              Plantilla de pull request
```

## Cómo ejecutar el proyecto

**Requisitos:** Node.js (versión LTS), Git y una base de datos PostgreSQL (Neon o local). Se usan dos terminales abiertas al mismo tiempo, una para el backend y otra para el frontend.

1. **Clonar** el repositorio y entrar a la carpeta.
2. **Variables de entorno del backend:** en `backend/`, copiar `.env.example` como `.env` y completar:
   - `DATABASE_URL`: cadena de conexión de PostgreSQL (en Neon, la conexión directa, sin `-pooler`, con `?sslmode=require`).
   - `JWT_SECRET`: una cadena larga y aleatoria. Sin ella, el login responde 500.
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `ADMIN_NOMBRE`: datos del administrador inicial (la contraseña, de al menos 8 caracteres).
3. **Variables de entorno del frontend:** en `frontend/`, copiar `.env.example` como `.env`. `VITE_API_URL` debe apuntar al backend (`http://localhost:3000`).
4. **Terminal 1, backend:**
   ```bash
   cd backend
   npm install
   npm run migrate up     # crea las tablas, vistas y funciones desde cero
   npm run seed           # datos de prueba (con -- --reset vacía y recarga)
   npm run crear-admin    # crea el administrador inicial con ADMIN_EMAIL y ADMIN_PASSWORD
   npm run dev            # API en http://localhost:3000
   ```
5. **Terminal 2, frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev            # interfaz en http://localhost:5173
   ```
6. Abrir `http://localhost:5173` e iniciar sesión con el administrador del paso 4.

Nunca se suben a GitHub los archivos `.env` ni la cadena de conexión.

## Cómo correr las pruebas

El backend usa **Vitest** y **Supertest**. La suite principal simula PostgreSQL, así que no necesita base de datos.

```bash
cd backend
npm install
npm test            # ejecuta toda la suite
npm run test:watch  # modo interactivo
```

Resultado actual: **56 pruebas aprobadas** contra una base real (54 si se corre sin base; las 2 de integración se omiten).

Cubre:

- login correcto e incorrecto, cuenta inactiva, validación de datos y falta de `JWT_SECRET`;
- rutas del panel sin token (401), token inválido (401) y rol distinto de administrador (403);
- dashboard: indicadores, servicios de hoy, filtros y 503 cuando faltan migraciones;
- CORS y JSON mal formado.

Con PostgreSQL real (rama `test` de Neon o una base local) para no tocar los datos de `dev`:

```powershell
$env:TEST_DATABASE_URL="postgresql://usuario:clave@host:puerto/ecoruta?sslmode=require"
npm test
```

El registro detallado (paso, resultado esperado, resultado obtenido y fecha) está en
[`docs/pruebas.md`](docs/pruebas.md), con las respuestas guardadas en `docs/evidencia/`.
Las pruebas de vehículos y conductores (RNF-16) quedan pendientes como API porque esos endpoints
todavía no existen en `Dev`; la base sí está verificada (rechaza placa, documento y licencia
duplicados con `23505`).

## Verificación del acceso administrativo

1. Abrir `http://localhost:5173/login`.
2. Probar una contraseña incorrecta: aparece «Correo o contraseña incorrectos» y no se crea sesión.
3. Entrar con las credenciales correctas: se abre `/dashboard` con el menú (Vehículos, Conductores, Barrios y Rutas, Mapa de Rutas, Programación y Simulación) y los indicadores del backend.
4. Pulsar «Cerrar sesión»: se borra el token y la aplicación vuelve a `/login`.
5. Sin sesión, abrir `http://localhost:5173/dashboard`: redirige a `/login` con el aviso «Inicia sesión para continuar».

Las capturas de esta verificación están en [`docs/evidencia/entrega-1/`](docs/evidencia/entrega-1/README.md).

## URLs públicas

- Frontend: _pendiente (obligatoria desde la entrega 3)_
- Backend: _pendiente (obligatoria desde la entrega 3)_

Las credenciales de demostración se envían por Teams el día de cada cierre.

## Entregas y releases

| Entrega | Contenido | Cierre | Release | Estado |
|---------|-----------|--------|---------|--------|
| 1 | Acceso administrativo | lun 23 nov 2026 | `semana-1` | En proceso |
| 2 | Vehículos, conductores y dashboard | lun 30 nov 2026 | `semana-2` | Pendiente |
| 3 | Rutas, mapa y primera URL pública | lun 7 dic 2026 | `semana-3` | Pendiente |
| 4 | Programación y cierre | lun 14 dic 2026 | `semana-4` | Pendiente |

Los cierres son a las 11:59 p. m. y no se aceptan cambios posteriores.

## Cómo trabajamos

Ramas por tarea y pull requests, cada integrante desde su propia cuenta de GitHub. Ver [CONTRIBUTING.md](CONTRIBUTING.md).

## Limitaciones y trabajo pendiente

_Se completa en la entrega 4._ Funciones previstas para el próximo semestre: GPS físico (rastreadores comerciales o Arduino con ESP32) con servidor Traccar, cuentas de ciudadanos con notificaciones, aplicación móvil nativa y hora estimada de paso que considere el tráfico.