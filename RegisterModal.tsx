import { useState } from 'react';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { SectorType } from '@/types';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (name: string, email: string, password: string, sector: SectorType) => Promise<{ success: boolean; message?: string }>;
  onSwitchToLogin: () => void;
}

export function RegisterModal({ isOpen, onClose, onRegister, onSwitchToLogin }: RegisterModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sector, setSector] = useState<SectorType | ''>('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validatePassword = (pass: string): string | null => {
    if (pass.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!sector) {
      setError('Debes seleccionar un sector');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    const result = await onRegister(name, email, password, sector);
    
    setIsLoading(false);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setSector('');
        setSuccess(false);
        onSwitchToLogin();
      }, 2000);
    } else {
      setError(result.message || 'Error al registrarse');
    }
  };

  const handleClose = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setSector('');
    setError('');
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Crear Cuenta</DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                ¡Registro exitoso!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Redirigiendo al inicio de sesión...
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="register-name">Nombre completo</Label>
              <Input
                id="register-name"
                type="text"
                placeholder="Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-email">Email</Label>
              <Input
                id="register-email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label>Sector</Label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => setSector('informatica')}
                  disabled={isLoading}
                  className={`p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                    sector === 'informatica'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                      : 'border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💻</span>
                    <div>
                      <div className={`font-medium text-sm ${sector === 'informatica' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>
                        Técnico en Informática
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Computación, Robótica, Hardware y Software
                      </div>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setSector('industria')}
                  disabled={isLoading}
                  className={`p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                    sector === 'industria'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                      : 'border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏭</span>
                    <div>
                      <div className={`font-medium text-sm ${sector === 'industria' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>
                        Industria de Procedimiento
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Producción, Laboratorio, Cocina
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Mínimo 6 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-confirm">Confirmar contraseña</Label>
              <Input
                id="register-confirm"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                'Crear Cuenta'
              )}
            </Button>

            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-blue-600 hover:underline dark:text-blue-400 font-medium"
              >
                Inicia sesión aquí
              </button>
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
