"use client";

import { useState, useRef, useEffect } from 'react';
import styles from "../page.module.css";
import { PlusIcon, SendIcon } from './Icons';

// Type definitions from main component
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

type Process = {
  id: string;
  name: string;
  type: 'chat';
  status: 'inProgress' | 'completed' | 'failed';
};

interface ChatSidebarProps {
  chatTabs: ChatTab[];
  setChatTabs: React.Dispatch<React.SetStateAction<ChatTab[]>>;
  userAgents: Agent[];
  setCurrentAgent: React.Dispatch<React.SetStateAction<Agent | null>>;
  setProcesses: React.Dispatch<React.SetStateAction<Process[]>>;
  generateUUID: () => string;
  handleSendMessage: (userMsg: string, activeTab: ChatTab) => void;
  createNewChatTab: () => void;
  startTabRename: (tabId: string) => void;
  saveTabRename: (tabId: string, newTitle: string) => void;
  cancelTabRename: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chatTabs,
  setChatTabs,
  userAgents,
  setCurrentAgent,
  setProcesses,
  generateUUID,
  handleSendMessage,
  createNewChatTab,
  startTabRename,
  saveTabRename,
  cancelTabRename
}) => {
  const renameInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change or processing state changes
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    };

    // Small delay to ensure DOM is updated before scrolling
    const timeoutId = setTimeout(scrollToBottom, 100);
    
    return () => clearTimeout(timeoutId);
  }, [chatTabs]); // Trigger when chatTabs change (new messages, processing state, etc.)

  return (
    <div className={styles.chatSidebar}>
      <div className={`${styles.widgetHeader} ${styles.clickableHeader}`} style={{ position: 'relative', justifyContent: 'flex-end', alignItems: 'center' }}>
        <span style={{ 
          position: 'absolute', 
          left: '-18px', 
          display: 'flex', 
          alignItems: 'center' 
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 6 9 12 15 18"></polyline>
          </svg>
        </span>
        <h3 className={styles.widgetTitle} style={{ cursor: 'pointer', margin: 0, marginRight: '12px' }}>
          Chat
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
          
          <div className={styles.fullHeightChat} style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 85px)' }}>
            {/* Chat messages area */}
            <div 
              ref={messagesContainerRef}
              style={{ flex: '1', overflow: 'auto', marginBottom: 'auto' }}
            >
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
            </div>
            
            {/* Chat input container - now positioned at the bottom */}
            <div className={styles.chatInputContainer} style={{ marginTop: 'auto' }}>
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
                <button 
                  className={styles.sendButton}
                  onClick={(e) => {
                    const input = document.querySelector(`.${styles.chatInput}`) as HTMLInputElement;
                    const userMsg = input.value.trim();
                    
                    if (userMsg) {
                      const activeTab = chatTabs.find(tab => tab.active);
                      if (activeTab) {
                        handleSendMessage(userMsg, activeTab);
                        // Clear input
                        input.value = '';
                      }
                    }
                  }}
                >
                  <SendIcon />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatSidebar;
