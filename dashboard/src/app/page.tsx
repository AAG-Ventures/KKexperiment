import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function Dashboard() {
  return (
    <div className={styles.dashboardWrapper}>
      {/* Top Bar */}
      <header className={styles.topBar}>
        <div className={styles.logoArea}>
          <Image 
            src="/logo.png" 
            alt="Mind Extension Logo" 
            width={140} 
            height={40} 
            priority
            style={{objectFit: 'contain'}} 
            className={styles.logo}
          />
        </div>
        <div className={styles.topBarRight}>
          <button className={styles.iconButton} title="Notifications">
            <span className="material-icons" style={{fontSize: 32}}>notifications</span>
          </button>
          <Link href="/settings" className={styles.profileButton} title="Profile & Settings">
            <span className="material-icons" style={{fontSize: 32}}>account_circle</span>
          </Link>
        </div>
      </header>

      {/* Main Layout */}
      <div className={styles.layout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <nav>
            <div className={styles.sectionTitle}>Knowledgebase</div>
            {/* Example folders/files */}
            <ul className={styles.kbList}>
              <li>📁 Projects</li>
              <li>📄 Meeting Notes</li>
              <li>📁 Shared Space</li>
            </ul>
            <div className={styles.sectionTitle}>Active Processes</div>
            <ul className={styles.processList}>
              <li>🔄 Data Sync</li>
              <li>✅ Report Generation</li>
            </ul>
          </nav>
          <button className={styles.createButton}>＋</button>
        </aside>

        {/* Main Content */}
        <main className={styles.mainContent}>
          <div className={styles.fileDisplay}>
            <h2>Welcome to your Dashboard</h2>
            <p>This is where your files and main workspace will appear.</p>
          </div>
        </main>

        {/* Right Widgets */}
        <section className={styles.widgets}>
          <div className={styles.widgetBox}>
            <h3>My Tasks</h3>
            <ul>
              <li>Design dashboard UI</li>
              <li>Review agent history</li>
              <li>Connect Slack</li>
            </ul>
          </div>
          <div className={styles.chatbox}>
            <div className={styles.chatHeader}>Chat</div>
            <div className={styles.chatTabs}>
              <button className={styles.activeTab}>General</button>
              <button>New Tab ＋</button>
            </div>
            <div className={styles.chatBody}>
              <div className={styles.chatMsg}>🤖 Hi! How can I help you today?</div>
            </div>
            <input className={styles.chatInput} placeholder="Type a message..." />
          </div>
        </section>
      </div>
    </div>
  );
}
