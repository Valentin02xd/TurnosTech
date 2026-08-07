require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const path = require('path');
const { Resend } = require('resend');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// ------------------------------------------------------------------
// Email (Resend). Sin RESEND_API_KEY configurada, el servidor sigue
// funcionando pero avisa por consola y no podrá enviar el código.
// ------------------------------------------------------------------
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'TurnoTech <onboarding@resend.dev>';
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

if (!resend) {
  console.warn(
    '[TurnoTech] AVISO: no hay RESEND_API_KEY configurada. ' +
    'La recuperación de contraseña por email no va a funcionar hasta que la definas en .env'
  );
}

async function sendResetCodeEmail(toEmail, userName, code) {
  if (!resend) {
    throw new Error('Servicio de email no configurado (falta RESEND_API_KEY)');
  }

  await resend.emails.send({
    from: EMAIL_FROM,
    to: toEmail,
    subject: 'Tu código de recuperación de contraseña — TurnoTech',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color:#0f172a; margin-bottom: 4px;">TurnoTech Pro</h2>
        <p style="color:#334155;">Hola ${userName || ''},</p>
        <p style="color:#334155;">Recibimos una solicitud para restablecer tu contraseña. Usá el siguiente código en la app (válido por 15 minutos):</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; text-align: center; background:#f1f5f9; padding: 16px; border-radius: 8px; margin: 20px 0; color:#0f172a;">
          ${code}
        </div>
        <p style="color:#64748b; font-size: 13px;">Si vos no pediste este código, podés ignorar este email con tranquilidad — tu contraseña no va a cambiar.</p>
      </div>
    `,
  });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// ------------------------------------------------------------------
// Helpers de contraseñas / tokens
// ------------------------------------------------------------------
function hashPasswordLegacy(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

function verifyPassword(password, storedHash) {
  if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$')) {
    return bcrypt.compareSync(password, storedHash);
  }
  return hashPasswordLegacy(password) === storedHash;
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function generateResetCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Sesiones: valida el token Y que no haya expirado (7 días, ver schema.sql)
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token requerido' });
  }

  try {
    const { rows } = await db.query(
      'SELECT user_id FROM sessions WHERE token = $1 AND expires_at > now()',
      [token]
    );
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Token inválido o expirado' });
    }
    req.userId = rows[0].user_id;
    next();
  } catch (err) {
    console.error('Error verificando sesión:', err.message);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
}

const SECTOR_ROOMS = {
  informatica: ['computacion', 'robotica', 'hardware'],
  industria: ['produccion', 'laboratorio', 'cocina'],
};

// ==================== Rutas ====================

// Registro
app.post('/api/register', async (req, res) => {
  const { name, email, password, sector } = req.body;

  if (!name || !email || !password || !sector) {
    return res.status(400).json({ success: false, message: 'Todos los campos son requeridos' });
  }
  if (!['informatica', 'industria'].includes(sector)) {
    return res.status(400).json({ success: false, message: 'Sector inválido' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres' });
  }

  try {
    const hashedPassword = hashPassword(password);
    await db.query(
      'INSERT INTO users (name, email, password, sector) VALUES ($1, $2, $3, $4)',
      [name, email, hashedPassword, sector]
    );
    res.json({ success: true, message: 'Usuario registrado exitosamente' });
  } catch (err) {
    if (err.code === '23505') { // unique_violation (email duplicado)
      return res.status(400).json({ success: false, message: 'El email ya está registrado' });
    }
    console.error('Error al registrar usuario:', err.message);
    res.status(500).json({ success: false, message: 'Error al registrar usuario' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email y contraseña son requeridos' });
  }

  try {
    const { rows } = await db.query(
      'SELECT id, name, email, password, role, sector FROM users WHERE email = $1',
      [email]
    );
    const user = rows[0];

    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ success: false, message: 'Email o contraseña incorrectos' });
    }

    // Migración transparente de hashes viejos (SHA-256) a bcrypt
    if (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
      const bcryptHash = hashPassword(password);
      db.query('UPDATE users SET password = $1 WHERE id = $2', [bcryptHash, user.id])
        .catch((e) => console.error('Error migrando hash a bcrypt:', e.message));
    }

    const token = generateToken();
    await db.query('INSERT INTO sessions (token, user_id) VALUES ($1, $2)', [token, user.id]);

    res.json({
      success: true,
      token,
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        sector: user.sector || 'informatica',
      },
    });
  } catch (err) {
    console.error('Error en login:', err.message);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

// Usuario actual
app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, name, email, role, sector FROM users WHERE id = $1',
      [req.userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    const user = rows[0];
    res.json({
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      sector: user.sector || 'informatica',
    });
  } catch (err) {
    console.error('Error obteniendo usuario:', err.message);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

// Crear turno
app.post('/api/appointments', authenticateToken, async (req, res) => {
  const { date, time, room } = req.body;

  if (!date || !time || !room) {
    return res.status(400).json({ success: false, message: 'Fecha, hora y sala son requeridos' });
  }

  try {
    const { rows: userRows } = await db.query(
      'SELECT name, email, sector FROM users WHERE id = $1',
      [req.userId]
    );
    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    const user = userRows[0];
    const userSector = user.sector || 'informatica';
    const allowedRooms = SECTOR_ROOMS[userSector] || [];
    if (!allowedRooms.includes(room)) {
      return res.status(403).json({ success: false, message: 'No tienes acceso a esta sala' });
    }

    // El propio constraint UNIQUE(date, time, room) de la base de datos
    // es quien decide si el horario está libre — evita que dos personas
    // reserven el mismo turno si llegan al mismo tiempo (condición de carrera).
    const { rows } = await db.query(
      `INSERT INTO appointments (user_id, name, email, date, time, room)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, created_at`,
      [req.userId, user.name, user.email, date, time, room]
    );

    res.json({
      success: true,
      appointment: {
        id: rows[0].id.toString(),
        userId: req.userId.toString(),
        name: user.name,
        email: user.email,
        date,
        time,
        room,
        createdAt: rows[0].created_at,
      },
    });
  } catch (err) {
    if (err.code === '23505') { // unique_violation → el horario ya estaba tomado
      return res.status(400).json({ success: false, message: 'El horario ya está ocupado' });
    }
    console.error('Error al crear turno:', err.message);
    res.status(500).json({ success: false, message: 'Error al crear turno' });
  }
});

// Listar turnos
app.get('/api/appointments', async (req, res) => {
  const { room } = req.query;

  try {
    const { rows } = room && room !== 'all'
      ? await db.query('SELECT * FROM appointments WHERE room = $1 ORDER BY date, time', [room])
      : await db.query('SELECT * FROM appointments ORDER BY date, time');

    const appointments = rows.map((row) => ({
      id: row.id.toString(),
      userId: row.user_id.toString(),
      name: row.name,
      email: row.email,
      date: row.date,
      time: row.time,
      room: row.room,
      createdAt: row.created_at,
    }));

    res.json(appointments);
  } catch (err) {
    console.error('Error al obtener turnos:', err.message);
    res.status(500).json({ success: false, message: 'Error al obtener turnos' });
  }
});

// Cancelar turno
app.delete('/api/appointments/:id', authenticateToken, async (req, res) => {
  const appointmentId = req.params.id;

  try {
    const { rows } = await db.query('SELECT user_id FROM appointments WHERE id = $1', [appointmentId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Turno no encontrado' });
    }
    if (String(rows[0].user_id) !== String(req.userId)) {
      return res.status(403).json({ success: false, message: 'No puedes cancelar turnos de otros usuarios' });
    }

    await db.query('DELETE FROM appointments WHERE id = $1', [appointmentId]);
    res.json({ success: true, message: 'Turno cancelado correctamente' });
  } catch (err) {
    console.error('Error al cancelar turno:', err.message);
    res.status(500).json({ success: false, message: 'Error al cancelar turno' });
  }
});

// ==================== Recuperación de contraseña ====================

// Como máximo 1 solicitud de código cada 60 segundos por email.
const resetRequestCooldown = new Map();

app.post('/api/solicitar-codigo', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'El email es requerido' });
  }

  const lastRequest = resetRequestCooldown.get(email);
  if (lastRequest && Date.now() - lastRequest < 60 * 1000) {
    return res.status(429).json({
      success: false,
      message: 'Ya te enviamos un código hace un momento. Esperá un minuto antes de pedir otro.',
    });
  }
  resetRequestCooldown.set(email, Date.now());

  // Respuesta genérica: no confirmamos ni negamos si el email existe.
  const genericResponse = {
    success: true,
    message: 'Si el email está registrado, vas a recibir un código de verificación en los próximos minutos.',
  };

  try {
    const { rows } = await db.query('SELECT id, name FROM users WHERE email = $1', [email]);
    if (rows.length === 0) {
      return res.json(genericResponse);
    }
    const user = rows[0];
    const code = generateResetCode();

    await db.query(
      "UPDATE users SET reset_code = $1, reset_expires = now() + INTERVAL '15 minutes' WHERE id = $2",
      [code, user.id]
    );

    try {
      await sendResetCodeEmail(email, user.name, code);
    } catch (emailErr) {
      console.error('Error enviando email de recuperación:', emailErr.message);
      return res.status(500).json({
        success: false,
        message: 'No pudimos enviar el email en este momento. Probá de nuevo en unos minutos.',
      });
    }

    res.json(genericResponse);
  } catch (err) {
    console.error('Error en solicitar-codigo:', err.message);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.post('/api/verificar-codigo', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ success: false, message: 'Email y código son requeridos' });
  }

  try {
    const { rows } = await db.query(
      'SELECT id, reset_code, reset_expires FROM users WHERE email = $1',
      [email]
    );
    const user = rows[0];

    if (!user || !user.reset_code || user.reset_code !== code) {
      return res.status(400).json({ success: false, message: 'El código ingresado es incorrecto' });
    }
    if (!user.reset_expires || new Date(user.reset_expires) < new Date()) {
      return res.status(400).json({ success: false, message: 'El código ha expirado. Solicita uno nuevo.' });
    }

    res.json({ success: true, message: 'Código verificado correctamente' });
  } catch (err) {
    console.error('Error en verificar-codigo:', err.message);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.post('/api/cambiar-password', async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ success: false, message: 'Todos los campos son requeridos' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'La nueva contraseña debe tener al menos 6 caracteres' });
  }

  try {
    const { rows } = await db.query(
      'SELECT id, reset_code, reset_expires FROM users WHERE email = $1',
      [email]
    );
    const user = rows[0];

    if (!user || !user.reset_code || user.reset_code !== code) {
      return res.status(400).json({ success: false, message: 'Código inválido' });
    }
    if (!user.reset_expires || new Date(user.reset_expires) < new Date()) {
      return res.status(400).json({ success: false, message: 'El código ha expirado. Solicita uno nuevo.' });
    }

    const hashedPassword = hashPassword(newPassword);
    await db.query(
      'UPDATE users SET password = $1, reset_code = NULL, reset_expires = NULL WHERE id = $2',
      [hashedPassword, user.id]
    );
    await db.query('DELETE FROM sessions WHERE user_id = $1', [user.id]);

    res.json({ success: true, message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.' });
  } catch (err) {
    console.error('Error en cambiar-password:', err.message);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

// Cambio de contraseña (usuario autenticado)
app.post('/api/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Ambas contraseñas son requeridas' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'La nueva contraseña debe tener al menos 6 caracteres' });
  }

  try {
    const { rows } = await db.query('SELECT id, password FROM users WHERE id = $1', [req.userId]);
    const user = rows[0];

    if (!user || !verifyPassword(currentPassword, user.password)) {
      return res.status(401).json({ success: false, message: 'La contraseña actual es incorrecta' });
    }

    const hashedNewPassword = hashPassword(newPassword);
    await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedNewPassword, req.userId]);

    res.json({ success: true, message: 'Contraseña cambiada exitosamente' });
  } catch (err) {
    console.error('Error en change-password:', err.message);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

// React app para el resto de rutas
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ==================== Arranque ====================
db.initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}/`);
      console.log('Press Ctrl+C to stop');
    });
  })
  .catch((err) => {
    console.error('[TurnoTech] No se pudo inicializar la base de datos:', err.message);
    process.exit(1);
  });
