// Configuración de horarios por módulos del colegio técnico
const TIME_SLOTS = [
    "08:00 - 09:20",  // Primer módulo (mañana)
    "09:30 - 10:50",  // Segundo módulo (mañana)
    "11:00 - 12:20",  // Tercer módulo (mañana)
    "12:20 - 13:30",  // Cuarto módulo - Poshora (mañana)
    "14:00 - 15:20",  // Primer módulo (tarde)
    "15:30 - 16:50",  // Segundo módulo (tarde)
    "17:00 - 18:20",  // Tercer módulo (tarde)
    "18:20 - 19:30"   // Cuarto módulo - Poshora (tarde)
];

// Storage para los turnos
let appointments = [];
let currentUser = null;
let dailyStats = {};
let currentRoom = null;

// Nombres de las salas
const ROOM_NAMES = {
    'informatica': 'Sala de Informática',
    'robotica': 'Sala de Robótica',
    'hardware': 'Sala de Hardware y Software'
};

// Función para seleccionar una sala
function selectRoom(room) {
    currentRoom = room;
    document.getElementById('roomSelector').style.display = 'none';
    document.getElementById('bookingForm').style.display = 'block';
    document.getElementById('appointmentsList').style.display = 'block';
    document.getElementById('timeSlotsSection').style.display = 'none';
    document.getElementById('timeSlotsGridSingle').style.display = 'block';
    
    document.getElementById('currentRoomTitle').textContent = `Reservar Turno - ${ROOM_NAMES[room]}`;
    document.getElementById('singleRoomTitle').textContent = `Estado de Horarios - ${ROOM_NAMES[room]}`;
    
    initializeGridDateSingle();
    loadAppointments();
}

// Función para volver al selector de salas
function backToRoomSelector() {
    currentRoom = null;
    document.getElementById('roomSelector').style.display = 'block';
    document.getElementById('bookingForm').style.display = 'none';
    document.getElementById('appointmentsList').style.display = 'none';
    document.getElementById('timeSlotsSection').style.display = 'block';
    document.getElementById('timeSlotsGridSingle').style.display = 'none';
    
    loadAppointments();
}

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
    initializeCalendar();
    
    // Listeners para navegación del calendario
    document.getElementById('prevMonth').addEventListener('click', () => navigateMonth(-1));
    document.getElementById('nextMonth').addEventListener('click', () => navigateMonth(1));
    document.getElementById('prevYear').addEventListener('click', () => navigateYear(-1));
    document.getElementById('nextYear').addEventListener('click', () => navigateYear(1));
    document.getElementById('goToToday').addEventListener('click', goToToday);
}

// Variables globales para el calendario
let currentCalendarDate = new Date();
let selectedDate = null;
const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

function initializeCalendar() {
    const today = new Date();
    currentCalendarDate = new Date(today.getFullYear(), today.getMonth(), 1);
    renderCalendar();
}

function renderCalendar() {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    // Actualizar encabezado
    document.getElementById('calendarMonth').textContent = monthNames[month];
    document.getElementById('calendarYear').textContent = year;
    
    const daysContainer = document.getElementById('calendarDays');
    daysContainer.innerHTML = '';
    
    // Obtener el primer día del mes y cuántos días tiene
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Días del mes anterior
    const prevMonth = new Date(year, month - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();
    
    // Agregar días del mes anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const dayNumber = daysInPrevMonth - i;
        const dayElement = createCalendarDay(dayNumber, 'other-month', year, month - 1);
        daysContainer.appendChild(dayElement);
    }
    
    // Agregar días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = createCalendarDay(day, 'current-month', year, month);
        daysContainer.appendChild(dayElement);
    }
    
    // Agregar días del siguiente mes para completar la grilla
    const totalCells = daysContainer.children.length;
    const remainingCells = 42 - totalCells; // 6 filas × 7 días
    
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createCalendarDay(day, 'other-month', year, month + 1);
        daysContainer.appendChild(dayElement);
    }
    
    // Agregar leyenda si no existe
    addCalendarLegend();
}

