import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles, HelpCircle, Calendar, ShieldCheck, Clock, Info, Settings, MousePointer2, BookOpen, Mail, RotateCcw, Star, Zap, Monitor, Wrench, Users, ChevronRight, Trash2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  categories?: Category[];
  quickActions?: QuickAction[];
  followUp?: QuickAction[];
}

interface QuickAction {
  label: string;
  icon: React.ReactNode;
}

interface Category {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  questions: QuickAction[];
}

const categories: Category[] = [
  {
    id: 'turnos',
    label: 'Gestión de Turnos',
    icon: <Calendar className="w-4 h-4" />,
    description: 'Reservar, cancelar y consultar turnos',
    questions: [
      { label: '¿Cómo reservo un turno?', icon: <Calendar className="w-3 h-3" /> },
      { label: '¿Cómo cancelo mi turno?', icon: <X className="w-3 h-3" /> },
      { label: '¿Puedo reservar varios turnos?', icon: <Star className="w-3 h-3" /> },
      { label: '¿Puedo cambiar un turno?', icon: <RotateCcw className="w-3 h-3" /> },
      { label: '¿Qué pasa si no asisto?', icon: <HelpCircle className="w-3 h-3" /> },
      { label: '¿Cómo veo mis turnos?', icon: <BookOpen className="w-3 h-3" /> },
    ],
  },
  {
    id: 'cuenta',
    label: 'Mi Cuenta',
    icon: <User className="w-4 h-4" />,
    description: 'Registro, login y perfil',
    questions: [
      { label: '¿Cómo me registro?', icon: <User className="w-3 h-3" /> },
      { label: '¿Cómo inicio sesión?', icon: <Zap className="w-3 h-3" /> },
      { label: 'Olvidé mi contraseña', icon: <HelpCircle className="w-3 h-3" /> },
      { label: '¿Cómo cambio mi contraseña?', icon: <KeyRound className="w-3 h-3" /> },
      { label: '¿Cómo cambio mi perfil?', icon: <Settings className="w-3 h-3" /> },
      { label: '¿Puedo eliminar mi cuenta?', icon: <Trash2 className="w-3 h-3" /> },
      { label: '¿Qué datos necesito?', icon: <Info className="w-3 h-3" /> },
    ],
  },
  {
    id: 'salas',
    label: 'Salas y Horarios',
    icon: <Monitor className="w-4 h-4" />,
    description: 'Info sobre espacios y disponibilidad',
    questions: [
      { label: '¿Cuáles son los horarios?', icon: <Clock className="w-3 h-3" /> },
      { label: 'Uso de las Salas', icon: <MousePointer2 className="w-3 h-3" /> },
      { label: '¿Qué sectores hay?', icon: <Monitor className="w-3 h-3" /> },
      { label: '¿Qué salas tiene Informática?', icon: <Monitor className="w-3 h-3" /> },
      { label: '¿Qué salas tiene Industria?', icon: <Wrench className="w-3 h-3" /> },
      { label: '¿Los fines de semana hay turnos?', icon: <Calendar className="w-3 h-3" /> },
    ],
  },
  {
    id: 'soporte',
    label: 'Ayuda Técnica',
    icon: <ShieldCheck className="w-4 h-4" />,
    description: 'Problemas, errores y soporte',
    questions: [
      { label: 'Tengo un problema técnico', icon: <ShieldCheck className="w-3 h-3" /> },
      { label: 'La página no carga bien', icon: <Monitor className="w-3 h-3" /> },
      { label: 'No puedo reservar un turno', icon: <Calendar className="w-3 h-3" /> },
      { label: '¿Cómo contacto soporte?', icon: <Mail className="w-3 h-3" /> },
      { label: 'Error al iniciar sesión', icon: <HelpCircle className="w-3 h-3" /> },
      { label: 'No veo mis turnos reservados', icon: <BookOpen className="w-3 h-3" /> },
    ],
  },
  {
    id: 'general',
    label: 'Sobre TurnoTech',
    icon: <Info className="w-4 h-4" />,
    description: 'Conoce la plataforma',
    questions: [
      { label: '¿Qué es TurnoTech?', icon: <Info className="w-3 h-3" /> },
      { label: '¿Quién desarrolló TurnoTech?', icon: <Users className="w-3 h-3" /> },
      { label: '¿Es gratis usar TurnoTech?', icon: <Star className="w-3 h-3" /> },
      { label: '¿Funciona en celular?', icon: <Monitor className="w-3 h-3" /> },
      { label: '¿Hay app para descargar?', icon: <Zap className="w-3 h-3" /> },
      { label: '¿Qué navegadores soporta?', icon: <Settings className="w-3 h-3" /> },
    ],
  },
];

interface ResponseEntry {
  keywords: string[];
  text: string;
  followUp?: QuickAction[];
}

