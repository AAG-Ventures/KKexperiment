"use client";

import Image from "next/image";
import Link from "next/link";
import FileContent from './components/FileContent';
import MarkdownViewer from './components/MarkdownViewer';
import { useState, useEffect, useRef, useMemo } from 'react';
import { FileDiff } from './components/file-diff/FileDiff';
import { FileList } from './components/file-list/FileList';
import styles from "./page.module.css";
import AddModal from "./components/AddModal";
import { DraggableWidgetContainer } from "./components/DraggableWidgetContainer";
import FileExplorer, { isFolder, FileExplorerProps } from './components/FileExplorer';
import { UploadIcon, FileIcon, SearchIcon, ShareIcon, FolderIcon, ChevronRightIcon, ChevronDownIcon, EditIcon, MessageIcon, ClockIcon, BellIcon, UserIcon, PlusIcon, SendIcon, HomeIcon, CheckIcon, CalendarIcon } from './components/Icons';
import DatePicker from './components/DatePicker';
import CalendarWidget from './components/CalendarWidget';
import { knowledgebaseData } from './components/KnowledgebaseSampleData';
// Import explicitly for client component
import { useRouter } from 'next/navigation';
import OnboardingModal from './components/Onboarding/OnboardingModal';

// Helper function to format dates
const formatDate = (date: Date | string | number) => {
  if (!date) return '';
  
  // Ensure we're working with a Date object
  let dateObj: Date;
  try {
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string' || typeof date === 'number') {
      dateObj = new Date(date);
    } else {
      return ''; // Invalid date format
    }
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return ''; // Invalid date
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return ''; // Return empty string on error
  }
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const isToday = dateObj.toDateString() === today.toDateString();
  const isTomorrow = dateObj.toDateString() === tomorrow.toDateString();
  
  if (isToday) return 'Today';
  if (isTomorrow) return 'Tomorrow';
  
  return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Type definitions
type TaskPriority = 'low' | 'medium' | 'high';

type Task = {
  id: string;
  text: string;
  completed: boolean;
  deadline?: Date; // Add deadline field
  description?: string;
  priority?: TaskPriority;
  attachments?: string[];
  comments?: { id: string; author: string; text: string; timestamp: Date }[];
};

type WidgetItem = {
  id: string;
  content: React.ReactNode;
  column?: string;
};

type ChatTab = {
  id: string;
  title: string;
  messages: { 
    sender: 'user' | 'bot', 
    content: string,
    thinking?: string // Optional thinking content for agent messages
  }[];
  active: boolean;
  isRenaming?: boolean;
  isProcessing?: boolean;
  sessionId?: string; // AI agent session ID
  agentId?: string; // ID of the agent for this chat
};

type Process = {
  id: string;
  name: string;
  type: 'chat';
  status: 'inProgress' | 'completed' | 'failed';
};

