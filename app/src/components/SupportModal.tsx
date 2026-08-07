import { Mail, MessageSquare, HelpCircle, Lightbulb, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const supportEmails = [
  { name: 'Brandon Areco', email: 'brandonareco02@gmail.com', icon: '👨‍💻' },
  { name: 'Kevin Maz', email: 'kevinmaz30020@gmail.com', icon: '👨‍💻' },
];

const commonIssues = [
  {
    title: 'No puedo reservar un turno',
    solution: 'Verifica que estés logueado y que el horario esté disponible (en verde).',
  },
  {
    title: 'No veo mi turno',
    solution: 'Refresca la página o verifica la fecha seleccionada en "Mis Turnos".',
  },
  {
    title: 'No puedo iniciar sesión',
    solution: 'Verifica tu email y contraseña, o regístrate si no tienes cuenta.',
  },
  {
    title: 'Olvidé mi contraseña',
    solution: 'Contacta al soporte técnico por email para restablecer tu acceso.',
  },
];

const tips = [
  'Describe detalladamente el problema',
  'Menciona qué navegador estás usando',
  'Indica el dispositivo (PC, móvil, tablet)',
  'Adjunta una captura de pantalla si es posible',
];

export function SupportModal({ isOpen, onClose }: SupportModalProps) {

  const generateEmailLink = (email: string) => {
    const subject = encodeURIComponent('Soporte TurnoTech - Solicitud de Ayuda');
    const body = encodeURIComponent(`Hola equipo de TurnoTech,

Estoy contactando porque necesito ayuda con la página web.

❗ TIPO DE PROBLEMA:
[Describe si es un problema técnico, pregunta, sugerencia, etc.]

📝 DESCRIPCIÓN DETALLADA:
[Explica en detalle qué sucede, qué esperabas que pasara, etc.]

💻 INFORMACIÓN TÉCNICA:
Navegador: [ej. Chrome, Firefox, Safari]
Dispositivo: [ej. PC, Móvil, Tablet]
Sistema Operativo: [ej. Windows, Android, iOS]

📸 CAPTURAS DE PANTALLA:
[Si es posible, adjunta capturas del problema]

Gracias por su atención.

Saludos.`);
    return `mailto:${email}?subject=${subject}&body=${body}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            Soporte Técnico
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Intro */}
          <p className="text-gray-600 dark:text-gray-400">
            ¿Tienes problemas con la página o necesitas ayuda? Nuestro equipo de técnicos está aquí para ayudarte.
          </p>

          {/* Emails */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Contacta por Email
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {supportEmails.map((support) => (
                <a
                  key={support.email}
                  href={generateEmailLink(support.email)}
                  className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <span>{support.icon}</span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{support.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{support.email}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Tips para un mejor soporte
            </h3>
            <ul className="space-y-2">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="text-blue-500 mt-0.5">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Common Issues */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Problemas Comunes
            </h3>
            <div className="space-y-2">
              {commonIssues.map((issue, index) => (
                <div
                  key={index}
                  className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-amber-900 dark:text-amber-200">
                        {issue.title}
                      </div>
                      <div className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                        {issue.solution}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
