// Configuración de horarios
const TIME_SLOTS = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
    '16:00', '17:00', '18:00', '19:00'
];

// Storage para los turnos
let appointments = [];
let currentUser = null;
let dailyStats = {};

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', async function() {
    initializeAuthSystem();
    initializeDateInput();
    initializeGridDate();
    setupEventListeners();
    
    // Event listeners para burbujas flotantes
    const aiAssistantBubble = document.getElementById('aiAssistantBubble');
    if (aiAssistantBubble) {
        aiAssistantBubble.addEventListener('click', showAIAssistant);
    }
    
    const supportBubble = document.getElementById('supportBubble');
    if (supportBubble) {
        supportBubble.addEventListener('click', showSupportModal);
    }

    // Event listeners para botones del asistente IA
    const closeAIBtn = document.getElementById('closeAIBtn');
    if (closeAIBtn) {
        closeAIBtn.addEventListener('click', closeAIAssistant);
    }

    const sendAIBtn = document.getElementById('sendAIBtn');
    if (sendAIBtn) {
        sendAIBtn.addEventListener('click', sendAIMessage);
    }

    const aiInput = document.getElementById('aiInput');
    if (aiInput) {
        aiInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                sendAIMessage();
            }
        });
    }

    // Event listener para cerrar modal de soporte
    const closeSupportBtn = document.getElementById('closeSupportBtn');
    if (closeSupportBtn) {
        closeSupportBtn.addEventListener('click', closeSupportModal);
    }

    // Verificar sesión actual
    await checkCurrentSession();
    
    // Cargar turnos inicialmente
    await loadAppointments();
    
    // Actualizar turnos cada 5 segundos
    setInterval(loadAppointments, 5000);
});

// Verificar sesión actual
async function checkCurrentSession() {
    const user = await localAuth.getCurrentUser();
    if (user) {
        currentUser = user;
        showAuthenticatedView();
    } else {
        currentUser = null;
        showUnauthenticatedView();
    }
}


function initializeDateInput() {
    const dateInput = document.getElementById('appointmentDate');
    const today = new Date();
    const maxDate = new Date('2100-12-31');

    dateInput.min = today.toISOString().split('T')[0];
    dateInput.max = maxDate.toISOString().split('T')[0];
    dateInput.value = today.toISOString().split('T')[0];

    dateInput.addEventListener('change', loadTimeSlots);
}

function initializeGridDate() {
    const gridDateInput = document.getElementById('gridDate');
    const today = new Date();
    const maxDate = new Date('2100-12-31');

    gridDateInput.min = today.toISOString().split('T')[0];
    gridDateInput.max = maxDate.toISOString().split('T')[0];
    gridDateInput.value = today.toISOString().split('T')[0];

    gridDateInput.addEventListener('change', displayTimeSlotsGrid);
}

function loadTimeSlots() {
    const dateInput = document.getElementById('appointmentDate');
    const timeSelect = document.getElementById('timeSlot');
    const selectedDate = dateInput.value;

    if (!selectedDate) return;

    timeSelect.innerHTML = '<option value="">Selecciona un horario</option>';

    const occupiedSlots = appointments
        .filter(apt => apt.date === selectedDate)
        .map(apt => ({ time: apt.time, name: apt.name }));

    TIME_SLOTS.forEach(time => {
        const option = document.createElement('option');
        option.value = time;
        const occupiedSlot = occupiedSlots.find(slot => slot.time === time);

        if (occupiedSlot) {
            option.textContent = `${time} - Ocupado por ${occupiedSlot.name}`;
            option.disabled = true;
            option.classList.add('time-slot-occupied');
        } else {
            option.textContent = `${time} - Disponible`;
            option.classList.add('time-slot-available');
        }
        timeSelect.appendChild(option);
    });
}

function setupEventListeners() {
    document.getElementById('appointmentForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('confirmationModal').querySelector('.close').addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target === document.getElementById('confirmationModal')) {
            closeModal();
        }
    });
}

