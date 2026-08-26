import { useEffect, useRef } from 'react';
import { NotificationManager } from '../notifications/NotificationManager';

export function useNotifications() {
  const manager = useRef(NotificationManager.getInstance());

  useEffect(() => {
    manager.current.initialize();
    return () => manager.current.destroy();
  }, []);

  return { setBadgeCount: manager.current.setBadgeCount.bind(manager.current) };
}
