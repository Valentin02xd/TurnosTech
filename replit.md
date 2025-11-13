# TurnoTech - Sistema de Turnos para Sala de Informática

## Overview
TurnoTech is an appointment booking system for a computer lab ("Sala de Informática"). It's a web application that allows users to register, log in, and book time slots for using the computer lab. The system displays available time slots, manages bookings, and provides statistics.

**Current State**: The application is fully set up and running on Replit. The frontend is accessible at port 5000.

## Recent Changes (November 7, 2025)
- Created Firebase configuration file with placeholder values that need to be replaced with actual Firebase credentials
- Set up Python HTTP server to serve static files on port 5000
- Configured workflow for the web server with proper cache control headers
- Created project documentation and .gitignore file

## Project Architecture

### Technology Stack
- **Frontend**: Pure HTML, CSS, and JavaScript (no framework)
- **Backend**: Firebase (Authentication + Realtime Database)
- **Web Server**: Python 3 HTTP server (for development)
- **Languages**: Spanish (interface in Spanish)

### File Structure
```
.
├── index.html              # Main HTML file with UI structure
├── script.js              # JavaScript logic for appointments and Firebase integration
├── style.css              # Complete styling for the application
├── firebase-config.js     # Firebase configuration (needs user credentials)
├── server.py              # Python HTTP server for serving static files
├── attached_assets/       # Images and assets
│   └── Gemini_Generated_Image_8v0lbz8v0lbz8v0l_1750635539578.png
└── replit.md             # This documentation file
```

### Key Features
1. **User Authentication**: Email/password registration and login via Firebase Auth
2. **Appointment Booking**: Users can book time slots from 08:00 to 19:00
3. **Real-time Updates**: Uses Firebase Realtime Database for live updates
4. **Time Slot Grid**: Visual display of available/occupied time slots
5. **Statistics**: Shows booking statistics and trends
6. **AI Assistant**: Chatbot interface for user help
7. **Technical Support**: Contact form with support email addresses

### Firebase Setup Required
⚠️ **IMPORTANT**: The application requires Firebase configuration to work properly.

To set up Firebase:
1. Go to https://console.firebase.google.com/
2. Create a new project (or use an existing one)
3. Enable **Authentication** (Email/Password method)
4. Enable **Realtime Database**
5. In Project Settings, find your web app credentials
6. Update `firebase-config.js` with your actual Firebase credentials:
   - apiKey
   - authDomain
   - databaseURL
   - projectId
   - storageBucket
   - messagingSenderId
   - appId

### Database Structure
The Firebase Realtime Database uses this structure:
```
{
  "users": {
    "userId": {
      "name": "string",
      "email": "string",
      "registeredAt": timestamp
    }
  },
  "appointments": {
    "appointmentId": {
      "name": "string",
      "date": "YYYY-MM-DD",
      "time": "HH:MM",
      "userId": "string",
      "userEmail": "string",
      "createdAt": timestamp
    }
  },
  "dailyStats": {
    "YYYY-MM-DD": {
      "count": number
    }
  }
}
```

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

## Deployment Notes
When deploying to production:
- Use a production-ready web server (nginx, Apache, or similar)
- Ensure Firebase security rules are properly configured
- Consider adding rate limiting for API requests
- Keep Firebase credentials secure and never commit them to public repositories