async function handleFormSubmit(event) {
    event.preventDefault();
    if (!currentUser) {
        showError('loginError', 'Debes iniciar sesión para reservar un turno.');
        return;
    }

    const formData = new FormData(event.target);
    const appointmentData = {
        date: formData.get('appointmentDate'),
        time: formData.get('timeSlot')
    };

    try {
        const result = await localDB.saveAppointment(appointmentData);
        if (result.success) {
            showConfirmation(result.appointment);
            event.target.reset();
            await loadAppointments();
        } else {
            showRealTimeNotification('Error al reservar el turno.', 'error');
        }
    } catch (error) {
        console.error("Error al reservar el turno: ", error);
        showRealTimeNotification('Error al reservar el turno.', 'error');
    }
}

function showConfirmation(appointment) {
    const modal = document.getElementById('confirmationModal');
    const detailsDiv = document.getElementById('confirmationDetails');
    const formattedDate = new Date(appointment.date + 'T00:00:00').toLocaleDateString('es-ES', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    detailsDiv.innerHTML = `
        <p><strong>Nombre:</strong> ${appointment.name}</p>
        <p><strong>Fecha:</strong> ${formattedDate}</p>
        <p><strong>Horario:</strong> ${appointment.time}</p>
        <p><strong>Número de turno:</strong> #${appointment.id}</p>
    `;
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('confirmationModal').style.display = 'none';
}

function displayAppointments() {
    const container = document.getElementById('appointmentsContainer');
    const today = new Date().toISOString().split('T')[0];

    const upcomingAppointments = appointments
        .filter(apt => apt.date >= today)
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

    if (upcomingAppointments.length === 0) {
        container.innerHTML = '<p class="no-appointments">No hay turnos reservados</p>';
        return;
    }

    container.innerHTML = upcomingAppointments.map(appointment => `
        <div class="appointment-card ${appointment.date === today ? 'today' : ''}">
            <div class="appointment-time">${appointment.time}</div>
            <div class="appointment-name">${appointment.name}</div>
            <div class="appointment-date">
                ${new Date(appointment.date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short', month: 'short', day: 'numeric' })}
                ${currentUser && appointment.userId === currentUser.id ? `<button class="btn-delete" onclick="deleteAppointment('${appointment.id}')">Cancelar</button>` : ''}
            </div>
        </div>
    `).join('');
}

async function deleteAppointment(appointmentId) {
    if (confirm('¿Estás seguro de que quieres cancelar este turno?')) {
        try {
            const result = await localDB.deleteAppointment(appointmentId);
            if (result.success) {
                showRealTimeNotification('Turno cancelado correctamente.', 'success');
                await loadAppointments();
            } else {
                showRealTimeNotification('Error al cancelar el turno.', 'error');
            }
        } catch (error) {
            console.error("Error al cancelar el turno: ", error);
            showRealTimeNotification('Error al cancelar el turno.', 'error');
        }
    }
}

function displayTimeSlotsGrid() {
    const gridContainer = document.getElementById('timeSlotsGrid');
    const selectedDate = document.getElementById('gridDate').value;

    if (!selectedDate) return;

    const occupiedSlots = appointments.filter(apt => apt.date === selectedDate).map(apt => apt.time);

    gridContainer.innerHTML = TIME_SLOTS.map(time => {
        const isOccupied = occupiedSlots.includes(time);
        const occupiedAppointment = appointments.find(apt => apt.date === selectedDate && apt.time === time);
        return `
            <div class="time-slot ${isOccupied ? 'occupied' : 'available'}" title="${isOccupied ? `Ocupado por: ${occupiedAppointment.name}` : 'Horario disponible'}">
                <div class="slot-time">${time}</div>
                ${isOccupied ? `<div class="slot-name">${occupiedAppointment.name}</div>` : ''}
            </div>
        `;
    }).join('');
}

// Cargar turnos desde la API
async function loadAppointments() {
    try {
        const data = await localDB.getAppointments();
        appointments = data || [];
        displayAppointments();
        displayTimeSlotsGrid();
        loadTimeSlots();
        updateStatistics();
    } catch (error) {
        console.error("Error al cargar turnos:", error);
    }
}

function showRealTimeNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `real-time-notification ${type} show`;
    notification.innerHTML = `<div class="notification-content">${message}</div>`;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// 3. Auth Functions
function initializeAuthSystem() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('logoutBtn').addEventListener('click', logout);

    document.addEventListener('click', (event) => {
        const modals = document.querySelectorAll('.auth-modal');
        modals.forEach(modal => {
            if (event.target === modal) closeAuthModals();
        });
    });
}

