
import http.server
import socketserver
import json
import os
import hashlib
import secrets
from datetime import datetime
from urllib.parse import urlparse, parse_qs
import threading

PORT = 5000
DATABASE_FILE = 'database.json'

# Inicializar base de datos
def init_database():
    if not os.path.exists(DATABASE_FILE):
        with open(DATABASE_FILE, 'w') as f:
            json.dump({
                'users': {},
                'appointments': {},
                'sessions': {}
            }, f)

def load_database():
    with open(DATABASE_FILE, 'r') as f:
        return json.load(f)

def save_database(data):
    with open(DATABASE_FILE, 'w') as f:
        json.dump(data, f, indent=2)

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
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))

        db = load_database()
        
        # Verificar si el email ya existe
        if any(user['email'] == data['email'] for user in db['users'].values()):
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'success': False,
                'message': 'El email ya está registrado'
            }).encode())
            return

        # Crear nuevo usuario
        user_id = str(len(db['users']) + 1)
        db['users'][user_id] = {
            'id': user_id,
            'name': data['name'],
            'email': data['email'],
            'password': hash_password(data['password']),
            'registeredAt': datetime.now().isoformat()
        }
        
        save_database(db)

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({
            'success': True,
            'message': 'Usuario registrado exitosamente'
        }).encode())

    def handle_login(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))

        db = load_database()
        
        # Buscar usuario
        user = None
        for u in db['users'].values():
            if u['email'] == data['email'] and u['password'] == hash_password(data['password']):
                user = u
                break

        if not user:
            self.send_response(401)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'success': False,
                'message': 'Email o contraseña incorrectos'
            }).encode())
            return

        # Crear sesión
        token = generate_token()
        db['sessions'][token] = {
            'userId': user['id'],
            'createdAt': datetime.now().isoformat()
        }
        save_database(db)

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

    def handle_get_user(self):
        auth_header = self.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            self.send_error(401)
            return

        token = auth_header.split(' ')[1]
        db = load_database()

        if token not in db['sessions']:
            self.send_error(401)
            return

        user_id = db['sessions'][token]['userId']
        user = db['users'][user_id]

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({
            'id': user['id'],
            'name': user['name'],
            'email': user['email']
        }).encode())

    def handle_create_appointment(self):
        auth_header = self.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            self.send_error(401)
            return

        token = auth_header.split(' ')[1]
        db = load_database()

        if token not in db['sessions']:
            self.send_error(401)
            return

        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))

        user_id = db['sessions'][token]['userId']
        user = db['users'][user_id]

        appointment_id = str(len(db['appointments']) + 1)
        db['appointments'][appointment_id] = {
            'id': appointment_id,
            'name': user['name'],
            'date': data['date'],
            'time': data['time'],
            'userId': user_id,
            'userEmail': user['email'],
            'createdAt': datetime.now().isoformat()
        }

        save_database(db)

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({
            'success': True,
            'appointment': db['appointments'][appointment_id]
        }).encode())

    def handle_get_appointments(self):
        db = load_database()
        appointments = list(db['appointments'].values())

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(appointments).encode())

    def handle_delete_appointment(self):
        auth_header = self.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            self.send_error(401)
            return

        token = auth_header.split(' ')[1]
        db = load_database()

        if token not in db['sessions']:
            self.send_error(401)
            return

        appointment_id = self.path.split('/')[-1]
        user_id = db['sessions'][token]['userId']

        if appointment_id not in db['appointments']:
            self.send_error(404)
            return

        if db['appointments'][appointment_id]['userId'] != user_id:
            self.send_error(403)
            return

        del db['appointments'][appointment_id]
        save_database(db)

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({
            'success': True,
            'message': 'Turno cancelado correctamente'
        }).encode())

init_database()

with socketserver.TCPServer(("0.0.0.0", PORT), APIHandler) as httpd:
    print(f"Server running at http://0.0.0.0:{PORT}/")
    print("Serving files from", os.getcwd())
    httpd.serve_forever()