const knowledgeBase: ResponseEntry[] = [
  {
    keywords: ['cómo reservo un turno', 'reservar turno', 'reservar', 'sacar turno', 'pedir turno'],
    text: `📅 **PROCESO DE RESERVA**

1. **Inicia sesión** con tu cuenta registrada.
2. **Verás las salas de tu sector** (según lo elegiste al registrarte).
3. **Selecciona una sala** de las disponibles.
4. **Elige una fecha** en el calendario interactivo.
5. **Selecciona un horario** disponible (aparecen en verde).
6. **Confirma** haciendo clic en "Reservar Turno".

✨ *Tip: Los turnos se agotan rápido en horas pico. ¡Reserva con antelación!*`,
    followUp: [
      { label: '¿Puedo reservar varios turnos?', icon: <Star className="w-3 h-3" /> },
      { label: '¿Cuáles son los horarios?', icon: <Clock className="w-3 h-3" /> },
      { label: '¿Qué pasa si no asisto?', icon: <HelpCircle className="w-3 h-3" /> },
    ],
  },
  {
    keywords: ['cómo cancelo', 'cancelar turno', 'cancelar', 'borrar turno', 'eliminar turno'],
    text: `❌ **GESTIÓN DE CANCELACIONES**

1. Ve a la sección **"Mis Turnos Reservados"** en la página principal.
2. Identifica el turno que deseas liberar.
3. Haz clic en el ícono de **papelera** (🗑️).
4. Confirma la acción en el diálogo que aparece.

⚠️ *Liberar turnos que no usarás permite que otros compañeros puedan aprovechar ese espacio.*`,
    followUp: [
      { label: '¿Puedo cambiar un turno?', icon: <RotateCcw className="w-3 h-3" /> },
      { label: '¿Cómo veo mis turnos?', icon: <BookOpen className="w-3 h-3" /> },
    ],
  },
  {
    keywords: ['cómo me registro', 'registrar', 'crear cuenta', 'registrarse', 'nueva cuenta'],
    text: `👤 **CREACIÓN DE CUENTA**

1. Haz clic en el botón **"Registrarse"** en la esquina superior derecha.
2. Completa los campos:
   • **Nombre completo**
   • **Correo electrónico** (preferentemente institucional)
   • **Sector:** Técnico en Informática o Industria de Procedimiento
   • **Contraseña** (mínimo 6 caracteres)
3. Presiona **"Crear Cuenta"**.
4. ¡Listo! Ya puedes iniciar sesión y ver las salas de tu sector.

🔒 *Usa una contraseña segura que combines letras, números y símbolos.*`,
    followUp: [
      { label: '¿Cómo inicio sesión?', icon: <Zap className="w-3 h-3" /> },
      { label: '¿Qué datos necesito?', icon: <Info className="w-3 h-3" /> },
    ],
  },
  {
    keywords: ['horarios', 'horario', 'módulos', 'turnos disponibles', 'horas'],
    text: `🕐 **HORARIOS Y MÓDULOS DISPONIBLES**

**☀️ Turno Mañana:**
• Módulo 1: 08:00 - 09:20
• Módulo 2: 09:30 - 10:50
• Módulo 3: 11:00 - 12:20
• Módulo 4: 12:20 - 13:30

**🌙 Turno Tarde:**
• Módulo 5: 14:00 - 15:20
• Módulo 6: 15:30 - 16:50
• Módulo 7: 17:00 - 18:20
• Módulo 8: 18:20 - 19:30

📊 *Total: 8 módulos diarios por cada sala. Horario de lunes a viernes.*`,
    followUp: [
      { label: '¿Los fines de semana hay turnos?', icon: <Calendar className="w-3 h-3" /> },
      { label: '¿Cómo reservo un turno?', icon: <Calendar className="w-3 h-3" /> },
    ],
  },
  {
    keywords: ['problema técnico', 'problema', 'error', 'no funciona', 'falla', 'bug', 'no anda'],
    text: `🔧 **CENTRO DE AYUDA TÉCNICA**

Sigue estos pasos en orden:
1. 🔄 **Refresca** la página con Ctrl+R o F5.
2. 🌐 Verifica que tu **conexión a internet** sea estable.
3. 🧹 Prueba en una **ventana de incógnito** (Ctrl+Shift+N).
4. 🔓 **Cierra sesión** y vuelve a iniciar para refrescar permisos.
5. 🗑️ Limpia la **caché del navegador** en Ajustes > Privacidad.

📧 Si el problema persiste, contacta a nuestro equipo de soporte: **Brandon** o **Kevin** desde el botón de Soporte Técnico.`,
    followUp: [
      { label: '¿Cómo contacto soporte?', icon: <Mail className="w-3 h-3" /> },
      { label: 'La página no carga bien', icon: <Monitor className="w-3 h-3" /> },
      { label: 'Error al iniciar sesión', icon: <HelpCircle className="w-3 h-3" /> },
    ],
  },
  {
    keywords: ['olvidé mi contraseña', 'contraseña olvidada', 'no recuerdo mi contraseña', 'recuperar contraseña', 'olvidé la clave'],
    text: `🔐 **RECUPERAR CONTRASEÑA**

¡Ahora puedes recuperar tu contraseña directamente desde la app!

1. En la pantalla de inicio de sesión, haz clic en **"¿Olvidaste tu contraseña?"**
2. Ingresa tu **email registrado**.
3. Recibirás un **código de 6 dígitos** en tu correo.
4. Ingresa el código en la app.
5. Crea tu **nueva contraseña** (mínimo 6 caracteres).

⏱️ *El código es válido por 1 hora. Si no lo recibes, revisa tu carpeta de spam.*`,
    followUp: [
      { label: '¿Cómo cambio mi contraseña?', icon: <KeyRound className="w-3 h-3" /> },
      { label: '¿Cómo inicio sesión?', icon: <Zap className="w-3 h-3" /> },
    ],
  },
  {
    keywords: ['cambio mi contraseña', 'cambiar contraseña', 'cambiar clave', 'nueva contraseña', 'modificar contraseña'],
    text: `🔑 **CAMBIAR CONTRASEÑA**

Si ya estás logueado, puedes cambiar tu contraseña fácilmente:

1. Inicia sesión en tu cuenta.
2. En la barra superior, haz clic en el **ícono de llave** (🔑) junto a tu nombre.
3. Ingresa tu **contraseña actual**.
4. Escribe tu **nueva contraseña** (mínimo 6 caracteres).
5. **Confirma** la nueva contraseña.
6. Haz clic en **"Cambiar Contraseña"**.

🔒 *Tip: Usa una contraseña segura que combine letras, números y símbolos.*`,
    followUp: [
      { label: 'Olvidé mi contraseña', icon: <HelpCircle className="w-3 h-3" /> },
      { label: '¿Cómo inicio sesión?', icon: <Zap className="w-3 h-3" /> },
    ],
  },
  {
    keywords: ['qué es turnotech', 'turnotech', 'sobre turnotech', 'que es esta página', 'para qué sirve'],
    text: `🏢 **SOBRE TURNOTECH**

**TurnoTech** es un sistema profesional de gestión de espacios educativos. Permite a alumnos y docentes reservar turnos en salas especializadas según su sector:

**💻 Técnico en Informática:**
• Sala de Computación
• Sala de Robótica
• Taller de Hardware y Software

**🏭 Industria de Procedimiento:**
• Taller de Producción
• Taller de Laboratorio
• Taller de Cocina

🎯 *Nuestra misión: Democratizar el acceso a la tecnología educativa garantizando turnos equitativos para todos.*`,
    followUp: [
      { label: '¿Quién desarrolló TurnoTech?', icon: <Users className="w-3 h-3" /> },
      { label: '¿Es gratis usar TurnoTech?', icon: <Star className="w-3 h-3" /> },
    ],
  },
  {
    keywords: ['cambio mi perfil', 'cambiar perfil', 'editar perfil', 'modificar datos', 'cambiar nombre', 'cambiar email'],
    text: `⚙️ **CONFIGURACIÓN DE PERFIL**

Los datos de perfil son gestionados por el administrador para mantener la integridad del registro académico.

Si necesitas corregir alguno de estos datos:
• 📛 Tu **Nombre completo**
• 📧 Tu **Correo electrónico**
• 🎓 Tu **Rol** (Alumno/Docente)

Envía un ticket al equipo de **Soporte Técnico** con la información correcta y documentación de respaldo.`,
    followUp: [
      { label: '¿Cómo contacto soporte?', icon: <Mail className="w-3 h-3" /> },
    ],
  },
  {
    keywords: ['uso de las salas', 'normas', 'reglas', 'reglamento', 'comportamiento'],
    text: `🖱️ **NORMAS DE USO DE LAS SALAS**

Para una convivencia excelente, respeta estas normas:
1. ⏰ **Puntualidad:** Llega a tiempo. Tu turno tiene un horario estricto.
2. 🖥️ **Cuidado:** Trata el equipamiento con responsabilidad total.
3. 🚫 **Limpieza:** No se permite comer ni beber dentro de las salas.
4. 🧹 **Orden:** Al finalizar, deja tu puesto limpio y ordenado.
5. 🔇 **Silencio:** Mantén un ambiente de trabajo respetuoso.
6. 📱 **Celulares:** En modo silencioso durante el uso de la sala.

⚠️ *El incumplimiento reiterado puede resultar en la suspensión temporal de tu cuenta.*`,
    followUp: [
      { label: '¿Qué pasa si no asisto?', icon: <HelpCircle className="w-3 h-3" /> },
      { label: '¿Qué tiene la sala de Informática?', icon: <Monitor className="w-3 h-3" /> },
    ],
  },
  {
    keywords: ['reservar varios', 'múltiples turnos', 'más de un turno', 'dos turnos'],
    text: `📅 **RESERVAS MÚLTIPLES**

Sí, puedes reservar más de un turno. Sin embargo, ten en cuenta:
• Puedes tener **varios turnos activos** en diferentes días y horarios.
• **No puedes** reservar dos turnos en el mismo horario (aunque sean en salas diferentes).
• Te recomendamos reservar solo los que realmente vayas a utilizar.

🤝 *Recuerda: Si no vas a asistir, cancela el turno para que otro compañero pueda aprovecharlo.*`,
    followUp: [
      { label: '¿Cómo reservo un turno?', icon: <Calendar className="w-3 h-3" /> },
      { label: '¿Cómo cancelo mi turno?', icon: <X className="w-3 h-3" /> },
    ],
  },
  {
    keywords: ['cambiar turno', 'modificar turno', 'mover turno', 'cambiar horario'],
    text: `🔄 **CAMBIO DE TURNO**

Actualmente no existe la opción de "editar" un turno directamente. Para cambiar un turno:

1. **Cancela** el turno actual desde "Mis Turnos Reservados".
2. **Reserva** uno nuevo en el horario o sala que prefieras.

💡 *Tip: Hazlo lo antes posible para asegurar disponibilidad en el nuevo horario.*`,
    followUp: [
      { label: '¿Cómo cancelo mi turno?', icon: <X className="w-3 h-3" /> },
      { label: '¿Cómo reservo un turno?', icon: <Calendar className="w-3 h-3" /> },
    ],
  },
  {
    keywords: ['no asisto', 'faltar', 'ausencia', 'no voy', 'no puedo ir'],
    text: `⚠️ **POLÍTICA DE INASISTENCIA**

Si no puedes asistir a tu turno reservado:
• **Cancela con anticipación** para liberar el espacio.
• Las ausencias repetidas **sin cancelación previa** pueden generar restricciones.
• Otros compañeros podrían necesitar ese horario.

🙏 *Sé responsable con la comunidad: si no vas, cancela. Así todos ganan.*`,
    followUp: [
      { label: '¿Cómo cancelo mi turno?', icon: <X className="w-3 h-3" /> },
      { label: 'Uso de las Salas', icon: <MousePointer2 className="w-3 h-3" /> },
    ],
  },
  {
    keywords: ['veo mis turnos', 'ver turnos', 'mis reservas', 'mis turnos', 'turnos reservados', 'donde veo'],
    text: `📋 **VER MIS TURNOS RESERVADOS**

Para consultar tus turnos activos:
1. **Inicia sesión** en tu cuenta.
2. En la página principal, busca la sección **"Mis Turnos Reservados"**.
3. Allí verás una lista con:
   • 📅 Fecha del turno
   • ⏰ Horario asignado
   • 🏫 Sala reservada
   • 🗑️ Opción de cancelar

También puedes ver la **grilla general de horarios** más abajo en la página para visualizar la disponibilidad global.`,
    followUp: [
      { label: '¿Cómo cancelo mi turno?', icon: <X className="w-3 h-3" /> },
      { label: '¿Puedo cambiar un turno?', icon: <RotateCcw className="w-3 h-3" /> },
    ],
  },
  {
    keywords: ['inicio sesión', 'iniciar sesión', 'login', 'entrar', 'loguear', 'ingresar'],
    text: `🔑 **INICIAR SESIÓN**

1. Haz clic en **"Iniciar Sesión"** en la esquina superior derecha.
2. Ingresa tu **correo electrónico** registrado.
3. Escribe tu **contraseña**.
4. Presiona **"Entrar"**.

⚡ *¡Listo! Ya puedes acceder a todas las funciones de TurnoTech.*

❓ ¿Problemas para entrar? Verifica que tu email y contraseña sean correctos. Si olvidaste tu clave, contacta soporte.`,
    followUp: [
      { label: 'Olvidé mi contraseña', icon: <HelpCircle className="w-3 h-3" /> },
      { label: '¿Cómo me registro?', icon: <User className="w-3 h-3" /> },
    ],
  },
  {
    keywords: ['eliminar cuenta', 'borrar cuenta', 'dar de baja', 'eliminar mi cuenta'],
    text: `🗑️ **ELIMINACIÓN DE CUENTA**

Si deseas dar de baja tu cuenta de TurnoTech:
1. Contacta al equipo de **Soporte Técnico**.
2. Indica tu correo registrado y el motivo de la baja.
3. El equipo procesará la solicitud.

⚠️ *Ten en cuenta que al eliminar tu cuenta se cancelarán todos tus turnos activos y perderás el historial de reservas.*`,
    followUp: [
      { label: '¿Cómo contacto soporte?', icon: <Mail className="w-3 h-3" /> },
    ],
  },
  {
    keywords: ['qué datos', 'datos necesarios', 'requisitos registro', 'qué necesito para registrarme'],
    text: `📝 **DATOS NECESARIOS PARA REGISTRARTE**

Para crear tu cuenta necesitas:
• 📛 **Nombre completo:** Tu nombre real para identificarte.
• 📧 **Correo electrónico:** Preferentemente el institucional.
• 🏫 **Sector:** Elegir entre Técnico en Informática o Industria de Procedimiento.
• 🔒 **Contraseña:** Mínimo 6 caracteres (se recomienda usar letras, números y símbolos).

📌 *El sector determina qué salas verás al iniciar sesión. ¡Elige el correcto!*`,
    followUp: [
      { label: '¿Cómo me registro?', icon: <User className="w-3 h-3" /> },
    ],
  },
  {
    keywords: ['sectores', 'qué sectores', 'sector informática', 'sector industria'],
    text: `🏫 **SECTORES DISPONIBLES**

TurnoTech tiene dos sectores, cada uno con sus propias salas:

**💻 Técnico en Informática:**
• Sala de Computación - Equipos para programación y diseño
• Sala de Robótica - Kits de robótica y componentes electrónicos
• Taller de Hardware y Software - Mantenimiento y reparación

**🏭 Industria de Procedimiento:**
• Taller de Producción - Maquinaria para procesos industriales
• Taller de Laboratorio - Instrumentos para prácticas de laboratorio
• Taller de Cocina - Equipamiento profesional gastronómico

📌 *Al registrarte, eliges tu sector y solo verás las salas correspondientes.*`,
    followUp: [
      { label: '¿Qué salas tiene Informática?', icon: <Monitor className="w-3 h-3" /> },
      { label: '¿Qué salas tiene Industria?', icon: <Wrench className="w-3 h-3" /> },
    ],
  },
  {
    keywords: ['sala de informática', 'informática', 'sala informatica', 'computación', 'salas informática', 'salas tiene informática'],
    text: `💻 **SECTOR: TÉCNICO EN INFORMÁTICA**

Este sector cuenta con 3 salas especializadas:

**🖥️ Sala de Computación:**
Computadoras con software actualizado, IDEs, editores de código, conexión a internet de alta velocidad.

**🤖 Sala de Robótica:**
Kits de robótica educativa (Arduino, Raspberry Pi), impresoras 3D, componentes electrónicos y sensores.

**🔧 Taller de Hardware y Software:**
Herramientas de mantenimiento, equipos de diagnóstico, estaciones de soldadura y componentes de repuesto.

🎯 *Ideal para: programación, robótica, electrónica, mantenimiento de equipos y desarrollo de software.*`,
    followUp: [
      { label: '¿Qué salas tiene Industria?', icon: <Wrench className="w-3 h-3" /> },
      { label: '¿Cuáles son los horarios?', icon: <Clock className="w-3 h-3" /> },
    ],
  },
  {
    keywords: ['sala de robótica', 'robótica', 'sala robotica', 'robots'],
    text: `🤖 **SALA DE ROBÓTICA**

La sala de Robótica cuenta con:
• 🦾 Kits de robótica educativa (Arduino, Raspberry Pi).
• 🖨️ Impresoras 3D para prototipado.
• ⚡ Componentes electrónicos y sensores variados.
• 🔧 Herramientas de ensamblaje y soldadura básica.
• 💻 Estaciones de trabajo con software de simulación.

📌 *Esta sala pertenece al sector Técnico en Informática.*`,
    followUp: [
      { label: '¿Qué salas tiene Informática?', icon: <Monitor className="w-3 h-3" /> },
      { label: '¿Cuáles son los horarios?', icon: <Clock className="w-3 h-3" /> },
    ],
  },
  {
    keywords: ['sala de hardware', 'hardware', 'mantenimiento', 'reparación'],
    text: `🔧 **TALLER DE HARDWARE Y SOFTWARE**

El taller de Hardware dispone de:
• 🔩 Herramientas de mantenimiento y reparación de equipos.
• 🔌 Equipos de diagnóstico y testeo.
• ⚡ Estaciones de soldadura profesional.
• 🧰 Componentes de repuesto y materiales.
• 📖 Manuales técnicos y guías de referencia.

📌 *Este taller pertenece al sector Técnico en Informática.*`,
    followUp: [
      { label: '¿Qué salas tiene Informática?', icon: <Monitor className="w-3 h-3" /> },
      { label: 'Uso de las Salas', icon: <MousePointer2 className="w-3 h-3" /> },
    ],
  },
  {
    keywords: ['industria', 'producción', 'laboratorio', 'cocina', 'salas industria', 'salas tiene industria'],
    text: `🏭 **SECTOR: INDUSTRIA DE PROCEDIMIENTO**

Este sector cuenta con 3 talleres especializados:

**🏭 Taller de Producción:**
Equipos y maquinaria para procesos de producción industrial, líneas de ensamblaje y control de calidad.

**🔬 Taller de Laboratorio:**
Instrumentos de medición, materiales para prácticas de laboratorio, equipos de análisis y seguridad.

**👨‍🍳 Taller de Cocina:**
Equipamiento profesional gastronómico, estaciones de cocina, utensilios y áreas de preparación.

🎯 *Ideal para: procesos industriales, prácticas de laboratorio y gastronomía profesional.*`,
    followUp: [
      { label: '¿Qué salas tiene Informática?', icon: <Monitor className="w-3 h-3" /> },
      { label: '¿Cuáles son los horarios?', icon: <Clock className="w-3 h-3" /> },
    ],
  },
  {
    keywords: ['fines de semana', 'sábado', 'domingo', 'fin de semana', 'sabado'],
    text: `📅 **DISPONIBILIDAD EN FINES DE SEMANA**

Actualmente, las salas están disponibles únicamente de **lunes a viernes** en los horarios establecidos (08:00 a 19:30).

🚫 *Los sábados y domingos las instalaciones permanecen cerradas.*

💡 *Tip: Planifica tus actividades durante la semana para aprovechar al máximo los espacios disponibles.*`,
    followUp: [
      { label: '¿Cuáles son los horarios?', icon: <Clock className="w-3 h-3" /> },
      { label: '¿Cómo reservo un turno?', icon: <Calendar className="w-3 h-3" /> },
    ],
  },
  {
    keywords: ['página no carga', 'no carga', 'pantalla en blanco', 'carga lento', 'tarda en cargar'],
    text: `🖥️ **LA PÁGINA NO CARGA CORRECTAMENTE**

Prueba estas soluciones en orden:
1. 🔄 **Recarga forzada:** Ctrl+Shift+R (o Cmd+Shift+R en Mac).
2. 🧹 **Limpia caché:** Configuración del navegador > Borrar datos de navegación.
3. 🕵️ **Modo incógnito:** Ctrl+Shift+N para abrir una ventana privada.
4. 📱 **Otro dispositivo:** Prueba desde tu celular o tablet.
5. 🌐 **Conexión:** Verifica que tu internet esté funcionando correctamente.

Si después de todo esto sigue sin funcionar, contacta a soporte con una captura de pantalla del error.`,
    followUp: [
      { label: '¿Cómo contacto soporte?', icon: <Mail className="w-3 h-3" /> },
      { label: 'Tengo un problema técnico', icon: <ShieldCheck className="w-3 h-3" /> },
    ],
  },
  {
    keywords: ['no puedo reservar', 'no me deja reservar', 'error al reservar', 'reserva falla'],
    text: `📅 **NO PUEDO RESERVAR UN TURNO**

Posibles causas y soluciones:
1. 🔒 **No iniciaste sesión:** Asegúrate de estar logueado primero.
2. 🔴 **Horario ocupado:** Ese slot ya fue reservado por otro usuario.
3. 📅 **Fecha pasada:** No se pueden reservar turnos en fechas anteriores.
4. 🔄 **Error temporal:** Recarga la página e intenta nuevamente.

💡 *Recuerda: Los slots en verde están disponibles. Los grises u ocupados no se pueden seleccionar.*`,
    followUp: [
      { label: '¿Cómo reservo un turno?', icon: <Calendar className="w-3 h-3" /> },
      { label: 'Tengo un problema técnico', icon: <ShieldCheck className="w-3 h-3" /> },
    ],
  },
  {
    keywords: ['contacto soporte', 'contactar soporte', 'soporte técnico', 'email soporte', 'hablar con soporte'],
    text: `📧 **CONTACTAR SOPORTE TÉCNICO**

Tienes dos formas de comunicarte con nuestro equipo:

**Opción 1 - Desde la web:**
• Haz clic en el botón **"Soporte Técnico"** (esquina inferior derecha, ícono de chat).
• Se abrirá un formulario con los correos del equipo.

**Opción 2 - Email directo:**
• 👨‍💻 **Brandon Areco:** brandonareco02@gmail.com
• 👨‍💻 **Kevin Maz:** kevinmaz30020@gmail.com

📝 *Al escribir, incluye: descripción del problema, navegador, dispositivo y capturas de pantalla si es posible.*`,
    followUp: [
      { label: 'Tengo un problema técnico', icon: <ShieldCheck className="w-3 h-3" /> },
    ],
  },
  {
    keywords: ['error al iniciar sesión', 'no puedo entrar', 'login no funciona', 'credenciales incorrectas'],
    text: `🔑 **ERROR AL INICIAR SESIÓN**

Soluciones comunes:
1. ✅ Verifica que el **email** esté escrito correctamente (sin espacios).
2. 🔤 Comprueba que las **mayúsculas/minúsculas** de tu contraseña sean correctas.
3. 🔒 Asegúrate de que el **Bloq Mayús** no esté activado.
4. 📧 Confirma que estés usando el **correo con el que te registraste**.
5. 🔄 Si todo falla, intenta **registrarte nuevamente** con otro correo.

❓ *Si sigues sin poder entrar, probablemente necesites resetear tu contraseña a través de soporte.*`,
    followUp: [
      { label: 'Olvidé mi contraseña', icon: <HelpCircle className="w-3 h-3" /> },
      { label: '¿Cómo contacto soporte?', icon: <Mail className="w-3 h-3" /> },
    ],
  },
  {
    keywords: ['no veo mis turnos', 'turnos no aparecen', 'desaparecieron mis turnos'],
    text: `👀 **MIS TURNOS NO APARECEN**

Esto puede ocurrir por varias razones:
1. 🔒 **Sesión expirada:** Cierra sesión y vuelve a entrar.
2. 📅 **Turnos pasados:** Los turnos de fechas anteriores ya no se muestran.
3. ❌ **Cancelados:** Alguien con acceso pudo haber cancelado el turno.
4. 🔄 **Sincronización:** La página se actualiza cada 5 segundos, espera un momento.

💡 *Si recargaste la página y siguen sin aparecer, es posible que los turnos hayan expirado o sido cancelados.*`,
    followUp: [
      { label: '¿Cómo reservo un turno?', icon: <Calendar className="w-3 h-3" /> },
      { label: '¿Cómo contacto soporte?', icon: <Mail className="w-3 h-3" /> },
    ],
  },
  {
    keywords: ['quién desarrolló', 'quién hizo', 'creadores', 'desarrolladores', 'equipo'],
    text: `👥 **EQUIPO DE TURNOTECH**

TurnoTech fue desarrollado por un equipo de estudiantes apasionados por la tecnología:

• 👨‍💻 **Brandon Areco** - Desarrollo y Soporte
• 👨‍💻 **Kevin Maz** - Desarrollo y Soporte

🎓 *Proyecto creado con el objetivo de facilitar el acceso equitativo a los laboratorios tecnológicos educativos.*

💬 *¿Tienes sugerencias para mejorar la plataforma? ¡Escríbeles por email!*`,
    followUp: [
      { label: '¿Cómo contacto soporte?', icon: <Mail className="w-3 h-3" /> },
      { label: '¿Qué es TurnoTech?', icon: <Info className="w-3 h-3" /> },
    ],
  },
  {
    keywords: ['gratis', 'costo', 'precio', 'pagar', 'pago', 'cobran'],
    text: `🆓 **¿ES GRATIS TURNOTECH?**

¡Sí! TurnoTech es **completamente gratuito** para todos los usuarios.

• ✅ Registro gratuito
• ✅ Reserva de turnos sin costo
• ✅ Sin publicidad
• ✅ Sin límites de uso

🎯 *TurnoTech es un proyecto educativo sin fines de lucro, creado para beneficiar a toda la comunidad académica.*`,
    followUp: [
      { label: '¿Cómo me registro?', icon: <User className="w-3 h-3" /> },
      { label: '¿Qué es TurnoTech?', icon: <Info className="w-3 h-3" /> },
    ],
  },
  {
    keywords: ['celular', 'móvil', 'smartphone', 'tablet', 'responsive', 'teléfono'],
    text: `📱 **COMPATIBILIDAD MÓVIL**

¡Sí! TurnoTech funciona perfectamente en:
• 📱 **Celulares:** Android e iOS
• 📱 **Tablets:** iPad, tablets Android
• 💻 **Computadoras:** Windows, Mac, Linux

🌐 *La página se adapta automáticamente al tamaño de tu pantalla. No necesitas descargar ninguna aplicación.*

💡 *Tip: Puedes agregar TurnoTech a tu pantalla de inicio desde el navegador para acceder más rápido.*`,
    followUp: [
      { label: '¿Hay app para descargar?', icon: <Zap className="w-3 h-3" /> },
      { label: '¿Qué navegadores soporta?', icon: <Settings className="w-3 h-3" /> },
    ],
  },
  {
    keywords: ['app', 'aplicación', 'descargar', 'play store', 'app store'],
    text: `📲 **¿HAY APP PARA DESCARGAR?**

Actualmente no existe una aplicación nativa para descargar. Sin embargo:

• 🌐 **TurnoTech funciona desde cualquier navegador** como si fuera una app.
• 📱 Puedes **agregar un acceso directo** a tu pantalla de inicio:
  - **Android:** Menú del navegador > "Añadir a pantalla de inicio"
  - **iPhone:** Botón compartir > "Añadir a pantalla de inicio"

🚀 *De esta forma tendrás acceso rápido con un solo toque, sin ocupar espacio de almacenamiento.*`,
    followUp: [
      { label: '¿Funciona en celular?', icon: <Monitor className="w-3 h-3" /> },
    ],
  },
  {
    keywords: ['navegadores', 'navegador', 'chrome', 'firefox', 'safari', 'edge', 'compatible'],
    text: `🌐 **NAVEGADORES COMPATIBLES**

TurnoTech funciona en todos los navegadores modernos:
• ✅ **Google Chrome** (recomendado)
• ✅ **Mozilla Firefox**
• ✅ **Microsoft Edge**
• ✅ **Safari** (Mac/iPhone)
• ✅ **Opera**
• ✅ **Brave**

⚠️ *Se recomienda usar la versión más reciente de tu navegador para una experiencia óptima.*

❌ *Internet Explorer NO está soportado.*`,
    followUp: [
      { label: '¿Funciona en celular?', icon: <Monitor className="w-3 h-3" /> },
      { label: 'Tengo un problema técnico', icon: <ShieldCheck className="w-3 h-3" /> },
    ],
  },
  {
    keywords: ['hola', 'buenos días', 'buenas tardes', 'buenas noches', 'hey', 'que tal', 'qué tal'],
    text: `👋 ¡Hola! Soy **TurnoBot**, tu asistente inteligente de TurnoTech.

Estoy aquí para ayudarte con todo lo que necesites. Puedes:
• Seleccionar una **categoría** abajo para explorar preguntas.
• Escribir tu **duda directamente** en el campo de texto.
• Usar las **preguntas rápidas** que aparecen después de cada respuesta.

**¿En qué puedo asistirte hoy?** 😊`,
  },
  {
    keywords: ['gracias', 'muchas gracias', 'genial', 'perfecto', 'excelente'],
    text: `🙏 ¡De nada! Me alegra poder ayudarte.

¿Necesitas asistencia con algo más? Puedes seguir explorando las categorías o escribirme cualquier otra pregunta.

💙 *Estoy aquí para ti en todo momento.*`,
  },
  {
    keywords: ['chau', 'adiós', 'adios', 'hasta luego', 'nos vemos', 'bye'],
    text: `👋 ¡Hasta pronto! Que tengas un excelente día.

Recuerda que puedes volver a abrir el chat en cualquier momento haciendo clic en el ícono del bot. ¡Éxitos con tus turnos! 🚀`,
  },
  {
    keywords: ['ayuda', 'help', 'necesito ayuda', 'no entiendo', 'no sé'],
    text: `🆘 **¿NECESITAS AYUDA?**

¡Tranquilo! Estoy aquí para guiarte. Puedes:

1. 📂 **Explorar categorías:** Haz clic en una categoría abajo para ver preguntas organizadas por tema.
2. ✍️ **Escribir tu duda:** Escríbeme lo que necesitas en el campo de texto.
3. ⚡ **Preguntas rápidas:** Usa los botones que aparecen después de cada respuesta.
4. 📧 **Soporte humano:** Si prefieres hablar con una persona, contacta a Brandon o Kevin.

**¡No dudes en preguntar lo que sea!** 💪`,
  },
];