async function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;

    if (password !== document.getElementById('confirmPassword').value) {
        showError('registerError', 'Las contraseñas no coinciden');
        return;
    }

    try {
        const result = await localAuth.register(name, email, password);
        if (result.success) {
            showSuccess('registerSuccess', '¡Registro exitoso! Ahora puedes iniciar sesión.');
            setTimeout(() => switchToLogin(), 2000);
        } else {
            showError('registerError', result.message);
        }
    } catch (error) {
        showError('registerError', 'Error al registrarse. Por favor intenta de nuevo.');
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
        const result = await localAuth.login(email, password);
        if (result.success) {
            localStorage.setItem('authToken', result.token);
            localStorage.setItem('currentUser', JSON.stringify(result.user));
            currentUser = result.user;
            closeAuthModals();
            showAuthenticatedView();
            await loadAppointments();
        } else {
            showError('loginError', result.message);
        }
    } catch (error) {
        showError('loginError', 'Email o contraseña incorrectos.');
    }
}

function logout() {
    localAuth.logout();
    currentUser = null;
    showUnauthenticatedView();
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function hideError(elementId) {
    document.getElementById(elementId).style.display = 'none';
}

function showSuccess(elementId, message) {
    const successElement = document.getElementById(elementId);
    successElement.textContent = message;
    successElement.style.display = 'block';
}

function showAuthenticatedView() {
    document.getElementById('userInfo').style.display = 'flex';
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('bookingForm').style.display = 'block';
    document.getElementById('appointmentsList').style.display = 'block';
    document.getElementById('welcomeText').textContent = `¡Hola, ${currentUser.name}!`;
    document.getElementById('userName').value = currentUser.name;
    document.getElementById('userName').readOnly = true;
}

function showUnauthenticatedView() {
    document.getElementById('userInfo').style.display = 'none';
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('bookingForm').style.display = 'none';
    document.getElementById('appointmentsList').style.display = 'none';
}

function showLoginModal() {
    closeAuthModals();
    document.getElementById('loginModal').style.display = 'block';
    hideError('loginError');
}

function showRegisterModal() {
    closeAuthModals();
    document.getElementById('registerModal').style.display = 'block';
    hideError('registerError');
    hideError('registerSuccess');
}

function closeAuthModals() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('registerModal').style.display = 'none';
}

function switchToLogin() {
    closeAuthModals();
    showLoginModal();
}

function switchToRegister() {
    closeAuthModals();
    showRegisterModal();
}

// AI Assistant Functions
function showAIAssistant() {
    document.getElementById('aiChatContainer').style.display = 'flex';
}

function closeAIAssistant() {
    document.getElementById('aiChatContainer').style.display = 'none';
}

