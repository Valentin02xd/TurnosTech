const fs = require('fs');
const path = require('path');
const { Pool, types } = require('pg');

// OID 1082 = columnas de tipo DATE. Por defecto pg las convierte a un
// objeto Date de JS (interpretado en UTC), lo que puede correr el día
// mostrado según la zona horaria del usuario. Para una app de turnos
// eso es un bug serio, así que las dejamos viajar como texto plano
// "YYYY-MM-DD", igual que se guardaban antes en SQLite.
types.setTypeParser(1082, (value) => value);

if (!process.env.DATABASE_URL) {
  console.error(
    '[TurnoTech] ERROR: falta la variable de entorno DATABASE_URL.\n' +
    'Definila en tu archivo .env (ver .env.example) apuntando a tu base PostgreSQL.'
  );
  process.exit(1);
}

// Pool de conexiones: reutiliza conexiones en vez de abrir una nueva por
// cada consulta, lo que soporta muchos usuarios simultáneos sin problema.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // La mayoría de los proveedores gestionados (Render, Railway, Neon, Supabase)
  // requieren SSL. Si tu Postgres es local, podés poner DB_SSL=false en .env.
  ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('[TurnoTech] Error inesperado en una conexión inactiva del pool:', err.message);
});

// Ejecuta schema.sql al arrancar. Todo el archivo usa "IF NOT EXISTS",
// así que correrlo de nuevo en cada arranque no rompe nada ni borra datos.
async function initDatabase() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  await pool.query(schema);
  console.log('[TurnoTech] Base de datos PostgreSQL lista (esquema verificado).');
}

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  initDatabase,
};