const defaultResponse = `👋 ¡Hola! Soy **TurnoBot**, tu asistente inteligente de TurnoTech.

Estoy aquí para ayudarte con todo lo que necesites sobre la plataforma. Puedo resolver tus dudas sobre turnos, cuentas, salas, horarios y mucho más.

**Selecciona una categoría para empezar o escríbeme tu pregunta:**`;

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'bot',
      text: defaultResponse,
      categories: categories,
    },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const findResponse = (userInput: string): { text: string; followUp?: QuickAction[] } => {
    const lowerInput = userInput.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    let bestMatch: ResponseEntry | null = null;
    let bestScore = 0;

    for (const entry of knowledgeBase) {
      for (const keyword of entry.keywords) {
        const normalizedKeyword = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (lowerInput.includes(normalizedKeyword)) {
          const score = normalizedKeyword.length;
          if (score > bestScore) {
            bestScore = score;
            bestMatch = entry;
          }
        }
      }
    }

    if (bestMatch) {
      return { text: bestMatch.text, followUp: bestMatch.followUp };
    }

    return {
      text: `🤔 No encontré una respuesta exacta para tu pregunta, pero puedo ayudarte de otras formas:

• Intenta reformular tu pregunta con otras palabras.
• Selecciona una de las **categorías** disponibles.
• O contacta directamente al equipo de soporte.

💡 *Tip: Prueba con palabras clave como "reservar", "horarios", "contraseña", "sala", etc.*`,
      followUp: [
        { label: '¿Cómo contacto soporte?', icon: <Mail className="w-3 h-3" /> },
        { label: '¿Qué es TurnoTech?', icon: <Info className="w-3 h-3" /> },
      ],
    };
  };

  const processResponse = (userInput: string) => {
    setIsTyping(true);
    const { text, followUp } = findResponse(userInput);

    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text,
        followUp,
        categories: !followUp || followUp.length === 0 ? categories : undefined,
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 600 + Math.random() * 400);
  };

  const handleSend = () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setActiveCategory(null);
    processResponse(currentInput);
  };

  const handleQuickAction = (question: string) => {
    if (isTyping) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: question,
    };
    setMessages((prev) => [...prev, userMessage]);
    setActiveCategory(null);
    processResponse(question);
  };

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        type: 'bot',
        text: defaultResponse,
        categories: categories,
      },
    ]);
    setActiveCategory(null);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`
          fixed bottom-[4.5rem] right-4 sm:bottom-24 sm:right-6 z-40
          w-11 h-11 sm:w-14 sm:h-14 rounded-full
          bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700
          text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)]
          flex items-center justify-center
          hover:scale-110 active:scale-95 transition-all duration-300
          animate-float-in animate-pulse-soft
          ${isOpen ? 'hidden' : 'flex'}
        `}
        aria-label="Abrir asistente"
      >
        <div className="relative">
          <Bot className="w-5 h-5 sm:w-7 sm:h-7" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-400"></span>
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-2 sm:inset-auto sm:bottom-6 sm:right-6 z-50 sm:w-[420px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col sm:max-h-[85vh] sm:h-[650px] animate-scale-in">
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white p-4 flex items-center justify-between cursor-default shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-blue-100" />
              </div>
              <div>
                <span className="font-bold text-lg block leading-none">TurnoBot</span>
                <span className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">Asistente Inteligente</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                title="Reiniciar chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 dark:bg-slate-900/50" ref={scrollRef}>
            <div className="space-y-5">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`
                      w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm
                      ${message.type === 'user'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 border border-blue-100 dark:border-blue-900/30'
                        : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white'
                      }
                    `}
                  >
                    {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`max-w-[85%] space-y-3 ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`
                        rounded-2xl p-3.5 text-sm shadow-sm leading-relaxed
                        ${message.type === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none'
                        }
                      `}
                    >
                      <div className="whitespace-pre-line">{message.text}</div>
                    </div>

                    {message.categories && !isTyping && (
                      <div className="space-y-2 pt-1 w-full">
                        {message.categories.map((cat) => (
                          <div key={cat.id}>
                            <button
                              onClick={() => handleCategoryClick(cat.id)}
                              className={`flex items-center justify-between w-full text-left px-3.5 py-2.5 text-xs font-semibold border rounded-xl transition-all duration-200
                                ${activeCategory === cat.id
                                  ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800'
                                }
                              `}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className={`p-1.5 rounded-lg ${activeCategory === cat.id ? 'bg-blue-100 dark:bg-blue-800' : 'bg-slate-100 dark:bg-slate-600'}`}>
                                  {cat.icon}
                                </span>
                                <div>
                                  <span className="block">{cat.label}</span>
                                  <span className="block text-[10px] font-normal opacity-70">{cat.description}</span>
                                </div>
                              </div>
                              <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${activeCategory === cat.id ? 'rotate-90' : ''}`} />
                            </button>
                            {activeCategory === cat.id && (
                              <div className="mt-1.5 ml-3 space-y-1 border-l-2 border-blue-200 dark:border-blue-700 pl-3">
                                {cat.questions.map((q) => (
                                  <button
                                    key={q.label}
                                    onClick={() => handleQuickAction(q.label)}
                                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-150"
                                  >
                                    <span className="text-blue-500">{q.icon}</span>
                                    {q.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {message.followUp && !isTyping && message.followUp.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">Preguntas relacionadas</span>
                        {message.followUp.map((action) => (
                          <button
                            key={action.label}
                            onClick={() => handleQuickAction(action.label)}
                            className="flex items-center gap-2 w-full text-left px-3.5 py-2.5 text-xs font-medium bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                          >
                            <span className="p-1 bg-slate-100 dark:bg-slate-600 rounded-md">
                              {action.icon}
                            </span>
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-tl-none px-5 py-3.5 flex gap-1.5 items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-3 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0">
            <div className="flex gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu pregunta..."
                disabled={isTyping}
                className="flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 text-sm h-10"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                size="icon"
                className="shrink-0 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[10px] text-center mt-1.5 text-slate-400 dark:text-slate-500 font-medium">
              TurnoBot - Asistente de TurnoTech
            </p>
          </div>
        </div>
      )}
    </>
  );
}
