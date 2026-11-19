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
| 2 | Backend 1 | Autenticación, seguridad, vehículos, endpoint de posiciones | _por completar_ | _por completar_ |
| 3 | Backend 2 | Conductores, barrios, rutas, programación y validaciones | _por completar_ | _por completar_ |
| 4 | Datos y despliegue | PostgreSQL, migraciones, datos de prueba, publicación | _por completar_ | _por completar_ |
| 5 | Frontend 1 | Login, dashboard, vehículos, barrios, rutas | _por completar_ | _por completar_ |
| 6 | Frontend 2 | Conductores, mapa, programación, simulación en el mapa | _por completar_ | _por completar_ |
| 7 | Ciudadano y calidad | Panel ciudadano, pruebas, capturas, video | _por completar_ | _por completar_ |

## Tecnologías

| Capa | Tecnología |
|------|------------|
| Base de datos | PostgreSQL (migraciones que crean la base desde cero) |
| Backend | _por definir_ |
| Frontend | _por definir_ |
| Mapa | _por definir_ (centrado en Buenaventura) |
| Despliegue | _por definir_ |

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

_Pendiente: se completa cuando el equipo cierre las tecnologías._

1. Requisitos.
2. Variables de entorno: copiar `.env.example` a `.env` y completar los valores.
3. Crear la base de datos y correr las migraciones.
4. Cargar los datos de prueba.
5. Crear el administrador inicial.
6. Iniciar backend y frontend.

## Verificación del acceso administrativo

_Pendiente (Entrega 1): pasos para iniciar y cerrar sesión, ver el bloqueo de rutas sin sesión y abrir el dashboard._

## URLs públicas

- Frontend: _pendiente (obligatoria desde la entrega 3)_
- Backend: _pendiente (obligatoria desde la entrega 3)_

Las credenciales de demostración se envían por Teams el día de cada cierre.

## Entregas y releases

| Entrega | Contenido | Cierre | Release | Estado |
|---------|-----------|--------|---------|--------|
| 1 | Acceso administrativo | lun 23 nov 2026 | `semana-1` | Pendiente |
| 2 | Vehículos, conductores y dashboard | lun 30 nov 2026 | `semana-2` | Pendiente |
| 3 | Rutas, mapa y primera URL pública | lun 7 dic 2026 | `semana-3` | Pendiente |
| 4 | Programación y cierre | lun 14 dic 2026 | `semana-4` | Pendiente |

Los cierres son a las 11:59 p. m. y no se aceptan cambios posteriores.

## Cómo trabajamos

Ramas por tarea y pull requests, cada integrante desde su propia cuenta de GitHub. Ver [CONTRIBUTING.md](CONTRIBUTING.md).

## Limitaciones y trabajo pendiente

_Se completa en la entrega 4._ Funciones previstas para el próximo semestre: GPS físico (rastreadores comerciales o Arduino con ESP32) con servidor Traccar, cuentas de ciudadanos con notificaciones, aplicación móvil nativa y hora estimada de paso que considere el tráfico.
