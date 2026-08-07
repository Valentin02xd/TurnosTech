import { useState, useEffect } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import schoolLogo from '@assets/images_1771526840635.webp';
import { Header } from './components/Header';
import { LoginModal } from './components/LoginModal';
import { RegisterModal } from './components/RegisterModal';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { RoomSelector } from './components/RoomSelector';
import { BookingForm } from './components/BookingForm';
import { TimeSlotsGrid } from './components/TimeSlotsGrid';
import { AppointmentsList } from './components/AppointmentsList';
import { Statistics } from './components/Statistics';
import { AIAssistant } from './components/AIAssistant';
import { SupportModal } from './components/SupportModal';
import { ToastContainer } from './components/Toast';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';
import { useAppointments } from './hooks/useAppointments';
import { useToast } from './hooks/useToast';
import type { RoomType, SectorType } from './types';

function App() {
  const { isDark, toggle } = useTheme();
  const { user, isLoading: isAuthLoading, isAuthenticated, login, register, logout } = useAuth();
  const { appointments, fetchAppointments, createAppointment, deleteAppointment } = useAppointments();
  const { notifications, removeNotification, success, error } = useToast();

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);

  useEffect(() => {
    const sector = user?.sector || '';
    document.documentElement.setAttribute('data-sector', sector);
    return () => {
      document.documentElement.removeAttribute('data-sector');
    };
  }, [user?.sector]);

  useEffect(() => {
    fetchAppointments();
    
    const interval = setInterval(() => {
      fetchAppointments();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [fetchAppointments]);

  const handleLogin = async (email: string, password: string) => {
    const result = await login(email, password);
    if (result.success) {
      success('¡Bienvenido! Has iniciado sesión correctamente');
    }
    return result;
  };

  const handleRegister = async (name: string, email: string, password: string, sector: SectorType) => {
    const result = await register(name, email, password, sector);
    if (result.success) {
      success('¡Registro exitoso! Ahora puedes iniciar sesión');
    }
    return result;
  };

  const handleLogout = () => {
    logout();
    setSelectedRoom(null);
    success('Has cerrado sesión correctamente');
  };

  const handleSelectRoom = (room: RoomType) => {
    if (!isAuthenticated) {
      setShowLogin(true);
      error('Debes iniciar sesión para reservar un turno');
      return;
    }
    setSelectedRoom(room);
  };

  const handleBackToRooms = () => {
    setSelectedRoom(null);
  };

  const handleCreateAppointment = async (data: { date: string; time: string; room: RoomType }) => {
    const result = await createAppointment(data);
    if (result.success) {
      success('¡Turno reservado exitosamente!');
      await fetchAppointments();
    } else {
      error(result.message || 'Error al reservar el turno');
    }
    return result;
  };

  const handleCancelAppointment = async (id: string) => {
    const result = await deleteAppointment(id);
    if (result.success) {
      success('Turno cancelado correctamente');
      await fetchAppointments();
    } else {
      error(result.message || 'Error al cancelar el turno');
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg overflow-hidden">
            <img src={schoolLogo} alt="E.P.E.T. N°1 La Rioja" className="w-full h-full object-contain" />
          </div>
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" />
          <p className="text-gray-600 dark:text-gray-400 text-heading font-medium">Cargando TurnoTech...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Toast Notifications */}
      <ToastContainer notifications={notifications} onClose={removeNotification} />

      {/* Header */}
      <Header
        user={user}
        isDark={isDark}
        onToggleTheme={toggle}
        onLoginClick={() => setShowLogin(true)}
        onRegisterClick={() => setShowRegister(true)}
        onLogout={handleLogout}
        onChangePassword={() => setShowChangePassword(true)}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-4 sm:pb-8" role="main">
        <div className="space-y-4 sm:space-y-8">
          {/* Selector de sala o Formulario de reserva */}
          {selectedRoom ? (
            <section className="card-professional p-4 sm:p-8 animate-scale-in" aria-label="Formulario de reserva">
              <BookingForm
                room={selectedRoom}
                appointments={appointments}
                onBack={handleBackToRooms}
                onSubmit={handleCreateAppointment}
                userSector={user?.sector}
              />
            </section>
          ) : (
            <section className="card-professional p-4 sm:p-8 animate-fade-in-up" aria-label="Selección de sala">
              <RoomSelector onSelectRoom={handleSelectRoom} userSector={user?.sector} />
            </section>
          )}

          {isAuthenticated && user && (
            <section className="card-professional p-4 sm:p-8 animate-fade-in-up stagger-2" aria-label="Mis turnos">
              <AppointmentsList
                appointments={appointments}
                userId={user.id}
                onCancel={handleCancelAppointment}
                userSector={user.sector}
              />
            </section>
          )}

          <section className="card-professional p-4 sm:p-8 animate-fade-in-up stagger-3" aria-label="Estado de horarios">
            <TimeSlotsGrid appointments={appointments} user={user} />
          </section>

          <section className="card-professional p-4 sm:p-8 animate-fade-in-up stagger-4" aria-label="Estadísticas de uso">
            <Statistics appointments={appointments} userSector={user?.sector} />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-gray-300 mt-12 sm:mt-16" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
                  <img src={schoolLogo} alt="E.P.E.T. N°1 La Rioja" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg text-heading">TurnoTech</h3>
                  <p className="text-gray-400 text-xs">Sistema de Gestión de Turnos</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Plataforma profesional para la gestión de turnos en laboratorios de tecnología educativa.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4 text-heading">Sectores</h3>
              <ul className="space-y-2 text-sm">
                <li className="text-gray-400 hover:text-cyan-400 transition-colors cursor-default">Técnico en Informática</li>
                <li className="text-gray-400 hover:text-amber-400 transition-colors cursor-default">Industria de Procedimiento</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4 text-heading">Soporte</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => setShowSupport(true)}
                    className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" aria-hidden="true" />
                    Soporte Técnico
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-10 pt-6 text-center">
            <p className="text-gray-500 text-sm">
              © 2026 TurnoTech Pro — Sistema de Gestión de Turnos. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLogin={handleLogin}
        onSwitchToRegister={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
        onForgotPassword={() => {
          setShowLogin(false);
          setShowForgotPassword(true);
        }}
      />

      <RegisterModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onRegister={handleRegister}
        onSwitchToLogin={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}
      />

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onBackToLogin={() => {
          setShowForgotPassword(false);
          setShowLogin(true);
        }}
      />

      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />

      <SupportModal
        isOpen={showSupport}
        onClose={() => setShowSupport(false)}
      />

      {/* AI Assistant */}
      <AIAssistant />

      {/* Floating Support Button */}
      <button
        onClick={() => setShowSupport(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full text-white shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 animate-float-in animate-pulse-soft"
        style={{ background: `linear-gradient(135deg, var(--sector-gradient-from), var(--sector-gradient-to))`, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
        aria-label="Abrir soporte técnico"
      >
        <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
      </button>
    </div>
  );
}

export default App;
