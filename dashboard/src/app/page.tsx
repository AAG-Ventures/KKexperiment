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
import { DraggableWidgetContainer } from './components/DraggableWidgetContainer';
import WorkspaceCreateModal from './components/workspace/WorkspaceCreateModal';
import FileExplorer, { isFolder, FileExplorerProps, FileOperations } from './components/FileExplorer';
import { UploadIcon, FileIcon, SearchIcon, ShareIcon, FolderIcon, ChevronRightIcon, ChevronDownIcon, EditIcon, MessageIcon, ClockIcon, BellIcon, UserIcon, PlusIcon, SendIcon, HomeIcon, CheckIcon, CalendarIcon } from './components/Icons';
import DatePicker from './components/DatePicker';
import CalendarWidget from './components/CalendarWidget';
import { knowledgebaseData as knowledgebaseInitialData } from './components/KnowledgebaseSampleData';
import ActiveProcesses, { initializeProcessesFromChats } from './components/ActiveProcesses';
import MyAgents from './components/MyAgents';
import RecentActivity from './components/RecentActivity';
import { formatDate, generateUUID } from './utils/helpers';
import { marketingPlanContent } from './data/MarketingPlanContent';
import { handleWidgetSelect as handleWidgetSelectUtil, WidgetType } from './utils/widgetOperations';
import { Agent, createAgent, sendMessageToAIAgent, AI_AGENT_CONFIG, selectAgent } from './utils/agentOperations';
import { Workspace, sampleWorkspaces } from './utils/workspace';
import { WorkspaceWidget } from './components/workspace';
// Import explicitly for client component
import { useRouter } from 'next/navigation';
import OnboardingModal from './components/Onboarding/OnboardingModal';
import ShareModal from './components/ShareModal';
import Notifications, { Notification as NotificationType } from './components/Notifications'; // Use alias for Notification type if local one is hard to remove or named Notification
import Header from './components/Header';
import ChatSidebar from './components/ChatSidebar';

// Helper functions imported from utils/helpers.ts

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

// Agent type is now imported from utils/agentOperations.ts

