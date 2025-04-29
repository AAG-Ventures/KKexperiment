"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import AddModal from "./components/AddModal";
import { DraggableWidgetContainer } from "./components/DraggableWidgetContainer";

// Type definitions
type Task = {
  id: string;
  text: string;
  completed: boolean;
};

type WidgetItem = {
  id: string;
  content: React.ReactNode;
};

export default function Dashboard() {
  // Initial tasks state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Expandable folders state
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(false);
  const [isSharedSpaceExpanded, setIsSharedSpaceExpanded] = useState(false);
  
  // Sidebar collapsed state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Toggle sidebar function
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  
  // Tab system state
  const [openTabs, setOpenTabs] = useState([
    { id: 'dashboard', title: 'Dashboard', isPermanent: true },
    { id: 'marketing-plan', title: 'Marketing Plan' },
    { id: 'health', title: 'Health' }
  ]);
  const [activeTabId, setActiveTabId] = useState('dashboard');

  // Initialize tasks on component mount
  useEffect(() => {
    // Get saved tasks from localStorage or use default tasks
    const savedTasks = localStorage.getItem('dashboard_tasks');
    
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      // Default tasks with the specific tasks requested by the user
      const defaultTasks = [
        { id: '1', text: 'Design dashboard UI', completed: false },
        { id: '2', text: 'Review agent history', completed: false },
        { id: '3', text: 'Connect Slack', completed: false },
        { id: '4', text: 'Review marketing plan', completed: false },
        { id: '5', text: 'Connect calendar', completed: false },
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
    handleCloseAddModal();
    
    // You can add specific logic for each option type here
    switch (option) {
      case 'folder':
        // Logic for creating a folder
        break;
      case 'file':
        // Logic for creating a file
        break;
      case 'widget':
        // Logic for creating a new dashboard widget
        console.log('Creating a new widget');
        // Here you could show a modal for widget creation or add a default widget
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
            src={`/logo.png?v=${new Date().getTime()}`} 
            alt="Mind Extension Logo" 
            width={180} 
            height={60} 
            priority
            style={{
              objectFit: 'contain',
              maxHeight: '40px',
              width: 'auto'
            }} 
            className={styles.logo}
          />
        </div>
        <div className={styles.spacer}></div>
        <div className={styles.topBarRight}>
          <button className={styles.iconButton} title="Notifications">
            <span style={{fontSize: 24}}>🔔</span>
            <span className={styles.notificationBadge}>3</span>
          </button>
          <div className={styles.profileBar}>
            <div className={styles.userInfo}>
              <span className={styles.userName}>User Name</span>
              <span className={styles.userRole}>Premium Account</span>
            </div>
            <div className={styles.profileImage}>
              <Link href="/settings" title="Profile & Settings">
                <span style={{fontSize: 32}}>👤</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className={`${styles.layout} ${isSidebarCollapsed ? styles.layoutCollapsed : ''}`}>
        {/* Sticky Create Button */}
        <button 
          className={styles.stickyCreateButton}
          onClick={handleOpenAddModal}
          aria-label="Create new item"
        >
          <span className={styles.plusIcon}>＋</span>
        </button>
        
        {/* Left Sidebar - Full version */}
        <div className={styles.leftColumn}>
          {/* Toggle button at the edge */}
          <button 
            className={`${styles.sidebarToggle} ${isSidebarCollapsed ? styles.sidebarToggleCollapsed : ''}`} 
            onClick={toggleSidebar}
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
            {!isSidebarCollapsed ? (
              /* Show full widgets when expanded */
              <DraggableWidgetContainer
                columnId="left-column"
                initialItems={[
                  {
                    id: 'knowledgebase',
                    content: (
                  <aside className={styles.knowledgeWidget}>
                    <div className={styles.widgetHeader}>
                      <h3>Knowledgebase</h3>
                      <span className={styles.widgetIcon}>📚</span>
                    </div>
                    {/* Example folders/files */}
                    <nav>
                      <ul className={styles.kbList}>
                        <li className={styles.folderItem}>
                          <div 
                            className={styles.folderHeader} 
                            onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
                          >
                            <span>{isProjectsExpanded ? '📂' : '📁'} Topics</span>
                            <span className={styles.expandIcon}>{isProjectsExpanded ? '▼' : '▶'}</span>
                          </div>
                          {isProjectsExpanded && (
                            <ul className={styles.nestedList}>
                              <li className={styles.nestedItem}>💼 Work</li>
                              <li className={styles.nestedItem}>❤️ Health</li>
                              <li className={styles.nestedItem}>💰 Finance</li>
                              <li className={styles.nestedItem}>✈️ Travel</li>
                              <li className={styles.nestedItem}>🎮 Hobbies</li>
                            </ul>
                          )}
                        </li>
                        <li>📄 Meeting Notes</li>
                        <li className={styles.folderItem}>
                          <div 
                            className={styles.folderHeader} 
                            onClick={() => setIsSharedSpaceExpanded(!isSharedSpaceExpanded)}
                          >
                            <span>{isSharedSpaceExpanded ? '📂' : '📁'} Shared Space</span>
                            <span className={styles.expandIcon}>{isSharedSpaceExpanded ? '▼' : '▶'}</span>
                          </div>
                          {isSharedSpaceExpanded && (
                            <ul className={styles.nestedList}>
                              <li className={styles.nestedItem}>📈 Marketing Plan</li>
                              <li className={styles.nestedItem}>📚 Team Documentation</li>
                              <li className={styles.nestedItem}>📊 Analytics</li>
                            </ul>
                          )}
                        </li>
                      </ul>
                    </nav>
                  </aside>
                )
              },
              {
                id: 'active-processes',
                content: (
                  <aside className={styles.activeProcessesWidget}>
                    <div className={styles.widgetHeader}>
                      <h3>Active Processes</h3>
                      <span className={styles.widgetIcon}>🔄</span>
                    </div>
                    <div className={styles.processList}>
                      <div className={styles.processItem}>
                        <div className={styles.processIcon}>🔄</div>
                        <div className={styles.processDetails}>
                          <div className={styles.processName}>Data Sync</div>
                          <div className={styles.processStatus}>
                            <span className={styles.statusBadgeInProgress}>In Progress</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </aside>
                  )
                }
              ]}
              />
            ) : (
              /* Show mini icons when collapsed */
              <div className={styles.miniSidebar}>
                <div 
                  className={styles.miniWidgetIcon} 
                  title="Knowledgebase"
                  onClick={toggleSidebar}
                >
                  <span className={styles.bookIcon}></span>
                </div>
                
                <div 
                  className={styles.miniWidgetIcon} 
                  title="Active Processes"
                  onClick={toggleSidebar}
                >
                  <span className={styles.clockIcon}></span>
                </div>
              </div>
            )}
          </div>

        {/* Main Content */}
        <main className={styles.mainContent}>
          {/* Tabs Bar */}
          <div style={{
            display: 'flex',
            marginBottom: '10px',
            borderBottom: '1px solid var(--border-light)',
            position: 'relative',
          }}>
            {openTabs.map(tab => (
              <div 
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                style={{
                  padding: '4px 12px',
                  marginRight: '5px',
                  cursor: 'pointer',
                  borderTop: activeTabId === tab.id ? '3px solid var(--brand-primary)' : '3px solid transparent',
                  borderLeft: '1px solid var(--border-light)',
                  borderRight: '1px solid var(--border-light)',
                  borderBottom: activeTabId === tab.id ? 'none' : undefined,
                  borderTopLeftRadius: '3px',
                  borderTopRightRadius: '3px',
                  position: 'relative',
                  top: activeTabId === tab.id ? '1px' : '0',
                  backgroundColor: activeTabId === tab.id ? 'var(--background-secondary)' : 'var(--background-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '13px',
                  height: '28px',
                }}
              >
                <div style={{ fontWeight: 500, color: 'var(--foreground-primary)' }}>
                  {tab.title}
                </div>
                
                {!tab.isPermanent && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const newTabs = openTabs.filter(t => t.id !== tab.id);
                      setOpenTabs(newTabs);
                      if (activeTabId === tab.id && newTabs.length > 0) {
                        setActiveTabId(newTabs[0].id);
                      }
                    }}
                    style={{
                      marginLeft: '6px',
                      background: 'none',
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      color: 'var(--foreground-secondary)',
                      padding: '0 2px',
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <h2 className={styles.pageTitle}>Dashboard Overview</h2>
          
          <div className={styles.cardGrid}>

            {/* Recent Activity Card */}
            <div className={styles.card}>
              <div className={styles.widgetHeader}>
                <h3>Recent Activity</h3>
                <span className={styles.widgetIcon}>🕒</span>
              </div>
              <div className={styles.cardContent}>
                <ul className={styles.activityList}>
                  <li className={styles.activityItem}>
                    <span style={{fontSize: 24, marginRight: 10}}>✏️</span>
                    <div className={styles.activityText}>
                      <div>Updated <strong>Marketing Plan</strong></div>
                      <div className={styles.activityTime}>10 minutes ago</div>
                    </div>
                  </li>
                  <li className={styles.activityItem}>
                    <span style={{fontSize: 24, marginRight: 10}}>📁</span>
                    <div className={styles.activityText}>
                      <div>Created <strong>Q2 Reports</strong> folder</div>
                      <div className={styles.activityTime}>Yesterday</div>
                    </div>
                  </li>
                  <li className={styles.activityItem}>
                    <span style={{fontSize: 24, marginRight: 10}}>💬</span>
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
              <div className={styles.widgetHeader}>
                <h3>Quick Actions</h3>
                <span className={styles.widgetIcon}>⚡</span>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.actionButtons}>
                  <button className={styles.actionButton}>
                    <span style={{fontSize: 20, marginRight: 5}}>📄</span>
                    New File
                  </button>
                  <button className={styles.actionButton}>
                    <span style={{fontSize: 20, marginRight: 5}}>⬆️</span>
                    Upload
                  </button>
                  <button className={styles.actionButton}>
                    <span style={{fontSize: 20, marginRight: 5}}>🔗</span>
                    Share
                  </button>
                  <button className={styles.actionButton}>
                    <span style={{fontSize: 20, marginRight: 5}}>🔍</span>
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Right Widgets */}
        <section className={styles.widgets}>
          <DraggableWidgetContainer
            columnId="right-column"
            initialItems={[
              {
                id: 'tasks',
                content: (
                  <div className={styles.widgetBox}>
                    <div className={styles.widgetHeader}>
                      <h3>My Tasks</h3>
                      <span className={styles.widgetIcon}>✅</span>
                    </div>
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
                                      <span className="material-icons" style={{ fontSize: '14px' }}>check</span>
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
                )
              },
              {
                id: 'chat',
                content: (
                  <div className={styles.chatbox}>
                    <div className={styles.widgetHeader}>
                      <h3>Chat</h3>
                      <span className={styles.widgetIcon}>💬</span>
                    </div>
                    <div className={styles.chatTabs}>
                      <button className={styles.activeTab}>General</button>
                      <button>New Tab ＋</button>
                    </div>
                    <div className={styles.chatBody}>
                      <div className={styles.chatMsg}>🤖 Hi! How can I help you today?</div>
                    </div>
                    <input className={styles.chatInput} placeholder="Type a message..." />
                  </div>
                )
              }
            ]}
          />
        </section>
      </div>
      
      {/* Add Modal */}
      <AddModal 
        isOpen={isAddModalOpen} 
        onClose={handleCloseAddModal} 
        onOptionSelect={handleOptionSelect} 
        onFolderCreate={(folderName, files) => {
          console.log(`Creating folder: ${folderName} with ${files.length} files`);
          // Handle folder creation logic here
        }}
      />
    </div>
  );
}
