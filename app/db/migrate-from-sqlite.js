/**
 * Migración única: copia los datos del viejo turnotech.db (SQLite) a la
 * nueva base PostgreSQL. Se puede correr una sola vez, después de tener
 * DATABASE_URL configurada en tu .env.
 *
 * Uso:
 *   1. Asegurate de tener turnotech.db en esta misma carpeta (app/).
 *   2. npm install   (para tener sqlite3 disponible; no quedó como
 *                      dependencia del proyecto, así que si da error de
 *                      módulo no encontrado corré: npm install sqlite3)
 *   3. node db/migrate-from-sqlite.js
 */
require('dotenv').config();
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const db = require('./index');

const SQLITE_PATH = path.join(__dirname, '..', 'turnotech.db');

function openSqlite() {
  return new Promise((resolve, reject) => {
    const sq = new sqlite3.Database(SQLITE_PATH, sqlite3.OPEN_READONLY, (err) => {
      if (err) reject(err);
      else resolve(sq);
    });
  });
}

function allRows(sq, sql) {
  return new Promise((resolve, reject) => {
    sq.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function migrate() {
  console.log('Iniciando migración desde SQLite a PostgreSQL...');
  await db.initDatabase();

  const sq = await openSqlite();

  // --- usuarios ---
  const users = await allRows(sq, 'SELECT * FROM users');
  let migratedUsers = 0;
  for (const u of users) {
    try {
      await db.query(
        `INSERT INTO users (id, name, email, password, role, sector, registered_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (email) DO NOTHING`,
        [u.id, u.name, u.email, u.password, u.role || 'user', u.sector || 'informatica', u.registered_at]
      );
      migratedUsers++;
    } catch (e) {
      console.error(`No se pudo migrar el usuario ${u.email}:`, e.message);
    }
  }
  console.log(`Usuarios migrados: ${migratedUsers}/${users.length}`);

  // --- turnos ---
  const appointments = await allRows(sq, 'SELECT * FROM appointments');
  let migratedAppointments = 0;
  for (const a of appointments) {
    try {
      await db.query(
        `INSERT INTO appointments (id, user_id, name, email, date, time, room, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT DO NOTHING`,
        [a.id, a.user_id, a.name, a.email, a.date, a.time, a.room, a.created_at]
      );
      migratedAppointments++;
    } catch (e) {
      console.error(`No se pudo migrar el turno #${a.id}:`, e.message);
    }
  }
  console.log(`Turnos migrados: ${migratedAppointments}/${appointments.length}`);

  // Reajusta los contadores de autoincremento (SERIAL) para que sigan
  // desde el máximo id migrado, y no choquen con los nuevos registros.
  await db.query(`SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1))`);
  await db.query(`SELECT setval('appointments_id_seq', COALESCE((SELECT MAX(id) FROM appointments), 1))`);

  console.log('Migración terminada. Revisá los datos antes de borrar turnotech.db.');
  sq.close();
  await db.pool.end();
}

migrate().catch((err) => {
  console.error('La migración falló:', err);
  process.exit(1);
});