type Notification = NotificationType;

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
  
  // State management for workspaces
  const [workspaces, setWorkspaces] = useState<Workspace[]>(sampleWorkspaces);
  const [isWorkspaceCreateModalOpen, setIsWorkspaceCreateModalOpen] = useState(false);
  // State for workspace editing
  const [workspaceToEdit, setWorkspaceToEdit] = useState<Workspace | undefined>(undefined);
  const [isEditMode, setIsEditMode] = useState(false);
  
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
  
  // Function to toggle folder expansion (for  // Toggle folder expansion in the file explorer
  const toggleFolderExpansion = (folderId: string) => {
    console.log(`Toggling folder: ${folderId}`);
    
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
  
  // Track current preview file for knowledgebase
  const [previewFile, setPreviewFile] = useState<any | null>(null);
  
  // State for knowledgebase data
  const [knowledgebaseData, setKnowledgebaseData] = useState(knowledgebaseInitialData);
  
  // Global share modal state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareFileName, setShareFileName] = useState('');
  const [shareFileId, setShareFileId] = useState('');
  
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
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  
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
  }, []);

  // Get unread notification count
  const unreadCount = useMemo(() => {
    return notifications.filter(notification => !notification.read).length;
  }, [notifications]);
  
  // AI Agent constants and functions are now imported from utils/agentOperations.ts
  // generateUUID is now imported from utils/helpers.ts

  // Function to handle sending a message
  const handleSendMessage = (userMsg: string, activeTab: ChatTab) => {
    // Add user message
    const newMessages = [
      ...activeTab.messages,
      { sender: 'user' as const, content: userMsg }
    ];

    // Update the active tab with user message and set as processing
    setChatTabs((prevTabs: ChatTab[]) => 
      prevTabs.map((tab: ChatTab) => {
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
      setChatTabs((tabs: ChatTab[]) => {
        return tabs.map((tab: ChatTab) => tab.id === activeTab.id && !tab.isProcessing ? 
          { ...tab, isProcessing: true } : tab);
      });
    }, 100);
    
    // Get or create a session ID for this chat
    const chatSessionId = activeTab.sessionId || generateUUID();
    
    // Call the AI agent API with the user message and session ID
    sendMessageToAIAgent(userMsg, chatSessionId)
      .then((response: string) => {
        console.log('AI agent response:', response);
        
        // Add bot message with response from the AI agent
        setChatTabs((prevTabs: ChatTab[]) => {
          return prevTabs.map((tab: ChatTab) => {
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
        setProcesses((prevProcesses: Process[]) => 
          prevProcesses.map((process: Process) => 
            process.id === activeTab.id ? 
              { ...process, status: 'completed' as const } : 
              process
          )
        );
      })
      .catch((error: unknown) => {
        console.error('Error calling AI agent:', error);
        
        // Update chat with error message
        setChatTabs((prevTabs: ChatTab[]) => 
          prevTabs.map((tab: ChatTab) => {
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
        setProcesses((prevProcesses: Process[]) => 
          prevProcesses.map((process: Process) => 
            process.id === activeTab.id ? 
              { ...process, status: 'failed' as const } : 
              process
          )
        );
      });
    
    // Update status in Active Processes to in progress
    setProcesses((prevProcesses: Process[]) => 
      prevProcesses.map((process: Process) => 
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
      setProcesses(initializeProcessesFromChats(chatTabs));
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
    const taskToComplete = updatedTasks.find(task => task.id === id);
    if (taskToComplete) {
      addNotification({
        title: 'Task Completed',
        message: `You've completed the task: "${taskToComplete.text}"`,
        type: 'success',
      });
    }
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
    const task = updatedTasks.find(task => task.id === taskId);
    if (task) {
      addNotification({
        title: 'Task Deadline Updated',
        message: `Deadline for task "${task.text}" set to ${formatDate(task.deadline || '')}.`,
        type: 'info',
      });
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
      const taskToDelete = tasks.find(task => task.id === taskId);
      if (taskToDelete) {
        addNotification({
          title: 'Task Deleted',
          message: `Task "${taskToDelete.text}" has been deleted.`,
          type: 'error',
        });
      }
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
  
  // Handle adding a new notification
  const addNotification = (notification: Omit<NotificationType, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: NotificationType = {
      ...notification,
      id: Date.now().toString(), // Simple unique ID
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const handleAddTask = () => {
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
    // Reset expanded folders when going back to all topics
    setExpandedFolders([]);
  };
  
  // File operations handlers for knowledgebase
  const handleViewFile = (file: any) => {
    console.log('Viewing file:', file.name);
    setPreviewFile(file);
    
    // Simple approach - click on the Marketing Plan tab directly
    try {
      // Click on the tab that has 'Marketing Plan' content
      const marketingTab = Array.from(document.querySelectorAll('div')).
        find(el => el.textContent?.includes('MarketingPlan.md'));
        
      if (marketingTab) {
        console.log('Found Marketing Plan tab, clicking it');
        (marketingTab as HTMLElement).click();
      } else {
        console.log('Marketing Plan tab not found, trying preview tab');
        const previewTab = document.getElementById('preview-tab');
        if (previewTab) previewTab.click();
      }
    } catch (error) {
      console.error('Error clicking Marketing Plan tab:', error);
    }
  };
  
  const handleRenameFile = (fileId: string, newName: string) => {
    console.log('Renaming file:', fileId, 'to', newName);
    
    let isNewItem = false;
    let itemType = '';
    let oldName = '';
    
    // Find and rename the file in the knowledgebase data
    const findAndRenameFile = (items: any[]) => {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.id === fileId) {
          // Store the original name and check if this is a new item
          oldName = item.name;
          isNewItem = !!item.isNew;
          itemType = isFolder(item) ? 'folder' : 'file';
          
          // Rename the item
          item.name = newName;
          
          // Remove the isNew flag if it exists
          if (item.isNew) delete item.isNew;
          
          return true;
        }
        if (isFolder(item) && item.children) {
          if (findAndRenameFile(item.children)) {
            return true;
          }
        }
      }
      return false;
    };
    
    findAndRenameFile(knowledgebaseData);
    
    // Force re-render by creating a new reference
    const knowledgebaseDataCopy = [...knowledgebaseData];
    knowledgebaseData.length = 0;
    knowledgebaseData.push(...knowledgebaseDataCopy);
    
    // Show different notifications based on whether this is a new item or renaming an existing one
    if (isNewItem) {
      addNotification({
        title: `${itemType === 'folder' ? 'Folder' : 'File'} Created`,
        message: `New ${itemType} "${newName}" has been created`,
        type: 'success',
      });
    } else {
      addNotification({
        title: `${itemType === 'folder' ? 'Folder' : 'File'} Renamed`,
        message: `${itemType === 'folder' ? 'Folder' : 'File'} renamed from "${oldName}" to "${newName}"`,
        type: 'success',
      });
    }
  };
  
  // Global method to open the share modal
  const openShareModal = (fileId: string) => {
    // Find the file name
    let fileName = '';
    const findFileName = (items: any[]) => {
      for (const item of items) {
        if (item.id === fileId) {
          fileName = item.name;
          return true;
        }
        if (isFolder(item) && item.children) {
          if (findFileName(item.children)) {
            return true;
          }
        }
      }
      return false;
    };
    
    findFileName(knowledgebaseData);
    
    // Set share modal data and open it
    setShareFileId(fileId);
    setShareFileName(fileName);
    setShareModalOpen(true);
  };
  
  const handleShareFile = (fileId: string, email: string) => {
    console.log('Sharing file:', fileId, 'with', email);
    
    addNotification({
      title: 'File Shared',
      message: `File "${shareFileName}" shared with ${email}`,
      type: 'success',
    });
    
    // Close the modal
    setShareModalOpen(false);
  };
  
  // Knowledgebase operation handlers
  const handleKnowledgebaseAddFile = (folderId: string) => {
    console.log('Adding file to knowledgebase folder:', folderId);
    
    // Generate a unique ID for the new file
    const newFileId = `new-file-${generateUUID()}`;
    
    // Create a new file object that will be in renaming state from the start
    const newFile = {
      id: newFileId,
      name: 'New File.md', // Default name that will be editable immediately
      type: 'document' as const,
      icon: '📄',
      isNew: true // Special flag to indicate this is a new file that needs immediate renaming
    };
    
    let knowledgebaseDataCopy = JSON.parse(JSON.stringify(knowledgebaseData));
    
    // Function to add the file to the specified folder
    const addFileToFolder = (items: any[]): boolean => {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        if (item.id === folderId) {
          // If this is the target folder, add the file
          if (isFolder(item) && item.children) {
            item.children.push(newFile);
            return true;
          } else {
            // If it's not a folder, add to parent folder instead
            return false;
          }
        }
        
        // Recursively check children
        if (isFolder(item) && item.children) {
          if (addFileToFolder(item.children)) {
            return true;
          }
        }
      }
      return false;
    };
    
    // Try to add the file to the folder
    const added = addFileToFolder(knowledgebaseDataCopy);
    
    // If no folder found or not actually a folder, add to the root
    if (!added) {
      // Add directly to root level
      knowledgebaseDataCopy.push(newFile);
    }
    
    // Update state with the new data
    setKnowledgebaseData(knowledgebaseDataCopy);
    
    // No notification yet as the user will still be naming the file
    // We'll show a notification after the renaming is complete
  };
  
  // Workspace operation handlers
  const handleWorkspaceAddFile = (folderId: string) => {
    // Find the workspace to edit
    const workspaceToEdit = workspaces.find(workspace => workspace.id === folderId);
    if (workspaceToEdit) {
      // Open the workspace edit modal
      setWorkspaceToEdit(workspaceToEdit);
      setIsEditMode(true);
    } else {
      console.error(`Could not find workspace with ID: ${folderId}`);
    }
  };
  
  // Generic handler that routes to the appropriate function
  const handleAddFile = (folderId: string) => {
    console.log('handleAddFile called with folderId:', folderId);
    // Check if this is a workspace ID (workspace IDs always exactly match 'workspace-number')
    if (folderId.match(/^workspace-\d+$/) && workspaces.some(w => w.id === folderId)) {
      handleWorkspaceAddFile(folderId);
    } else {
      handleKnowledgebaseAddFile(folderId);
    }
  };
  
  // Knowledgebase operation handlers
  const handleKnowledgebaseAddFolder = (parentFolderId: string) => {
    console.log('Adding folder to knowledgebase:', parentFolderId);
    
    // Generate a unique ID for the new folder
    const newFolderId = `new-folder-${generateUUID()}`;
    
    // Create a new folder object that will be in renaming state from the start
    const newFolder = {
      id: newFolderId,
      name: 'New Folder', // Default name that will be editable immediately
      icon: '📁',
      children: [] as any[],
      isNew: true // Special flag to indicate this is a new folder that needs immediate renaming
    };
    
    // Create a deep copy of the knowledgebase data to avoid mutation issues
    let knowledgebaseDataCopy = JSON.parse(JSON.stringify(knowledgebaseData));
    
    // Function to add the folder to the specified parent folder
    const addFolderToParent = (items: any[]): boolean => {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        if (item.id === parentFolderId) {
          // If this is the target folder, add the new folder
          if (isFolder(item) && item.children) {
            item.children.push(newFolder);
            return true;
          } else {
            // If it's not a folder, add to parent folder instead
            return false;
          }
        }
        
        // Recursively check children
        if (isFolder(item) && item.children) {
          if (addFolderToParent(item.children)) {
            return true;
          }
        }
      }
      return false;
    };
    
    // Try to add the folder to the parent
    const added = addFolderToParent(knowledgebaseDataCopy);
    
    // If no parent folder found or not actually a folder, add to the root
    if (!added) {
      // Try to add to Topics folder
      const topicsFolder = knowledgebaseDataCopy.find(item => item.id === 'topics');
      if (topicsFolder && isFolder(topicsFolder) && topicsFolder.children) {
        topicsFolder.children.push(newFolder);
      } else {
        // Add to root if no Topics folder
        knowledgebaseDataCopy.push(newFolder);
      }
    }
    
    // Update state with the modified copy
    setKnowledgebaseData(knowledgebaseDataCopy);
    
    // No notification yet as the user will still be naming the folder
    // We'll show a notification after the renaming is complete
  };
  
  // Workspace operation handlers
  const handleWorkspaceAddFolder = (parentFolderId: string) => {
    // Find the workspace to edit
    const workspaceToEdit = workspaces.find(workspace => workspace.id === parentFolderId);
    if (workspaceToEdit) {
      // Open the workspace edit modal
      setWorkspaceToEdit(workspaceToEdit);
      setIsEditMode(true);
    } else {
      console.error(`Could not find workspace with ID: ${parentFolderId}`);
    }
  };
  
  // Generic handler that routes to the appropriate function
  const handleAddFolder = (parentFolderId: string) => {
    console.log('handleAddFolder called with parentFolderId:', parentFolderId);
    // Check if this is a workspace ID (workspace IDs always exactly match 'workspace-number')
    if (parentFolderId.match(/^workspace-\d+$/) && workspaces.some(w => w.id === parentFolderId)) {
      handleWorkspaceAddFolder(parentFolderId);
    } else {
      handleKnowledgebaseAddFolder(parentFolderId);
    }
  };

  // Function to delete a file from the knowledgebase
  const handleKnowledgebaseDeleteFile = (fileId: string) => {
    console.log('Deleting file from knowledgebase:', fileId);
    
    // Find and delete the file from knowledgebase data
    let fileName = '';
    let fileDeleted = false;

    // Direct deletion from top-level array
    for (let i = 0; i < knowledgebaseData.length; i++) {
      const item = knowledgebaseData[i];
      if (item.id === fileId) {
        fileName = item.name;
        knowledgebaseData.splice(i, 1);
        fileDeleted = true;
        break;
      }
    }
    
    // If not found at top level, recursively search through children
    if (!fileDeleted) {
      const deleteItemFromChildren = (items: any[]): boolean => {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.id === fileId) {
            fileName = item.name;
            // Remove the item from the array
            items.splice(i, 1);
            return true;
          }
          
          // Recursively search children
          if (isFolder(item) && item.children) {
            if (deleteItemFromChildren(item.children)) {
              return true;
            }
          }
        }
        return false;
      };
      
      // Try all top-level folders
      for (const item of knowledgebaseData) {
        if (isFolder(item) && item.children) {
          if (deleteItemFromChildren(item.children)) {
            fileDeleted = true;
            break;
          }
        }
      }
    }
    
    // Reset preview file if the deleted file was being previewed
    if (previewFile && previewFile.id === fileId) {
      setPreviewFile(null);
    }
    
    // Force state update by creating a deep copy and updating state
    const knowledgebaseDataCopy = JSON.parse(JSON.stringify(knowledgebaseData));
    setKnowledgebaseData(knowledgebaseDataCopy);
    
    // Show a notification
    if (fileDeleted) {
      addNotification({
        title: 'File Deleted',
        message: `File "${fileName}" deleted`,
        type: 'info',
      });
    } else {
      console.error(`Could not find file with ID: ${fileId}`);
    }
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
      title: 'File Moved',
      message: `${fileToMove.name} has been moved to ${targetFolder.name}`,
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
    console.log(`Selected option in Dashboard: ${option}`);
    
    // Handle each option type differently
    switch (option) {
      case 'folder':
        // Don't close the modal for folder - the AddModal component will show FolderCreateModal
        console.log('Folder option selected - AddModal will handle displaying FolderCreateModal');
        return; // Return early to prevent closing the modal
        
      case 'file':
        // Don't close the modal for file - the AddModal component will show FileUploadModal
        console.log('File option selected - AddModal will handle displaying FileUploadModal');
        return; // Return early to prevent closing the modal
        
      case 'widget':
        // Don't close the modal for widget - the AddModal component will show WidgetSelectModal
        console.log('Widget option selected - AddModal will handle displaying WidgetSelectModal');
        return; // Return early to prevent closing the modal
        
      case 'agent':
        // Don't close the modal for agent - the AddModal component will show AgentBrowserModal
        console.log('Agent option selected - AddModal will handle displaying AgentBrowserModal');
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
  
  // Handle widget selection using the utility function
  const handleWidgetSelect = (widgetType: WidgetType) => {
    // Call the utility function with the necessary parameters
    handleWidgetSelectUtil(widgetType, dashboardItems, setDashboardItems, addNotification);
  };
  
  // Handle file selection
  const handleFileSelect = (file: any) => {
    console.log('File selected:', file);
    // Implementation for file selection logic
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
      <Header
        isNotificationPanelOpen={isNotificationPanelOpen}
        setIsNotificationPanelOpen={setIsNotificationPanelOpen}
        unreadCount={unreadCount}
        notifications={notifications}
        setNotifications={setNotifications}
      />

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
                    id: 'workspaces',
                    content: (
                      <WorkspaceWidget
                        workspaces={workspaces}
                        setWorkspaces={setWorkspaces}
                        knowledgebaseData={knowledgebaseData}
                        onOpenCreateModal={() => setIsWorkspaceCreateModalOpen(true)}
                        onEditWorkspace={(workspace) => {
                          setWorkspaceToEdit(workspace);
                          setIsEditMode(true);
                        }}
                      />
                    )
                  },
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
                          <h3>Knowledgebase</h3>
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
                            fileOperations={{
                              onView: handleViewFile,
                              onRename: handleRenameFile,
                              onShare: openShareModal,
                              onDelete: handleKnowledgebaseDeleteFile,
                              onAddFile: handleKnowledgebaseAddFile,
                              onAddFolder: handleKnowledgebaseAddFolder
                            }}
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
                      <MyAgents 
                        userAgents={userAgents}
                        chatTabs={chatTabs}
                        setChatTabs={setChatTabs}
                        setCurrentAgent={setCurrentAgent}
                        processes={processes}
                        setProcesses={setProcesses}
                        setIsAddModalOpen={setIsAddModalOpen}
                        handleOptionSelect={handleOptionSelect}
                        generateUUID={generateUUID}
                      />
                    )
                  },
                  {
                    id: 'active-processes',
                    content: (
                      <ActiveProcesses 
                        processes={processes}
                        chatTabs={chatTabs}
                        setChatTabs={setChatTabs}
                        setProcesses={setProcesses}
                      />
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
                          { type: 'removed', content: '      <div className={styles.header}>', lineNumber: 17, oldLineNumber: 15 },
                          { type: 'added', content: '      <header className={styles.header}>', lineNumber: 17 },
                          { type: 'unchanged', content: '        <h1>{title}</h1>', lineNumber: 18, oldLineNumber: 16 },
                          { type: 'removed', content: '      </div>', lineNumber: 19, oldLineNumber: 17 },
                          { type: 'added', content: '      </header>', lineNumber: 19 },
                          { type: 'added', content: '      <main className={styles.main}>', lineNumber: 20 },
                          { type: 'unchanged', content: '        {showSidebar && <div className={styles.sidebar}>Sidebar</div>}', lineNumber: 21, oldLineNumber: 18 },
                          { type: 'added', content: '        <div className={styles.content}>Content</div>', lineNumber: 22 },
                          { type: 'added', content: '      </main>', lineNumber: 23 },
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
            /* Show Marketing Plan content in markdown format - imported from external file */
            <MarkdownViewer content={marketingPlanContent} />
            
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
                      onSelectDate={(date) => {
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
                      onSelectTask={(taskId) => {
                        // When a task is selected in the calendar, show its details
                        setSelectedTaskId(taskId);
                      }}
                    />
                  </div>
                </div>
                
                {/* Recent Activity Card */}
                <RecentActivity />

                {/* My Tasks Card */}
                <div className={`${styles.card} ${styles.cardTasks}`}>
                  <div className={styles.widgetHeader}>
                    <h3>My Tasks</h3>
                    {!isNotificationPanelOpen && (
                      <button 
                        className={styles.newTabButton} 
                        title="Add New Task"
                        type="button"
                        onClick={handleAddTask}
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
                            onClick={handleAddTask}
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
          <div className={styles.rightColumnWidgets} style={{ width: chatWidth + 'px', height: '100%' }}>
            <ChatSidebar 
              chatTabs={chatTabs}
              setChatTabs={setChatTabs}
              userAgents={userAgents}
              setCurrentAgent={setCurrentAgent}
              setProcesses={setProcesses}
              generateUUID={generateUUID}
              handleSendMessage={handleSendMessage}
              createNewChatTab={createNewChatTab}
              startTabRename={startTabRename}
              saveTabRename={saveTabRename}
              cancelTabRename={cancelTabRename}
            />
          </div>
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
          
          // Create the new agent object using our utility function
          const newAgent = createAgent(name, description, avatar, capabilities);
          
          // Add the agent to userAgents
          setUserAgents((prev: Agent[]) => [...prev, newAgent]);
          
          // Notify user
          addNotification({
            title: 'Agent Created',
            message: `Agent "${name}" was created successfully`,
            type: 'success',
          });
          
          // Automatically open a chat with the new agent
          const agentChatId = `chat-${newAgent.id}`;
          
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
            title: 'Files Uploaded',
            message: `${files.length} file${files.length !== 1 ? 's' : ''} uploaded successfully`,
            type: 'success',
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
            title: 'Folder Created',
            message: `New topic "${safeTopicName}" has been added to your knowledgebase`,
            type: 'success',
          });
          
          // Close the add modal
          handleCloseAddModal();
          
        }}
      />

      {/* Global share modal */}
      {shareModalOpen && (
        <ShareModal
          fileName={shareFileName}
          onClose={() => setShareModalOpen(false)}
          onShare={(email) => handleShareFile(shareFileId, email)}
        />
      )}
      
      {/* Workspace Create Modal */}
      {(isWorkspaceCreateModalOpen || (isEditMode && workspaceToEdit)) && (
        <WorkspaceCreateModal
          isOpen={isWorkspaceCreateModalOpen || isEditMode}
          onClose={() => {
            setIsWorkspaceCreateModalOpen(false);
            setIsEditMode(false);
            setWorkspaceToEdit(undefined);
          }}
          onCreateWorkspace={(workspace) => {
            if (isEditMode && workspaceToEdit) {
              // Update existing workspace
              setWorkspaces(prevWorkspaces => {
                const index = prevWorkspaces.findIndex(w => w.id === workspace.id);
                if (index !== -1) {
                  const updatedWorkspaces = [...prevWorkspaces];
                  updatedWorkspaces[index] = workspace;
                  return updatedWorkspaces;
                }
                return prevWorkspaces;
              });
            } else {
              // Add new workspace
              setWorkspaces(prevWorkspaces => [...prevWorkspaces, workspace]);
            }
            
            // Reset modal state
            setIsWorkspaceCreateModalOpen(false);
            setIsEditMode(false);
            setWorkspaceToEdit(undefined);
          }}
          knowledgebaseData={knowledgebaseData}
          existingWorkspace={workspaceToEdit}
          modalTitle={isEditMode ? "Edit Workspace" : "Create New Workspace"}
        />
      )}
    </div>
  );
}
