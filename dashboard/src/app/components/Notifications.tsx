'use client';

import React, { useEffect, useRef } from 'react';
// TODO: Create and populate Notifications.module.css with styles from page.module.css
import styles from './Notifications.module.css'; 

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date | string | number;
  read: boolean;
  type: string; // e.g., 'info', 'success', 'warning', 'error'
}

interface NotificationsProps {
  isOpen: boolean;
  onClose: () => void;
  notificationsData: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

// Function to format notification timestamp as relative time
const formatNotificationTime = (timestampInput: Date | string | number): string => {
  if (typeof window === 'undefined') {
    return '';
  }
  const timestamp = timestampInput instanceof Date ? timestampInput : new Date(timestampInput);
  if (isNaN(timestamp.getTime())) {
    return 'Invalid date';
  }

  const now = new Date();
  const seconds = Math.round((now.getTime() - timestamp.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 5) {
    return 'now';
  } else if (seconds < 60) {
    return `${seconds}s ago`;
  } else if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else if (days === 1) {
    return 'yesterday';
  } else if (days < 7) {
    return `${days}d ago`;
  }
  // For older notifications, you might want to show the date
  return timestamp.toLocaleDateString();
};

const Notifications: React.FC<NotificationsProps> = ({
  isOpen,
  onClose,
  notificationsData,
  setNotifications,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle marking a notification as read internally
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  // Handle marking all notifications as read internally
  const markAllNotificationsAsReadInternal = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(n => ({ ...n, read: true }))
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const unreadCount = notificationsData.filter(n => !n.read).length;

  // Determine which notifications to display: unread or most recent 3
  const displayNotifications = unreadCount > 0 
    ? notificationsData.filter(n => !n.read) 
    : [...notificationsData].sort((a, b) => {
        const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
        const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
        return bTime - aTime;
      }).slice(0, 3);

  return (
    <div ref={panelRef} className={styles.notificationPanel} style={{ zIndex: 2000 }}>
      <div className={styles.notificationPanelHeader}>
        <h3>Notifications</h3>
        <button onClick={onClose} className={styles.closeButton}>
          ×
        </button>
      </div>
      <div className={styles.notificationList}>
        {notificationsData.length === 0 ? (
          <div className={styles.emptyNotifications}>No notifications</div>
        ) : (
          displayNotifications.map(notification => (
            <div
              key={notification.id}
              className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''} ${styles[notification.type] || ''}`}
              onClick={() => markNotificationAsRead(notification.id)}
            >
              <div className={styles.notificationContent}>
                <div className={styles.notificationTitle}>{notification.title}</div>
                <div className={styles.notificationMessage}>{notification.message}</div>
                <div className={styles.notificationTime}>
                  {formatNotificationTime(notification.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {notificationsData.length > 0 && (
        <div className={styles.notificationPanelFooter}>
          <button
            className={styles.markAllReadButton}
            onClick={markAllNotificationsAsReadInternal}
          >
            Mark all as read
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;
