"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import AddModal from "./components/AddModal";

// Task type definition
type Task = {
  id: string;
  text: string;
  completed: boolean;
};

export default function Dashboard() {
  // Initial tasks state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Initialize tasks on component mount
  useEffect(() => {
    // Get saved tasks from localStorage or use default tasks
    const savedTasks = localStorage.getItem('dashboard_tasks');
    
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      // Default tasks
      const defaultTasks = [
        { id: '1', text: 'Design dashboard UI', completed: false },
        { id: '2', text: 'Review agent history', completed: false },
        { id: '3', text: 'Connect Slack', completed: false },
      ];
      setTasks(defaultTasks);
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('dashboard_tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  // Toggle task completion
  const toggleTaskCompletion = (taskId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Handle opening the add modal
  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };
  
  // Handle closing the add modal
  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };
  
  // Handle option selection in the add modal
  const handleOptionSelect = (option: string) => {
    console.log(`Selected option: ${option}`);
    // Here you would handle each option differently
    // For this implementation, we'll just close the modal
    setIsAddModalOpen(false);
    
    // You can add specific logic for each option type here
    switch (option) {
      case 'folder':
        // Logic for creating a folder
        break;
      case 'file':
        // Logic for creating a file
        break;
      case 'agent':
        // Logic for creating an agent
        break;
      case 'workflow':
        // Logic for creating a workflow
        break;
      case 'custom':
        // Logic for custom/other
        break;
    }
  };
  
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
            style={{
              objectFit: 'contain',
              mixBlendMode: 'normal'
            }} 
            className={styles.logo}
          />
        </div>
        <div className={styles.spacer}></div>
        <div className={styles.topBarRight}>
          <button className={styles.iconButton} title="Notifications">
            <span className="icon icon-notification"></span>
            <span className={styles.notificationBadge}>3</span>
          </button>
          <div className={styles.profileBar}>
            <div className={styles.userInfo}>
              <span className={styles.userName}>User Name</span>
              <span className={styles.userRole}>Premium Account</span>
            </div>
            <div className={styles.profileImage}>
              <Link href="/settings" className={styles.profileButton} title="Profile & Settings">
                <span className="icon icon-account"></span>
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
          </nav>
          <div className={styles.sidebarBottom}>
            {/* Process Widget */}
            <div className={styles.processWidget}>
              <h3>Active Processes</h3>
              <ul className={styles.processList}>
                <li>
                  <span className="icon icon-sync" style={{marginRight: 6}}></span>
                  Data Sync
                  <span className={styles.processStatus}>In Progress</span>
                </li>
                <li>
                  <span className="icon icon-document" style={{marginRight: 6}}></span>
                  Report Generation
                  <span className={styles.processStatus + ' ' + styles.complete}>Complete</span>
                </li>
              </ul>
            </div>
            <button 
              className={styles.createButton}
              onClick={handleOpenAddModal}
              aria-label="Create new item"
            >＋</button>
          </div>
        </aside>

        {/* Main Content */}
        <main className={styles.mainContent}>
          <h2 className={styles.pageTitle}>Dashboard Overview</h2>
          
          <div className={styles.cardGrid}>

            {/* Recent Activity Card */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Recent Activity</h3>
                <span className="icon icon-history"></span>
              </div>
              <div className={styles.cardContent}>
                <ul className={styles.activityList}>
                  <li className={styles.activityItem}>
                    <span className="icon icon-edit"></span>
                    <div className={styles.activityText}>
                      <div>Updated <strong>Marketing Plan</strong></div>
                      <div className={styles.activityTime}>10 minutes ago</div>
                    </div>
                  </li>
                  <li className={styles.activityItem}>
                    <span className="icon icon-folder"></span>
                    <div className={styles.activityText}>
                      <div>Created <strong>Q2 Reports</strong> folder</div>
                      <div className={styles.activityTime}>Yesterday</div>
                    </div>
                  </li>
                  <li className={styles.activityItem}>
                    <span className="icon icon-chat"></span>
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
                <span className="icon icon-bolt"></span>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.actionButtons}>
                  <button className={styles.actionButton}>
                    <span className="icon icon-note-add"></span>
                    New Note
                  </button>
                  <button className={styles.actionButton}>
                    <span className="icon icon-upload"></span>
                    Upload
                  </button>
                  <button className={styles.actionButton}>
                    <span className="icon icon-share"></span>
                    Share
                  </button>
                  <button className={styles.actionButton}>
                    <span className="icon icon-search"></span>
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
            <div className={styles.tasksContainer}>
              {/* Active Tasks */}
              <div className={styles.taskSection}>
                <ul className={styles.taskList}>
                  {tasks
                    .filter(task => !task.completed)
                    .map(task => (
                      <li key={task.id} className={styles.taskItem}>
                        <button 
                          className={styles.taskCheckbox} 
                          onClick={() => toggleTaskCompletion(task.id)}
                          aria-label={`Mark ${task.text} as complete`}
                        >
                          <span className={styles.checkboxInner}></span>
                        </button>
                        <span className={styles.taskText}>{task.text}</span>
                      </li>
                    ))}
                </ul>
              </div>
              
              {/* Completed Tasks */}
              {tasks.some(task => task.completed) && (
                <div className={styles.completedTasksSection}>
                  <div className={styles.completedTasksHeader}>Completed</div>
                  <ul className={styles.taskList}>
                    {tasks
                      .filter(task => task.completed)
                      .map(task => (
                        <li key={task.id} className={`${styles.taskItem} ${styles.completedTask}`}>
                          <button 
                            className={`${styles.taskCheckbox} ${styles.checked}`}
                            onClick={() => toggleTaskCompletion(task.id)}
                            aria-label={`Mark ${task.text} as incomplete`}
                          >
                            <span className={`${styles.checkboxInner} ${styles.checked}`}>
                              <span className="icon icon-check" style={{ transform: 'scale(0.7)' }}></span>
                            </span>
                          </button>
                          <span className={styles.taskText}>{task.text}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
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
      
      {/* Add Modal */}
      <AddModal 
        isOpen={isAddModalOpen} 
        onClose={handleCloseAddModal} 
        onOptionSelect={handleOptionSelect} 
      />
    </div>
  );
}
