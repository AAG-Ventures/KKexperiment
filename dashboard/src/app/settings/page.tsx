"use client";

import styles from "./settings.module.css";
import connectStyles from "./connect.module.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CreditCardIcon, DollarSignIcon, AlertCircleIcon, CheckCircleIcon, Copy, Share2, UserCircle, PlusIcon, Link2, CheckCircle, Plug, Sun, Moon, Minus, Plus } from "lucide-react";

export default function SettingsPage() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [saveNotification, setSaveNotification] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<"free" | "basic" | "premium">("basic");
  const [additionalCredits, setAdditionalCredits] = useState<number>(1000);
  const [availableCredits, setAvailableCredits] = useState<number>(1850);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);
  const [referralLink, setReferralLink] = useState('');
  const [referralCount, setReferralCount] = useState(0);
  const [successfulReferrals, setSuccessfulReferrals] = useState(0);
  const [freeMonthsEarned, setFreeMonthsEarned] = useState(0);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  // Initialize theme from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Get stored theme or default to dark
      const storedTheme = localStorage.getItem("theme") as "light" | "dark" || "dark";
      // Only allow light or dark themes
      const validTheme = storedTheme === "light" ? "light" : "dark";
      setTheme(validTheme);
      
      // Apply theme to document
      document.documentElement.classList.remove("light-theme", "dark-theme");
      document.documentElement.classList.add(`${validTheme}-theme`);

      // Store the theme in localStorage to persist the change
      localStorage.setItem("theme", validTheme);
    }
  }, []); 
  
  // Generate referral link and data (in a real app, would come from API)
  useEffect(() => {
    const userId = 'u' + Math.random().toString(36).substring(2, 10);
    setReferralLink(`https://mindextension.app/signup?ref=${userId}`);
    setReferralCount(5);
    setSuccessfulReferrals(2);
    setFreeMonthsEarned(2);
  }, []);

  // Helper function to show and auto-hide the save notification
  const showSavedNotification = (message: string = "Theme preference saved!") => {
    setSaveNotification(message);
    setTimeout(() => {
      setSaveNotification(null);
    }, 3000);
  };
  
  // Function to copy referral link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink)
      .then(() => {
        showSavedNotification("Referral link copied to clipboard!");
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        showSavedNotification("Failed to copy link. Please try again.");
      });
  };

  // Function to share referral link
  const shareReferralLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join Me on Mind Extension',
        text: 'Get 1 month free when you sign up using my referral link:',
        url: referralLink,
      })
      .then(() => showSavedNotification("Shared successfully!"))
      .catch((error) => console.log('Error sharing', error));
    } else {
      copyToClipboard();
    }
  };
  
  // Handle subscription change
  const handleSubscriptionChange = (type: "free" | "basic" | "premium") => {
    console.log(`Changed subscription to: ${type}`);
    setSubscription(type);
    showSavedNotification("Subscription updated successfully!");
  };
  
  // Handle additional credits adjustment
  const adjustCredits = (amount: number) => {
    const newAmount = additionalCredits + amount;
    if (newAmount >= 1000) {
      setAdditionalCredits(newAmount);
    }
  };
  
  // Handle adding credits
  const addCredits = () => {
    showSavedNotification(`Added ${additionalCredits} credits successfully!`);
    console.log(`Adding ${additionalCredits} credits to account.`);
    // Here you would make an API call to add the credits
  };
  
  // Handle saving profile data
  const handleSaveProfile = () => {
    // Here you would make an API call to save profile data
    console.log('Saving profile data...');
    showSavedNotification('Profile updated successfully!');
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
  const handleThemeChange = (selectedTheme: "light" | "dark") => {
    setTheme(selectedTheme);
    
    // Save to localStorage
    localStorage.setItem("theme", selectedTheme);
    
    // Apply theme to document
    document.documentElement.classList.remove("light-theme", "dark-theme");
    document.documentElement.classList.add(`${selectedTheme}-theme`);
    
    // Show notification
    showSavedNotification("Theme preference saved!");
  };
  
  return (
    <div className={styles.settingsWrapper}>
      <header className={styles.settingsHeader}>
        <div className={styles.headerLeft}>
          <Link href="/" className={styles.backLink}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Dashboard
          </Link>
          <h1 className={styles.settingsTitle}>Settings</h1>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.themeToggleContainer}>
            <span className={styles.themeLabel}><Sun size={16} /></span>
            <label className={styles.themeToggle}>
              <input 
                type="checkbox" 
                checked={theme === "dark"}
                onChange={() => handleThemeChange(theme === "dark" ? "light" : "dark")}
              />
              <span className={styles.themeToggleSlider}></span>
            </label>
            <span className={styles.themeLabel}><Moon size={16} /></span>
          </div>
        </div>
      </header>

      <div className={styles.settingsContainer}>
        
        {/* Row 1: Profile (1/2) and Connected Services (1/2) */}
        <div className={styles.settingsRow}>
          {/* Profile & Privacy - 1/2 width */}
          <div className={styles.settingsHalf}>
            <section className={styles.settingsSection} id="profile">
              <div className={styles.sectionHeader}>
                <h2>Profile</h2>
                <button className={styles.actionButton} onClick={handleSaveProfile}>Save</button>
              </div>
              
              <div className={styles.profileContentLayout}>
                <div className={styles.profileFormSection}>
                  <div className={styles.settingItem}>
                    <input type="text" defaultValue="User Name" placeholder="Display Name" />
                  </div>
                  <div className={styles.settingItem}>
                    <input type="email" defaultValue="user@example.com" placeholder="Email" />
                  </div>
                </div>
                
                <div className={styles.profileImageContainer}>
                  <div 
                    className={styles.profileImage} 
                    onClick={() => document.getElementById('profile-upload')?.click()}
                  >
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" />
                    ) : (
                      <UserCircle size={60} />
                    )}
                  </div>
                  <div 
                    className={styles.uploadButton}
                    onClick={() => document.getElementById('profile-upload')?.click()}
                  >
                    <PlusIcon size={16} />
                  </div>
                  <input 
                    type="file" 
                    id="profile-upload" 
                    className={styles.fileInput} 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          if (e.target?.result) {
                            setProfileImage(e.target.result as string);
                            showSavedNotification("Profile picture updated!");
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
              </div>
              
              {/* Button container removed */}
            </section>
          </div>
          
          {/* Connected Services - 1/2 width */}
          <div className={styles.settingsHalf}>
            <section className={styles.settingsSection} id="connected-services">
              <div className={styles.sectionHeader}>
                <h2>Connected Services</h2>
                <button className={styles.actionButton}>More</button>
              </div>
              <div className={connectStyles.connectedToolsContainer}>
                <div className={connectStyles.connectedToolsGrid}>
                  <div className={connectStyles.connectedToolsColumn}>
                    {/* Connected services first */}
                    <div className={connectStyles.toolItem}>
                      <span className={connectStyles.toolIcon}>📧</span>
                      <span className={connectStyles.toolName}>Email</span>
                      <div className={connectStyles.connectIcon + " " + connectStyles.connected}>
                        <CheckCircle size={18} />
                      </div>
                    </div>
                    {/* Unconnected services */}
                    <div className={connectStyles.toolItem}>
                      <span className={connectStyles.toolIcon}>📱</span>
                      <span className={connectStyles.toolName}>Instagram</span>
                      <div className={connectStyles.connectIcon}>
                        <Plug size={18} />
                      </div>
                    </div>
                    <div className={connectStyles.toolItem}>
                      <span className={connectStyles.toolIcon}>👤</span>
                      <span className={connectStyles.toolName}>Facebook</span>
                      <div className={connectStyles.connectIcon}>
                        <Plug size={18} />
                      </div>
                    </div>
                  </div>
                  <div className={connectStyles.connectedToolsColumn}>
                    <div className={connectStyles.toolItem}>
                      <span className={connectStyles.toolIcon}>📁</span>
                      <span className={connectStyles.toolName}>Google Drive</span>
                      <div className={connectStyles.connectIcon}>
                        <Plug size={18} />
                      </div>
                    </div>
                    <div className={connectStyles.toolItem}>
                      <span className={connectStyles.toolIcon}>📅</span>
                      <span className={connectStyles.toolName}>Calendar</span>
                      <div className={connectStyles.connectIcon}>
                        <Plug size={18} />
                      </div>
                    </div>
                    <div className={connectStyles.toolItem}>
                      <span className={connectStyles.toolIcon}>✈️</span>
                      <span className={connectStyles.toolName}>Telegram</span>
                      <div className={connectStyles.connectIcon}>
                        <Plug size={18} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
        
        {/* Row 2: Subscription (60%) and Referral Program (40%) */}
        <div className={styles.settingsRow}>
          {/* Subscription - 60% width */}
          <div className={styles.settingsHalf} style={{ flex: '6' }}>
            <section className={styles.settingsSection} id="subscription">
              <div className={styles.sectionHeader}>
                <h2>Subscription & Billing</h2>
              </div>
              <div className={styles.subscriptionStatus}>
                <h3>Plans</h3>
                <div className={styles.subscriptionOptions}>
                  <div className={`${styles.subscriptionOption} ${subscription === 'free' ? styles.activeSubscription : ''}`}>
                    <input 
                      type="radio" 
                      id="freeSub" 
                      name="subscription" 
                      checked={subscription === "free"}
                      onChange={() => handleSubscriptionChange("free")}
                    />
                    <label htmlFor="freeSub">
                      <div className={styles.subscriptionDetails}>
                        <h4>Free Trial</h4>
                        <p className={styles.price}><span>$0</span>/week</p>
                        <p>Try the platform for free</p>
                        <ul className={styles.planFeatures}>
                          <li>Limited AI Agent access</li>
                          <li>Basic knowledge base storage (1GB)</li>
                          <li>Up to 3 concurrent processes</li>
                          <li>100 credits</li>
                        </ul>
                      </div>
                    </label>
                  </div>

                  <div className={`${styles.subscriptionOption} ${subscription === 'basic' ? styles.activeSubscription : ''}`}>
                    <input 
                      type="radio" 
                      id="basicSub" 
                      name="subscription" 
                      checked={subscription === "basic"}
                      onChange={() => handleSubscriptionChange("basic")}
                    />
                    <label htmlFor="basicSub">
                      <div className={styles.subscriptionDetails}>
                        <h4>Basic Plan</h4>
                        <p className={styles.price}><span>$7</span>/month</p>
                        <p>Access to the full platform and features</p>
                        <ul className={styles.planFeatures}>
                          <li>Basic AI Agent access</li>
                          <li>Standard knowledge base storage (5GB)</li>
                          <li>Up to 10 concurrent processes</li>
                          <li>3000 credits</li>
                        </ul>
                      </div>
                    </label>
                  </div>

                  <div className={`${styles.subscriptionOption} ${subscription === 'premium' ? styles.activeSubscription : ''}`}>
                    <input 
                      type="radio" 
                      id="premiumSub" 
                      name="subscription" 
                      checked={subscription === "premium"}
                      onChange={() => handleSubscriptionChange("premium")}
                    />
                    <label htmlFor="premiumSub">
                      <div className={styles.subscriptionDetails}>
                        <h4>Premium Plan</h4>
                        <p className={styles.price}><span>$22</span>/month</p>
                        <p>Premium developer tools and resources</p>
                        <ul className={styles.planFeatures}>
                          <li>Advanced AI Agent access</li>
                          <li>Extended knowledge base storage (20GB)</li>
                          <li>Unlimited concurrent processes</li>
                          <li>Priority support</li>
                          <li>10,000 credits</li>
                        </ul>
                      </div>
                    </label>
                  </div>
                </div>
                <div className={styles.planNoteContainer}>
                  <p className={styles.planNote}>Your current billing cycle: May 6, 2025 - June 6, 2025</p>
                </div>
                
                {/* Additional Credits Section */}
                <div className={styles.additionalCreditsSection}>
                  <div className={styles.creditsSectionHeader}>
                    <div className={styles.creditsHeaderLeft}>
                      <h3>Need More Credits?</h3>
                      <div className={styles.availableCredits}>
                        <span className={styles.availableCreditsValue}>{availableCredits.toLocaleString()}</span>
                        <span className={styles.availableCreditsLabel}>credits left</span>
                      </div>
                    </div>
                    <div className={styles.creditsContainer}>
                    <div className={styles.creditsCounter}>
                      <button 
                        className={styles.counterButton} 
                        onClick={() => adjustCredits(-1000)}
                        disabled={additionalCredits <= 1000}
                      >
                        <Minus size={16} />
                      </button>
                      <div className={styles.creditsAmount}>
                        <span>{additionalCredits.toLocaleString()}</span>
                        <span className={styles.creditsLabel}>credits</span>
                      </div>
                      <button 
                        className={styles.counterButton} 
                        onClick={() => adjustCredits(1000)}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className={styles.creditsPricing}>
                      <span className={styles.creditsPrice}>${(additionalCredits / 1000 * 5).toFixed(2)}</span>
                    </div>
                    <button 
                      className={styles.addCreditsButton} 
                      onClick={addCredits}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
              </div>
              
              <div className={styles.billingSection}>
                <div className={styles.sectionHeader} style={{ marginTop: '1.5rem' }}>
                  <h3>Billing Information</h3>
                  <button 
                    className={styles.actionButton}
                    onClick={handleAddPayment}
                  >
                    Add Card
                  </button>
                </div>
                <div className={styles.paymentMethods}>
                  <div className={styles.paymentMethod}>
                    <span className={styles.cardIcon}>
                      <CreditCardIcon size={20} />
                    </span>
                    <div className={styles.paymentDetails}>
                      <span className={styles.cardName}>Visa ending in 4242</span>
                      <span className={styles.cardExpiry}>Expires 12/26</span>
                    </div>
                    <span className={styles.defaultBadge}>Default</span>
                  </div>
                </div>
                
                <div className={styles.billingHistory}>
                  <h3>Recent Transactions</h3>
                  <div className={styles.transactionList}>
                    <div className={styles.transaction}>
                      <div className={styles.transactionDetails}>
                        <span className={styles.transactionDate}>May 6, 2025</span>
                        <span className={styles.transactionDesc}>Builder Subscription - Monthly</span>
                      </div>
                      <span className={styles.transactionAmount}>$20.00</span>
                    </div>
                    <div className={styles.transaction}>
                      <div className={styles.transactionDetails}>
                        <span className={styles.transactionDate}>Apr 6, 2025</span>
                        <span className={styles.transactionDesc}>Builder Subscription - Monthly</span>
                      </div>
                      <span className={styles.transactionAmount}>$20.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
          
          {/* Referral Program - 40% width */}
          <div className={styles.settingsHalf} style={{ flex: '4' }}>
            <section 
              className={styles.settingsSection} 
              id="referrals" 
              style={{
                position: 'relative',
                overflow: 'hidden',
                animation: 'referralPulse 2s ease-in-out'
              }}
            >
              <style jsx>{`
                @keyframes referralPulse {
                  0% { box-shadow: 0 0 0 rgba(0, 255, 209, 0); }
                  50% { box-shadow: 0 0 25px rgba(0, 255, 209, 0.6); }
                  100% { box-shadow: 0 0 0 rgba(0, 255, 209, 0); }
                }
                
                #referrals::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: -100%;
                  width: 100%;
                  height: 100%;
                  background: linear-gradient(90deg, 
                    transparent 0%, 
                    rgba(0, 255, 209, 0.3) 45%, 
                    rgba(255, 255, 255, 0.4) 50%, 
                    rgba(0, 255, 209, 0.3) 55%, 
                    transparent 100%);
                  animation: referralSweep 1.5s ease-out 0.3s forwards;
                  z-index: 10;
                }
                
                @keyframes referralSweep {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(200%); }
                }
              `}</style>
              <div className={styles.sectionHeader}>
                <h2>Referral Program</h2>
              </div>
              <div className={styles.referralInfo}>
                <div className={styles.infoBox}>
                  <h3>How it works:</h3>
                  <ul className={styles.referralList}>
                    <li>Share your unique referral link with friends</li>
                    <li>When they subscribe for at least one month, you both get 1 month free</li>
                    <li>There's no limit to how many friends you can refer!</li>
                  </ul>
                </div>
                
                <div className={styles.referralStats}>
                  <h3>Your Referral Stats</h3>
                  <div className={styles.statsGrid}>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>{referralCount}</span>
                      <span className={styles.statLabel}>Total Referrals</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>{successfulReferrals}</span>
                      <span className={styles.statLabel}>Successful</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>{freeMonthsEarned}</span>
                      <span className={styles.statLabel}>Free Months</span>
                    </div>
                  </div>
                </div>
                
                <div className={styles.referralLink}>
                  <h3>Your Referral Link</h3>
                  <div className={styles.linkContainer}>
                    <div className={styles.linkInputGroup}>
                      <div className={styles.linkInputWrapper}>
                        <input 
                          type="text" 
                          value={referralLink} 
                          readOnly 
                          className={styles.linkInput}
                        />
                        <button 
                          onClick={copyToClipboard} 
                          className={styles.copyIconButton}
                          title="Copy to clipboard"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                      <button onClick={shareReferralLink} className={`${styles.actionButton} ${styles.shareButton}`}>
                        <Share2 size={16} />
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            <div style={{ height: '2rem' }}></div>
            
            <section className={styles.settingsSection} id="notifications">
              <div className={styles.sectionHeader}>
                <h2>Notifications</h2>
              </div>
              <div className={styles.settingsList}>
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
              </div>
            </section>
          </div>
        </div>


        

        
        {/* Notification Toast */}
        {saveNotification && (
          <div className={`${styles.notification} ${saveNotification.includes('Profile') ? styles.success : ''}`}>
            {saveNotification}
          </div>
        )}
      </div>
    </div>
  );
}