function sendAIMessage() {
    const input = document.getElementById('aiInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    addUserMessage(message);
    input.value = '';
    
    setTimeout(() => {
        processAIQuery(message);
    }, 500);
}

function addUserMessage(message) {
    const messagesContainer = document.getElementById('aiChatMessages');
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'user-message';
    userMessageDiv.innerHTML = `
        <div class="user-text">${message}</div>
        <div class="user-avatar">👤</div>
    `;
    messagesContainer.appendChild(userMessageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addAIMessage(message, showQuickActions = false) {
    const messagesContainer = document.getElementById('aiChatMessages');
    const aiMessageDiv = document.createElement('div');
    aiMessageDiv.className = 'ai-message';
    
    let quickActionsHTML = '';
    if (showQuickActions) {
        quickActionsHTML = `
            <div class="ai-quick-actions">
                <button onclick="askAI('¿Cómo reservo un turno?')">📅 ¿Cómo reservo un turno?</button>
                <button onclick="askAI('¿Cómo cancelo mi turno?')">❌ ¿Cómo cancelo mi turno?</button>
                <button onclick="askAI('¿Cómo me registro?')">👤 ¿Cómo me registro?</button>
                <button onclick="contactSupport()">📞 Contactar soporte técnico</button>
            </div>
        `;
    }
    
    aiMessageDiv.innerHTML = `
        <div class="ai-avatar">🤖</div>
        <div class="ai-text">
            ${message}
            ${quickActionsHTML}
        </div>
    `;
    messagesContainer.appendChild(aiMessageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function askAI(question) {
    document.getElementById('aiInput').value = question;
    sendAIMessage();
}

function processAIQuery(query) {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('reservar') || lowerQuery.includes('turno') || lowerQuery.includes('cita')) {
        addAIMessage('Para reservar un turno, sigue estos pasos:\n\n1. Inicia sesión con tu cuenta (o regístrate si no tienes una)\n2. Selecciona la fecha deseada\n3. Elige un horario disponible (se muestran en verde)\n4. Haz clic en "Reservar Turno"\n\n¡Listo! Recibirás una confirmación con los detalles de tu turno.');
    } else if (lowerQuery.includes('cancelar') || lowerQuery.includes('eliminar')) {
        addAIMessage('Para cancelar un turno:\n\n1. Ve a la sección "Turnos Reservados"\n2. Busca tu turno en la lista\n3. Haz clic en el botón "Cancelar" junto a tu turno\n4. Confirma la cancelación\n\nNota: Solo puedes cancelar tus propios turnos.');
    } else if (lowerQuery.includes('registro') || lowerQuery.includes('cuenta')) {
        addAIMessage('Para registrarte en TurnoTech:\n\n1. Haz clic en el botón "Registrarse" en la parte superior\n2. Completa el formulario con:\n   - Tu nombre completo\n   - Email\n   - Contraseña (mínimo 6 caracteres)\n3. Confirma tu contraseña\n4. Haz clic en "Registrarse"\n\nDespués de registrarte, podrás iniciar sesión y reservar turnos.');
    } else if (lowerQuery.includes('horario') || lowerQuery.includes('disponible')) {
        addAIMessage('Los horarios disponibles son:\n\n- De 08:00 a 19:00 horas\n- Un turno por hora (12 turnos diarios)\n\nPuedes ver los horarios disponibles en la grilla de estado, donde:\n- Verde = Disponible\n- Rojo = Ocupado\n\nSelecciona una fecha para ver la disponibilidad específica de ese día.');
    } else if (lowerQuery.includes('estadística') || lowerQuery.includes('estadísticas')) {
        addAIMessage('La sección de estadísticas te muestra:\n\n- Total de turnos reservados\n- Promedio diario de reservas\n- Día con más turnos\n- Gráfico de turnos por día\n- Detalle día a día con tendencias\n\nPuedes cambiar el período de visualización (7, 15 o 30 días) y actualizar los datos en cualquier momento.');
    } else if (lowerQuery.includes('soporte') || lowerQuery.includes('ayuda') || lowerQuery.includes('problema')) {
        addAIMessage('Si necesitas ayuda técnica, puedes:\n\n1. Hacer clic en el botón de "Soporte" (🛠️) en la parte inferior derecha\n2. Contactar a nuestro equipo técnico por email\n3. Consultar los problemas comunes y sus soluciones\n\n¿Quieres que abra el modal de soporte?', true);
    } else {
        addAIMessage('¡Hola! Soy TurnoBot 🤖\n\nPuedo ayudarte con:\n- Cómo reservar un turno\n- Cómo cancelar tu turno\n- Cómo registrarte en la página\n- Ver horarios disponibles\n- Entender las estadísticas\n- Soporte técnico\n\n¿En qué puedo ayudarte?', true);
    }
}

function contactSupport() {
    closeAIAssistant();
    showSupportModal();
}

// Support Modal Functions
function showSupportModal() {
    document.getElementById('supportModal').style.display = 'flex';
}

function closeSupportModal() {
    document.getElementById('supportModal').style.display = 'none';
}

// Statistics Functions
function updateStatistics() {
    const periodSelect = document.getElementById('statsPeriod');
    const period = parseInt(periodSelect.value);
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - period);

    const filteredAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate >= startDate && aptDate <= today;
    });

    const totalTurnos = filteredAppointments.length;
    const promedioDiario = (totalTurnos / period).toFixed(1);

    const turnosPorDia = {};
    filteredAppointments.forEach(apt => {
        turnosPorDia[apt.date] = (turnosPorDia[apt.date] || 0) + 1;
    });

    const diaMasTurnos = Object.entries(turnosPorDia).sort((a, b) => b[1] - a[1])[0];

    document.getElementById('totalTurnos').textContent = totalTurnos;
    document.getElementById('promedioDiario').textContent = promedioDiario;
    document.getElementById('diaMasTurnos').textContent = diaMasTurnos 
        ? new Date(diaMasTurnos[0] + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
        : 'N/A';

    updateDailyChart(period, turnosPorDia);
    updateDailyTable(period, turnosPorDia);
}

function updateDailyChart(period, turnosPorDia) {
    const chartContainer = document.getElementById('dailyStatsChart');
    const today = new Date();
    let chartHTML = '';
    const maxTurnos = Math.max(...Object.values(turnosPorDia), 1);

    for (let i = period - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const count = turnosPorDia[dateStr] || 0;
        const height = (count / maxTurnos) * 150;
        const dayLabel = date.toLocaleDateString('es-ES', { weekday: 'short' });

        chartHTML += `
            <div class="chart-day">
                <div class="chart-bar ${count > 0 ? 'active' : ''}" style="height: ${height}px">
                    ${count > 0 ? `<span class="bar-value">${count}</span>` : ''}
                </div>
                <div class="chart-label">${dayLabel}</div>
            </div>
        `;
    }

    chartContainer.innerHTML = chartHTML;
}

function updateDailyTable(period, turnosPorDia) {
    const tableContainer = document.getElementById('dailyStatsTable');
    const today = new Date();
    let tableHTML = `
        <div class="stats-table-header">
            <div>Fecha</div>
            <div>Turnos</div>
            <div>Tendencia</div>
        </div>
    `;

    for (let i = 0; i < period; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const count = turnosPorDia[dateStr] || 0;
        
        const prevDate = new Date(date);
        prevDate.setDate(date.getDate() - 1);
        const prevDateStr = prevDate.toISOString().split('T')[0];
        const prevCount = turnosPorDia[prevDateStr] || 0;

        let trend = '━';
        let trendClass = 'trend-equal';
        if (count > prevCount) {
            trend = '↑';
            trendClass = 'trend-up';
        } else if (count < prevCount) {
            trend = '↓';
            trendClass = 'trend-down';
        }

        const formattedDate = date.toLocaleDateString('es-ES', { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short' 
        });

        tableHTML += `
            <div class="stats-row ${i === 0 ? 'active' : ''}">
                <div>${formattedDate}</div>
                <div class="turnos-count">${count}</div>
                <div class="trend ${trendClass}">${trend}</div>
            </div>
        `;
    }

    tableContainer.innerHTML = tableHTML;
}

// Close modals when clicking outside
window.addEventListener('click', (event) => {
    const supportModal = document.getElementById('supportModal');
    if (event.target === supportModal) {
        closeSupportModal();
    }
});
