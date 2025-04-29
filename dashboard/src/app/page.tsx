"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from 'react';
import styles from "./page.module.css";
import AddModal from "./components/AddModal";
import { DraggableWidgetContainer } from "./components/DraggableWidgetContainer";
import FileExplorer from './components/FileExplorer';
import { knowledgebaseData } from './components/KnowledgebaseSampleData';

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

type ChatTab = {
  id: string;
  title: string;
  messages: { sender: 'user' | 'bot', content: string }[];
  active: boolean;
  isRenaming?: boolean;
  isProcessing?: boolean;
};

type Process = {
  id: string;
  name: string;
  type: 'chat';
  status: 'inProgress' | 'completed' | 'failed';
};

export default function Dashboard() {
  // Initial tasks state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [openTabKey, setOpenTabKey] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  
  // Refs
  const newTaskInputRef = useRef<HTMLInputElement>(null);
  
  // Expandable folders state
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(false);
  const [isSharedSpaceExpanded, setIsSharedSpaceExpanded] = useState(false);
  
  // Sidebar collapsed state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Tab system state
  const [openTabs, setOpenTabs] = useState([
    { id: 'dashboard', title: 'Dashboard', isPermanent: true },
    { id: 'marketing-plan', title: 'Marketing Plan' },
    { id: 'health', title: 'Health' }
  ]);
  const [activeTabId, setActiveTabId] = useState('dashboard');
  
  // Chat state management
  const [chatTabs, setChatTabs] = useState<ChatTab[]>([
    {
      id: 'chat-1',
      title: 'Chat 1',
      messages: [{ sender: 'bot' as const, content: 'Hi! How can I help you today?' }],
      active: true,
      isRenaming: false,
      isProcessing: false
    }
  ]);
  
  // Chat tab input reference
  const renameInputRef = useRef<HTMLInputElement>(null);
  
  // Active processes state
  const [processes, setProcesses] = useState<Process[]>([]);
  
  // Function to create a new chat tab
  const createNewChatTab = () => {
    const newId = `chat-${Date.now()}`;
    const newTitle = `Chat ${chatTabs.length + 1}`;
    
    // Create updated tabs array with the new tab
    const updatedTabs = [
      ...chatTabs.map(tab => ({ ...tab, active: false })),
      {
        id: newId,
        title: newTitle,
        messages: [{ sender: 'bot' as const, content: 'Hi! How can I help you today?' }],
        active: true,
        isProcessing: false
      }
    ];
    
    setChatTabs(updatedTabs);
    
    // Add to Active Processes
    setProcesses(prev => [
      ...prev,
      {
        id: newId,
        name: newTitle,
        type: 'chat',
        status: 'completed'
      }
    ]);
  };
  
  // Function to handle tab rename
  const startTabRename = (tabId: string) => {
    setChatTabs(prevTabs => 
      prevTabs.map(t => ({
        ...t,
        isRenaming: t.id === tabId
      }))
    );
    
    // Focus the input after a short delay
    setTimeout(() => {
      if (renameInputRef.current) {
        renameInputRef.current.focus();
        renameInputRef.current.select();
      }
    }, 100);
  };
  
  // Function to save tab rename
  const saveTabRename = (tabId: string, newTitle: string) => {
    if (newTitle.trim()) {
      // Update tab title
      setChatTabs(prevTabs => prevTabs.map(t => ({
        ...t,
        title: t.id === tabId ? newTitle.trim() : t.title,
        isRenaming: false
      })));
      
      // Also update the process name in Active Processes
      setProcesses(prevProcesses => 
        prevProcesses.map(process => 
          process.id === tabId 
            ? { ...process, name: newTitle.trim() } 
            : process
        )
      );
    } else {
      // Just exit rename mode if empty
      setChatTabs(prevTabs => prevTabs.map(t => ({
        ...t,
        isRenaming: false
      })));
    }
  };
  
  // Function to cancel tab rename
  const cancelTabRename = () => {
    setChatTabs(prevTabs => prevTabs.map(t => ({
      ...t,
      isRenaming: false
    })));
  };

  // Toggle sidebar function
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  
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
    
    // Initialize Active Processes with current chat tabs
    if (chatTabs.length > 0) {
      setProcesses(chatTabs.map(tab => ({
        id: tab.id,
        name: tab.title,
        type: 'chat' as const,
        status: 'completed' as const
      })));
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('dashboard_tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  // Function to toggle task completion status
  const toggleTaskCompletion = (taskId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };
  
  // Function to start adding a new task
  const startAddingTask = () => {
    setIsAddingTask(true);
    setNewTaskText('');
    
    // Focus the input after a short delay
    setTimeout(() => {
      if (newTaskInputRef.current) {
        newTaskInputRef.current.focus();
      }
    }, 100);
  };
  
  // Function to save a new task
  const saveNewTask = () => {
    if (newTaskText.trim()) {
      // Create a new task and add it to the list
      const newTask = {
        id: `task-${Date.now()}`,
        text: newTaskText.trim(),
        completed: false
      };
      
      setTasks(prevTasks => [...prevTasks, newTask]);
    }
    
    // Reset the adding task state
    setIsAddingTask(false);
    setNewTaskText('');
  };
  
  // Function to cancel adding a task
  const cancelAddingTask = () => {
    setIsAddingTask(false);
    setNewTaskText('');
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
        
        {/* Left Column - Knowledge Section */}
        <div className={styles.leftColumn}>
          
          {!isSidebarCollapsed ? (
            /* Knowledge Section - Full size version */
            <>
              {/* Toggle button at the edge in expanded state */}
              <button 
                className={styles.sidebarToggle} 
                onClick={toggleSidebar}
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              {/* Draggable widget container for left column */}
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
                        {/* File Explorer Component */}
                        <div className={styles.fileExplorerContainer}>
                          <FileExplorer 
                            data={knowledgebaseData}
                            onSelect={(item) => console.log('Selected:', item.name)}
                          />
                        </div>
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
                          {processes.length > 0 ? (
                            processes.map(process => (
                              <div 
                                key={process.id} 
                                className={styles.processItem}
                                onClick={() => {
                                  if (process.type === 'chat') {
                                    // Highlight the tab if it exists already
                                    const existingTab = chatTabs.find(tab => tab.id === process.id);
                                    
                                    if (existingTab) {
                                      // Just make the tab active
                                      setChatTabs(prevTabs => 
                                        prevTabs.map(tab => ({
                                          ...tab,
                                          active: tab.id === process.id
                                        }))
                                      );
                                    } else {
                                      // Create new tab and set it as active
                                      const newTab: ChatTab = {
                                        id: process.id,
                                        title: process.name,
                                        messages: [{ sender: 'bot' as const, content: 'Resuming conversation...' }],
                                        active: true
                                      };
                                      
                                      setChatTabs(prevTabs => [
                                        ...prevTabs.map(tab => ({ ...tab, active: false })),
                                        newTab
                                      ]);
                                    }
                                    
                                    // Update process status but don't remove it
                                    setProcesses(prevProcesses => 
                                      prevProcesses.map(p => 
                                        p.id === process.id 
                                          ? { ...p, status: 'inProgress' as const } 
                                          : p
                                      )
                                    );
                                  }
                                }}
                              >
                                <span className={`${styles.statusIndicator} ${styles[`status${process.status.charAt(0).toUpperCase() + process.status.slice(1)}`]}`} 
                                  title={`${process.status.charAt(0).toUpperCase() + process.status.slice(1)}`}>
                                </span>
                                <div className={styles.processDetails}>
                                  <div className={styles.processName}>{process.name}</div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className={styles.emptyState}>No active processes</div>
                          )}
                        </div>
                      </aside>
                    )
                  }
                ]}
              />
            </>
            ) : (
              /* Show mini icons when collapsed */
              <div className={styles.miniSidebar}>
                {/* Toggle button as the first mini icon */}
                <div 
                  className={styles.miniWidgetIcon} 
                  title="Expand sidebar"
                  onClick={toggleSidebar}
                >
                  <svg className={styles.arrowIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                
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
        <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.mainContentExpanded : ''}`}>
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
                      <button 
                        className={styles.newTabButton} 
                        title="Add New Task"
                        type="button"
                        onClick={startAddingTask}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                          <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                    <div className={styles.tasksContainer}>
                      {/* Active Tasks */}
                      <div className={styles.taskSection}>
                        {tasks.filter(task => !task.completed).length === 0 && !isAddingTask ? (
                          <div className={styles.emptyTasksMessage}>
                            <div className={styles.emptyTasksIcon}>✓</div>
                            <p>You've completed everything in your plan!</p>
                            <button 
                              className={styles.addTaskButton}
                              onClick={startAddingTask}
                            >
                              Add a new task
                            </button>
                          </div>
                        ) : (
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
                            
                            {isAddingTask && (
                              <li className={styles.taskItem}>
                                <button className={styles.taskCheckbox}>
                                  <span className={styles.checkboxInner}></span>
                                </button>
                                <input
                                  ref={newTaskInputRef}
                                  className={styles.newTaskInput}
                                  type="text"
                                  placeholder="Type a new task..."
                                  value={newTaskText}
                                  onChange={(e) => setNewTaskText(e.target.value)}
                                  onBlur={saveNewTask}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      saveNewTask();
                                    } else if (e.key === 'Escape') {
                                      cancelAddingTask();
                                    }
                                  }}
                                />
                              </li>
                            )}
                          </ul>
                        )}         
                      </div>
                      
                      {/* Completed Tasks */}
                      {tasks.some(task => task.completed) && (
                        <div className={styles.completedTasksSection}>
                          <button 
                            className={styles.completedTasksHeader} 
                            onClick={() => {
                              const completedSection = document.querySelector(`.${styles.completedTasksList}`);
                              if (completedSection) {
                                completedSection.scrollIntoView({ behavior: 'smooth' });
                              }
                            }}
                          >
                            Completed ({tasks.filter(task => task.completed).length})
                          </button>
                          <div className={styles.completedTasksList}>
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
                                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M3 6L5 8L9 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                      </span>
                                    </button>
                                    <span className={styles.taskText}>{task.text}</span>
                                  </li>
                                ))}
                            </ul>
                          </div>
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
                      <button 
                        className={styles.newTabButton} 
                        title="New Chat Tab"
                        type="button"
                        onClick={() => createNewChatTab()}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                          <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                    {chatTabs.length > 0 && (
                      <>
                        <div className={styles.chatTabs}>
                          {chatTabs.map((tab) => (
                            <button 
                              key={tab.id}
                              className={tab.active ? styles.activeTab : styles.chatTab}
                              onClick={() => {
                                // Make this tab active
                                setChatTabs(prevTabs => prevTabs.map(t => ({
                                  ...t,
                                  active: t.id === tab.id
                                })));
                              }}
                              onDoubleClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                startTabRename(tab.id);
                              }}
                            >
                              {tab.isRenaming ? (
                                <input
                                  ref={renameInputRef}
                                  className={styles.tabRenameInput}
                                  type="text"
                                  defaultValue={tab.title}
                                  onClick={(e) => e.stopPropagation()}
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onBlur={(e) => {
                                    saveTabRename(tab.id, e.target.value);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      saveTabRename(tab.id, e.currentTarget.value);
                                    } else if (e.key === 'Escape') {
                                      cancelTabRename();
                                    }
                                  }}
                                />
                              ) : (
                                tab.title
                              )}
                              <span 
                                className={styles.closeTab}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  
                                  // Update the status of this chat in the processes list to 'completed'
                                  setProcesses(prevProcesses => 
                                    prevProcesses.map(p => 
                                      p.id === tab.id 
                                        ? { ...p, status: 'completed' as const } 
                                        : p
                                    )
                                  );
                                  
                                  // Remove from chat tabs
                                  const newTabs = chatTabs.filter(t => t.id !== tab.id);
                                  
                                  if (newTabs.length === 0) {
                                    // If no tabs left, create a new one
                                    const newId = `chat-${Date.now()}`;
                                    setChatTabs([{
                                      id: newId,
                                      title: `Chat ${1}`,
                                      messages: [{ sender: 'bot' as const, content: 'Hi! How can I help you today?' }],
                                      active: true,
                                      isProcessing: false
                                    }]);
                                    
                                    // Add new tab to Active Processes
                                    setProcesses(prev => [
                                      ...prev,
                                      {
                                        id: newId,
                                        name: `Chat ${1}`,
                                        type: 'chat',
                                        status: 'inProgress'
                                      }
                                    ]);
                                  } else {
                                    // Set first tab as active if we're removing the active tab
                                    if (tab.active) {
                                      newTabs[0].active = true;
                                    }
                                    setChatTabs(newTabs);
                                  }
                                }}
                              >
                                ×
                              </span>
                            </button>
                          ))}
                        </div>
                        
                        {chatTabs.map((tab) => tab.active && (
                          <div key={tab.id} className={styles.chatBody}>
                            {tab.messages.map((msg, i) => (
                              <div key={i} className={styles.chatMsg}>
                                {msg.sender === 'bot' && '🤖 '}{msg.content}
                              </div>
                            ))}
                          </div>
                        ))}
                        
                        <input 
                          className={styles.chatInput} 
                          placeholder="Type a message..." 
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                              const activeTab = chatTabs.find(tab => tab.active);
                              if (activeTab) {
                                // Add user message
                                const userMsg = e.currentTarget.value.trim();
                                const newMessages = [
                                  ...activeTab.messages,
                                  { sender: 'user' as const, content: userMsg }
                                ];
                                
                                // Update the active tab
                                setChatTabs(prevTabs => 
                                  prevTabs.map(tab => {
                                    if (tab.id === activeTab.id) {
                                      return { ...tab, messages: newMessages };
                                    }
                                    return tab;
                                  })
                                );
                                
                                // Clear input
                                e.currentTarget.value = '';
                                
                                // Set the chat as processing
                                setChatTabs(prevTabs => 
                                  prevTabs.map(tab => ({
                                    ...tab,
                                    isProcessing: tab.id === activeTab.id
                                  }))
                                );
                                
                                // Update status in Active Processes to in progress
                                setProcesses(prevProcesses => 
                                  prevProcesses.map(process => 
                                    process.id === activeTab.id 
                                      ? { ...process, status: 'inProgress' as const } 
                                      : process
                                  )
                                );
                                
                                // Simulate bot response after delay
                                setTimeout(() => {
                                  setChatTabs(prevTabs => 
                                    prevTabs.map(tab => {
                                      if (tab.id === activeTab.id) {
                                        return { 
                                          ...tab, 
                                          isProcessing: false,
                                          messages: [
                                            ...tab.messages,
                                            { sender: 'bot' as const, content: `I received your message: "${userMsg}"` }
                                          ]
                                        };
                                      }
                                      return tab;
                                    })
                                  );
                                  
                                  // Set back to completed in Active Processes
                                  setProcesses(prevProcesses => 
                                    prevProcesses.map(process => 
                                      process.id === activeTab.id 
                                        ? { ...process, status: 'completed' as const } 
                                        : process
                                    )
                                  );
                                }, 2000);
                              }
                            }
                          }}
                        />
                      </>
                    )}
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
