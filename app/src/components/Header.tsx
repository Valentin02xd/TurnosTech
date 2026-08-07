import { useState, useEffect } from 'react';
import { Sun, Moon, LogOut, User, KeyRound, Menu, X } from 'lucide-react';
import schoolLogo from '@assets/images_1771526840635.webp';
import { Button } from '@/components/ui/button';
import { SECTOR_LABELS } from '@/types';
import type { User as UserType } from '@/types';

interface HeaderProps {
  user: UserType | null;
  isDark: boolean;
  onToggleTheme: () => void;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onLogout: () => void;
  onChangePassword: () => void;
}

const sectorHeaderStyles: Record<string, { gradient: string; registerBtn: string; subtitleColor: string }> = {
  informatica: {
    gradient: 'bg-gradient-to-r from-cyan-600 via-cyan-700 to-cyan-800 dark:from-cyan-950 dark:via-cyan-900 dark:to-cyan-950',
    registerBtn: 'bg-white text-cyan-700 hover:bg-cyan-50',
    subtitleColor: 'text-cyan-100',
  },
  industria: {
    gradient: 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 dark:from-amber-950 dark:via-amber-900 dark:to-amber-950',
    registerBtn: 'bg-white text-amber-700 hover:bg-amber-50',
    subtitleColor: 'text-amber-100',
  },
  default: {
    gradient: 'bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900',
    registerBtn: 'bg-white text-slate-700 hover:bg-slate-50',
    subtitleColor: 'text-slate-300',
  },
};

export function Header({ 
  user, 
  isDark, 
  onToggleTheme, 
  onLoginClick, 
  onRegisterClick, 
  onLogout,
  onChangePassword,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const sectorKey = user?.sector || 'default';
  const styles = sectorHeaderStyles[sectorKey] || sectorHeaderStyles.default;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 ${styles.gradient} text-white transition-all duration-500 ${
        scrolled ? 'shadow-lg' : 'shadow-md'
      }`}
      style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      role="banner"
    >
      <nav className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4" role="navigation" aria-label="Navegación principal">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center overflow-hidden hover:scale-110 transition-transform duration-200" aria-hidden="true">
              <img src={schoolLogo} alt="E.P.E.T. N°1 La Rioja" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-heading">TurnoTech</h1>
              <p className={`${styles.subtitleColor} text-[10px] sm:text-sm hidden xs:block`}>Sistema de Gestión de Turnos</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleTheme}
              className="text-white hover:bg-white/20 transition-all duration-200"
              aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                  <User className="w-4 h-4" aria-hidden="true" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className={`text-[10px] ${styles.subtitleColor}`}>{SECTOR_LABELS[user.sector]}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onChangePassword}
                  className="text-white hover:bg-white/20 transition-all duration-200"
                  aria-label="Cambiar contraseña"
                >
                  <KeyRound className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="text-white hover:bg-white/20 gap-2 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden md:inline">Cerrar Sesión</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLoginClick}
                  className="text-white hover:bg-white/20 transition-all duration-200"
                >
                  Iniciar Sesión
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onRegisterClick}
                  className={`${styles.registerBtn} transition-all duration-200 hover:scale-105`}
                >
                  Registrarse
                </Button>
              </div>
            )}
          </div>

          <div className="flex sm:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleTheme}
              className="text-white hover:bg-white/20 w-8 h-8"
              aria-label={isDark ? 'Modo claro' : 'Modo oscuro'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:bg-white/20 w-8 h-8"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="sm:hidden mt-3 pt-3 border-t border-white/20 space-y-2 animate-slide-up-sm" role="menu">
            {user ? (
              <>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm">
                  <User className="w-4 h-4" aria-hidden="true" />
                  <div>
                    <span className="text-sm font-medium block">{user.name}</span>
                    <span className={`text-[10px] ${styles.subtitleColor}`}>{SECTOR_LABELS[user.sector]}</span>
                  </div>
                </div>
                <button
                  onClick={() => { onChangePassword(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors"
                  role="menuitem"
                >
                  <KeyRound className="w-4 h-4" aria-hidden="true" />
                  Cambiar Contraseña
                </button>
                <button
                  onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors"
                  role="menuitem"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { onLoginClick(); setMobileMenuOpen(false); }}
                  className="flex items-center justify-center w-full px-3 py-2.5 text-sm font-medium text-white hover:bg-white/10 rounded-lg transition-colors"
                  role="menuitem"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => { onRegisterClick(); setMobileMenuOpen(false); }}
                  className={`flex items-center justify-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${styles.registerBtn}`}
                  role="menuitem"
                >
                  Registrarse
                </button>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
