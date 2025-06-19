import React from 'react';
import styles from '../page.module.css';
import { PlusIcon } from 'lucide-react';
import ContextMenu, { ContextMenuItem } from './ContextMenu';

// Type definitions
export type Agent = {
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

export type ChatTab = {
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

export type Process = {
  id: string;
  name: string;
  type: 'chat';
  status: 'inProgress' | 'completed' | 'failed';
};

// Props interface
interface MyAgentsProps {
  userAgents: Agent[];
  chatTabs: ChatTab[];
  setChatTabs: React.Dispatch<React.SetStateAction<ChatTab[]>>;
  setCurrentAgent: React.Dispatch<React.SetStateAction<Agent | null>>;
  processes: Process[];
  setProcesses: React.Dispatch<React.SetStateAction<Process[]>>;
  setIsAddModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleOptionSelect: (option: string) => void;
  generateUUID: () => string;
}

export default function MyAgents({
  userAgents,
  chatTabs,
  setChatTabs,
  setCurrentAgent,
  processes,
  setProcesses,
  setIsAddModalOpen,
  handleOptionSelect,
  generateUUID
}: MyAgentsProps) {
  const [contextMenu, setContextMenu] = React.useState<{ x: number; y: number; agentId: string } | null>(null);

  // Close context menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  const handleViewMemory = (agentId: string) => {
    console.log(`View Memory for agent: ${agentId}`);
    // TODO: Implement view memory functionality
    setContextMenu(null);
  };

  // Context menu items for agents
  const contextMenuItems: ContextMenuItem[] = [
    {
      label: 'View Memory',
      onClick: () => handleViewMemory(contextMenu?.agentId || '')
    }
  ];

  return (
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
              onClick={(e) => {
                if (e.nativeEvent.button === 2) {
                  e.preventDefault();
                  setContextMenu({ x: e.clientX, y: e.clientY, agentId: agent.id });
                } else {
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
                }
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({ x: e.clientX, y: e.clientY, agentId: agent.id });
              }}
            >
              <div className={styles.processDetails}>
                <div className={styles.processName}>
                  <span style={{ marginRight: '8px' }}>{agent.avatar}</span>
                  {agent.name}
                </div>
              </div>
              <button
                className={styles.contextMenuTrigger}
                onClick={(e) => {
                  e.stopPropagation();
                  setContextMenu({ x: e.clientX, y: e.clientY, agentId: agent.id });
                }}
                aria-label="Agent options"
              >
                ⋮
              </button>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>No agents available</div>
        )}
      </div>
      
      {/* Context menu rendered outside the loop */}
      {contextMenu && (
        <ContextMenu
          items={contextMenuItems}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu(null)}
        />
      )}
    </aside>
  );
}
