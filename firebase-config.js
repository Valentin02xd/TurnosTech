
// Configuración de la API local
const API_BASE_URL = 'http://0.0.0.0:5000/api';

// Funciones de autenticación local
const localAuth = {
    async register(name, email, password) {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        return response.json();
    },

    async login(email, password) {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return response.json();
    },

    async getCurrentUser() {
        const token = localStorage.getItem('authToken');
        if (!token) return null;

        try {
            const response = await fetch(`${API_BASE_URL}/user`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                return response.json();
            }
            return null;
        } catch (error) {
            console.error('Error al obtener usuario:', error);
            return null;
        }
    },

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
    }
};

// Funciones de base de datos local
const localDB = {
    async saveAppointment(appointment) {
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`${API_BASE_URL}/appointments`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(appointment)
            });
            return response.json();
        } catch (error) {
            console.error('Error al guardar turno:', error);
            return { success: false, message: 'Error de conexión' };
        }
    },

    async getAppointments() {
        try {
            const response = await fetch(`${API_BASE_URL}/appointments`);
            return response.json();
        } catch (error) {
            console.error('Error al obtener turnos:', error);
            return [];
        }
    },

    async deleteAppointment(id) {
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.json();
        } catch (error) {
            console.error('Error al eliminar turno:', error);
            return { success: false, message: 'Error de conexión' };
        }
    }
};

console.log('API local configurada correctamente');
