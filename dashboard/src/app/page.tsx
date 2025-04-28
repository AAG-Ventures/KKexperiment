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
        <div className={styles.spacer}></div>
        <div className={styles.topBarRight}>
          <button className={styles.iconButton} title="Notifications">
            <span className="material-icons" style={{fontSize: 24}}>notifications</span>
            <span className={styles.notificationBadge}>3</span>
          </button>
          <div className={styles.profileBar}>
            <div className={styles.userInfo}>
              <span className={styles.userName}>User Name</span>
              <span className={styles.userRole}>Premium Account</span>
            </div>
            <div className={styles.profileImage}>
              <Link href="/settings" title="Profile & Settings">
                <span className="material-icons" style={{fontSize: 32}}>account_circle</span>
              </Link>
            </div>
          </div>
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
          <h2 className={styles.pageTitle}>Dashboard Overview</h2>
          
          <div className={styles.cardGrid}>

            {/* Recent Activity Card */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Recent Activity</h3>
                <span className="material-icons">history</span>
              </div>
              <div className={styles.cardContent}>
                <ul className={styles.activityList}>
                  <li className={styles.activityItem}>
                    <span className="material-icons">edit</span>
                    <div className={styles.activityText}>
                      <div>Updated <strong>Marketing Plan</strong></div>
                      <div className={styles.activityTime}>10 minutes ago</div>
                    </div>
                  </li>
                  <li className={styles.activityItem}>
                    <span className="material-icons">folder</span>
                    <div className={styles.activityText}>
                      <div>Created <strong>Q2 Reports</strong> folder</div>
                      <div className={styles.activityTime}>Yesterday</div>
                    </div>
                  </li>
                  <li className={styles.activityItem}>
                    <span className="material-icons">chat</span>
                    <div className={styles.activityText}>
                      <div>New message in <strong>Team Chat</strong></div>
                      <div className={styles.activityTime}>Yesterday</div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Quick Actions</h3>
                <span className="material-icons">bolt</span>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.actionButtons}>
                  <button className={styles.actionButton}>
                    <span className="material-icons">note_add</span>
                    New File
                  </button>
                  <button className={styles.actionButton}>
                    <span className="material-icons">upload_file</span>
                    Upload
                  </button>
                  <button className={styles.actionButton}>
                    <span className="material-icons">share</span>
                    Share
                  </button>
                  <button className={styles.actionButton}>
                    <span className="material-icons">search</span>
                    Search
                  </button>
                </div>
              </div>
            </div>
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
