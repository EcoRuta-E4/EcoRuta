# EcoRuta — Backend API

Módulo de servidor y API REST para EcoRuta (Seminario de Actualización I · Universidad del Pacífico).

## 1. Alcance implementado (ECO-3)

- **RF-01 & RF-03:** Login y logout con token JWT generado y validado en el backend.
- **RF-02:** Mensaje comprensible con credenciales incorrectas.
- **RF-04:** Rutas del panel protegidas y validación de permisos de administrador (`autenticar`, `soloAdmin`).
- **RF-05:** Script `npm run crear-admin` para crear o actualizar el administrador inicial.
- **RNF-01:** Contraseñas hasheadas con `bcrypt`.
- **RNF-02:** Sesión/token JWT con vencimiento (configurable, por defecto `8h`).

---

## 2. Puesta en marcha

### Variables de entorno
Copia `.env.example` a `.env` dentro de `backend/` (o en la raíz):

```bash
cp .env.example .env
```

Configura tus valores:
```env
PORT=3000
DATABASE_URL=postgresql://usuario:contrasena@localhost:5432/ecoruta
JWT_SECRET=tu-clave-secreta-segura
JWT_EXPIRES_IN=8h
FRONTEND_URL=http://localhost:5173
ADMIN_NOMBRE=Administrador EcoRuta
ADMIN_EMAIL=admin@ecoruta.co
ADMIN_PASSWORD=Admin123456*
```

### Comandos disponibles

```bash
# Iniciar en modo desarrollo con recarga automática
npm run dev

# Iniciar en producción
npm start

# Ejecutar pruebas unitarias automatizadas (16 tests)
npm test

# Crear o actualizar el administrador inicial (RF-05)
npm run crear-admin

# Ejecutar migraciones de la base de datos (PostgreSQL)
npm run migrate up
```

---

## 3. Endpoints de la API

### Autenticación (`/api/auth`)

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `POST` | `/api/auth/login` | Público | Inicia sesión con correo/email y contraseña/password (Zod). Devuelve token JWT. |
| `POST` | `/api/auth/logout` | Público | Cierra la sesión (el cliente descarta el token). |
| `GET` | `/api/auth/perfil` | Autenticado (`Bearer`) | Devuelve la información del usuario autenticado en el token. |

### Panel Administrativo (`/api/admin`)

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/admin/verificar` | Admin (`Bearer` + `admin`) | Valida que el token pertenezca a un usuario con rol `admin`. |
| `GET` | `/api/admin/dashboard-resumen` | Admin (`Bearer` + `admin`) | Retorna el resumen del dashboard si las vistas están migradas. |

---

## 4. Pruebas manuales

Puedes importar la colección preconfigurada para Thunder Client en VS Code o Postman desde el archivo:
`backend/thunder-collection_ecoruta_auth.json`.
