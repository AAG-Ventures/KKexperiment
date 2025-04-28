"use client";

import { useTheme } from "../context/ThemeContext";
import styles from "./settings.module.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [saveNotification, setSaveNotification] = useState<string | null>(null);
  
  // Helper function to show and auto-hide the save notification
  const showSavedNotification = () => {
    setSaveNotification("Theme preference saved!");
    setTimeout(() => {
      setSaveNotification(null);
    }, 3000);
  };
  return (
    <div className={styles.settingsWrapper}>
      <div className={styles.header}>
        <Link href="/" className={styles.backLink}>
          <span className="icon icon-arrow-back"></span>
          Back to Dashboard
        </Link>
        <div className={styles.logoContainer}>
          <Image 
            src="/logo.png" 
            alt="Mind Extension Logo" 
            width={120} 
            height={35} 
            priority
            style={{
              objectFit: 'contain',
              mixBlendMode: 'normal'
            }} 
            className={styles.logo}
          />
        </div>
      </div>
      <h1 className={styles.title}>Settings</h1>
      
      <div className={styles.settingsGrid}>
        {/* Profile Settings Section */}
        <section className={styles.settingsSection}>
          <h2>Profile & Privacy</h2>
          <div className={styles.settingItem}>
            <label>Display Name</label>
            <input type="text" defaultValue="User Name" />
          </div>
          <div className={styles.settingItem}>
            <label>Email</label>
            <input type="email" defaultValue="user@example.com" />
          </div>
          <div className={styles.settingItem}>
            <label>Privacy Level</label>
            <select defaultValue="standard">
              <option value="private">Private - Restrict all data sharing</option>
              <option value="standard">Standard - Share only necessary data</option>
              <option value="open">Open - Allow analytics and improvements</option>
            </select>
          </div>
          <button className={styles.actionButton}>Save Profile Changes</button>
        </section>

        {/* Connected Tools & Services */}
        <section className={styles.settingsSection}>
          <h2>Connected Services</h2>
          <div className={styles.connectedTools}>
            <div className={styles.toolItem}>
              <span className={styles.toolIcon}>📱</span>
              <span className={styles.toolName}>Instagram</span>
              <button className={styles.connectButton}>Connect</button>
            </div>
            <div className={styles.toolItem}>
              <span className={styles.toolIcon}>💬</span>
              <span className={styles.toolName}>Slack</span>
              <button className={styles.connectButton}>Connect</button>
            </div>
            <div className={styles.toolItem}>
              <span className={styles.toolIcon}>📧</span>
              <span className={styles.toolName}>Gmail</span>
              <button className={styles.connectButton + " " + styles.connected}>Connected</button>
            </div>
            <div className={styles.toolItem}>
              <span className={styles.toolIcon}>👤</span>
              <span className={styles.toolName}>Facebook</span>
              <button className={styles.connectButton}>Connect</button>
            </div>
            <button className={styles.moreButton}>Browse More Integrations</button>
          </div>
        </section>

        {/* Appearance Settings */}
        <section className={styles.settingsSection}>
          <h2>Appearance</h2>
          <div className={styles.themeSelector}>
            <div className={styles.themeOption}>
              <input 
                type="radio" 
                id="light" 
                name="theme" 
                checked={theme === "light"}
                onChange={() => {
                  setTheme("light");
                  showSavedNotification();
                }}
              />
              <label htmlFor="light">
                <div className={styles.themeSample + " " + styles.lightTheme}></div>
                Light Mode
              </label>
            </div>
            <div className={styles.themeOption}>
              <input 
                type="radio" 
                id="dark" 
                name="theme" 
                checked={theme === "dark"}
                onChange={() => {
                  setTheme("dark");
                  showSavedNotification();
                }}
              />
              <label htmlFor="dark">
                <div className={styles.themeSample + " " + styles.darkTheme}></div>
                Dark Mode
              </label>
            </div>
            <div className={styles.themeOption}>
              <input 
                type="radio" 
                id="system" 
                name="theme" 
                checked={theme === "system"}
                onChange={() => {
                  setTheme("system");
                  showSavedNotification();
                }}
              />
              <label htmlFor="system">
                <div className={styles.themeSample + " " + styles.systemTheme}></div>
                System Default
              </label>
            </div>
          </div>
          {saveNotification && (
            <div className={styles.notification}>
              {saveNotification}
            </div>
          )}
        </section>

        {/* Notifications */}
        <section className={styles.settingsSection}>
          <h2>Notifications</h2>
          <div className={styles.settingItem}>
            <label>Email Notifications</label>
            <div className={styles.toggle}>
              <input type="checkbox" id="emailNotifs" defaultChecked />
              <label htmlFor="emailNotifs"></label>
            </div>
          </div>
          <div className={styles.settingItem}>
            <label>Process Completion Alerts</label>
            <div className={styles.toggle}>
              <input type="checkbox" id="processAlerts" defaultChecked />
              <label htmlFor="processAlerts"></label>
            </div>
          </div>
          <div className={styles.settingItem}>
            <label>Agent Insights</label>
            <div className={styles.toggle}>
              <input type="checkbox" id="agentInsights" defaultChecked />
              <label htmlFor="agentInsights"></label>
            </div>
          </div>
          <div className={styles.settingItem}>
            <label>Weekly Summary</label>
            <div className={styles.toggle}>
              <input type="checkbox" id="weeklySummary" defaultChecked />
              <label htmlFor="weeklySummary"></label>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className={styles.settingsSection}>
          <h2>Quick Actions</h2>
          <div className={styles.quickActionsInfo}>
            <p>Command palette shortcuts for faster navigation</p>
            <div className={styles.shortcutItem}>
              <span>Open Command Palette</span>
              <kbd>Ctrl</kbd> + <kbd>K</kbd>
            </div>
            <div className={styles.shortcutItem}>
              <span>Quick Create</span>
              <kbd>Ctrl</kbd> + <kbd>N</kbd>
            </div>
            <div className={styles.shortcutItem}>
              <span>Search</span>
              <kbd>Ctrl</kbd> + <kbd>/</kbd>
            </div>
          </div>
        </section>

        {/* Account Actions */}
        <section className={styles.settingsSection + " " + styles.accountActions}>
          <h2>Account</h2>
          <button className={styles.actionButton}>Export All Data</button>
          <button className={styles.actionButton + " " + styles.dangerButton}>Logout</button>
        </section>
      </div>
    </div>
  );
}
