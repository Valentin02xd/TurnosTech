# TurnoTech Pro

## Descripción general

TurnoTech Pro es un sistema de reserva de turnos para seis salas especializadas, organizadas en dos sectores. Al registrarse, cada usuario elige su sector: **Técnico en Informática** (Sala de Computación, Sala de Robótica, Taller de Hardware y Software) o **Industria de Procedimiento** (Taller de Producción, Taller de Laboratorio, Taller de Cocina). Los usuarios pueden registrarse, iniciar sesión, reservar turnos en las salas de su sector, cancelarlos y ver la disponibilidad en tiempo real. Incluye un asistente de ayuda (TurnoBot, respuestas predefinidas — no es un modelo de IA conectado a un servicio externo), estadísticas de uso con gráficos, modo claro/oscuro y recuperación de contraseña por email.

## Arquitectura

### Frontend

- **Framework**: React 19 con TypeScript
- **Build**: Vite (alias `@/` → `./src/`)
- **Estilos**: Tailwind CSS, tema claro/oscuro con la clase `.dark`, colores de sector con el atributo `data-sector`
- **Componentes**: shadcn/ui (estilo "New York") sobre Radix UI, en `src/components/ui/`
- **Gráficos**: Recharts
- **Estado**: hooks de React (sin Redux/Zustand) — `useAuth`, `useAppointments`, `useTheme`, `useToast`
- El token de sesión se guarda en `localStorage` como `authToken`
- Los turnos se refrescan cada 5 segundos por polling (`setInterval`)

### Backend

- **Runtime**: Node.js + Express (`server.js`)
- **Puerto**: `process.env.PORT` (por defecto 5000)
- **Prefijo de API**: `/api`
- **Autenticación**: tokens de sesión propios (no JWT), contraseñas con bcrypt (con migración automática desde un esquema anterior en SHA-256 si el usuario todavía no inició sesión desde el cambio)
- **Emails**: Resend, para el código de recuperación de contraseña

**Endpoints principales:**
- `POST /api/register` — crear cuenta
- `POST /api/login` — iniciar sesión
- `GET /api/user` — usuario actual (requiere Bearer token)
- `GET /api/appointments` — listar turnos (filtro opcional `?room=`)
- `POST /api/appointments` — crear turno (requiere token)
- `DELETE /api/appointments/:id` — cancelar turno (requiere token)
- `POST /api/change-password` — cambiar contraseña estando logueado
- `POST /api/solicitar-codigo` — pedir código de recuperación (se envía por email, nunca en la respuesta)
- `POST /api/verificar-codigo` — verificar el código recibido
- `POST /api/cambiar-password` — cambiar contraseña con el código verificado

### Base de datos: PostgreSQL

El proyecto usa **PostgreSQL** (antes usaba un archivo SQLite local, que quedó obsoleto). La conexión se configura con la variable de entorno `DATABASE_URL` (ver `.env.example`).

- `app/db/schema.sql` — esquema completo (tablas, constraints, índices). Se ejecuta automáticamente al iniciar el servidor; es seguro correrlo varias veces.
- `app/db/index.js` — pool de conexiones (`pg`) y función `initDatabase()`.
- `app/db/migrate-from-sqlite.js` — script de un solo uso para migrar los datos del viejo `turnotech.db` a Postgres.

**Tablas:**
- `users`: id, name, email (único), password (bcrypt), role (`user`/`admin`), sector (`informatica`/`industria`), reset_code, reset_expires, registered_at
- `appointments`: id, user_id (FK → users, `ON DELETE CASCADE`), name, email, date, time, room, created_at. Tiene un `UNIQUE(date, time, room)` — es la propia base de datos la que impide que dos personas reserven el mismo turno al mismo tiempo, incluso si las dos peticiones llegan simultáneamente.
- `sessions`: token (PK), user_id (FK), created_at, expires_at (7 días desde la creación)

**Por qué PostgreSQL y no SQLite:**
- Soporta múltiples conexiones simultáneas sin bloquear el archivo (SQLite tiene problemas de concurrencia con varios usuarios a la vez).
- Constraints reales (`UNIQUE`, `CHECK`, `FOREIGN KEY ... ON DELETE CASCADE`) que hacen cumplir las reglas del negocio a nivel de base de datos, no solo en el código.
- Es el estándar para aplicaciones en producción; la mayoría de los hostings (Render, Railway, Neon, Supabase, etc.) ofrecen Postgres gestionado con backups automáticos.

### Puesta en marcha

1. Crear una base PostgreSQL (local o en un proveedor gratuito como Neon o Supabase).
2. Copiar `app/.env.example` a `app/.env` y completar `DATABASE_URL`, `RESEND_API_KEY` y `EMAIL_FROM`.
3. `cd app && npm install`
4. `npm run start` (compila el frontend y levanta el servidor; el esquema de la base se crea solo al arrancar)

### Estructura del proyecto

```
app/
├── server.js               # Backend Express (API + estáticos)
├── db/
│   ├── index.js            # Pool de conexiones a PostgreSQL
│   ├── schema.sql           # Esquema de la base de datos
│   └── migrate-from-sqlite.js  # Migración única desde el viejo SQLite
├── .env.example             # Variables de entorno necesarias
├── src/
│   ├── hooks/                # useAuth, useAppointments, useTheme, useToast
│   └── components/
│       ├── ui/                        # primitivas shadcn/ui
│       ├── LoginModal.tsx
│       ├── RegisterModal.tsx
│       ├── ForgotPasswordModal.tsx    # recuperación en 3 pasos
│       ├── ChangePasswordModal.tsx
│       ├── RoomSelector.tsx
│       ├── BookingForm.tsx
│       ├── Calendar.tsx
│       ├── TimeSlotsGrid.tsx
│       ├── AppointmentsList.tsx
│       ├── Statistics.tsx
│       ├── AIAssistant.tsx            # TurnoBot (respuestas predefinidas)
│       └── SupportModal.tsx
```

## Dependencias externas

- **Express**, **cors** — servidor y API
- **pg** — driver de PostgreSQL
- **bcryptjs** — hash de contraseñas
- **resend** — envío de emails de recuperación de contraseña
- **dotenv** — variables de entorno
- **React 19**, **Radix UI**, **Tailwind CSS**, **Recharts**, **date-fns**, **react-hook-form**, entre otras (ver `app/package.json`)

## Pendientes conocidos

- No hay panel de administración (el rol `admin` existe en la base pero todavía no se usa en la interfaz).
- Las salas y sectores están fijos en el código; para que una escuela pueda editarlos necesitaría un panel de configuración.
- No hay notificaciones por email de turnos confirmados o próximos (solo se usa email para recuperación de contraseña).
