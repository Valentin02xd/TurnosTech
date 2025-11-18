# TurnoTech - Sistema de Turnos Multi-Sala

## Overview
TurnoTech is an appointment booking system for educational computer and technology labs. It's a web application that allows users to register, log in, and book time slots across 3 independent rooms. The system displays available time slots for all rooms, manages bookings, and provides statistics.

**Current State**: The application is fully set up and running on Replit with support for 3 independent rooms. The frontend is accessible at port 5000.

## Recent Changes (November 18, 2025)
- **Implemented multi-room system** supporting 3 independent rooms:
  - 💻 Sala de Informática (Computer Lab)
  - 🤖 Sala de Robótica (Robotics Lab)
  - 🔧 Sala de Hardware y Software (Hardware & Software Lab)
- **Added room column to database** with automatic migration for existing databases
- **Created room selector UI** that appears after user login
- **Added 3 public schedule grids** visible to unauthenticated users showing availability for all rooms
- **Implemented "Volver" (back) button** to return from room booking view to room selector
- **Updated API endpoints** to filter appointments by room using query parameters
- **Fixed URL parsing** in server.py to correctly handle query parameters

## Previous Changes (November 13, 2025)
- Migrated database from JSON to SQLite for better reliability and performance
- Created firebase-config.js with proper API configuration using relative URLs
- Fixed API connection issues - registration and login now work correctly
- Installed Python 3.11 module
- Configured web server workflow on port 5000 with webview output
- Updated .gitignore to exclude SQLite database files
- Configured deployment settings for autoscale deployment

## Project Architecture

### Technology Stack
- **Frontend**: Pure HTML, CSS, and JavaScript (no framework)
- **Backend**: Python 3 HTTP server with REST API
- **Database**: SQLite (turnotech.db) - reliable and persistent
- **Authentication**: Token-based authentication with session management
- **Web Server**: Python 3 HTTP server on port 5000
- **Languages**: Spanish (interface in Spanish)

### File Structure
```
.
├── index.html              # Main HTML file with UI structure
├── script.js              # JavaScript logic for appointments and UI interactions
├── style.css              # Complete styling for the application
├── firebase-config.js     # API client configuration (connects to local backend)
├── server.py              # Python HTTP server with REST API endpoints
├── turnotech.db           # SQLite database for users, appointments, and sessions
├── attached_assets/       # Images and assets
│   └── Gemini_Generated_Image_8v0lbz8v0lbz8v0l_1750635539578.png
├── .gitignore             # Git ignore file
└── replit.md             # This documentation file
```

### Key Features
1. **User Authentication**: Email/password registration and login with secure token-based sessions
2. **Appointment Booking**: Users can book time slots from 08:00 to 19:00
3. **Real-time Updates**: Automatic polling every 5 seconds for live appointment updates
4. **Time Slot Grid**: Visual display of available/occupied time slots
5. **Statistics**: Shows booking statistics and trends over 7, 15, or 30 day periods
6. **AI Assistant**: Chatbot interface for user help and guidance
7. **Technical Support**: Contact form with support email addresses

### API Endpoints
The Python backend provides the following REST API endpoints:

- `POST /api/register` - Register a new user
- `POST /api/login` - Login and receive authentication token
- `GET /api/user` - Get current user information (requires auth token)
- `POST /api/appointments` - Create a new appointment (requires auth token)
- `GET /api/appointments` - Get all appointments
- `DELETE /api/appointments/{id}` - Cancel an appointment (requires auth token)

### Database Structure
The application uses SQLite (`turnotech.db`) with the following tables:

**users** table:
```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
name TEXT NOT NULL
email TEXT UNIQUE NOT NULL
password TEXT NOT NULL (SHA-256 hashed)
registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

**appointments** table:
```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
user_id INTEGER NOT NULL (foreign key to users)
name TEXT NOT NULL
email TEXT NOT NULL
date TEXT NOT NULL (YYYY-MM-DD)
time TEXT NOT NULL (HH:MM)
room TEXT NOT NULL DEFAULT 'informatica' (informatica, robotica, or hardware)
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

**sessions** table:
```sql
token TEXT PRIMARY KEY
user_id INTEGER NOT NULL (foreign key to users)
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### Database Benefits
✅ **Permanent storage**: Data persists across server restarts
✅ **SQL injection protection**: All queries use parameterized statements
✅ **Thread-safe**: Database access is protected with threading locks
✅ **Automatic backups**: The .db file is excluded from git but persists in Replit
✅ **Better performance**: SQLite is faster than JSON file I/O

### Time Slots
The system offers 12 time slots per day:
- 08:00, 09:00, 10:00, 11:00, 12:00, 13:00
- 14:00, 15:00, 16:00, 17:00, 18:00, 19:00

### Development Server
- **Port**: 5000 (required for Replit webview)
- **Host**: 0.0.0.0 (to allow external access)
- **Cache Control**: Disabled for development (no-cache headers)

## User Preferences
None documented yet.

## Deployment Configuration
The application is configured for Replit's autoscale deployment:
- **Deployment Type**: Autoscale (stateless web application)
- **Run Command**: `python server.py`
- **Port**: 5000
- **Host**: 0.0.0.0

### Deployment Considerations
When deploying to production:
- Consider migrating from JSON file storage to a proper database (PostgreSQL, MySQL, etc.)
- Implement proper backup strategies for the database.json file if continuing to use it
- Add rate limiting for API endpoints to prevent abuse
- Implement HTTPS/SSL for secure communication
- Set up proper error logging and monitoring
- Consider implementing password reset functionality
- Add email verification for new user registrations
