import { useState } from 'react';
import { Mail, KeyRound, Lock, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

type Step = 'email' | 'code' | 'password' | 'success';

export function ForgotPasswordModal({ isOpen, onClose, onBackToLogin }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const resetState = () => {
    setStep('email');
    setEmail('');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setError('');
    setIsLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleBackToLogin = () => {
    resetState();
    onBackToLogin();
  };

  const handleRequestCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/solicitar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('code');
      } else {
        setError(data.message || 'Error al solicitar el código');
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/verificar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('password');
      } else {
        setError(data.message || 'Código incorrecto');
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/cambiar-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('success');
      } else {
        setError(data.message || 'Error al cambiar la contraseña');
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const stepIndicator = (
    <div className="flex items-center justify-center gap-2 mb-6">
      {(['email', 'code', 'password'] as const).map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
              step === s
                ? 'bg-blue-600 text-white scale-110 shadow-md'
                : step === 'success' || (['email', 'code', 'password'].indexOf(step) > i)
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400'
            }`}
          >
            {step === 'success' || (['email', 'code', 'password'].indexOf(step) > i)
              ? '✓'
              : i + 1}
          </div>
          {i < 2 && (
            <div
              className={`w-8 h-0.5 transition-all duration-300 ${
                (['email', 'code', 'password'].indexOf(step) > i) || step === 'success'
                  ? 'bg-green-500'
                  : 'bg-gray-200 dark:bg-slate-700'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center flex items-center justify-center gap-2">
            {step === 'success' ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                ¡Listo!
              </>
            ) : (
              <>
                <KeyRound className="w-6 h-6 text-blue-600" />
                Recuperar Contraseña
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === 'email' && 'Ingresa tu email registrado para obtener un código de verificación'}
            {step === 'code' && 'Ingresa el código de verificación que se muestra a continuación'}
            {step === 'password' && 'Ingresa tu nueva contraseña'}
            {step === 'success' && 'Tu contraseña fue actualizada correctamente'}
          </DialogDescription>
        </DialogHeader>

        {step !== 'success' && stepIndicator}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 'email' && (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recovery-email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email de tu cuenta
              </Label>
              <Input
                id="recovery-email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoFocus
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verificando email...
                </>
              ) : (
                'Obtener Código de Verificación'
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleBackToLogin}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center gap-1 mx-auto"
              >
                <ArrowLeft className="w-3 h-3" />
                Volver al inicio de sesión
              </button>
            </div>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
              <AlertDescription className="text-blue-700 dark:text-blue-400">
                Te enviamos un código de verificación a <strong>{email}</strong>. Revisá tu bandeja de entrada
                (y la carpeta de spam, por las dudas). El código es válido por 15 minutos.
              </AlertDescription>
            </Alert>

            <div className="text-center">
              <button
                type="button"
                onClick={() => handleRequestCode()}
                disabled={isLoading}
                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline disabled:opacity-50"
              >
                ¿No te llegó? Reenviar código
              </button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recovery-code" className="flex items-center gap-2">
                <KeyRound className="w-4 h-4" />
                Ingresa el código para continuar
              </Label>
              <Input
                id="recovery-code"
                type="text"
                placeholder="123456"
                value={code}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setCode(val);
                }}
                required
                disabled={isLoading}
                maxLength={6}
                className="text-center text-2xl tracking-[0.5em] font-bold"
                autoFocus
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || code.length !== 6}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Verificar Código'
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => { setStep('email'); setError(''); setCode(''); }}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center gap-1 mx-auto"
              >
                <ArrowLeft className="w-3 h-3" />
                Cambiar email
              </button>
            </div>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Nueva contraseña
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={6}
                  className="pr-10"
                  autoFocus
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Confirmar contraseña
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repite tu nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={6}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500">Las contraseñas no coinciden</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || newPassword.length < 6 || newPassword !== confirmPassword}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Actualizando contraseña...
                </>
              ) : (
                'Actualizar Contraseña'
              )}
            </Button>
          </form>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Tu contraseña fue actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            <Button onClick={handleBackToLogin} className="w-full">
              Ir a Iniciar Sesión
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
