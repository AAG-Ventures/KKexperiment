"use client";

import styles from "./settings.module.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CreditCardIcon, DollarSignIcon, AlertCircleIcon, CheckCircleIcon } from "lucide-react";

export default function SettingsPage() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [saveNotification, setSaveNotification] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<"user" | "builder">("user");
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);
  
  // Initialize theme from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" || "light";
      setTheme(storedTheme);
      
      // Apply theme to document
      document.documentElement.classList.remove("light-theme", "dark-theme");
      if (storedTheme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        document.documentElement.classList.add(`${systemTheme}-theme`);
      } else {
        document.documentElement.classList.add(`${storedTheme}-theme`);
      }
    }
  }, []);

  // Helper function to show and auto-hide the save notification
  const showSavedNotification = (message: string = "Theme preference saved!") => {
    setSaveNotification(message);
    setTimeout(() => {
      setSaveNotification(null);
    }, 3000);
  };
  
  // Handle subscription change
  const handleSubscriptionChange = (newSubscription: "user" | "builder") => {
    setSubscription(newSubscription);
    showSavedNotification("Subscription updated successfully!");
  };
  
  // Handle adding a new payment method
  const handleAddPayment = () => {
    setShowAddPayment(!showAddPayment);
  };
  
  // Handle payment form submission
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAddPayment(false);
    setPaymentSuccessMsg("Payment method added successfully!");
    setTimeout(() => {
      setPaymentSuccessMsg(null);
    }, 3000);
  };
  
  // Handle theme change
  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    
    if (typeof window !== 'undefined') {
      // Save to localStorage
      localStorage.setItem("theme", newTheme);
      
      // Apply theme to document
      document.documentElement.classList.remove("light-theme", "dark-theme");
      if (newTheme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        document.documentElement.classList.add(`${systemTheme}-theme`);
      } else {
        document.documentElement.classList.add(`${newTheme}-theme`);
      }
    }
    
    showSavedNotification();
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
                onChange={() => handleThemeChange("light")}
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
                onChange={() => handleThemeChange("dark")}
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
                onChange={() => handleThemeChange("system")}
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

        {/* Finances & Subscription */}
        <section className={styles.settingsSection}>
          <h2>Finances & Subscription</h2>
          <div className={styles.financeInfo}>
            <div className={styles.subscriptionStatus}>
              <h3>Current Subscription</h3>
              <div className={styles.subscriptionOptions}>
                <div className={`${styles.subscriptionOption} ${subscription === 'user' ? styles.activeSubscription : ''}`}>
                  <input 
                    type="radio" 
                    id="userSub" 
                    name="subscription" 
                    checked={subscription === "user"}
                    onChange={() => handleSubscriptionChange("user")}
                  />
                  <label htmlFor="userSub">
                    <div className={styles.subscriptionDetails}>
                      <h4>User Subscription</h4>
                      <p className={styles.price}><span>$15</span>/month</p>
                      <p>Access to the full platform and features</p>
                      <ul className={styles.subscriptionFeatures}>
                        <li><CheckCircleIcon size={16} /> Dedicated AI agent</li>
                        <li><CheckCircleIcon size={16} /> Persistent memory</li>
                        <li><CheckCircleIcon size={16} /> All basic features</li>
                      </ul>
                    </div>
                  </label>
                </div>

                <div className={`${styles.subscriptionOption} ${subscription === 'builder' ? styles.activeSubscription : ''}`}>
                  <input 
                    type="radio" 
                    id="builderSub" 
                    name="subscription" 
                    checked={subscription === "builder"}
                    onChange={() => handleSubscriptionChange("builder")}
                  />
                  <label htmlFor="builderSub">
                    <div className={styles.subscriptionDetails}>
                      <h4>Builder Subscription</h4>
                      <p className={styles.price}><span>$20</span>/month</p>
                      <p>Premium developer tools and resources</p>
                      <ul className={styles.subscriptionFeatures}>
                        <li><CheckCircleIcon size={16} /> Everything in User plan</li>
                        <li><CheckCircleIcon size={16} /> Agent creation tools</li>
                        <li><CheckCircleIcon size={16} /> Marketplace access</li>
                      </ul>
                    </div>
                  </label>
                </div>
              </div>
            </div>
            
            <div className={styles.billingSection}>
              <h3>Billing Information</h3>
              <div className={styles.paymentMethods}>
                <div className={styles.paymentMethod}>
                  <CreditCardIcon size={20} />
                  <div className={styles.paymentDetails}>
                    <span className={styles.cardName}>Visa ending in 4242</span>
                    <span className={styles.cardExpiry}>Expires 12/26</span>
                  </div>
                  <span className={styles.defaultBadge}>Default</span>
                </div>
                
                <button 
                  className={styles.addPaymentButton}
                  onClick={handleAddPayment}
                >
                  {showAddPayment ? "Cancel" : "+ Add Payment Method"}
                </button>
                
                {showAddPayment && (
                  <form className={styles.paymentForm} onSubmit={handlePaymentSubmit}>
                    <div className={styles.formRow}>
                      <label htmlFor="cardName">Name on Card</label>
                      <input type="text" id="cardName" placeholder="John Doe" required />
                    </div>
                    <div className={styles.formRow}>
                      <label htmlFor="cardNumber">Card Number</label>
                      <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" required pattern="[0-9\s]{13,19}" />
                    </div>
                    <div className={styles.formRowSplit}>
                      <div>
                        <label htmlFor="cardExpiry">Expiry</label>
                        <input type="text" id="cardExpiry" placeholder="MM/YY" required pattern="[0-9]{2}/[0-9]{2}" />
                      </div>
                      <div>
                        <label htmlFor="cardCvc">CVC</label>
                        <input type="text" id="cardCvc" placeholder="123" required pattern="[0-9]{3,4}" />
                      </div>
                    </div>
                    <button type="submit" className={styles.saveButton}>Save Payment Method</button>
                  </form>
                )}
                
                {paymentSuccessMsg && (
                  <div className={styles.successMessage}>                 
                    <CheckCircleIcon size={16} />
                    {paymentSuccessMsg}
                  </div>
                )}
              </div>
              
              <div className={styles.billingHistory}>
                <h3>Billing History</h3>
                <table className={styles.billingTable}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>May 1, 2025</td>
                      <td>User Subscription</td>
                      <td>$15.00</td>
                      <td><span className={styles.paidStatus}>Paid</span></td>
                    </tr>
                    <tr>
                      <td>Apr 1, 2025</td>
                      <td>User Subscription</td>
                      <td>$15.00</td>
                      <td><span className={styles.paidStatus}>Paid</span></td>
                    </tr>
                    <tr>
                      <td>Mar 1, 2025</td>
                      <td>User Subscription</td>
                      <td>$15.00</td>
                      <td><span className={styles.paidStatus}>Paid</span></td>
                    </tr>
                  </tbody>
                </table>
                <a href="#" className={styles.viewAllLink}>View All Transactions</a>
              </div>
              
              <div className={styles.nextBilling}>
                <DollarSignIcon size={16} />
                <span>Your next billing date is <strong>June 1, 2025</strong></span>
              </div>
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
              <div className={styles.shortcutControls}>
                <kbd>Ctrl</kbd> <span>+</span> <kbd>K</kbd>
              </div>
            </div>
            <div className={styles.shortcutItem}>
              <span>Quick Create</span>
              <div className={styles.shortcutControls}>
                <kbd>Ctrl</kbd> <span>+</span> <kbd>N</kbd>
              </div>
            </div>
            <div className={styles.shortcutItem}>
              <span>Search</span>
              <div className={styles.shortcutControls}>
                <kbd>Ctrl</kbd> <span>+</span> <kbd>F</kbd>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