type Agent = {
  id: string;
  name: string;
  description: string;
  avatar: string;
  status: 'online' | 'offline' | 'busy';
  lastActive?: Date;
  createdAt: Date;
  capabilities: string[];
  author: string;
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
  
  // Dashboard widgets state
  const [dashboardItems, setDashboardItems] = useState<Record<string, WidgetItem[]>>({
    column1: [],
    column2: [],
    column3: []
  });
  
  // Notification panel state
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const notificationPanelRef = useRef<HTMLDivElement>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  
  // File handling state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  
  // Task detail panel state
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [newAttachment, setNewAttachment] = useState('');
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [datePickerTaskId, setDatePickerTaskId] = useState<string | null>(null);
  
  // New task state
  const [newTaskDeadline, setNewTaskDeadline] = useState<Date | null>(null);
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority | null>(null);
  const [showPrioritySelector, setShowPrioritySelector] = useState(false);
  
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
    { id: 'marketing-plan', title: 'MarketingPlan.md' }
  ]);
  const [activeTabId, setActiveTabId] = useState('dashboard');
  
  // Version history state for versioning sample
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0);
  
  // Initialize with empty states to prevent server  // Initialize chat and processes state
  const [chatTabs, setChatTabs] = useState<ChatTab[]>([]);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null); // Track current agent for chat
  const [processes, setProcesses] = useState<Process[]>([]);
  
  // State for resizable chat/dashboard
  const [isDragging, setIsDragging] = useState(false);
  const defaultChatWidth = 350; // Default/minimum width of chat section
  const [chatWidth, setChatWidth] = useState(defaultChatWidth);
  const dragDividerRef = useRef<HTMLDivElement>(null);
  
  // Initialize agents state
  const [userAgents, setUserAgents] = useState<Agent[]>([  
    {
      id: 'agent-onboarding',
      name: 'Onboarding Guide',
      description: 'Helps you get started with the dashboard and understand its features',
      avatar: '🧭',
      status: 'online',
      lastActive: new Date(), // Now
      createdAt: new Date(),
      capabilities: ['Tutorial', 'Help', 'Documentation', 'Feature demonstration'],
      author: 'ME'
    },
    {
      id: 'agent-1',
      name: 'Research Assistant',
      description: 'Helps with research tasks and summarizing information',
      avatar: '🔍',
      status: 'online',
      lastActive: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
      capabilities: ['Web search', 'Document analysis', 'Summarization'],
      author: 'ME'
    },
    {
      id: 'agent-2',
      name: 'Data Analyst',
      description: 'Specializes in data processing and visualization',
      avatar: '📊',
      status: 'offline',
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // 2 weeks ago
      capabilities: ['Data processing', 'Visualization', 'Statistical analysis'],
      author: 'ME'
    },
    {
      id: 'agent-3',
      name: 'Workspace Manager',
      description: 'Manages your workspace, organizes files, and helps with productivity tasks',
      avatar: '🤖',
      status: 'online',
      lastActive: new Date(), // Now
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      capabilities: ['File organization', 'Task management', 'Workspace optimization'],
      author: 'ME'
    },
  ]);
  
  // Track expanded folders in knowledgebase
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  
  // Function to toggle folder expansion (for special folders like Topics and Shared Space)
  const toggleFolderExpansion = (folderId: string) => {
    console.log(`Toggling folder: ${folderId}`);
    
    // Special case for the Topics folder - either show it with all subtopics or hide all
    if (folderId === 'topics') {
      if (expandedFolders.includes('topics')) {
        // If Topics is currently expanded, collapse it (remove it from expanded folders)
        console.log('Closing Topics folder');
        setExpandedFolders(expandedFolders.filter(id => id !== 'topics'));
      } else {
        // If Topics is currently collapsed, expand it (add it to expanded folders)
        console.log('Opening Topics folder');
        setExpandedFolders([...expandedFolders, 'topics']);
      }
      return;
    }
    
    // Special case for the Shared Space folder - either show it with all subtopics or hide all
    if (folderId === 'shared') {
      if (expandedFolders.includes('shared')) {
        // If Shared Space is currently expanded, collapse it (remove it from expanded folders)
        console.log('Closing Shared Space folder');
        setExpandedFolders(expandedFolders.filter(id => id !== 'shared'));
      } else {
        // If Shared Space is currently collapsed, expand it (add it to expanded folders)
        console.log('Opening Shared Space folder');
        setExpandedFolders([...expandedFolders, 'shared']);
      }
      return;
    }
    
    // For all other folders, use the standard logic
    setExpandedFolders(prev => {
      if (prev.includes(folderId)) {
        // Remove folder from expanded list to collapse it
        return prev.filter(id => id !== folderId);
      } else {
        // Add folder to expanded list to expand it
        return [...prev, folderId];
      }
    });
  };
  
  // Track active topic in knowledgebase
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  
  // Chat tab input reference
  const renameInputRef = useRef<HTMLInputElement>(null);
  
  // Handle divider dragging
  useEffect(() => {
    // Skip if not dragging
    if (!isDragging) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && dragDividerRef.current) {
        const containerRect = dragDividerRef.current.parentElement?.getBoundingClientRect();
        if (containerRect) {
          // Get current position - only allow expanding, not shrinking below default
          const currentMouseX = e.clientX;
          const dividerPosition = window.innerWidth - defaultChatWidth;
          
          // Only allow expanding (dragging left), not shrinking below default
          if (currentMouseX <= dividerPosition) {
            // Calculate new width based on mouse position
            const newWidth = Math.max(
              defaultChatWidth, // Min width (default width)
              Math.min(
                window.innerWidth - 270, // Max width (window width minus left sidebar)
                window.innerWidth - currentMouseX + 3 // Position plus offset
              )
            );
            setChatWidth(newWidth);
          } else {
            // Reset to default if trying to make it smaller
            setChatWidth(defaultChatWidth);
          }
        }
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Set cursor style for entire document while dragging
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none'; // Prevent text selection while dragging
    
    return () => {
      // Clean up
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  // Effect to run only client-side
  useEffect(() => {
    // For demo purposes, clear localStorage tasks to show our updated task list
    localStorage.removeItem('dashboard_tasks');
    
    // Initialize tasks from localStorage if available
    const savedTasks = localStorage.getItem('dashboard_tasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        setTasks(parsedTasks);
      } catch (e) {
        console.error('Error parsing saved tasks:', e);
      }
    }
    
    // Set default agent (Onboarding Guide)
    const defaultAgent = userAgents.find(agent => agent.name === 'Onboarding Guide') || userAgents[0];
    setCurrentAgent(defaultAgent);
    
    // Initialize chat tabs or create a default one
    if (chatTabs.length === 0) {
      const initialChatId = generateUUID();
      const sessionId = generateUUID(); // Create a unique session ID for this chat
      setChatTabs([{
        id: initialChatId,
        title: 'Onboarding Guide',
        messages: [{ sender: 'bot', content: "Welcome to the Dashboard! 👋 I'm your Onboarding Guide and I'm here to help you get started. Here are some things you can do:\n\n• Explore your Knowledge Base in the left sidebar\n• Create and manage tasks in the Tasks widget\n• Chat with different AI agents for specialized help\n• Add widgets to customize your dashboard\n\nWhat would you like to learn about first?" }],
        active: true,
        isProcessing: false,
        sessionId: sessionId, // Store the session ID for conversation continuity
        agentId: defaultAgent.id // Store the agent ID for this chat
      }]);
      
      // Add initial chat to Active Processes
      setProcesses([{
        id: initialChatId,
        name: 'Onboarding Guide',
        type: 'chat',
        status: 'inProgress'
      }]);
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

  // Function to handle sending a message
  const handleSendMessage = (userMsg: string, activeTab: ChatTab) => {
    // Add user message
    const newMessages = [
      ...activeTab.messages,
      { sender: 'user' as const, content: userMsg }
    ];

    // Update the active tab with user message and set as processing
    setChatTabs(prevTabs => 
      prevTabs.map(tab => {
        if (tab.id === activeTab.id) {
          return { ...tab, messages: newMessages, isProcessing: true };
        }
        return tab;
      })
    );
    
    // Scroll to bottom after user sends a message
    setTimeout(() => {
      const chatContainer = document.getElementById('chatBodyContainer');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 50);
    
    // Ensure the processing state is visible
    setTimeout(() => {
      // Double-check that the tab is still in processing state
      setChatTabs(tabs => {
        return tabs.map(tab => tab.id === activeTab.id && !tab.isProcessing ? 
          { ...tab, isProcessing: true } : tab);
      });
    }, 100);
    
    // Get or create a session ID for this chat
    const chatSessionId = activeTab.sessionId || generateUUID();
    
    // Call the AI agent API
    sendMessageToAIAgent(userMsg, chatSessionId)
      .then(response => {
        console.log('AI agent response:', response);
        
        // Add bot message with response from the AI agent
        setChatTabs(prevTabs => {
          return prevTabs.map(tab => {
            if (tab.id === activeTab.id) {
              const botReply = {
                sender: 'bot' as const, 
                content: response,
                thinking: `Processing user input: "${userMsg}"

Analyzing context...

Identifying key points:
1. User is asking about: ${userMsg}
2. Relevant context: Dashboard environment

Formulating response based on available information...`
              };
              return { 
                ...tab, 
                sessionId: chatSessionId, // Store sessionId for conversation continuity
                messages: [...tab.messages, botReply],
                isProcessing: false 
              };
            }
            return tab;
          });
        });
        
        // Scroll to the bottom after message is added
        setTimeout(() => {
          const chatContainer = document.getElementById('chatBodyContainer');
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        }, 100);
        
        // Update process status to completed
        setProcesses(prevProcesses => 
          prevProcesses.map(process => 
            process.id === activeTab.id ? 
              { ...process, status: 'completed' as const } : 
              process
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
        
        // Scroll to bottom even on error response
        setTimeout(() => {
          const chatContainer = document.getElementById('chatBodyContainer');
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        }, 100);
        
        // Update status to failed
        setProcesses(prevProcesses => 
          prevProcesses.map(process => 
            process.id === activeTab.id ? 
              { ...process, status: 'failed' as const } : 
              process
          )
        );
      });
    
    // Update status in Active Processes to in progress
    setProcesses(prevProcesses => 
      prevProcesses.map(process => 
        process.id === activeTab.id 
          ? { ...process, status: 'inProgress' as const } 
          : process
      )
    );
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
      // Default tasks with the specific dates requested
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const inThreeDays = new Date();
      inThreeDays.setDate(inThreeDays.getDate() + 3);
      
      // Create specific dates (May 12, May 19, and June 30)
      const may12 = new Date(2025, 4, 12); // Note: months are 0-indexed
      const may19 = new Date(2025, 4, 19);
      const june30 = new Date(2025, 5, 30);
      
      const defaultTasks = [
        { 
          id: '1', 
          text: 'Design dashboard UI', 
          completed: false, 
          deadline: tomorrow,
          description: 'Create wireframes and design mockups for the main dashboard interface. Focus on widget layout, color scheme, and responsive design. Include considerations for dark mode and accessibility.',

          priority: 'high' as TaskPriority,
          attachments: ['dashboard_wireframe.fig', 'color_palette.pdf'],
          comments: [
            { 
              id: '101', 
              author: 'Kotryna', 
              text: 'I like the current direction. Can we add more emphasis on the data visualization widgets?', 
              timestamp: new Date(2025, 4, 3) 
            },
            { 
              id: '102', 
              author: 'Karina', 
              text: 'Will incorporate more visualization options in the next iteration.', 
              timestamp: new Date(2025, 4, 4) 
            }
          ]
        },
        { 
          id: '2', 
          text: 'Review agent history', 
          completed: false, 
          deadline: inThreeDays,
          description: '',
          priority: 'medium' as TaskPriority,
          attachments: [],
          comments: []
        },
        { 
          id: '3', 
          text: 'Create Onboarding Guide visuals', 
          completed: false, 
          deadline: may12,
          description: 'Create visual guides and tutorials for new users',
          priority: 'high' as TaskPriority,
          attachments: [],
          comments: []
        },
        { 
          id: '4', 
          text: 'Create Marketing plan', 
          completed: false, 
          deadline: may19,
          description: '',
          priority: 'medium' as TaskPriority,
          attachments: [],
          comments: []
        },
        { 
          id: '5', 
          text: 'Train onboarding Agent', 
          completed: false, 
          deadline: may12,
          description: 'Develop training materials and datasets for the Onboarding Guide agent',
          priority: 'medium' as TaskPriority,
          attachments: [],
          comments: []
        },
        { 
          id: '6', 
          text: 'Make chat size adjustable', 
          completed: false, 
          deadline: may19,
          description: 'Implement draggable resizing for the chat interface',
          priority: 'low' as TaskPriority,
          attachments: [],
          comments: []
        },
        { 
          id: '7', 
          text: 'Update Agents Marketplace', 
          completed: false, 
          deadline: june30,
          description: 'Enhance the marketplace with new features and agents',
          priority: 'medium' as TaskPriority,
          attachments: [],
          comments: []
        },
        { 
          id: '8', 
          text: 'Create Workflow builder', 
          completed: false, 
          deadline: june30,
          description: 'Develop a visual workflow builder for automating tasks',
          priority: 'high' as TaskPriority,
          attachments: [],
          comments: []
        },
        { 
          id: '9', 
          text: 'Implement login', 
          completed: false, 
          deadline: inThreeDays,
          description: 'Add authentication and user management',
          priority: 'high' as TaskPriority,
          attachments: [],
          comments: []
        },
      ];
      setTasks(defaultTasks as Task[]);
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
  
  // Helper function to format task deadlines
  const formatDeadline = (dateInput: Date | string | number): string => {
    // Ensure the input is converted to a proper Date object
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    
    // Handle invalid dates
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Clear time portion for date comparison
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
    
    // Check if the deadline is today or tomorrow
    if (dateOnly.getTime() === nowOnly.getTime()) {
      return 'Today';
    } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
      return 'Tomorrow';
    } else {
      // Format dates within the next week as day names
      const daysDiff = Math.floor((dateOnly.getTime() - nowOnly.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff < 7) {
        const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
        return date.toLocaleDateString(undefined, options);
      } else {
        // Format with month and day for dates further away
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
      }
    }
  };
  
  // Helper functions for deadline urgency
  const isDeadlineUrgent = (dateInput: Date | string | number): boolean => {
    // Ensure the input is converted to a proper Date object
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    
    // Handle invalid dates
    if (isNaN(date.getTime())) {
      return false;
    }
    
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Clear time portion for date comparison
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
    
    // Return true if deadline is today or tomorrow
    return dateOnly.getTime() === nowOnly.getTime() || dateOnly.getTime() === tomorrowOnly.getTime();
  };
  
  const isDeadlineSoon = (dateInput: Date | string | number): boolean => {
    // Ensure the input is converted to a proper Date object
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    
    // Handle invalid dates
    if (isNaN(date.getTime())) {
      return false;
    }
    
    const now = new Date();
    
    // Clear time portion for date comparison
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Calculate difference in days
    const daysDiff = Math.floor((dateOnly.getTime() - nowOnly.getTime()) / (1000 * 60 * 60 * 24));
    
    // Return true if deadline is within 2-4 days (not today/tomorrow, but still coming up soon)
    return daysDiff > 1 && daysDiff <= 4;
  };
  
  // Helper function to identify normal deadlines (more than 4 days away)
  const isDeadlineNormal = (dateInput: Date | string | number): boolean => {
    // Ensure the input is converted to a proper Date object
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    
    // Handle invalid dates
    if (isNaN(date.getTime())) {
      return false;
    }
    
    const now = new Date();
    
    // Clear time portion for date comparison
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Calculate difference in days
    const daysDiff = Math.floor((dateOnly.getTime() - nowOnly.getTime()) / (1000 * 60 * 60 * 24));
    
    // Return true if deadline is more than 4 days away
    return daysDiff > 4;
  };

  // Function to toggle task completion status
  const toggleTaskCompletion = (id: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    localStorage.setItem('dashboard_tasks', JSON.stringify(updatedTasks));
  };
  
  // Function to update task description
  const updateTaskDescription = (taskId: string, description: string) => {
    if (!description.trim()) return;
    
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, description } : task
    );
    setTasks(updatedTasks);
    localStorage.setItem('dashboard_tasks', JSON.stringify(updatedTasks));
  };
  
  // Function to add a comment to a task
  const addTaskComment = (taskId: string) => {
    if (!newComment.trim()) return;
    
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const comment = {
          id: `comment-${Date.now()}`,
          author: 'You', // In a real app, get the current user
          text: newComment,
          timestamp: new Date()
        };
        
        return {
          ...task,
          comments: task.comments ? [...task.comments, comment] : [comment]
        };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    localStorage.setItem('dashboard_tasks', JSON.stringify(updatedTasks));
    setNewComment('');
  };
  
  // Function to update a task's deadline
  const updateTaskDeadline = (taskId: string, newDeadline: Date) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          deadline: newDeadline
        };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    localStorage.setItem('dashboard_tasks', JSON.stringify(updatedTasks));
    
    // Close the date picker but keep task details panel open
    setDatePickerVisible(false);
    setDatePickerTaskId(null);
    
    // Make sure the selected task is still active after date selection
    if (selectedTaskId !== taskId) {
      setSelectedTaskId(taskId);
    }
  };
  
  // Function to delete a task
  const deleteTask = (taskId: string) => {
    // First confirm the user wants to delete the task
    if (confirm('Are you sure you want to delete this task?')) {
      // Filter out the task with the given ID
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      
      // Update state and localStorage
      setTasks(updatedTasks);
      localStorage.setItem('dashboard_tasks', JSON.stringify(updatedTasks));
      
      // Close the task detail panel
      setSelectedTaskId(null);
    }
  };

  // Function to add an attachment to a task
  const addTaskAttachment = async (taskId: string) => {
    try {
      // Use the File System Access API to let user select a file
      if ('showOpenFilePicker' in window) {
        // Define proper type for FileSystemFileHandle
        interface FileSystemFileHandle {
          getFile(): Promise<File>;
        }
        
        const fileHandle = await (window as unknown as {
          showOpenFilePicker(options: object): Promise<FileSystemFileHandle[]>;
        }).showOpenFilePicker({
          multiple: false,
          types: [
            {
              description: 'All Files',
              accept: {'*/*': []},
            },
          ],
        });
        
        if (fileHandle && fileHandle[0]) {
          const file = await fileHandle[0].getFile();
          updateTaskWithAttachment(taskId, file.name);
        }
      } else {
        // Fallback for browsers without File System Access API
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = (e) => {
          const target = e.target as HTMLInputElement;
          const file = target.files?.[0];
          if (file) {
            updateTaskWithAttachment(taskId, file.name);
          }
        };
        input.click();
      }
    } catch (error) {
      // User cancelled the file picker or another error occurred
      console.error('Error selecting file:', error);
    }
  };
  
  // Helper function to update task with a new attachment
  const updateTaskWithAttachment = (taskId: string, fileName: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          attachments: task.attachments ? [...task.attachments, fileName] : [fileName]
        };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    localStorage.setItem('dashboard_tasks', JSON.stringify(updatedTasks));
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
  
  // Function to format notification timestamp as relative time
  const formatNotificationTime = (timestampInput: Date | string | number): string => {
    // Return empty string during server-side rendering
    if (typeof window === 'undefined') {
      return '';
    }
    
    // Ensure timestamp is a valid Date object
    const timestamp = timestampInput instanceof Date ? timestampInput : new Date(timestampInput);
    
    // Check if the date is valid
    if (isNaN(timestamp.getTime())) {
      return 'Invalid date';
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
    setShowPrioritySelector(false);
    setNewTaskPriority(null);
    setNewTaskDeadline(null);
    
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
      const newTask: Task = {
        id: `task-${Date.now()}`,
        text: newTaskText.trim(),
        completed: false,
        ...(newTaskDeadline && { deadline: newTaskDeadline }),
        ...(newTaskPriority && { priority: newTaskPriority })
      };
      
      setTasks(prevTasks => [...prevTasks, newTask]);
      
      // Save to localStorage
      const updatedTasks = [...tasks, newTask];
      localStorage.setItem('dashboard_tasks', JSON.stringify(updatedTasks));
    }
    
    // Reset the adding task state
    setIsAddingTask(false);
    setNewTaskText('');
    setShowPrioritySelector(false);
    setNewTaskPriority(null);
    setNewTaskDeadline(null);
  };
  
  // Function to set date for a new task
  const setNewTaskDate = (date: Date) => {
    setNewTaskDeadline(date);
    setDatePickerVisible(false);
    setShowPrioritySelector(true);
  };
  
  // Function to set priority for a new task
  const setTaskPriority = (priority: TaskPriority) => {
    setNewTaskPriority(priority);
    setShowPrioritySelector(false);
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
    
    // Also switch to the corresponding tab if it exists
    if (openTabs.some(tab => tab.id === topicId)) {
      setActiveTabId(topicId);
    } else {
      // If tab doesn't exist (like removed 'health' tab), use dashboard as fallback
      setActiveTabId('dashboard');
    }
  };
  
  // Function to return to main Topics view in knowledgebase
  const backToAllTopics = () => {
    setActiveTopicId(null);
    setExpandedFolders(['topics']);
  };
  
  // Function to handle file drops between folders in the knowledgebase
  const handleFileDrop = (fileId: string, targetFolderId: string) => {
    console.log(`Moving file ${fileId} to folder ${targetFolderId}`);
    
    // Find the file in the knowledgebase data
    let fileToMove: any = null;
    let parentFolder: any = null;
    let fileIndex = -1;
    
    // Helper function to recursively find the file
    const findFile = (items: any[], parent: any = null) => {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.id === fileId) {
          fileToMove = item;
          parentFolder = parent;
          fileIndex = i;
          return true;
        }
        
        if (item.children) {
          if (findFile(item.children, item)) {
            return true;
          }
        }
      }
      return false;
    };
    
    // Helper function to find the target folder
    const findTargetFolder = (items: any[]): any => {
      for (const item of items) {
        if (item.id === targetFolderId) {
          return item;
        }
        
        if (item.children) {
          const found = findTargetFolder(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    // Search for the file to move
    findFile(knowledgebaseData);
    
    if (!fileToMove) {
      console.error('File not found');
      return;
    }
    
    // Find the target folder
    const targetFolder = findTargetFolder(knowledgebaseData);
    
    if (!targetFolder || !targetFolder.children) {
      console.error('Target folder not found or is not a folder');
      return;
    }
    
    // Don't move if it's the same folder
    if (parentFolder && parentFolder.id === targetFolder.id) {
      console.log('File is already in this folder');
      return;
    }
    
    // Remove the file from its current location
    if (parentFolder && parentFolder.children) {
      parentFolder.children.splice(fileIndex, 1);
    } else {
      // File is at the root level
      knowledgebaseData.splice(fileIndex, 1);
    }
    
    // Add the file to the target folder
    targetFolder.children.push(fileToMove);
    
    // Force a re-render by creating a new reference
    const knowledgebaseDataCopy = [...knowledgebaseData];
    knowledgebaseData.length = 0;
    knowledgebaseData.push(...knowledgebaseDataCopy);
    
    // Show notification
    addNotification({
      id: `notif-${Date.now()}`,
      title: 'File Moved',
      message: `${fileToMove.name} has been moved to ${targetFolder.name}`,
      timestamp: new Date(),
      read: false,
      type: 'success',
    });
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
        // Don't close the modal for file - the AddModal component will show FileUploadModal
        return; // Return early to prevent closing the modal
        
      case 'widget':
        // Don't close the modal for widget - the AddModal component will show WidgetSelectModal
        return; // Return early to prevent closing the modal
        
      case 'agent':
        // Don't close the modal for agent - the AddModal component will show AgentBrowserModal
        console.log('Showing agent browser modal');
        return; // Return early to prevent closing the modal
        
      case 'workflow':
        // Logic for creating a workflow
        console.log('Creating a new workflow');
        handleCloseAddModal();
        break;
        
      case 'custom':
        // Logic for custom/other
        console.log('Creating a custom item');
        handleCloseAddModal();
        break;
        
      default:
        // For all other options, close the modal
        handleCloseAddModal();
        break;
    }
  };
  
  // Handle widget selection 
  const handleWidgetSelect = (widgetType: 'calendar' | 'myTasks' | 'activeProcesses' | 'myAgents') => {
    console.log(`Selected widget type: ${widgetType}`);
    
    // Create widget content based on the selected type
    let widgetContent: React.ReactNode;
    
    switch (widgetType) {
      case 'calendar':
        widgetContent = (
          <CalendarWidget 
            tasks={tasks.filter(task => task.deadline).map(task => ({
              id: task.id,
              text: task.text,
              deadline: task.deadline || new Date(),
              priority: task.priority || 'medium',
              completed: task.completed
            }))}
            onSelectDate={(date) => {
              console.log('Calendar date selected:', date);
            }}
            onSelectTask={(taskId) => {
              setSelectedTaskId(taskId);
            }}
          />
        );
        break;
        

        
      case 'myTasks':
        widgetContent = (
          <div className={styles.tasksWidget}>
            <h3>My Tasks</h3>
            <div className={styles.tasksList}>
              {tasks.slice(0, 3).map(task => (
                <div key={task.id} className={styles.taskItem}>
                  <input 
                    type="checkbox" 
                    checked={task.completed} 
                    onChange={() => toggleTaskCompletion(task.id)}
                  />
                  <span className={task.completed ? styles.completedTask : ''}>
                    {task.text}
                  </span>
                </div>
              ))}
              {tasks.length === 0 && (
                <p>No tasks yet</p>
              )}
            </div>
            <button className={styles.viewAllButton}>
              View All Tasks
            </button>
          </div>
        );
        break;
        
      case 'activeProcesses':
        widgetContent = (
          <div className={styles.processesWidget}>
            <h3>Active Processes</h3>
            <div className={styles.processesList}>
              {processes.filter(p => p.status === 'inProgress').slice(0, 3).map(process => (
                <div key={process.id} className={styles.processItem}>
                  <span>{process.name}</span>
                  <div className={styles.processStatus}>
                    <div className={styles.processingIndicator}></div>
                    Processing
                  </div>
                </div>
              ))}
              {processes.filter(p => p.status === 'inProgress').length === 0 && (
                <p>No active processes</p>
              )}
            </div>
          </div>
        );
        break;
        
      case 'myAgents':
        widgetContent = (
          <div className={styles.agentsWidget}>
            <h3>My Agents</h3>
            <div className={styles.agentsList}>
              {chatTabs.slice(0, 3).map(chatTab => (
                <div key={chatTab.id} className={styles.agentItem}>
                  <div className={styles.agentIcon}>
                    <UserIcon size={20} />
                  </div>
                  <div className={styles.agentInfo}>
                    <div className={styles.agentName}>{chatTab.title}</div>
                    <div className={styles.agentStatus}>
                      {chatTab.isProcessing ? 'Processing...' : 'Ready'}
                    </div>
                  </div>
                  <button className={styles.agentActionButton}>
                    <MessageIcon size={16} />
                  </button>
                </div>
              ))}
              {chatTabs.length === 0 && (
                <p>No agents available</p>
              )}
            </div>
            <button className={styles.viewAllButton}>
              Manage Agents
            </button>
          </div>
        );
        break;
    }
    
    // Add the new widget to the dashboard
    const newWidgetId = `widget-${Date.now()}`;
    const newWidget = { id: newWidgetId, content: widgetContent };
    
    // Add to first column for simplicity
    const columnId = 'column1';
    const columnWidgets = dashboardItems[columnId] || [];
    
    // Create the widget with drag-and-drop enabled
    const draggableWidget = {
      ...newWidget,
      column: columnId,
      isDraggable: true
    };
    
    setDashboardItems(prev => ({
      ...prev,
      [columnId]: [...columnWidgets, draggableWidget]
    }));
    
    // Show confirmation notification
    addNotification({
      id: generateUUID(),
      title: 'Widget Added',
      message: `New ${widgetType} widget has been added to your dashboard`,
      type: 'success',
      read: false,
      timestamp: new Date()
    });
    
    handleCloseAddModal();
  };
  
  // Add drag and drop event listeners when component mounts
  useEffect(() => {
    const dashboard = dashboardRef.current;
    if (!dashboard) return;
    
    // Handler for dragging widgets from the selection modal
    const handleWidgetDragStart = (e: DragEvent) => {
      if (e.target && (e.target as HTMLElement).classList.contains(styles.widgetCard)) {
        const widgetId = (e.target as HTMLElement).dataset.widgetId;
        if (widgetId) {
          e.dataTransfer?.setData('text/plain', `widget:${widgetId}`);
          e.dataTransfer?.setDragImage(e.target as Element, 50, 50);
        }
      }
    };

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
      {/* Onboarding Modal */}
      <OnboardingModal />
      {/* Top Bar */}
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
            
            {/* Profile Icon - Without text */}
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
          
          {/* Notification Panel Popup */}
          {isNotificationPanelOpen && (
            <div ref={notificationPanelRef} className={styles.notificationPanel} style={{zIndex: 2000}}>
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
                    [...notifications].sort((a, b) => {
                      // Ensure timestamps are proper Date objects
                      const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
                      const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
                      return bTime - aTime;
                    }).slice(0, 3)
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
        </div>
      </header>

      {/* Main Layout */}
      <div className={`${styles.layout} ${isSidebarCollapsed ? styles.layoutCollapsed : ''}`}>
        {/* Sticky Create Button - Apply hideWhenNotifications class when notification panel is open */}
        <button 
          className={`${styles.stickyCreateButton} ${isNotificationPanelOpen ? styles.hideWhenNotifications : ''}`}
          onClick={handleOpenAddModal}
          aria-label="Create new item"
        >
          <PlusIcon size={20} />
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
                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                            onClick={() => {
                              // Direct toggle for the topics folder
                              toggleFolderExpansion('topics');
                            }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                              {expandedFolders.includes('topics') ? 
                                <ChevronDownIcon size={18} /> : 
                                <ChevronRightIcon size={18} />
                              }
                            </span>
                            Knowledgebase
                          </h3>
                        </div>
                        {/* File Explorer Component */}
                        <div className={styles.fileExplorerContainer}>
                          <FileExplorer 
                            data={knowledgebaseData}
                            expandedFolders={expandedFolders}
                            activeTopicId={activeTopicId}
                            onBackToTopics={backToAllTopics}
                            onToggleFolder={toggleFolderExpansion}
                            onFileDrop={handleFileDrop}
                            onSelect={(item) => {
                              console.log('Selected:', item.name);
                              
                              // Special handling for versioning sample file
                              if (!isFolder(item) && item.id === 'versioning-sample') {
                                console.log('Opening file versioning sample');
                                
                                // Check if versioning-sample tab already exists
                                const versioningTabExists = openTabs.some(tab => tab.id === 'versioning-sample');
                                
                                if (!versioningTabExists) {
                                  // Add new versioning tab
                                  setOpenTabs(prev => [...prev, {
                                    id: 'versioning-sample',
                                    title: 'Versioning Sample'
                                  }]);
                                }
                                
                                // Switch to versioning tab
                                setActiveTabId('versioning-sample');
                                return;
                              }
                              
                              // If it's a topic folder, set it as root
                              if (isFolder(item) && 
                                 (item.id.includes('work') || 
                                  item.id.includes('health') || 
                                  item.id.includes('finance') || 
                                  item.id.includes('travel') || 
                                  item.id.includes('hobbies'))) {
                                setTopicAsRoot(item.id);
                              }
                            }}
                          />
                        </div>
                      </aside>
                    )
                  },
                  {
                    id: 'my-agents',
                    content: (
                      <aside className={styles.activeProcessesWidget}>
                        <div className={styles.widgetHeader}>
                          <h3>My Agents</h3>
                          <button 
                            className={styles.newTabButton}
                            onClick={() => {
                              setIsAddModalOpen(true);
                              // Pre-select the agent option
                              handleOptionSelect('agent');
                            }}
                            title="Add Agent"
                            type="button"
                          >
                            <PlusIcon size={20} />
                          </button>
                        </div>
                        <div className={styles.processList}>
                          {userAgents.length > 0 ? (
                            userAgents.map(agent => (
                              <div 
                                key={agent.id} 
                                className={styles.processItem}
                                onClick={() => {
                                  // Open a chat with this agent
                                  console.log(`Starting chat with agent: ${agent.name}`);
                                  
                                  // Set the current agent
                                  setCurrentAgent(agent);
                                  
                                  // Create a new chat tab for this agent if it doesn't exist
                                  const agentChatId = `chat-${agent.id}`;
                                  const existingTab = chatTabs.find(tab => tab.id === agentChatId);
                                  
                                  if (existingTab) {
                                    // Just make the tab active
                                    setChatTabs(prevTabs => 
                                      prevTabs.map(tab => ({
                                        ...tab,
                                        active: tab.id === agentChatId
                                      }))
                                    );
                                  } else {
                                    // Create new tab and set it as active
                                    const newTab: ChatTab = {
                                      id: agentChatId,
                                      title: agent.name,
                                      messages: [{ 
                                        sender: 'bot' as const, 
                                        content: `Hello! I'm ${agent.name}. How can I assist you today?` 
                                      }],
                                      active: true,
                                      isRenaming: false,
                                      isProcessing: false,
                                      sessionId: generateUUID(),
                                      agentId: agent.id
                                    };
                                    
                                    setChatTabs(prevTabs => [
                                      ...prevTabs.map(tab => ({ ...tab, active: false })),
                                      newTab
                                    ]);
                                    
                                    // Add to Active Processes
                                    const processExists = processes.some(p => p.id === agentChatId);
                                    if (!processExists) {
                                      setProcesses(prev => [
                                        ...prev,
                                        {
                                          id: agentChatId,
                                          name: `Chat with ${agent.name}`,
                                          type: 'chat',
                                          status: 'inProgress'
                                        }
                                      ]);
                                    }
                                  }
                                }}
                              >

                                <div className={styles.processDetails}>
                                  <div className={styles.processName}>
                                    <span style={{ marginRight: '8px' }}>{agent.avatar}</span>
                                    {agent.name}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className={styles.emptyState}>No agents available</div>
                          )}
                        </div>
                        {/* Widget footer removed */}
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
        <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.mainContentExpanded : ''}`} style={{ flex: 1 }}>
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
          ) : activeTabId === 'versioning-sample' ? (
            /* Show File Versioning Sample */
            <div className={styles.fileViewerContainer}>
              <div className={styles.fileViewerHeader}>
                <h2>File Versioning Sample</h2>
                <div className={styles.fileViewerActions}>
                  <button 
                    className={styles.fileViewerButton}
                    onClick={() => {
                      // Remove the versioning tab
                      setOpenTabs(prev => prev.filter(tab => tab.id !== 'versioning-sample'));
                      // Go back to Dashboard tab
                      setActiveTabId('dashboard');
                    }}
                  >
                    Close file
                  </button>
                </div>
              </div>
              
              <div className={styles.fileViewerContent}>
                {/* File Versioning Content */}
                <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
                  {/* Sample Diff Data */}
                  {(() => {
                    // File versions history
                    const fileVersions = [
                      {
                        version: 'v3 (current)',
                        timestamp: new Date(),
                        author: 'AI Assistant',
                        changes: 'Added dark theme support and made showSidebar optional',
                        diffLines: [
                          { type: 'unchanged', content: 'import React from "react";', lineNumber: 1, oldLineNumber: 1 },
                          { type: 'unchanged', content: 'import styles from "./dashboard.module.css";', lineNumber: 2, oldLineNumber: 2 },
                          { type: 'unchanged', content: '', lineNumber: 3, oldLineNumber: 3 },
                          { type: 'unchanged', content: 'interface DashboardProps {', lineNumber: 4, oldLineNumber: 4 },
                          { type: 'unchanged', content: '  title: string;', lineNumber: 5, oldLineNumber: 5 },
                          { type: 'removed', content: '  showSidebar: boolean;', lineNumber: 6, oldLineNumber: 6 },
                          { type: 'added', content: '  showSidebar?: boolean;', lineNumber: 6 },
                          { type: 'added', content: '  theme?: "light" | "dark";', lineNumber: 7 },
                          { type: 'unchanged', content: '}', lineNumber: 8, oldLineNumber: 7 },
                          { type: 'unchanged', content: '', lineNumber: 9, oldLineNumber: 8 },
                          { type: 'unchanged', content: 'const Dashboard: React.FC<DashboardProps> = ({', lineNumber: 10, oldLineNumber: 9 },
                          { type: 'unchanged', content: '  title,', lineNumber: 11, oldLineNumber: 10 },
                          { type: 'removed', content: '  showSidebar', lineNumber: 12, oldLineNumber: 11 },
                          { type: 'added', content: '  showSidebar = true,', lineNumber: 12 },
                          { type: 'added', content: '  theme = "dark"', lineNumber: 13 },
                          { type: 'unchanged', content: '}) => {', lineNumber: 14, oldLineNumber: 12 },
                          { type: 'unchanged', content: '  return (', lineNumber: 15, oldLineNumber: 13 },
                          { type: 'unchanged', content: '    <div className={styles.dashboard}>', lineNumber: 16, oldLineNumber: 14 },
                          { type: 'unchanged', content: '      <header className={styles.header}>', lineNumber: 17, oldLineNumber: 15 },
                          { type: 'unchanged', content: '        <h1>{title}</h1>', lineNumber: 18, oldLineNumber: 16 },
                          { type: 'unchanged', content: '      </header>', lineNumber: 19, oldLineNumber: 17 },
                          { type: 'unchanged', content: '      <main className={styles.main}>', lineNumber: 20, oldLineNumber: 18 },
                          { type: 'removed', content: '        {showSidebar && <div className={styles.sidebar}>Sidebar</div>}', lineNumber: 21, oldLineNumber: 19 },
                          { type: 'added', content: '        {showSidebar && <div className={`${styles.sidebar} ${styles[theme]}`}>Sidebar</div>}', lineNumber: 21 },
                          { type: 'unchanged', content: '        <div className={styles.content}>Content</div>', lineNumber: 22, oldLineNumber: 20 },
                          { type: 'unchanged', content: '      </main>', lineNumber: 23, oldLineNumber: 21 },
                          { type: 'unchanged', content: '    </div>', lineNumber: 24, oldLineNumber: 22 },
                          { type: 'unchanged', content: '  );', lineNumber: 25, oldLineNumber: 23 },
                        ]
                      },
                      {
                        version: 'v2',
                        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
                        author: 'Jane Developer',
                        changes: 'Improved header styling and added content container',
                        diffLines: [
                          { type: 'unchanged', content: 'import React from "react";', lineNumber: 1, oldLineNumber: 1 },
                          { type: 'unchanged', content: 'import styles from "./dashboard.module.css";', lineNumber: 2, oldLineNumber: 2 },
                          { type: 'unchanged', content: '', lineNumber: 3, oldLineNumber: 3 },
                          { type: 'unchanged', content: 'interface DashboardProps {', lineNumber: 4, oldLineNumber: 4 },
                          { type: 'unchanged', content: '  title: string;', lineNumber: 5, oldLineNumber: 5 },
                          { type: 'unchanged', content: '  showSidebar: boolean;', lineNumber: 6, oldLineNumber: 6 },
                          { type: 'unchanged', content: '}', lineNumber: 7, oldLineNumber: 7 },
                          { type: 'unchanged', content: '', lineNumber: 8, oldLineNumber: 8 },
                          { type: 'unchanged', content: 'const Dashboard: React.FC<DashboardProps> = ({', lineNumber: 9, oldLineNumber: 9 },
                          { type: 'unchanged', content: '  title,', lineNumber: 10, oldLineNumber: 10 },
                          { type: 'unchanged', content: '  showSidebar', lineNumber: 11, oldLineNumber: 11 },
                          { type: 'unchanged', content: '}) => {', lineNumber: 12, oldLineNumber: 12 },
                          { type: 'unchanged', content: '  return (', lineNumber: 13, oldLineNumber: 13 },
                          { type: 'unchanged', content: '    <div className={styles.dashboard}>', lineNumber: 14, oldLineNumber: 14 },
                          { type: 'removed', content: '      <div className={styles.header}>', lineNumber: 15, oldLineNumber: 15 },
                          { type: 'added', content: '      <header className={styles.header}>', lineNumber: 15 },
                          { type: 'unchanged', content: '        <h1>{title}</h1>', lineNumber: 16, oldLineNumber: 16 },
                          { type: 'removed', content: '      </div>', lineNumber: 17, oldLineNumber: 17 },
                          { type: 'added', content: '      </header>', lineNumber: 17 },
                          { type: 'added', content: '      <main className={styles.main}>', lineNumber: 18 },
                          { type: 'unchanged', content: '        {showSidebar && <div className={styles.sidebar}>Sidebar</div>}', lineNumber: 19, oldLineNumber: 18 },
                          { type: 'added', content: '        <div className={styles.content}>Content</div>', lineNumber: 20 },
                          { type: 'added', content: '      </main>', lineNumber: 21 },
                          { type: 'unchanged', content: '    </div>', lineNumber: 22, oldLineNumber: 19 },
                          { type: 'unchanged', content: '  );', lineNumber: 23, oldLineNumber: 20 },
                        ]
                      },
                      {
                        version: 'v1 (initial)',
                        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
                        author: 'John Coder',
                        changes: 'Initial implementation',
                        diffLines: [
                          { type: 'added', content: 'import React from "react";', lineNumber: 1 },
                          { type: 'added', content: 'import styles from "./dashboard.module.css";', lineNumber: 2 },
                          { type: 'added', content: '', lineNumber: 3 },
                          { type: 'added', content: 'interface DashboardProps {', lineNumber: 4 },
                          { type: 'added', content: '  title: string;', lineNumber: 5 },
                          { type: 'added', content: '  showSidebar: boolean;', lineNumber: 6 },
                          { type: 'added', content: '}', lineNumber: 7 },
                          { type: 'added', content: '', lineNumber: 8 },
                          { type: 'added', content: 'const Dashboard: React.FC<DashboardProps> = ({', lineNumber: 9 },
                          { type: 'added', content: '  title,', lineNumber: 10 },
                          { type: 'added', content: '  showSidebar', lineNumber: 11 },
                          { type: 'added', content: '}) => {', lineNumber: 12 },
                          { type: 'added', content: '  return (', lineNumber: 13 },
                          { type: 'added', content: '    <div className={styles.dashboard}>', lineNumber: 14 },
                          { type: 'added', content: '      <div className={styles.header}>', lineNumber: 15 },
                          { type: 'added', content: '        <h1>{title}</h1>', lineNumber: 16 },
                          { type: 'added', content: '      </div>', lineNumber: 17 },
                          { type: 'added', content: '        {showSidebar && <div className={styles.sidebar}>Sidebar</div>}', lineNumber: 18 },
                          { type: 'added', content: '    </div>', lineNumber: 19 },
                          { type: 'added', content: '  );', lineNumber: 20 },
                          { type: 'added', content: '};', lineNumber: 21 },
                          { type: 'added', content: '', lineNumber: 22 },
                          { type: 'added', content: 'export default Dashboard;', lineNumber: 23 },
                        ]
                      }
                    ];

                    // Using the component-level state instead of a local state

                    return (
                      <div>
                        <div style={{ marginBottom: '1.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0 }}>dashboard.tsx</h3>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.9rem', color: 'var(--foreground-secondary)' }}>
                                Showing changes from {fileVersions[selectedVersionIndex].version}
                              </span>
                            </div>
                          </div>
                          
                          <FileDiff 
                            fileName="dashboard.tsx"
                            filePath="src/app/components/dashboard/dashboard.tsx"
                            timestamp={fileVersions[selectedVersionIndex].timestamp}
                            author={fileVersions[selectedVersionIndex].author}
                            diffLines={fileVersions[selectedVersionIndex].diffLines as any}
                            previousVersion={fileVersions[selectedVersionIndex].version}
                          />
                        </div>

                        <div style={{ marginTop: '2rem' }}>
                          <h3 style={{ marginBottom: '1rem' }}>Version History</h3>
                          <div style={{ border: '1px solid var(--border-light)', borderRadius: '0.5rem', overflow: 'hidden' }}>
                            {fileVersions.map((version, index) => (
                              <div 
                                key={index}
                                style={{
                                  padding: '1rem',
                                  borderBottom: index < fileVersions.length - 1 ? '1px solid var(--border-light)' : 'none',
                                  backgroundColor: selectedVersionIndex === index ? 'var(--background-tertiary)' : 'var(--background-secondary)',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}
                                onClick={() => setSelectedVersionIndex(index)}
                              >
                                <div>
                                  <div style={{ fontWeight: selectedVersionIndex === index ? 'bold' : 'normal' }}>
                                    {version.version}
                                  </div>
                                  <div style={{ fontSize: '0.9rem', color: 'var(--foreground-secondary)', marginTop: '0.25rem' }}>
                                    {version.changes}
                                  </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ fontSize: '0.9rem' }}>
                                    {version.author}
                                  </div>
                                  <div style={{ fontSize: '0.8rem', color: 'var(--foreground-tertiary)', marginTop: '0.25rem' }}>
                                    {version.timestamp.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          ) : activeTabId === 'marketing-plan' ? (
            /* Show Marketing Plan content in markdown format */
            <MarkdownViewer content={`# Marketing Plan 2025

## Executive Summary

This marketing plan outlines our strategy for increasing market share and brand awareness over the next fiscal year. We aim to leverage digital channels, strategic partnerships, and innovative product features to achieve our growth targets.

## Target Market

### Primary Audience
- Mid-sized enterprises (100-500 employees)
- Tech-focused startups in growth phase
- Educational institutions

### Secondary Audience
- Individual professionals
- Small businesses (< 100 employees)

## Competitive Analysis

| Competitor | Market Share | Key Strengths | Weaknesses |
|------------|--------------|---------------|------------|
| CompX | 34% | Brand recognition, Wide feature set | High pricing, Complex UI |
| TechY | 28% | Modern interface, Good mobile support | Limited integrations |
| SystemZ | 15% | Enterprise focus, Security features | Dated design, Poor customer support |

## Marketing Strategy

### Digital Marketing
- **Content Marketing**: Weekly blog posts, monthly whitepapers
- **SEO**: Target 5 high-value keywords per quarter
- **Email Campaigns**: Bi-weekly newsletter, automated onboarding sequence
- **Social Media**: Daily posts across platforms with focus on LinkedIn and Twitter

### Event Marketing
- Attendance at 3 major industry conferences
- Host quarterly webinars on industry topics
- Annual user conference in Q3

### Partnerships
- Co-marketing with 5 strategic technology partners
- Educational institution discount program
- Referral program for existing customers

## Budget Allocation

- Digital Marketing: 40%
- Content Production: 25%
- Events: 20%
- Partnerships: 10%
- Miscellaneous: 5%

## Key Performance Indicators

- Increase website traffic by 35%
- Achieve 15% conversion rate from free trial to paid
- Grow customer base by 25%
- Improve customer retention to 90%
- Increase social media engagement by 50%

## Timeline

### Q1 (Jan-Mar)
- Launch redesigned website
- Implement marketing automation platform
- Develop Q1 content calendar

### Q2 (Apr-Jun)
- Begin partnership program
- Launch spring promotional campaign
- Attend industry conference A

### Q3 (Jul-Sep)
- Host annual user conference
- Review and adjust digital strategy
- Launch referral program

### Q4 (Oct-Dec)
- Holiday promotional campaign
- Annual strategy review
- Planning for next year

## Risk Assessment

- Increased competition may require additional budget allocation
- Market trends shift may necessitate pivot in messaging
- Economic factors could impact B2B spending

## Conclusion

This marketing plan provides a comprehensive framework for achieving our business objectives through strategic marketing initiatives. Regular monitoring and adjustments will ensure we stay agile in response to market changes.`} />
            
          ) : activeTabId !== 'work' ? (
            /* Show regular dashboard content for non-Work tabs */
            <>
              <h2 className={styles.pageTitle}>Dashboard Overview</h2>
              
              <div className={styles.cardGrid} data-onboarding-target="card-grid">
                {/* Calendar Card */}
                <div className={`${styles.card} ${styles.cardCalendar}`} data-onboarding-target="calendar-card">
                  <div className={styles.widgetHeader}>
                    <h3>Calendar</h3>
                    <span className={styles.widgetIcon}>📅</span>
                  </div>
                  <div className={styles.calendarContainer}>
                    <CalendarWidget 
                      tasks={tasks.map(task => ({
                        id: task.id,
                        text: task.text,
                        deadline: task.deadline || new Date(),
                        priority: task.priority,
                        completed: task.completed
                      }))}
                      onSelectDate={(date: Date) => {
                        console.log('Date selected in calendar:', date);
                        // Set the selected date as the deadline for the new task
                        setNewTaskDeadline(date);
                        // Start adding a task
                        setIsAddingTask(true);
                        setNewTaskText('');
                        // Skip date picker and show priority selector after text is entered
                        
                        // Focus on the input after a short delay
                        setTimeout(() => {
                          if (newTaskInputRef.current) {
                            newTaskInputRef.current.focus();
                          }
                        }, 100);
                      }}
                      onSelectTask={(taskId: string) => {
                        // When a task is selected in the calendar, show its details
                        setSelectedTaskId(taskId);
                      }}
                    />
                  </div>
                </div>
                
                {/* Recent Activity Card */}
                <div className={`${styles.card} ${styles.cardActivity}`}>
                  <div className={styles.widgetHeader}>
                    <h3>Recent Activity</h3>
                    <span className={styles.widgetIcon}>
                      <ClockIcon size={20} />
                    </span>
                  </div>
                  <div className={styles.cardContent}>
                    <ul className={styles.activityList}>
                      <li className={styles.activityItem}>
                        <span className={styles.activityIcon}>
                          <EditIcon size={20} />
                        </span>
                        <div className={styles.activityText}>
                          <div>Updated <strong>Marketing Plan</strong></div>
                          <div className={styles.activityTime}>10 minutes ago</div>
                        </div>
                      </li>
                      <li className={styles.activityItem}>
                        <span className={styles.activityIcon}>
                          <FolderIcon size={20} />
                        </span>
                        <div className={styles.activityText}>
                          <div>Created <strong>Q2 Reports</strong> folder</div>
                          <div className={styles.activityTime}>Yesterday</div>
                        </div>
                      </li>
                      <li className={styles.activityItem}>
                        <span className={styles.activityIcon}>
                          <MessageIcon size={20} />
                        </span>
                        <div className={styles.activityText}>
                          <div>New message in <strong>Team Chat</strong></div>
                          <div className={styles.activityTime}>Yesterday</div>
                        </div>
                      </li>
                      <li className={styles.activityItem}>
                        <span className={styles.activityIcon}>
                          <FileIcon size={20} />
                        </span>
                        <div className={styles.activityText}>
                          <div>Uploaded <strong>Presentation.pdf</strong></div>
                          <div className={styles.activityTime}>2 days ago</div>
                        </div>
                      </li>
                      <li className={styles.activityItem}>
                        <span className={styles.activityIcon}>
                          <CheckIcon size={20} />
                        </span>
                        <div className={styles.activityText}>
                          <div>Completed <strong>Project Review</strong></div>
                          <div className={styles.activityTime}>3 days ago</div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* My Tasks Card */}
                <div className={`${styles.card} ${styles.cardTasks}`}>
                  <div className={styles.widgetHeader}>
                    <h3>My Tasks</h3>
                    {!isNotificationPanelOpen && (
                      <button 
                        className={styles.newTabButton} 
                        title="Add New Task"
                        type="button"
                        onClick={startAddingTask}
                      >
                        <PlusIcon size={20} />
                      </button>
                    )}
                  </div>
                  <div className={styles.tasksContainer}>
                    {/* Active Tasks */}
                    <div className={styles.taskSection}>
                      {tasks.filter(task => !task.completed).length === 0 && !isAddingTask ? (
                        <div className={styles.emptyTasksMessage}>
                          <div className={styles.emptyTasksIcon}>✓</div>
                          <p>You&apos;ve completed everything in your plan!</p>
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
                            // Sort tasks by deadline (nearest at top)
                            .sort((a, b) => {
                              // Tasks without deadlines go to the bottom
                              if (!a.deadline && !b.deadline) return 0;
                              if (!a.deadline) return 1;
                              if (!b.deadline) return -1;
                              
                              // Safer approach: use try-catch to prevent any runtime errors
                              try {
                                // Convert to timestamps with error handling
                                let aTime, bTime;
                                
                                try {
                                  aTime = a.deadline instanceof Date ? 
                                    a.deadline.getTime() : 
                                    new Date(a.deadline).getTime();
                                } catch (e) {
                                  // If there's an error, put this task at the bottom
                                  return 1;
                                }
                                
                                try {
                                  bTime = b.deadline instanceof Date ? 
                                    b.deadline.getTime() : 
                                    new Date(b.deadline).getTime();
                                } catch (e) {
                                  // If there's an error, put this task at the bottom
                                  return -1;
                                }
                                
                                // Additional validation
                                if (isNaN(aTime)) return 1;
                                if (isNaN(bTime)) return -1;
                                
                                // Sort by date
                                return aTime - bTime;
                              } catch (e) {
                                // Last resort fallback if anything goes wrong
                                console.error('Error sorting tasks:', e);
                                return 0;
                              }
                            })
                            .map(task => (
                              <li key={task.id} className={`${styles.taskItem} ${styles.taskItemClickable}`}>
                                <button 
                                  className={styles.taskCheckbox} 
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent task selection when clicking checkbox
                                    toggleTaskCompletion(task.id);
                                  }}
                                  aria-label={`Mark ${task.text} as complete`}
                                >
                                  <span className={styles.checkboxInner}></span>
                                </button>
                                <div 
                                  className={styles.taskContent}
                                  onClick={() => setSelectedTaskId(task.id)}
                                >
                                  <span className={styles.taskText}>{task.text}</span>
                                  {task.deadline && (
                                    <span className={`${styles.taskDeadline} 
                                      ${isDeadlineUrgent(task.deadline) ? styles.urgentDeadline : ''}
                                      ${isDeadlineSoon(task.deadline) ? styles.soonDeadline : ''}
                                      ${isDeadlineNormal(task.deadline) ? styles.normalDeadline : ''}`}>
                                      {formatDeadline(task.deadline)}
                                    </span>
                                  )}
                                </div>
                              </li>
                            ))}
                          
                          {isAddingTask && (
                            <>
                              <li className={styles.taskItem}>
                                <button className={styles.taskCheckbox}>
                                  <span className={styles.checkboxInner}></span>
                                </button>
                                <div className={styles.newTaskContainer}>
                                  <input
                                    ref={newTaskInputRef}
                                    className={styles.newTaskInput}
                                    type="text"
                                    placeholder="Type a new task..."
                                    value={newTaskText}
                                    onChange={(e) => setNewTaskText(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        if (newTaskText.trim()) {
                                          // Create task immediately on Enter press
                                          const newTask: Task = {
                                            id: `task-${Date.now()}`,
                                            text: newTaskText.trim(),
                                            completed: false
                                          };
                                          
                                          setTasks(prevTasks => [...prevTasks, newTask]);
                                          
                                          // Save to localStorage
                                          const updatedTasks = [...tasks, newTask];
                                          localStorage.setItem('dashboard_tasks', JSON.stringify(updatedTasks));
                                          
                                          // Reset input field
                                          setNewTaskText('');
                                        }
                                      } else if (e.key === 'Escape') {
                                        cancelAddingTask();
                                      }
                                    }}
                                  />
                                </div>
                              </li>
                            </>
                          )}
                        </ul>
                      )}
                      {/* Completed Tasks */}
                      {tasks.some(task => task.completed) && (
                        <div className={styles.completedTasksSection}>
                          <button 
                            className={styles.completedTasksHeader} 
                            onClick={() => {
                              const completedSection = document.querySelector(`.${styles.completedTasksList}`);
                              if (completedSection) {
                                (completedSection as HTMLElement).scrollIntoView({ behavior: 'smooth' });
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
                                  <li key={task.id} className={`${styles.taskItem} ${styles.completedTask} ${styles.taskItemClickable}`}>
                                    <button 
                                      className={`${styles.taskCheckbox} ${styles.checked}`}
                                      onClick={(e) => {
                                        e.stopPropagation(); // Prevent task selection when clicking checkbox
                                        toggleTaskCompletion(task.id);
                                      }}
                                      aria-label={`Mark ${task.text} as incomplete`}
                                    >
                                      <span className={`${styles.checkboxInner} ${styles.checked}`}>
                                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M3 6L5 8L9 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                      </span>
                                    </button>
                                    <div 
                                      className={styles.taskContent}
                                      onClick={() => setSelectedTaskId(task.id)}
                                    >
                                      <span className={styles.taskText}>{task.text}</span>
                                      {task.deadline && (
                                        <span className={`${styles.taskDeadline} 
                                          ${isDeadlineUrgent(task.deadline) ? styles.urgentDeadline : ''}
                                          ${isDeadlineSoon(task.deadline) ? styles.soonDeadline : ''}
                                          ${isDeadlineNormal(task.deadline) ? styles.normalDeadline : ''}`}>
                                          {formatDeadline(task.deadline)}
                                        </span>
                                      )}
                                    </div>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        </div>
                      )}
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
                  

                </div>
              </div>
            </div>
          )}
        </main>

        <section className={styles.widgets} style={{ width: `${chatWidth}px` }}>
          {/* Draggable resize divider */}
          <div 
            className={`${styles.resizeDivider} ${isDragging ? styles.dragging : ''}`} 
            ref={dragDividerRef}
            onMouseDown={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            title="Drag to expand chat"
          />
          <DraggableWidgetContainer
            columnId="right-column"
            initialItems={[
              {
                id: 'chat',
                content: (
                  <div className={`${styles.chatbox} ${styles.fullHeightChat}`}>
                    <div className={`${styles.widgetHeader} ${styles.clickableHeader}`} style={{ justifyContent: 'flex-end' }}>
                      <h3 
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                        onClick={() => {
                          // Toggle chat visibility
                          const chatBody = document.getElementById('chatBodyContainer');
                          const chatInput = document.querySelector(`.${styles.chatInputContainer}`);
                          const chatTabs = document.querySelector(`.${styles.chatTabs}`);
                          if (chatBody) {
                            const isVisible = (chatBody as HTMLElement).style.display !== 'none';
                            (chatBody as HTMLElement).style.display = isVisible ? 'none' : 'block';
                            if (chatInput) {
                              (chatInput as HTMLElement).style.display = isVisible ? 'none' : 'flex';
                            }
                            if (chatTabs) {
                              (chatTabs as HTMLElement).style.display = isVisible ? 'none' : 'flex';
                            }
                          }
                        }}
                      >
                        Chat
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 6 9 12 15 18"></polyline>
                          </svg>
                        </span>
                      </h3>
                    </div>
                    {chatTabs.length > 0 && (
                      <>
                        <div className={styles.chatTabs}>
                          {/* New Chat Tab button as first tab */}
                          <button 
                            className={styles.newChatTab}
                            title="New Chat Tab"
                            onClick={() => createNewChatTab()}
                          >
                            <PlusIcon />
                          </button>
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
                                
                                // Update the current agent if this tab has an agentId
                                if (tab.agentId) {
                                  const agent = userAgents.find(a => a.id === tab.agentId);
                                  if (agent) {
                                    setCurrentAgent(agent);
                                  }
                                }
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
                                  
                                  // Remove this chat from the processes list completely
                                  setProcesses(prevProcesses => 
                                    prevProcesses.filter(p => p.id !== tab.id)
                                  );
                                  
                                  // Remove from chat tabs
                                  const newTabs = chatTabs.filter(t => t.id !== tab.id);
                                  
                                  if (newTabs.length === 0) {
                                    // Close all tabs and create a new one
                                    const newId = generateUUID();
                                    const newSessionId = generateUUID(); // Create a unique session ID for this chat
                                    setChatTabs([{
                                      id: newId,
                                      title: `Chat ${1}`,
                                      messages: [{ sender: 'bot' as const, content: 'Hi! How can I help you today?' }],
                                      active: true,
                                      isProcessing: false,
                                      sessionId: newSessionId // Store the session ID for conversation continuity
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
                          <div key={tab.id} className={styles.chatBody} id="chatBodyContainer">
                            {tab.messages.map((msg, i) => (
                              <div key={i} className={msg.sender === 'user' ? styles.userMsg : styles.botMsg}>
                                {msg.sender === 'bot' && (
                                  <div className={styles.botHeader}>
                                    {tab.agentId ? (
                                      (() => {
                                        const agent = userAgents.find(a => a.id === tab.agentId);
                                        return agent ? (
                                          <>
                                            {agent.avatar} {agent.name}
                                          </>
                                        ) : (
                                          <>🤖 Workspace Manager</>
                                        );
                                      })()
                                    ) : (
                                      <>🤖 Workspace Manager</>
                                    )}
                                  </div>
                                )}
                                {/* Show thinking section for bot messages if available */}
                                {msg.sender === 'bot' && msg.thinking && (
                                  <div className={styles.thinkingContainer}>
                                    <details className={styles.thinkingDetails}>
                                      <summary className={styles.thinkingSummary}>
                                        <span className={styles.thinkingText}>Thought process</span>
                                      </summary>
                                      <div className={styles.thinkingContent}>
                                        {msg.thinking}
                                      </div>
                                    </details>
                                  </div>
                                )}
                                
                                <div className={styles.messageContent}>{msg.content}</div>
                              </div>
                            ))}
                            
                            {/* Messenger-style typing indicator */}
                            {tab.isProcessing && (
                              <div className={`${styles.botMsg} ${styles.typingMsg}`}>
                                <div className={styles.botHeader}>
                                  {tab.agentId ? (
                                    (() => {
                                      const agent = userAgents.find(a => a.id === tab.agentId);
                                      return agent ? (
                                        <>
                                          {agent.avatar} {agent.name}
                                        </>
                                      ) : (
                                        <>🤖 Workspace Manager</>
                                      );
                                    })()
                                  ) : (
                                    <>🤖 Workspace Manager</>
                                  )}
                                </div>
                                {/* Separate typing indicators for maximum visibility */}
                                <div className={styles.processingIndicator}>
                                  <span className={styles.typingDot}></span>
                                  <span className={styles.typingDot}></span>
                                  <span className={styles.typingDot}></span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {/* Chat input container */}
                        <div className={styles.chatInputContainer}>
                          <div className={styles.chatInputWrapper}>
                            <input 
                              className={styles.chatInput} 
                              placeholder="Type a message..." 
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                  const activeTab = chatTabs.find(tab => tab.active);
                                  if (activeTab) {
                                    const userMsg = e.currentTarget.value.trim();
                                    handleSendMessage(userMsg, activeTab);
                                    // Clear input
                                    e.currentTarget.value = '';
                                  }
                                }
                              }}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )
              }
            ]}
          />
        </section>
      </div>

      {/* Task Detail Panel */}
      <div className={`${styles.taskDetailPanel} ${selectedTaskId ? styles.taskDetailPanelOpen : ''}`}>
        {selectedTaskId && (() => {
          const task = tasks.find(t => t.id === selectedTaskId);
          if (!task) return null;
          
          return (
            <>
              <div className={styles.taskDetailHeader}>
                <h2 className={styles.taskDetailTitle}>{task.text}</h2>
                <button 
                  className={styles.taskDetailClose}
                  onClick={() => setSelectedTaskId(null)}
                  aria-label="Close task details"
                >
                  ×
                </button>
              </div>
              
              <div className={styles.taskMeta}>
                {task.deadline && (
                  <div className={styles.taskMetaItem}>
                    <span className={styles.taskMetaLabel}>Due Date</span>
                    <span 
                      className={`${styles.taskMetaValue} 
                        ${isDeadlineUrgent(task.deadline) ? styles.urgentDeadline : ''}
                        ${isDeadlineSoon(task.deadline) ? styles.soonDeadline : ''}
                        ${isDeadlineNormal(task.deadline) ? styles.normalDeadline : ''}`
                      }
                      onClick={() => {
                        setDatePickerTaskId(task.id);
                        setDatePickerVisible(true);
                      }}
                      style={{ 
                        cursor: 'pointer',
                        position: 'relative',
                        textDecoration: 'underline',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {formatDeadline(task.deadline)}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      
                      {datePickerVisible && datePickerTaskId === task.id && (
                        <DatePicker
                          selectedDate={task.deadline instanceof Date ? task.deadline : new Date(task.deadline)}
                          onDateChange={(date) => updateTaskDeadline(task.id, date)}
                          onClose={() => {
                            setDatePickerVisible(false);
                            setDatePickerTaskId(null);
                          }}
                        />
                      )}
                    </span>
                  </div>
                )}
                

                
                {task.priority && (
                  <div className={styles.taskMetaItem}>
                    <span className={styles.taskMetaLabel}>Priority</span>
                    <span className={`${styles.taskMetaValue} ${styles[`priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`]}`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className={styles.taskDetailSection}>
                <h3 className={styles.taskDetailSectionTitle}>Description</h3>
                {task.description ? (
                  <div className={styles.taskDescription}>
                    {task.description}
                  </div>
                ) : (
                  <p className={styles.taskDescription} style={{ fontStyle: 'italic', opacity: 0.7 }}>
                    No description provided yet.
                  </p>
                )}
                <textarea
                  className={styles.taskDescriptionInput}
                  placeholder="Add or update description..."
                  defaultValue={task.description || ''}
                  onChange={(e) => updateTaskDescription(task.id, e.target.value)}
                />
              </div>
              
              <div className={styles.taskDetailSection}>
                <h3 className={styles.taskDetailSectionTitle}>Attachments</h3>
                
                {task.attachments && task.attachments.length > 0 ? (
                  <div className={styles.taskAttachments}>
                    {task.attachments.map((attachment, index) => (
                      <div 
                        key={index} 
                        className={styles.taskAttachment}
                        onClick={() => {
                          // When clicked, simulate file click action
                          // This is just for demonstration - in a real app this would open the actual file
                          alert(`Opening attachment: ${attachment}`);
                          // You could implement proper file preview functionality here
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span style={{ textDecoration: 'underline' }}>{attachment}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.taskDescription} style={{ fontStyle: 'italic', opacity: 0.7 }}>
                    No attachments yet.
                  </p>
                )}
                
                <div className={styles.taskInputGroup}>
                  <button
                    className={styles.taskAttachButton}
                    onClick={() => addTaskAttachment(task.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '10px',
                      backgroundColor: 'var(--action-primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 500,
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Attach File
                  </button>
                </div>
              </div>
              
              <div className={styles.taskDetailSection}>
                <h3 className={styles.taskDetailSectionTitle}>Comments</h3>
                
                {task.comments && task.comments.length > 0 ? (
                  <div className={styles.taskComments}>
                    {task.comments.map(comment => (
                      <div key={comment.id} className={styles.taskComment}>
                        <div className={styles.taskCommentHeader}>
                          <span className={styles.taskCommentAuthor}>{comment.author}</span>
                          <span className={styles.taskCommentDate}>
                            {new Date(comment.timestamp).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <p className={styles.taskCommentText}>{comment.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.taskDescription} style={{ fontStyle: 'italic', opacity: 0.7 }}>
                    No comments yet.
                  </p>
                )}
                
                <div className={styles.taskInputGroup}>
                  <input
                    type="text"
                    className={styles.taskInput}
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newComment.trim()) {
                        addTaskComment(task.id);
                      }
                    }}
                  />
                  <button
                    className={styles.taskButton}
                    onClick={() => addTaskComment(task.id)}
                  >
                    Post
                  </button>
                </div>
              </div>

              <div className={styles.taskDetailSection} style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  className={styles.removeTaskButton}
                  onClick={() => deleteTask(task.id)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Remove Task
                </button>
              </div>
            </>
          );
        })()}
      </div>

      {/* Add Modal */}
      <AddModal 
        isOpen={isAddModalOpen} 
        onClose={handleCloseAddModal} 
        onOptionSelect={handleOptionSelect}
        onCreateAgent={(name, description, avatar, capabilities) => {
          console.log(`Creating agent: ${name}`);
          
          // Create a new ID for the agent
          const agentId = `agent-${Date.now()}`;
          
          // Create the new agent object
          const newAgent: Agent = {
            id: agentId,
            name,
            description,
            avatar,
            status: 'online' as const,
            lastActive: new Date(),
            createdAt: new Date(),
            capabilities,
            author: 'ME',
          };
          
          // Add the agent to userAgents
          setUserAgents((prev: Agent[]) => [...prev, newAgent]);
          
          // Notify user
          addNotification({
            id: `notif-${Date.now()}`,
            title: 'Agent Created',
            message: `Agent "${name}" was created successfully`,
            timestamp: new Date(),
            read: false,
            type: 'success',
          });
          
          // Automatically open a chat with the new agent
          const agentChatId = `chat-${agentId}`;
          
          // Create new chat tab
          const newTab: ChatTab = {
            id: agentChatId,
            title: `Chat with ${name}`,
            messages: [{ 
              sender: 'bot' as const, 
              content: `Hello! I'm ${name}. ${description}. How can I assist you today?` 
            }],
            active: true,
            isRenaming: false,
            isProcessing: false,
            sessionId: generateUUID()
          };
          
          setChatTabs(prevTabs => [
            ...prevTabs.map(tab => ({ ...tab, active: false })),
            newTab
          ]);
          
          // Add to Active Processes
          setProcesses(prev => [
            ...prev,
            {
              id: agentChatId,
              name: `Chat with ${name}`,
              type: 'chat',
              status: 'inProgress'
            }
          ]);
        }}
        availableFolders={[
          { id: 'root', name: 'Root' },
          { id: 'topics', name: 'Topics' },
          ...(knowledgebaseData[0]?.children?.filter(item => item.children)
              .map(folder => ({ id: folder.id, name: folder.name })) || [])
        ]}
        onFileUpload={(destinationFolder, files) => {
          console.log(`Uploading ${files.length} files to folder: ${destinationFolder}`);
          
          // Process and add files directly to the knowledgebase
          console.log(`Processing ${files.length} files for upload to ${destinationFolder}`);
          
          // Handle each file individually to avoid type issues
          for (const file of files) {
            // Determine file type based on extension
            const fileExt = (file.name.split('.').pop() || '').toLowerCase();
            let fileType = 'other';
            
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
            
            // Create a unique ID for the file
            const fileId = `file-${file.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
            
            // Create the file object
            const fileObj = {
              id: fileId,
              name: file.name,
              type: fileType
            };
            
            // Add the file to the appropriate location in the knowledgebase
            if (destinationFolder === 'root') {
              // Add to root level
              knowledgebaseData.push(fileObj as any);
            } else if (destinationFolder === 'topics') {
              // Add to topics folder
              const topicsFolder = knowledgebaseData.find(item => item.id === 'topics');
              if (topicsFolder && Array.isArray(topicsFolder.children)) {
                topicsFolder.children.push(fileObj as any);
              }
            } else {
              // Add to specific folder
              const topicsFolder = knowledgebaseData.find(item => item.id === 'topics');
              if (topicsFolder && Array.isArray(topicsFolder.children)) {
                const targetFolder = topicsFolder.children.find(item => item.id === destinationFolder);
                if (targetFolder && Array.isArray(targetFolder.children)) {
                  targetFolder.children.push(fileObj as any);
                } else if (targetFolder) {
                  targetFolder.children = [fileObj as any];
                }
              }
            }
          }
          
          // Force a re-render by creating a new reference to knowledgebaseData
          const knowledgebaseDataCopy = [...knowledgebaseData];
          // This is a hack to force a re-render in this demo
          knowledgebaseData.length = 0;
          knowledgebaseData.push(...knowledgebaseDataCopy);
          
          // Show notification
          addNotification({
            id: generateUUID(),
            title: 'Files Uploaded',
            message: `${files.length} file${files.length !== 1 ? 's' : ''} uploaded successfully`,
            type: 'success',
            read: false,
            timestamp: new Date()
          });
          
          // If there's at least one file, open it in the file viewer
          if (files.length > 0) {
            // In a real app, this would open the file in a viewer
            console.log(`Opening file: ${files[0].name}`);
          }
          
          // Close modal
          handleCloseAddModal();
        }}
        onFolderCreate={(folderName, files) => {
          console.log(`Creating folder: ${folderName} with ${files.length} files`);
          
          // Create a new topic in the knowledgebase
          const newTopicId = folderName.toLowerCase().replace(/\s+/g, '-');
          
          // Create a new topic folder structure with the proper type structure
          const newTopic = {
            id: newTopicId,
            name: folderName,
            icon: '📁', // Default folder icon
            children: [] as any[] // Using any[] to avoid type issues with children
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
              });
            });
          }
          
          // Add the new topic to the knowledgebase data
          if (knowledgebaseData && knowledgebaseData.length > 0 && knowledgebaseData[0].children) {
            knowledgebaseData[0].children.push(newTopic);
          }
          
          // Make sure the topics folder is expanded
          if (!expandedFolders.includes('topics')) {
            setExpandedFolders([...expandedFolders, 'topics']);
          }
          
          // Show a success notification
          const safeTopicName = typeof folderName === 'string' ? folderName : 'Untitled';
          addNotification({
            id: generateUUID(),
            title: 'Folder Created',
            message: `New topic "${safeTopicName}" has been added to your knowledgebase`,
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
