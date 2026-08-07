-- ============================================================
-- TurnoTech Pro — esquema de base de datos (PostgreSQL)
-- ============================================================
-- Se ejecuta automáticamente al arrancar el servidor (ver db/init.js),
-- así que es seguro correrlo varias veces (IF NOT EXISTS en todo).

CREATE TABLE IF NOT EXISTS users (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(120) NOT NULL,
  email          VARCHAR(255) NOT NULL UNIQUE,
  password       TEXT NOT NULL,
  role           VARCHAR(20) NOT NULL DEFAULT 'user'
                   CHECK (role IN ('user', 'admin')),
  sector         VARCHAR(20) NOT NULL DEFAULT 'informatica'
                   CHECK (sector IN ('informatica', 'industria')),
  reset_code     VARCHAR(6),
  reset_expires  TIMESTAMPTZ,
  registered_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS appointments (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(120) NOT NULL,
  email       VARCHAR(255) NOT NULL,
  date        DATE NOT NULL,
  time        VARCHAR(5) NOT NULL,
  room        VARCHAR(30) NOT NULL DEFAULT 'computacion'
                CHECK (room IN (
                  'computacion', 'robotica', 'hardware',
                  'produccion', 'laboratorio', 'cocina'
                )),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Esto es lo más importante del cambio a Postgres: la base de datos
  -- misma impide que dos personas reserven la misma sala/día/horario,
  -- aunque las dos peticiones lleguen al mismo tiempo. Con SQLite esa
  -- verificación se hacía "a mano" en el código (consultar y después
  -- insertar), lo cual puede fallar si dos usuarios reservan a la vez.
  CONSTRAINT unique_slot UNIQUE (date, time, room)
);

CREATE TABLE IF NOT EXISTS sessions (
  token       TEXT PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days')
);

-- Índices para las consultas más frecuentes de la app
CREATE INDEX IF NOT EXISTS idx_appointments_date_room ON appointments (date, room);
CREATE INDEX IF NOT EXISTS idx_appointments_user ON appointments (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id);
