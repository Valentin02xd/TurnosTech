
import http.server
import socketserver
import json
import os
import hashlib
import secrets
import sqlite3
from datetime import datetime
from urllib.parse import urlparse, parse_qs
import threading

PORT = 5000
DATABASE_FILE = 'turnotech.db'

db_lock = threading.Lock()

def get_db_connection():
    conn = sqlite3.connect(DATABASE_FILE, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_database():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print("Database initialized successfully")

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token():
    return secrets.token_urlsafe(32)

class APIHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/register':
            self.handle_register()
        elif self.path == '/api/login':
            self.handle_login()
        elif self.path == '/api/appointments':
            self.handle_create_appointment()
        else:
            self.send_error(404)

    def do_GET(self):
        if self.path == '/api/appointments':
            self.handle_get_appointments()
        elif self.path == '/api/user':
            self.handle_get_user()
        elif self.path.startswith('/api/'):
            self.send_error(404)
        else:
            super().do_GET()

    def do_DELETE(self):
        if self.path.startswith('/api/appointments/'):
            self.handle_delete_appointment()
        else:
            self.send_error(404)

    def handle_register(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            with db_lock:
                conn = get_db_connection()
                cursor = conn.cursor()
                
                cursor.execute('SELECT id FROM users WHERE email = ?', (data['email'],))
                if cursor.fetchone():
                    conn.close()
                    self.send_response(400)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        'success': False,
                        'message': 'El email ya está registrado'
                    }).encode())
                    return

                cursor.execute(
                    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                    (data['name'], data['email'], hash_password(data['password']))
                )
                conn.commit()
                conn.close()

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'success': True,
                'message': 'Usuario registrado exitosamente'
            }).encode())
        except Exception as e:
            print(f"Error in register: {e}")
            self.send_error(500)

    def handle_login(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            with db_lock:
                conn = get_db_connection()
                cursor = conn.cursor()
                
                cursor.execute(
                    'SELECT id, name, email FROM users WHERE email = ? AND password = ?',
                    (data['email'], hash_password(data['password']))
                )
                user = cursor.fetchone()

                if not user:
                    conn.close()
                    self.send_response(401)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        'success': False,
                        'message': 'Email o contraseña incorrectos'
                    }).encode())
                    return

                token = generate_token()
                cursor.execute(
                    'INSERT INTO sessions (token, user_id) VALUES (?, ?)',
                    (token, user['id'])
                )
                conn.commit()
                conn.close()

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'success': True,
                'token': token,
                'user': {
                    'id': user['id'],
                    'name': user['name'],
                    'email': user['email']
                }
            }).encode())
        except Exception as e:
            print(f"Error in login: {e}")
            self.send_error(500)

    def handle_get_user(self):
        try:
            auth_header = self.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                self.send_error(401)
                return

            token = auth_header.split(' ')[1]

            with db_lock:
                conn = get_db_connection()
                cursor = conn.cursor()
                
                cursor.execute('SELECT user_id FROM sessions WHERE token = ?', (token,))
                session = cursor.fetchone()

                if not session:
                    conn.close()
                    self.send_error(401)
                    return

                cursor.execute('SELECT id, name, email FROM users WHERE id = ?', (session['user_id'],))
                user = cursor.fetchone()
                conn.close()

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'id': user['id'],
                'name': user['name'],
                'email': user['email']
            }).encode())
        except Exception as e:
            print(f"Error in get_user: {e}")
            self.send_error(500)

    def handle_create_appointment(self):
        try:
            auth_header = self.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                self.send_error(401)
                return

            token = auth_header.split(' ')[1]
            
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            with db_lock:
                conn = get_db_connection()
                cursor = conn.cursor()
                
                cursor.execute('SELECT user_id FROM sessions WHERE token = ?', (token,))
                session = cursor.fetchone()

                if not session:
                    conn.close()
                    self.send_error(401)
                    return

                cursor.execute('SELECT id, name, email FROM users WHERE id = ?', (session['user_id'],))
                user = cursor.fetchone()

                cursor.execute(
                    'INSERT INTO appointments (user_id, name, email, date, time) VALUES (?, ?, ?, ?, ?)',
                    (user['id'], user['name'], user['email'], data['date'], data['time'])
                )
                appointment_id = cursor.lastrowid
                
                cursor.execute('SELECT * FROM appointments WHERE id = ?', (appointment_id,))
                appointment = cursor.fetchone()
                
                conn.commit()
                conn.close()

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'success': True,
                'appointment': {
                    'id': str(appointment['id']),
                    'name': appointment['name'],
                    'date': appointment['date'],
                    'time': appointment['time'],
                    'userId': str(appointment['user_id']),
                    'userEmail': appointment['email'],
                    'createdAt': appointment['created_at']
                }
            }).encode())
        except Exception as e:
            print(f"Error in create_appointment: {e}")
            self.send_error(500)

    def handle_get_appointments(self):
        try:
            with db_lock:
                conn = get_db_connection()
                cursor = conn.cursor()
                cursor.execute('SELECT * FROM appointments ORDER BY date, time')
                appointments = cursor.fetchall()
                conn.close()

            result = []
            for apt in appointments:
                result.append({
                    'id': str(apt['id']),
                    'name': apt['name'],
                    'date': apt['date'],
                    'time': apt['time'],
                    'userId': str(apt['user_id']),
                    'userEmail': apt['email'],
                    'createdAt': apt['created_at']
                })

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())
        except Exception as e:
            print(f"Error in get_appointments: {e}")
            self.send_error(500)

    def handle_delete_appointment(self):
        try:
            auth_header = self.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                self.send_error(401)
                return

            token = auth_header.split(' ')[1]
            appointment_id = self.path.split('/')[-1]

            with db_lock:
                conn = get_db_connection()
                cursor = conn.cursor()
                
                cursor.execute('SELECT user_id FROM sessions WHERE token = ?', (token,))
                session = cursor.fetchone()

                if not session:
                    conn.close()
                    self.send_error(401)
                    return

                cursor.execute('SELECT user_id FROM appointments WHERE id = ?', (appointment_id,))
                appointment = cursor.fetchone()

                if not appointment:
                    conn.close()
                    self.send_error(404)
                    return

                if appointment['user_id'] != session['user_id']:
                    conn.close()
                    self.send_error(403)
                    return

                cursor.execute('DELETE FROM appointments WHERE id = ?', (appointment_id,))
                conn.commit()
                conn.close()

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'success': True,
                'message': 'Turno cancelado correctamente'
            }).encode())
        except Exception as e:
            print(f"Error in delete_appointment: {e}")
            self.send_error(500)

init_database()

class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

with ReusableTCPServer(("0.0.0.0", PORT), APIHandler) as httpd:
    print(f"Server running at http://0.0.0.0:{PORT}/")
    print("Serving files from", os.getcwd())
    httpd.serve_forever()
