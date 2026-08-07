# TurnoTech Pro v2.0

Sistema profesional de gestión de turnos para salas de Informática, Robótica y Hardware.

## 🚀 Características

### UI/UX Mejorado
- ✅ **Tema Claro/Oscuro** - Toggle para cambiar entre modos
- ✅ **Diseño Responsive** - Funciona en PC, tablet y móvil
- ✅ **Notificaciones Toast** - Feedback visual inmediato
- ✅ **Loading States** - Indicadores de carga en todas las acciones
- ✅ **Animaciones Suaves** - Transiciones profesionales

### Funcionalidades
- ✅ **Reserva de Turnos** - Sistema completo con calendario interactivo
- ✅ **Cancelación de Turnos** - Con confirmación y feedback
- ✅ **Visualización en Tiempo Real** - Grilla de horarios actualizada cada 5 segundos
- ✅ **Estadísticas** - Gráficos y métricas de uso
- ✅ **Asistente IA** - TurnoBot para ayuda instantánea
- ✅ **Soporte Técnico** - Modal con contactos y FAQ

### Seguridad
- ✅ **Autenticación JWT** - Tokens seguros
- ✅ **Contraseñas Hasheadas** - SHA-256
- ✅ **Validaciones** - En frontend y backend
- ✅ **Protección CSRF** - Headers de seguridad

## 📦 Instalación

### Requisitos
- Node.js 18+
- npm o yarn

### Pasos

1. **Instalar dependencias:**
```bash
npm install
```

2. **Build del frontend:**
```bash
npm run build
```

3. **Iniciar servidor:**
```bash
npm run server
```

O todo en uno:
```bash
npm start
```

4. **Abrir en navegador:**
```
http://localhost:5000
```

## 🏗️ Estructura del Proyecto

```
├── dist/                 # Build del frontend
├── src/
│   ├── components/       # Componentes React
│   │   ├── AIAssistant.tsx
│   │   ├── AppointmentsList.tsx
│   │   ├── BookingForm.tsx
│   │   ├── Calendar.tsx
│   │   ├── Header.tsx
│   │   ├── LoginModal.tsx
│   │   ├── RegisterModal.tsx
│   │   ├── RoomSelector.tsx
│   │   ├── Statistics.tsx
│   │   ├── SupportModal.tsx
│   │   └── Toast.tsx
│   ├── hooks/            # Custom hooks
│   │   ├── useAppointments.ts
│   │   ├── useAuth.ts
│   │   ├── useTheme.ts
│   │   └── useToast.ts
│   ├── types/            # TypeScript types
│   │   └── index.ts
│   ├── App.tsx           # Componente principal
│   └── main.tsx          # Entry point
├── server.js             # Backend Express
├── package.json
└── README.md
```

## 🔧 Configuración

### Variables de Entorno (opcional)
Crear archivo `.env`:
```env
PORT=5000
DATABASE_FILE=turnotech.db
```

### Personalización
- **Horarios:** Editar `TIME_SLOTS` en `src/types/index.ts`
- **Salas:** Editar `ROOMS` en `src/types/index.ts`
- **Colores:** Modificar `tailwind.config.js`

## 📊 Estadísticas Incluidas

- Total de turnos
- Promedio diario
- Día con más turnos
- Gráfico de turnos por día
- Ranking de usuarios

## 🤖 Asistente IA - TurnoBot

Responde preguntas sobre:
- Cómo reservar/cancelar turnos
- Horarios disponibles
- Registro de cuenta
- Problemas técnicos
- Recuperación de contraseña

## 🛠️ Soporte Técnico

Contactos disponibles:
- brandonareco02@gmail.com
- agueroelias433@gmail.com
- santinoolariaga11@gmail.com
- jereledezma871@gmail.com

## 📝 Changelog

### v2.0.0 (2026-02-13)
- Rebuild completo con React + TypeScript
- Implementación de tema claro/oscuro
- Nuevo sistema de notificaciones toast
- Mejoras de UX/UI significativas
- Estadísticas con gráficos reales
- Asistente IA funcional
- Soporte técnico integrado

### v1.0.0
- Versión inicial vanilla JS

## 📄 Licencia

Proyecto privado - TurnoTech Team
