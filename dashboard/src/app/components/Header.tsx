"use client";

import Image from "next/image";
import Link from "next/link";
import { BellIcon, UserIcon } from './Icons';
import Notifications, { Notification as NotificationType } from './Notifications';
import styles from "./Header.module.css";
import { Dispatch, SetStateAction } from 'react';

interface HeaderProps {
  isNotificationPanelOpen: boolean;
  setIsNotificationPanelOpen: (isOpen: boolean) => void;
  unreadCount: number;
  notifications: NotificationType[];
  setNotifications: Dispatch<SetStateAction<NotificationType[]>>;
}

export default function Header({
  isNotificationPanelOpen,
  setIsNotificationPanelOpen,
  unreadCount,
  notifications,
  setNotifications,
}: HeaderProps) {
  return (
    <header className={styles.topBar}>
      <div className={styles.logoArea}>
        <Image
          src="https://mindextension.me/logo.webp"
          alt="Mind Extension Logo"
          width={200}
          height={70}
          priority
          style={{
            objectFit: 'contain',
            maxHeight: '48px',
            width: 'auto'
          }}
          className={styles.logo}
        />
      </div>
      <div className={styles.spacer}></div>
      <div className={styles.topBarRight}>
        <div className={styles.iconGroup}>
          <button
            className={styles.iconButton}
            title="Notifications"
            onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
          >
            <BellIcon size={20} />
            {unreadCount > 0 && (
              <span className={styles.notificationBadge}>{unreadCount}</span>
            )}
          </button>

          <div className={styles.profileIconOnly}>
            <Link
              href="/settings"
              title="Profile & Settings"
              passHref
            >
              <UserIcon size={22} />
            </Link>
          </div>
        </div>

        {isNotificationPanelOpen && (
          <Notifications
            isOpen={isNotificationPanelOpen}
            onClose={() => setIsNotificationPanelOpen(false)}
            notificationsData={notifications}
            setNotifications={setNotifications}
          />
        )}
      </div>
    </header>
  );
}