function createCalendarDay(day, monthType, year, month) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.textContent = day;
    
    const dayDate = new Date(year, month, day);
    const today = new Date();
    const maxDate = new Date(today.getFullYear() + 100, 11, 31); // 100 años adelante
    
    // Aplicar clases según el tipo de día
    if (monthType === 'other-month') {
        dayElement.classList.add('other-month');
    }
    
    // Marcar día actual
    if (dayDate.toDateString() === today.toDateString()) {
        dayElement.classList.add('today');
    }
    
    // Marcar día seleccionado
    if (selectedDate && dayDate.toDateString() === selectedDate.toDateString()) {
        dayElement.classList.add('selected');
    }
    
    // Deshabilitar fechas pasadas (solo para mes actual)
    if (dayDate < today && monthType === 'current-month') {
        dayElement.classList.add('disabled');
    }
    
    // Deshabilitar fechas más allá de 100 años
    if (dayDate > maxDate) {
        dayElement.classList.add('disabled');
    }
    
    // Verificar si hay turnos en esta fecha
    const dateStr = formatDateForAPI(dayDate);
    const hasAppointments = appointments.some(apt => apt.date === dateStr);
    if (hasAppointments && monthType === 'current-month') {
        dayElement.classList.add('has-appointments');
        dayElement.title = `Hay turnos reservados el ${dayDate.toLocaleDateString('es-ES')}`;
    }
    
    // Event listener para seleccionar fecha
    dayElement.addEventListener('click', () => {
        if (dayElement.classList.contains('disabled')) return;
        
        selectCalendarDate(dayDate);
    });
    
    return dayElement;
}

function selectCalendarDate(date) {
    selectedDate = new Date(date);
    
    // Actualizar input hidden
    const dateInput = document.getElementById('appointmentDate');
    dateInput.value = formatDateForAPI(selectedDate);
    
    // Actualizar display
    const displayElement = document.getElementById('selectedDateDisplay');
    displayElement.textContent = `Fecha seleccionada: ${selectedDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })}`;
    
    // Re-renderizar calendario para mostrar selección
    renderCalendar();
    
    // Cargar horarios disponibles
    loadTimeSlots();
}

function formatDateForAPI(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function navigateMonth(direction) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + direction);
    renderCalendar();
}

function navigateYear(direction) {
    currentCalendarDate.setFullYear(currentCalendarDate.getFullYear() + direction);
    renderCalendar();
}

function goToToday() {
    const today = new Date();
    currentCalendarDate = new Date(today.getFullYear(), today.getMonth(), 1);
    selectCalendarDate(today);
    renderCalendar();
}

