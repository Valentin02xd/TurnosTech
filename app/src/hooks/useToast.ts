import { useState, useCallback } from 'react';
import type { Notification } from '@/types';

export function useToast() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((message: string, type: Notification['type'] = 'info') => {
    const id = Date.now().toString();
    const notification: Notification = { id, message, type };
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
    
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const success = useCallback((message: string) => {
    return addNotification(message, 'success');
  }, [addNotification]);

  const error = useCallback((message: string) => {
    return addNotification(message, 'error');
  }, [addNotification]);

  const warning = useCallback((message: string) => {
    return addNotification(message, 'warning');
  }, [addNotification]);

  const info = useCallback((message: string) => {
    return addNotification(message, 'info');
  }, [addNotification]);

  return {
    notifications,
    removeNotification,
    success,
    error,
    warning,
    info,
  };
}
