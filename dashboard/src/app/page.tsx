"use client";

import Image from "next/image";
import Link from "next/link";
import FileContent from './components/FileContent';
import { useState, useEffect, useRef, useMemo } from 'react';
import styles from "./page.module.css";
import AddModal from "./components/AddModal";
import { DraggableWidgetContainer } from "./components/DraggableWidgetContainer";
import FileExplorer, { isFolder } from './components/FileExplorer';
import { knowledgebaseData } from './components/KnowledgebaseSampleData';
// Import explicitly for client component
import { useRouter } from 'next/navigation';

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
  sessionId?: string; // AI agent session ID
};

type Process = {
  id: string;
  name: string;
  type: 'chat';
  status: 'inProgress' | 'completed' | 'failed';
};

type Notification = {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
};

export default function Dashboard() {
  // Use useRouter hook to mark the component as client-side only
  useRouter();
  
  // Initial tasks state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [openTabKey, setOpenTabKey] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Notification panel state
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const notificationPanelRef = useRef<HTMLDivElement>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  
  // File handling state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  
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
  
  // Initialize with empty states to prevent server/client hydration mismatch
  const [chatTabs, setChatTabs] = useState<ChatTab[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  
  // Track expanded folders in knowledgebase
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['topics']);
  
  // Function to toggle folder expansion (including Topics)
  const toggleFolderExpansion = (folderId: string) => {
    console.log(`Toggling folder: ${folderId}`);
    setExpandedFolders(prev => {
      // Log current expanded folders
      console.log('Current expanded folders:', prev);
      
      if (prev.includes(folderId)) {
        const result = prev.filter(id => id !== folderId);
        console.log('Removing from expanded folders, new state:', result);
        return result;
      } else {
        const result = [...prev, folderId];
        console.log('Adding to expanded folders, new state:', result);
        return result;
      }
    });
  };
  
  // Track active topic in knowledgebase
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  
  // Chat tab input reference
  const renameInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize chat state client-side only
  useEffect(() => {
    // Only run this on the client
    if (typeof window !== 'undefined') {
      // Only initialize if not already done
      if (chatTabs.length === 0) {
        const initialChatId = 'chat-1';
        
        // Set up initial chat tab
        setChatTabs([
          {
            id: initialChatId,
            title: 'Chat 1',
            messages: [{ sender: 'bot' as const, content: 'Hi! How can I help you today?' }],
            active: true,
            isRenaming: false,
            isProcessing: false,
            sessionId: generateUUID()
          }
        ]);
        
        // Set up initial process
        setProcesses([
          {
            id: initialChatId,
            name: 'Chat 1',
            type: 'chat',
            status: 'completed'
          }
        ]);
      }
    }
  }, [chatTabs.length]);
  
  // Initialize with empty array to prevent hydration mismatch
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Initialize notifications on client-side only
  useEffect(() => {
    // Only run once and only on the client
    if (typeof window !== 'undefined' && notifications.length === 0) {
      const now = Date.now();
      setNotifications([
        {
          id: '1',
          title: 'New task assigned',
          message: 'You have been assigned a new task "Review documentation"',
          timestamp: new Date(now - 1000 * 60 * 15), // 15 minutes ago
          read: false,
          type: 'info'
        },
        {
          id: '2',
          title: 'Process completed',
          message: 'Your agent has finished analyzing the data',
          timestamp: new Date(now - 1000 * 60 * 60), // 1 hour ago
          read: true,
          type: 'success'
        },
        {
          id: '3',
          title: 'System warning',
          message: 'Low storage space available',
          timestamp: new Date(now - 1000 * 60 * 60 * 3), // 3 hours ago
          read: false,
          type: 'warning'
        },
        {
          id: '4',
          title: 'Connection error',
          message: 'Unable to connect to external service',
          timestamp: new Date(now - 1000 * 60 * 60 * 24), // 1 day ago
          read: true,
          type: 'error'
        }
      ]);
    }
  }, [notifications.length]);
  
  // Add click outside handler for notification panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationPanelRef.current && 
          !notificationPanelRef.current.contains(event.target as Node) &&
          !(event.target as Element).closest(`.${styles.iconButton}`)) {
        setIsNotificationPanelOpen(false);
      }
    };
    
    if (isNotificationPanelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationPanelOpen, styles.iconButton]);
  
  // Get unread notification count
  const unreadCount = useMemo(() => {
    return notifications.filter(notification => !notification.read).length;
  }, [notifications]);
  
  // AI Agent constants
  const AI_AGENT_CONFIG = {
    API_KEY: 'test',
    BACKEND_DOMAIN: 'https://ai-agent-soc-media-template-ddd7b1afdf47.herokuapp.com',
    AGENT_ID: '95ba603a-9479-4f6a-8e1e-1e63638053a9',
    USER_ID: '86d3eaaa-51e0-43a3-ba79-e42ed82ee30f'
  };
  
  // Helper function to generate UUID compatible with both server and client
  const generateUUID = () => {
    // Check if crypto.randomUUID is available (modern browsers)
    if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    
    // Fallback method
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0,
          v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
  
  // Function to interact with AI agent
  const sendMessageToAIAgent = async (prompt: string, sessionId: string) => {
    try {
      console.log('Sending request to AI agent with:', {
        endpoint: `${AI_AGENT_CONFIG.BACKEND_DOMAIN}/api/interact/voice`,
        sessionId,
        agentId: AI_AGENT_CONFIG.AGENT_ID,
        userId: AI_AGENT_CONFIG.USER_ID
      });
      
      const requestBody = {
        agentId: AI_AGENT_CONFIG.AGENT_ID,
        userId: AI_AGENT_CONFIG.USER_ID,
        sessionId: sessionId,
        prompt: prompt,
        attachments: []
      };
      
      console.log('Request payload:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(`${AI_AGENT_CONFIG.BACKEND_DOMAIN}/api/interact/voice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': AI_AGENT_CONFIG.API_KEY,
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', {
        'content-type': response.headers.get('content-type'),
        'cors': response.headers.get('access-control-allow-origin')
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed response data:', data);
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      }
      
      // Extract AI response from the API's structure
      let aiResponseText = '';
      
      // The API returns response in the 'text' field based on your console logs
      if (data.text) {
        aiResponseText = data.text;
        console.log('Found response in text field:', aiResponseText);
      } else if (data.response) {
        aiResponseText = data.response;
        console.log('Found response in response field:', aiResponseText);
      } else {
        console.warn('No text or response field found in data:', data);
        // Look for any string field that might contain the response
        for (const key in data) {
          if (typeof data[key] === 'string' && data[key].length > 10) {
            aiResponseText = data[key];
            console.log(`Found potential response in ${key} field:`, aiResponseText);
            break;
          }
        }
      }
      
      return aiResponseText || "I'm here to help. What can I assist you with today?";
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error communicating with AI agent:', error);
      return `Sorry, I couldn't connect to the AI agent at this moment. Technical details: ${errorMessage}`;
    }
  };

  // Function to create a new chat tab
  const createNewChatTab = () => {
    const newId = `chat-${Date.now()}`;
    const newTabNumber = chatTabs.length + 1;
    const newTitle = `Chat ${newTabNumber}`;
    const sessionId = generateUUID(); // Generate a unique session ID for the chat
    
    // Update chat tabs state
    const updatedTabs = [
      ...chatTabs.map(tab => ({ ...tab, active: false })),
      {
        id: newId,
        title: newTitle,
        messages: [{ sender: 'bot' as const, content: 'Hi! How can I help you today?' }],
        active: true,
        isProcessing: false,
        sessionId: sessionId
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
  const toggleTaskCompletion = (id: string) => {
    setTasks(prevTasks => prevTasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };
  
  // Handle marking a notification as read
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };
  
  // Add a new notification
  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
  };
  
  // Function to format notification timestamp - safe for SSR
  const formatNotificationTime = (timestamp: Date): string => {
    // Return empty string during server-side rendering
    if (typeof window === 'undefined') {
      return '';
    }
    
    // Only run time calculations on client
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
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
  
  // Function to set a topic as the active root in knowledgebase
  const setTopicAsRoot = (topicId: string) => {
    // Set this topic as the active topic
    setActiveTopicId(topicId);
    
    // Clear previous expanded folders except the active topic
    setExpandedFolders([topicId]);
    
    // Also switch to the corresponding tab
    setActiveTabId(topicId);
  };
  
  // Function to return to main Topics view in knowledgebase
  const backToAllTopics = () => {
    setActiveTopicId(null);
    setExpandedFolders(['topics']);
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
    
    // Handle each option type differently
    switch (option) {
      case 'folder':
        // Don't close the modal for folder - the AddModal component will show FolderCreateModal
        return; // Return early to prevent closing the modal
        
      case 'file':
        // Logic for creating a file
        handleCloseAddModal();
        break;
        
      case 'widget':
        // Logic for creating a new dashboard widget
        console.log('Creating a new widget');
        handleCloseAddModal();
        break;
        
      default:
        // For all other options, close the modal
        handleCloseAddModal();
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
  
  // Add drag and drop event listeners when component mounts
  useEffect(() => {
    const dashboard = dashboardRef.current;
    if (!dashboard) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
      dashboard.classList.add('drag-active');
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dashboard.classList.remove('drag-active');
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dashboard.classList.remove('drag-active');
      
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        console.log(`Dropped file: ${file.name}`);
        setSelectedFile(file);
        // Add Files tab if it doesn't exist
        const filesTabExists = openTabs.some(tab => tab.id === 'files');
        if (!filesTabExists) {
          setOpenTabs(prev => [...prev, { id: 'files', title: `File: ${file.name}` }]);
        }
        setActiveTabId('files');
        setOpenTabKey('files');
      }
    };

    dashboard.addEventListener('dragover', handleDragOver as EventListener);
    dashboard.addEventListener('dragleave', handleDragLeave as EventListener);
    dashboard.addEventListener('drop', handleDrop as EventListener);

    return () => {
      dashboard.removeEventListener('dragover', handleDragOver as EventListener);
      dashboard.removeEventListener('dragleave', handleDragLeave as EventListener);
      dashboard.removeEventListener('drop', handleDrop as EventListener);
    };
  }, []);

  return (
    <div className={styles.dashboardWrapper} ref={dashboardRef}>
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
          <button 
            className={styles.iconButton} 
            title="Notifications"
            onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
          >
            <span style={{fontSize: 24}}>🔔</span>
            {unreadCount > 0 && (
              <span className={styles.notificationBadge}>{unreadCount}</span>
            )}
          </button>
          
          {/* Notification Panel Popup */}
          {isNotificationPanelOpen && (
            <div ref={notificationPanelRef} className={styles.notificationPanel}>
              <div className={styles.notificationPanelHeader}>
                <h3>Notifications</h3>
                <button 
                  onClick={() => setIsNotificationPanelOpen(false)}
                  className={styles.closeButton}
                >
                  ×
                </button>
              </div>
              <div className={styles.notificationList}>
                {notifications.length === 0 ? (
                  <div className={styles.emptyNotifications}>No notifications</div>
                ) : (
                  // Show unread notifications or the 3 most recent
                  (unreadCount > 0 ? 
                    notifications.filter(n => !n.read) : 
                    [...notifications].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 3)
                  ).map(notification => (
                    <div 
                      key={notification.id}
                      className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''} ${styles[notification.type]}`}
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
              {notifications.length > 0 && (
                <div className={styles.notificationPanelFooter}>
                  <button 
                    className={styles.markAllReadButton}
                    onClick={() => {
                      setNotifications(prevNotifications => 
                        prevNotifications.map(n => ({ ...n, read: true }))
                      );
                    }}
                  >
                    Mark all as read
                  </button>
                </div>
              )}
            </div>
          )}
          <div className={styles.profileBar}>
            <div className={styles.userInfo}>
              <span className={styles.userName}>User Name</span>
              <span className={styles.userRole}>Premium Account</span>
            </div>
            <div className={styles.profileImage}>
              <Link 
                href="/settings" 
                title="Profile & Settings"
                passHref
              >
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
                        <div 
                          className={`${styles.widgetHeader} ${activeTopicId ? styles.clickableHeader : ''}`}
                          onClick={() => {
                            if (activeTopicId) {
                              // If we're viewing a specific topic, go back to main view
                              backToAllTopics();
                            }
                          }}
                          title={activeTopicId ? "Return to main view" : ""}
                          style={{
                            cursor: activeTopicId ? 'pointer' : 'default',
                          }}
                        >
                          <h3 
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              // Direct toggle for the topics folder
                              toggleFolderExpansion('topics');
                            }}
                          >
                            Knowledgebase {expandedFolders.includes('topics') ? '▼' : '►'}
                          </h3>
                          <span className={styles.widgetIcon}>📚</span>
                        </div>
                        {/* File Explorer Component */}
                        <div className={styles.fileExplorerContainer}>
                          <FileExplorer 
                            data={knowledgebaseData}
                            expandedFolders={expandedFolders}
                            activeTopicId={activeTopicId}
                            onBackToTopics={backToAllTopics}
                            onToggleFolder={toggleFolderExpansion}
                            onSelect={(item) => {
                              console.log('Selected:', item.name);
                              // If it's a topic folder, set it as root
                              if (isFolder(item) && item.id.includes('work') || item.id.includes('health') || 
                                  item.id.includes('finance') || item.id.includes('travel') || item.id.includes('hobbies')) {
                                setTopicAsRoot(item.id);
                              }
                              // For Work topic specifically (legacy code)
                              else if (item.id === 'work') {
                                // Check if Work tab already exists
                                const workTabExists = openTabs.some(tab => tab.id === 'work');
                                if (!workTabExists) {
                                  // Add Work tab after the Health tab
                                  const newTabs = [...openTabs];
                                  // Find the index of the Health tab
                                  const healthTabIndex = newTabs.findIndex(tab => tab.id === 'health');
                                  // Insert Work tab after Health tab
                                  newTabs.splice(healthTabIndex + 1, 0, { id: 'work', title: 'Work' });
                                  setOpenTabs(newTabs);
                                }
                                // Set Work tab as active
                                setActiveTabId('work');
                              }
                            }}
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
          
          {/* Display different content based on active tab */}
          {activeTabId === 'files' && selectedFile ? (
            /* Show only file content when file tab is active */
            <div className={styles.fileViewer}>
              <div className={styles.fileViewerHeader}>
                <h2 className={styles.fileViewerTitle}>{selectedFile.name}</h2>
                <div className={styles.fileViewerControls}>
                  <button 
                    className={styles.fileViewerButton}
                    onClick={() => {
                      // Clear the selected file
                      setSelectedFile(null);
                      // Remove the Files tab
                      setOpenTabs(prev => prev.filter(tab => tab.id !== 'files'));
                      // Go back to Dashboard tab
                      setActiveTabId('dashboard');
                    }}
                  >
                    Close file
                  </button>
                </div>
              </div>
              <div className={styles.fileViewerContent}>
                <FileContent file={selectedFile} />
              </div>
            </div>
          ) : activeTabId !== 'work' ? (
            /* Show regular dashboard content for non-Work tabs */
            <>
              <h2 className={styles.pageTitle}>Dashboard Overview</h2>
              
              {/* Topic Shortcuts */}
              <div className={styles.topicShortcuts}>
                <button 
                  className={styles.topicShortcutButton}
                  onClick={() => {
                    setTopicAsRoot('work'); // Set Work as root in knowledgebase
                    // No need to call setActiveTabId as setTopicAsRoot already does this
                  }}
                >
                  <span className={styles.topicIcon}>💼</span>
                  Work
                </button>
                <button 
                  className={styles.topicShortcutButton}
                  onClick={() => {
                    setTopicAsRoot('health'); // Set Health as root in knowledgebase
                    // No need to call setActiveTabId as setTopicAsRoot already does this
                  }}
                >
                  <span className={styles.topicIcon}>❤️</span>
                  Health
                </button>
                <button 
                  className={styles.topicShortcutButton}
                  onClick={() => {
                    // Check if Finance tab exists, if not create it
                    const financeTab = openTabs.find(tab => tab.id === 'finance');
                    if (!financeTab) {
                      setOpenTabs(prevTabs => [
                        ...prevTabs,
                        { id: 'finance', title: 'Finance' }
                      ]);
                    }
                    setTopicAsRoot('finance');
                  }}
                >
                  <span className={styles.topicIcon}>💰</span>
                  Finance
                </button>
                <button 
                  className={styles.topicShortcutButton}
                  onClick={() => {
                    // Check if Travel tab exists, if not create it
                    const travelTab = openTabs.find(tab => tab.id === 'travel');
                    if (!travelTab) {
                      setOpenTabs(prevTabs => [
                        ...prevTabs,
                        { id: 'travel', title: 'Travel' }
                      ]);
                    }
                    setTopicAsRoot('travel');
                  }}
                >
                  <span className={styles.topicIcon}>✈️</span>
                  Travel
                </button>
                <button 
                  className={styles.topicShortcutButton}
                  onClick={() => {
                    // Check if Hobbies tab exists, if not create it
                    const hobbiesTab = openTabs.find(tab => tab.id === 'hobbies');
                    if (!hobbiesTab) {
                      setOpenTabs(prevTabs => [
                        ...prevTabs,
                        { id: 'hobbies', title: 'Hobbies' }
                      ]);
                    }
                    setTopicAsRoot('hobbies');
                  }}
                >
                  <span className={styles.topicIcon}>🎮</span>
                  Hobbies
                </button>
              </div>
              
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
                      <button 
                        className={styles.actionButton}
                        onClick={async () => {
                          try {
                            // Check if File System Access API is available
                            if ('showOpenFilePicker' in window) {
                              const fileHandle = await (window as any).showOpenFilePicker({
                                types: [
                                  {
                                    description: 'All Files',
                                    accept: {'*/*': []},
                                  },
                                ],
                                multiple: false,
                              });
                              if (fileHandle && fileHandle[0]) {
                                const file = await fileHandle[0].getFile();
                                console.log(`Selected file: ${file.name}`);
                                setSelectedFile(file);
                                // Add Files tab if it doesn't exist
                                const filesTabExists = openTabs.some(tab => tab.id === 'files');
                                if (!filesTabExists) {
                                  setOpenTabs(prev => [...prev, { id: 'files', title: `File: ${file.name}` }]);
                                }
                                setActiveTabId('files');
                                setOpenTabKey('files');
                              }
                            } else {
                              // Fallback for browsers without File System Access API
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.onchange = (e) => {
                                const target = e.target as HTMLInputElement;
                                const file = target.files?.[0];
                                if (file) {
                                  console.log(`Selected file: ${file.name}`);
                                  setSelectedFile(file);
                                  // Add Files tab if it doesn't exist
                                  const filesTabExists = openTabs.some(tab => tab.id === 'files');
                                  if (!filesTabExists) {
                                    setOpenTabs(prev => [...prev, { id: 'files', title: `File: ${file.name}` }]);
                                  }
                                  setActiveTabId('files');
                                  setOpenTabKey('files');
                                }
                              };
                              input.click();
                            }
                          } catch (error) {
                            console.error('Error accessing file system:', error);
                            alert('Unable to access file system. Please try again.');
                          }
                        }}
                      >
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
            </>
          ) : (
            /* Show Work tab content with subtabs */
            <div>
              {/* Work tab with subtabs in a single line */}
              <div style={{
                marginTop: '0',
                position: 'relative',
                display: 'flex',
                width: '100%'
              }}>
                {/* All four tabs in one line, aligned to the left */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-start', 
                  gap: '10px',
                  width: '100%',
                  paddingLeft: '10px'
                }}>
                  {/* Knowledge base tab with active indicator */}
                  <div
                    className={styles.workSubtab}
                    style={{
                      padding: '4px 14px',
                      backgroundColor: 'var(--background-secondary)',
                      border: '1px solid var(--border-light)',
                      borderRadius: '12px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      fontWeight: 500,
                      color: 'var(--foreground-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      borderTop: '3px solid var(--brand-primary)',
                      marginTop: '-3px',
                      paddingTop: '2px'
                    }}
                  >
                    <span>Knowledge base</span>
                  </div>
                  
                  {/* Marketing Strategy tab */}
                  <div
                    className={styles.workSubtab}
                    style={{
                      padding: '4px 14px',
                      backgroundColor: 'var(--background-secondary)',
                      border: '1px solid var(--border-light)',
                      borderRadius: '12px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      fontWeight: 500,
                      color: 'var(--foreground-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>Marketing Strategy</span>
                    <button 
                      style={{
                        marginLeft: '8px',
                        background: 'none',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        color: 'var(--foreground-secondary)',
                        padding: '0 2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Close Marketing Strategy tab');
                      }}
                    >
                      ×
                    </button>
                  </div>
                  
                  {/* Notes for Meeting tab */}
                  <div
                    className={styles.workSubtab}
                    style={{
                      padding: '4px 14px',
                      backgroundColor: 'var(--background-secondary)',
                      border: '1px solid var(--border-light)',
                      borderRadius: '12px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      fontWeight: 500,
                      color: 'var(--foreground-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>Notes for Meeting</span>
                    <button 
                      style={{
                        marginLeft: '8px',
                        background: 'none',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        color: 'var(--foreground-secondary)',
                        padding: '0 2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Close Notes for Meeting tab');
                      }}
                    >
                      ×
                    </button>
                  </div>
                  
                  {/* Q2 Report tab */}
                  <div
                    className={styles.workSubtab}
                    style={{
                      padding: '4px 14px',
                      backgroundColor: 'var(--background-secondary)',
                      border: '1px solid var(--border-light)',
                      borderRadius: '12px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      fontWeight: 500,
                      color: 'var(--foreground-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>Q2 Report</span>
                    <button 
                      style={{
                        marginLeft: '8px',
                        background: 'none',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        color: 'var(--foreground-secondary)',
                        padding: '0 2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Close Q2 Report tab');
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
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
                        
                        {/* Always render the chat input */}
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
                                
                                // Send message to AI agent
                                const sessionId = activeTab.sessionId || generateUUID();
                                
                                // If no sessionId exists yet, add it to the tab
                                if (!activeTab.sessionId) {
                                  setChatTabs(prevTabs => 
                                    prevTabs.map(tab => {
                                      if (tab.id === activeTab.id) {
                                        return { ...tab, sessionId };
                                      }
                                      return tab;
                                    })
                                  );
                                }
                                
                                // Call the AI agent API
                                sendMessageToAIAgent(userMsg, sessionId)
                                  .then(response => {
                                    // Check if the response indicates an actual error (not just conversational phrases)
                                    const isErrorResponse = (
                                      // Only flag as error when these appear as specific error phrases, not as part of normal conversation
                                      (response.toLowerCase().includes("could not process your request") && response.length < 60) ||
                                      (response.toLowerCase().includes("error:") && !response.toLowerCase().includes("interesting")) ||
                                      response.toLowerCase().includes("api error:") ||
                                      response.toLowerCase().includes("failed to process") ||
                                      response.toLowerCase().includes("system error")
                                    );
                                    
                                    console.log("AI response:", response);
                                    console.log("Is error response?", isErrorResponse);
                                    
                                    // Update chat with the AI response
                                    setChatTabs(prevTabs => 
                                      prevTabs.map(tab => {
                                        if (tab.id === activeTab.id) {
                                          return { 
                                            ...tab, 
                                            isProcessing: false,
                                            messages: [
                                              ...tab.messages,
                                              { sender: 'bot' as const, content: response }
                                            ]
                                          };
                                        }
                                        return tab;
                                      })
                                    );
                                    
                                    // Set status based on whether the response was an error
                                    setProcesses(prevProcesses => 
                                      prevProcesses.map(process => 
                                        process.id === activeTab.id 
                                          ? { 
                                              ...process, 
                                              status: isErrorResponse ? 'failed' as const : 'completed' as const 
                                            } 
                                          : process
                                      )
                                    );
                                  })
                                  .catch(error => {
                                    console.error('Error calling AI agent:', error);
                                    
                                    // Update chat with error message
                                    setChatTabs(prevTabs => 
                                      prevTabs.map(tab => {
                                        if (tab.id === activeTab.id) {
                                          return { 
                                            ...tab, 
                                            isProcessing: false,
                                            messages: [
                                              ...tab.messages,
                                              { sender: 'bot' as const, content: 'Sorry, there was an error connecting to the AI agent.' }
                                            ]
                                          };
                                        }
                                        return tab;
                                      })
                                    );
                                    
                                    // Set to failed in Active Processes
                                    setProcesses(prevProcesses => 
                                      prevProcesses.map(process => 
                                        process.id === activeTab.id 
                                          ? { ...process, status: 'failed' as const } 
                                          : process
                                      )
                                    );
                                  });
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
          
          // Create a new topic in the knowledgebase
          const newTopicId = folderName.toLowerCase().replace(/\s+/g, '-');
          
          // Create a new topic folder structure with the proper type structure
          const newTopic = {
            id: newTopicId,
            name: folderName,
            icon: '📁', // Default folder icon
            children: [] as any[] // Type assertion to avoid type errors with children
          };
          
          // Add files to the new topic if any were provided
          if (files.length > 0) {
            files.forEach(file => {
              // Determine file type based on extension
              const fileExt = (file.name.split('.').pop() || '').toLowerCase();
              let fileType: 'document' | 'spreadsheet' | 'presentation' | 'pdf' | 'image' | 'code' | 'other' = 'other';
              
              if (['doc', 'docx', 'txt', 'md'].includes(fileExt)) {
                fileType = 'document';
              } else if (['xls', 'xlsx', 'csv'].includes(fileExt)) {
                fileType = 'spreadsheet';
              } else if (['ppt', 'pptx'].includes(fileExt)) {
                fileType = 'presentation';
              } else if (fileExt === 'pdf') {
                fileType = 'pdf';
              } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
                fileType = 'image';
              } else if (['js', 'ts', 'py', 'java', 'c', 'cpp', 'html', 'css'].includes(fileExt)) {
                fileType = 'code';
              }
              
              // Add file to the topic's children
              newTopic.children.push({
                id: `${newTopicId}-${file.name.toLowerCase().replace(/\s+/g, '-')}`,
                name: file.name,
                type: fileType
              } as any); // Type assertion to avoid type errors
            });
          }
          
          // Add the new topic to the knowledgebase data
          knowledgebaseData[0].children.push(newTopic as any); // Type assertion to fix TypeScript error
          
          // Make sure the topics folder is expanded
          if (!expandedFolders.includes('topics')) {
            setExpandedFolders([...expandedFolders, 'topics']);
          }
          
          // Show a success notification
          addNotification({
            id: generateUUID(),
            title: 'Folder Created',
            message: `New topic "${folderName}" has been added to your knowledgebase`, // Changed 'content' to 'message' to match type
            type: 'success',
            read: false,
            timestamp: new Date()
          });
          
          // Close the add modal
          handleCloseAddModal();
          
        }}
      />
    </div>
  );
}