function addCalendarLegend() {
    const calendarContainer = document.querySelector('.calendar-container');
    let legendDiv = calendarContainer.querySelector('.calendar-legend');
    
    if (!legendDiv) {
        legendDiv = document.createElement('div');
        legendDiv.className = 'calendar-legend';
        legendDiv.innerHTML = `
            <div class="legend-item">
                <span class="legend-color legend-available"></span>
                <span>Disponible</span>
            </div>
            <div class="legend-item">
                <span class="legend-color legend-today"></span>
                <span>Hoy</span>
            </div>
            <div class="legend-item">
                <span class="legend-color legend-selected"></span>
                <span>Seleccionado</span>
            </div>
            <div class="legend-item">
                <span class="legend-color legend-occupied"></span>
                <span>Con turnos</span>
            </div>
        `;
        calendarContainer.appendChild(legendDiv);
    }
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

function initializeGridDateSingle() {
    const gridDateInput = document.getElementById('gridDateSingle');
    const today = new Date();
    const maxDate = new Date('2100-12-31');

    gridDateInput.min = today.toISOString().split('T')[0];
    gridDateInput.max = maxDate.toISOString().split('T')[0];
    gridDateInput.value = today.toISOString().split('T')[0];

    gridDateInput.addEventListener('change', displayTimeSlotsGridSingle);
}

function loadTimeSlots() {
    const dateInput = document.getElementById('appointmentDate');
    const timeSelect = document.getElementById('timeSlot');
    const selectedDateValue = dateInput.value;

    if (!selectedDateValue) {
        timeSelect.innerHTML = '<option value="">Selecciona una fecha primero</option>';
        return;
    }

    timeSelect.innerHTML = '<option value="">Selecciona un horario</option>';

    const occupiedSlots = appointments
        .filter(apt => apt.date === selectedDateValue && (!currentRoom || apt.room === currentRoom))
        .map(apt => ({ time: apt.time, name: apt.name }));

    const availableCount = TIME_SLOTS.length - occupiedSlots.length;
    
    // Agregar información de disponibilidad
    const infoOption = document.createElement('option');
    infoOption.disabled = true;
    infoOption.textContent = `--- ${availableCount} horarios disponibles de ${TIME_SLOTS.length} ---`;
    infoOption.style.fontWeight = 'bold';
    infoOption.style.color = '#0066ff';
    timeSelect.appendChild(infoOption);

    TIME_SLOTS.forEach(time => {
        const option = document.createElement('option');
        option.value = time;
        const occupiedSlot = occupiedSlots.find(slot => slot.time === time);

        if (occupiedSlot) {
            option.textContent = `${time} - ❌ Ocupado por ${occupiedSlot.name}`;
            option.disabled = true;
            option.classList.add('time-slot-occupied');
        } else {
            option.textContent = `${time} - ✅ Disponible`;
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

    if (!currentRoom) {
        showRealTimeNotification('❌ Error: No se ha seleccionado una sala', 'error');
        return;
    }

    const formData = new FormData(event.target);
    const appointmentData = {
        date: formData.get('appointmentDate'),
        time: formData.get('timeSlot'),
        room: currentRoom
    };

    try {
        const result = await localDB.saveAppointment(appointmentData);
        if (result.success) {
            showConfirmation(result.appointment);
            event.target.reset();
            selectedDate = null; // Reset selected date
            document.getElementById('selectedDateDisplay').textContent = 'Selecciona una fecha en el calendario';
            await loadAppointments();
            renderCalendar(); // Re-render calendar to show updates
            showRealTimeNotification('✅ Turno reservado exitosamente', 'success');
        } else {
            showRealTimeNotification(`❌ ${result.message || 'Error al reservar el turno'}`, 'error');
        }
    } catch (error) {
        console.error("Error al reservar el turno: ", error);
        showRealTimeNotification('❌ Error al reservar el turno', 'error');
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

    container.innerHTML = upcomingAppointments.map(appointment => {
        const formattedDate = new Date(appointment.date + 'T00:00:00').toLocaleDateString('es-ES', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
        
        const isUserAppointment = currentUser && (
            appointment.userId === currentUser.id || 
            appointment.userId === String(currentUser.id)
        );
        
        return `
            <div class="appointment-card ${appointment.date === today ? 'today' : ''}">
                <div class="appointment-time">${appointment.time}</div>
                <div class="appointment-name">${appointment.name}</div>
                <div class="appointment-date">
                    <span>${formattedDate}</span>
                    ${isUserAppointment ? `<button class="btn-delete" onclick="deleteAppointment('${appointment.id}')">❌ Cancelar Turno</button>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

async function deleteAppointment(appointmentId) {
    // Encontrar el turno específico para mostrar detalles
    const appointment = appointments.find(apt => apt.id === appointmentId || apt.id === String(appointmentId));
    
    let confirmMessage = '¿Estás seguro de que quieres cancelar este turno?';
    if (appointment) {
        const formattedDate = new Date(appointment.date + 'T00:00:00').toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        confirmMessage = `¿Estás seguro de que quieres cancelar tu turno?\n\nFecha: ${formattedDate}\nHorario: ${appointment.time}\n\nEsta acción no se puede deshacer.`;
    }
    
    if (confirm(confirmMessage)) {
        try {
            const result = await localDB.deleteAppointment(appointmentId);
            if (result.success) {
                showRealTimeNotification('✅ Turno cancelado correctamente', 'success');
                await loadAppointments();
                // Actualizar también la grilla de horarios
                displayTimeSlotsGrid();
                loadTimeSlots();
            } else {
                showRealTimeNotification('❌ Error al cancelar el turno: ' + (result.message || 'Error desconocido'), 'error');
            }
        } catch (error) {
            console.error("Error al cancelar el turno: ", error);
            showRealTimeNotification('❌ Error de conexión al cancelar el turno', 'error');
        }
    }
}

async function displayTimeSlotsGrid() {
    const selectedDate = document.getElementById('gridDate').value;
    if (!selectedDate) return;

    const rooms = ['informatica', 'robotica', 'hardware'];
    
    for (const room of rooms) {
        const gridContainer = document.getElementById(`timeSlotsGrid_${room}`);
        if (!gridContainer) continue;
        
        const roomAppointments = await localDB.getAppointments(room);
        const occupiedSlots = roomAppointments.filter(apt => apt.date === selectedDate).map(apt => apt.time);

        gridContainer.innerHTML = TIME_SLOTS.map(time => {
            const isOccupied = occupiedSlots.includes(time);
            const occupiedAppointment = roomAppointments.find(apt => apt.date === selectedDate && apt.time === time);
            return `
                <div class="time-slot ${isOccupied ? 'occupied' : 'available'}" title="${isOccupied ? `Ocupado por: ${occupiedAppointment.name}` : 'Horario disponible'}">
                    <div class="slot-time">${time}</div>
                    ${isOccupied ? `<div class="slot-name">${occupiedAppointment.name}</div>` : ''}
                </div>
            `;
        }).join('');
    }
}

function displayTimeSlotsGridSingle() {
    const gridContainer = document.getElementById('timeSlotsGridSingleContent');
    const selectedDate = document.getElementById('gridDateSingle').value;

    if (!selectedDate || !currentRoom) return;

    const occupiedSlots = appointments.filter(apt => apt.date === selectedDate && apt.room === currentRoom).map(apt => apt.time);

    gridContainer.innerHTML = TIME_SLOTS.map(time => {
        const isOccupied = occupiedSlots.includes(time);
        const occupiedAppointment = appointments.find(apt => apt.date === selectedDate && apt.time === time && apt.room === currentRoom);
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
        const room = currentRoom || 'all';
        const data = await localDB.getAppointments(room);
        appointments = data || [];
        displayAppointments();
        
        if (currentRoom) {
            displayTimeSlotsGridSingle();
        } else {
            displayTimeSlotsGrid();
        }
        
        loadTimeSlots();
        updateStatistics();
        // Actualizar calendario si existe
        if (typeof renderCalendar === 'function') {
            renderCalendar();
        }
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
    document.getElementById('roomSelector').style.display = 'block';
    document.getElementById('bookingForm').style.display = 'none';
    document.getElementById('appointmentsList').style.display = 'none';
    document.getElementById('timeSlotsSection').style.display = 'none';
    document.getElementById('timeSlotsGridSingle').style.display = 'none';
    document.getElementById('welcomeText').textContent = `¡Hola, ${currentUser.name}!`;
    document.getElementById('userName').value = currentUser.name;
    document.getElementById('userName').readOnly = true;
    currentRoom = null;
}

function showUnauthenticatedView() {
    document.getElementById('userInfo').style.display = 'none';
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('roomSelector').style.display = 'none';
    document.getElementById('bookingForm').style.display = 'none';
    document.getElementById('appointmentsList').style.display = 'none';
    document.getElementById('timeSlotsSection').style.display = 'block';
    document.getElementById('timeSlotsGridSingle').style.display = 'none';
    currentRoom = null;
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

function handleForgotPassword() {
    const email = document.getElementById('loginEmail').value.trim();
    
    closeAuthModals();
    
    if (email) {
        // Si el usuario ingresó un email, mostramos mensaje específico
        alert(`📧 Recuperación de Contraseña\n\nPara recuperar tu contraseña para la cuenta: ${email}\n\nPor favor contacta al soporte técnico a través del botón de soporte (🛠️) en la esquina inferior derecha.\n\nEl equipo técnico te ayudará a restablecer tu acceso proporcionando:\n• Tu email: ${email}\n• Verificación de identidad\n\nTiempo estimado de respuesta: 24-48 horas.`);
    } else {
        // Si no ingresó email, mostramos mensaje general
        alert(`🔐 Recuperación de Contraseña\n\nSi olvidaste tu contraseña:\n\n1. Contacta al soporte técnico usando el botón 🛠️ en la esquina inferior derecha\n2. Proporciona tu email registrado\n3. El equipo verificará tu identidad\n4. Te ayudarán a restablecer tu acceso\n\n⏱️ Tiempo estimado: 24-48 horas\n\n💡 Consejo: Ten a mano tu email registrado al contactar soporte.`);
    }
    
    // Abrir modal de soporte después de cerrar el alert
    setTimeout(() => {
        showSupportModal();
    }, 500);
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
                <button onclick="askAI('¿Cuáles son los horarios?')">🕐 Ver horarios disponibles</button>
                <button onclick="askAI('Tengo un problema técnico')">🔧 Problemas técnicos</button>
                <button onclick="askAI('Olvidé mi contraseña')">🔐 Recuperar contraseña</button>
                <button onclick="askAI('¿Cuántos turnos puedo reservar?')">📋 Límites del sistema</button>
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
    
    // Problemas de inicio de sesión
    if (lowerQuery.includes('no puedo') && (lowerQuery.includes('entrar') || lowerQuery.includes('iniciar') || lowerQuery.includes('login'))) {
        addAIMessage('Si tienes problemas para iniciar sesión, verifica lo siguiente:\n\n1. ✅ Asegúrate de estar usando el email correcto\n2. ✅ Verifica que tu contraseña sea correcta (mínimo 6 caracteres)\n3. ✅ Si olvidaste tu contraseña, contacta al soporte técnico\n4. ✅ Verifica tu conexión a internet\n5. ✅ Intenta cerrar y reabrir tu navegador\n\nSi el problema persiste, es posible que tu cuenta no esté registrada. ¿Necesitas ayuda para registrarte?', true);
    }
    // Problemas con contraseña
    else if (lowerQuery.includes('contraseña') && (lowerQuery.includes('olvidé') || lowerQuery.includes('olvidé') || lowerQuery.includes('perdí') || lowerQuery.includes('cambiar'))) {
        addAIMessage('Si olvidaste tu contraseña:\n\n🔐 Actualmente no hay sistema de recuperación automática, pero puedes:\n\n1. Contactar al administrador del sistema mediante el soporte técnico\n2. Proporcionar tu email registrado\n3. El administrador podrá ayudarte a restablecer tu acceso\n\n💡 Consejo: Guarda tu contraseña en un lugar seguro para evitar este problema en el futuro.');
    }
    // Reservar turno
    else if (lowerQuery.includes('reservar') || lowerQuery.includes('turno') || lowerQuery.includes('cita') || lowerQuery.includes('sacar')) {
        addAIMessage('📅 Para reservar un turno en la Sala de Informática:\n\n1. 👤 Inicia sesión con tu cuenta (o regístrate si no tienes una)\n2. 📆 Selecciona la fecha deseada en el calendario\n3. 🕐 Elige un módulo/horario disponible:\n   • Mañana: 08:00-09:20, 09:30-10:50, 11:00-12:20, 12:20-13:30\n   • Tarde: 14:00-15:20, 15:30-16:50, 17:00-18:20, 18:20-19:30\n4. ✅ Los horarios disponibles se muestran en verde con ✅\n5. ❌ Los horarios ocupados se muestran en rojo con ❌\n6. 🖱️ Haz clic en "Reservar Turno"\n\n¡Listo! Recibirás una confirmación automática con los detalles de tu turno.');
    }
    // Cancelar turno
    else if (lowerQuery.includes('cancelar') || lowerQuery.includes('eliminar') || lowerQuery.includes('borrar turno')) {
        addAIMessage('Para cancelar un turno existente:\n\n1. 📋 Ve a la sección "Turnos Reservados" (debajo del formulario)\n2. 🔍 Busca tu turno en la lista\n3. ❌ Haz clic en el botón rojo "Cancelar" junto a tu turno\n4. ✔️ Confirma la cancelación cuando se te solicite\n\n⚠️ Importante:\n• Solo puedes cancelar TUS PROPIOS turnos\n• No puedes cancelar turnos de otros usuarios\n• La cancelación es instantánea y libera el horario para otros\n• Puedes volver a reservar si cambias de opinión');
    }
    // Registro de cuenta
    else if (lowerQuery.includes('registro') || lowerQuery.includes('cuenta') || lowerQuery.includes('crear cuenta') || lowerQuery.includes('registrarme')) {
        addAIMessage('Para crear tu cuenta en TurnoTech:\n\n1. 🔘 Haz clic en "Registrarse" en la esquina superior derecha\n2. 📝 Completa el formulario con:\n   • Nombre completo (obligatorio)\n   • Email válido (será tu usuario)\n   • Contraseña (mínimo 6 caracteres)\n   • Confirmar contraseña (debe coincidir)\n3. ✅ Haz clic en "Registrarse"\n4. 🎉 ¡Listo! Serás redirigido automáticamente\n\n💡 Consejos:\n• Usa un email que revises frecuentemente\n• Elige una contraseña segura y que recuerdes\n• Guarda tus credenciales en un lugar seguro');
    }
    // Horarios y módulos
    else if (lowerQuery.includes('horario') || lowerQuery.includes('módulo') || lowerQuery.includes('modulo') || lowerQuery.includes('disponible') || lowerQuery.includes('hora')) {
        addAIMessage('🕒 Horarios por Módulo del Colegio Técnico:\n\n🌅 TURNO MAÑANA:\n• 1er módulo: 08:00 - 09:20 (1h 20min)\n• 2do módulo: 09:30 - 10:50 (1h 20min)\n• 3er módulo: 11:00 - 12:20 (1h 20min)\n• 4to módulo (Poshora): 12:20 - 13:30 (1h 10min)\n\n🌆 TURNO TARDE:\n• 1er módulo: 14:00 - 15:20 (1h 20min)\n• 2do módulo: 15:30 - 16:50 (1h 20min)\n• 3er módulo: 17:00 - 18:20 (1h 20min)\n• 4to módulo (Poshora): 18:20 - 19:30 (1h 10min)\n\n📊 Total: 8 módulos diarios disponibles\n\n💡 Puedes ver la disponibilidad en tiempo real en la grilla de estado después de seleccionar una fecha.');
    }
    // Estadísticas
    else if (lowerQuery.includes('estadística') || lowerQuery.includes('estadísticas') || lowerQuery.includes('gráfico') || lowerQuery.includes('datos')) {
        addAIMessage('📊 Panel de Estadísticas:\n\nLa sección de estadísticas te proporciona análisis detallado:\n\n📈 Métricas principales:\n• Total de turnos reservados en el período\n• Promedio diario de reservas\n• Día con más turnos reservados\n• Gráfico de barras con tendencias diarias\n\n🔧 Funcionalidades:\n• Cambiar período: 7, 15 o 30 días\n• Actualizar datos en tiempo real\n• Ver detalles día por día\n• Identificar tendencias (↑ subida, ↓ bajada, → estable)\n\n💡 Útil para:\n• Planificar cuándo hay menos demanda\n• Identificar días pico\n• Analizar patrones de uso');
    }
    // Problemas técnicos
    else if (lowerQuery.includes('error') || lowerQuery.includes('no funciona') || lowerQuery.includes('problema') || lowerQuery.includes('falla')) {
        addAIMessage('🔧 Solución de Problemas Técnicos:\n\n1. 🔄 Refresca la página (F5 o Ctrl+R)\n2. 🌐 Verifica tu conexión a internet\n3. 🗑️ Limpia caché del navegador\n4. 🔓 Cierra sesión y vuelve a iniciar\n5. 🔍 Revisa si estás usando las credenciales correctas\n\n❌ Errores comunes:\n• "Email ya registrado" → Ya existe una cuenta con ese email\n• "Turno no disponible" → Alguien más lo reservó primero\n• "Fecha no válida" → Selecciona una fecha futura\n• "Contraseña muy corta" → Usa mínimo 6 caracteres\n\n¿Necesitas contactar soporte técnico?', true);
    }
    // Soporte técnico
    else if (lowerQuery.includes('soporte') || lowerQuery.includes('ayuda técnica') || lowerQuery.includes('contacto') || lowerQuery.includes('administrador')) {
        addAIMessage('📞 Soporte Técnico TurnoTech:\n\nPuedes obtener ayuda de varias formas:\n\n1. 🛠️ Hacer clic en el botón "Soporte" (esquina inferior derecha)\n2. 📧 Contactar al equipo técnico por email\n3. 📋 Consultar la lista de problemas comunes y soluciones\n4. 🤖 Chatear conmigo (TurnoBot) para ayuda inmediata\n\n💡 Antes de contactar soporte:\n• Anota el error exacto que recibes\n• Indica qué estabas haciendo cuando ocurrió\n• Proporciona tu email registrado\n• Menciona el navegador que usas\n\n¿Quieres que abra el modal de soporte?', true);
    }
    // Límites y restricciones
    else if (lowerQuery.includes('límite') || lowerQuery.includes('limite') || lowerQuery.includes('cuántos') || lowerQuery.includes('cuantos') || lowerQuery.includes('restricción')) {
        addAIMessage('📋 Límites y Restricciones del Sistema:\n\n✅ PERMITIDO:\n• Reservar 1 turno por módulo/horario\n• Múltiples turnos en diferentes fechas\n• Cancelar tus propios turnos en cualquier momento\n• Ver todos los horarios disponibles\n\n❌ NO PERMITIDO:\n• Reservar el mismo horario dos veces\n• Cancelar turnos de otros usuarios\n• Reservar fechas pasadas\n• Duplicar reservas en el mismo módulo\n\n⚡ Capacidad:\n• 8 módulos por día\n• Capacidad ilimitada de usuarios\n• Actualización en tiempo real cada 5 segundos');
    }
    // Grilla de estado
    else if (lowerQuery.includes('grilla') || lowerQuery.includes('estado') || lowerQuery.includes('colores') || lowerQuery.includes('verde') || lowerQuery.includes('rojo')) {
        addAIMessage('🎨 Cómo interpretar la Grilla de Estado:\n\n🟢 VERDE = Disponible\n• El horario está libre\n• Puedes reservarlo sin problemas\n• Muestra "Disponible" en el desplegable\n\n🔴 ROJO = Ocupado\n• Alguien ya reservó ese horario\n• Muestra el nombre de quien lo reservó\n• No se puede seleccionar\n\n📊 La grilla muestra:\n• Vista completa del día seleccionado\n• 8 módulos (4 mañana, 4 tarde)\n• Actualización automática cada 5 segundos\n• Contador de horarios disponibles vs ocupados');
    }
    // Seguridad y privacidad
    else if (lowerQuery.includes('segur') || lowerQuery.includes('privacidad') || lowerQuery.includes('datos') || lowerQuery.includes('protección')) {
        addAIMessage('🔒 Seguridad y Privacidad:\n\n🛡️ TUS DATOS ESTÁN PROTEGIDOS:\n• Las contraseñas se almacenan encriptadas (SHA-256)\n• Conexión segura mediante tokens de sesión\n• Solo tú puedes ver y cancelar tus turnos\n• No compartimos información con terceros\n\n👁️ QUÉ INFORMACIÓN SE GUARDA:\n• Nombre completo\n• Email (para inicio de sesión)\n• Contraseña encriptada\n• Historial de turnos reservados\n\n✅ RECOMENDACIONES:\n• No compartas tu contraseña\n• Cierra sesión en computadoras públicas\n• Usa una contraseña única y segura');
    }
    // Preguntas sobre el sistema
    else if (lowerQuery.includes('qué es') || lowerQuery.includes('que es') || lowerQuery.includes('para qué') || lowerQuery.includes('para que')) {
        addAIMessage('🏫 ¿Qué es TurnoTech?\n\nTurnoTech es el sistema de gestión de turnos para la Sala de Informática del colegio técnico.\n\n🎯 PROPÓSITO:\n• Organizar el acceso a la sala de informática\n• Evitar conflictos de horarios\n• Facilitar la planificación de los estudiantes\n• Proporcionar estadísticas de uso\n\n💪 BENEFICIOS:\n• Reserva rápida y fácil\n• Visualización en tiempo real\n• Sin necesidad de listas en papel\n• Acceso 24/7 desde cualquier dispositivo\n• Cancelación flexible\n\n🚀 Diseñado para estudiantes y profesores del colegio técnico.');
    }
    // Navegadores compatibles
    else if (lowerQuery.includes('navegador') || lowerQuery.includes('chrome') || lowerQuery.includes('firefox') || lowerQuery.includes('compatib')) {
        addAIMessage('🌐 Compatibilidad de Navegadores:\n\n✅ NAVEGADORES COMPATIBLES:\n• Google Chrome (recomendado)\n• Mozilla Firefox\n• Microsoft Edge\n• Safari\n• Opera\n• Brave\n\n📱 DISPOSITIVOS:\n• Computadoras de escritorio\n• Laptops\n• Tablets\n• Smartphones\n\n💡 Para mejor experiencia:\n• Usa la versión más reciente de tu navegador\n• Habilita JavaScript\n• Permite cookies de sesión\n• Resolución mínima: 320px de ancho');
    }
    // Consejos y tips
    else if (lowerQuery.includes('consejo') || lowerQuery.includes('tip') || lowerQuery.includes('recomendación') || lowerQuery.includes('sugerencia')) {
        addAIMessage('💡 Consejos y Mejores Prácticas:\n\n🎯 PARA RESERVAR:\n• Planifica con anticipación\n• Revisa disponibilidad en días alternativos\n• Reserva en horarios de baja demanda\n• Anota tu turno en tu agenda personal\n\n⚡ PARA AHORRAR TIEMPO:\n• Mantén tu sesión iniciada\n• Usa la grilla de estado para ver disponibilidad rápido\n• Cancela con tiempo si no usarás tu turno\n\n📊 APROVECHA LAS ESTADÍSTICAS:\n• Identifica horarios menos concurridos\n• Planifica basándote en tendencias\n• Evita días pico si es posible');
    }
    // Mensaje por defecto mejorado
    else {
        addAIMessage('👋 ¡Hola! Soy TurnoBot, tu asistente inteligente 🤖\n\n🎯 Estoy aquí para ayudarte con TODO lo relacionado a TurnoTech:\n\n📅 TURNOS:\n• Cómo reservar turnos\n• Cómo cancelar turnos\n• Ver horarios disponibles\n• Entender los módulos\n\n👤 CUENTA:\n• Registrarse\n• Iniciar sesión\n• Recuperar contraseña\n• Seguridad y privacidad\n\n📊 ESTADÍSTICAS:\n• Interpretar gráficos\n• Ver tendencias\n• Análisis de uso\n\n🔧 SOPORTE:\n• Resolver problemas técnicos\n• Contactar administradores\n• Problemas comunes\n\n💬 Escribe tu pregunta o selecciona una opción rápida:', true);
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
    updateUserStatistics();
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

// Función para mostrar/ocultar contraseña
function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    const toggleIcon = passwordInput.nextElementSibling;
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="M12 9c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zM12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z"/>
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
                <line x1="3" y1="3" x2="21" y2="21" stroke="#666" stroke-width="2"/>
            </svg>
        `;
        toggleIcon.classList.add('hidden');
    } else {
        passwordInput.type = 'password';
        toggleIcon.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="M12 9c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zM12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z"/>
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
            </svg>
        `;
        toggleIcon.classList.remove('hidden');
    }
}

// Funciones para estadísticas de usuarios
function updateUserStatistics() {
    const periodSelect = document.getElementById('userStatsPeriod');
    const period = periodSelect.value;
    
    let filteredAppointments = [...appointments];
    
    if (period !== 'all') {
        const periodDays = parseInt(period);
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - periodDays);

        filteredAppointments = appointments.filter(apt => {
            const aptDate = new Date(apt.date);
            return aptDate >= startDate && aptDate <= today;
        });
    }

    // Contar turnos por usuario
    const userCounts = {};
    filteredAppointments.forEach(apt => {
        const userName = apt.name;
        userCounts[userName] = (userCounts[userName] || 0) + 1;
    });

    // Ordenar usuarios por cantidad de turnos
    const sortedUsers = Object.entries(userCounts).sort((a, b) => b[1] - a[1]);
    
    updateUserChart(sortedUsers);
    updateUserTable(sortedUsers);
}

function updateUserChart(sortedUsers) {
    const chartContainer = document.getElementById('userStatsChart');
    
    if (sortedUsers.length === 0) {
        chartContainer.innerHTML = '<p class="no-user-stats">No hay datos de usuarios para mostrar</p>';
        return;
    }

    const maxCount = sortedUsers[0][1];
    let chartHTML = '';

    sortedUsers.forEach(([userName, count], index) => {
        const percentage = (count / maxCount) * 100;
        const position = index + 1;
        let positionClass = '';
        let positionIcon = '';
        
        if (position === 1) {
            positionClass = 'first';
            positionIcon = '🥇';
        } else if (position === 2) {
            positionClass = 'second';
            positionIcon = '🥈';
        } else if (position === 3) {
            positionClass = 'third';
            positionIcon = '🥉';
        } else {
            positionIcon = position;
        }

        chartHTML += `
            <div class="user-bar">
                <div class="user-position ${positionClass}">${positionIcon}</div>
                <div class="user-name" title="${userName}">${userName}</div>
                <div class="user-bar-container">
                    <div class="user-bar-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="user-count">${count}</div>
            </div>
        `;
    });

    chartContainer.innerHTML = chartHTML;
}

function updateUserTable(sortedUsers) {
    const tableContainer = document.getElementById('userStatsTable');
    
    if (sortedUsers.length === 0) {
        tableContainer.innerHTML = '<p class="no-user-stats">No hay datos de usuarios para mostrar</p>';
        return;
    }

    const totalTurnos = sortedUsers.reduce((sum, [, count]) => sum + count, 0);
    
    let tableHTML = `
        <div class="user-stats-table-header">
            <div>Rank</div>
            <div>Usuario</div>
            <div>Turnos</div>
            <div>Porcentaje</div>
        </div>
    `;

    sortedUsers.forEach(([userName, count], index) => {
        const position = index + 1;
        const percentage = ((count / totalTurnos) * 100).toFixed(1);
        
        let rankClass = '';
        let rankIcon = '';
        
        if (position === 1) {
            rankClass = 'gold';
            rankIcon = '🥇 1';
        } else if (position === 2) {
            rankClass = 'silver';
            rankIcon = '🥈 2';
        } else if (position === 3) {
            rankClass = 'bronze';
            rankIcon = '🥉 3';
        } else {
            rankIcon = position;
        }

        tableHTML += `
            <div class="user-stats-row">
                <div class="user-rank ${rankClass}">${rankIcon}</div>
                <div class="user-full-name" title="${userName}">${userName}</div>
                <div class="user-turnos-count">${count}</div>
                <div class="user-percentage">${percentage}%</div>
            </div>
        `;
    });

    tableContainer.innerHTML = tableHTML;
}

// Event listener para el selector de período de usuarios
document.addEventListener('DOMContentLoaded', function() {
    const userStatsPeriodSelect = document.getElementById('userStatsPeriod');
    if (userStatsPeriodSelect) {
        userStatsPeriodSelect.addEventListener('change', updateUserStatistics);
    }
});
