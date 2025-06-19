import { useState, useEffect } from 'react';
import styles from '../page.module.css';

// Types
export type Process = {
  id: string;
  name: string;
  type: 'chat';
  status: 'inProgress' | 'completed' | 'failed';
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

// Props type definition
interface ActiveProcessesProps {
  processes: Process[];
  chatTabs: ChatTab[];
  setChatTabs: React.Dispatch<React.SetStateAction<ChatTab[]>>;
  setProcesses: React.Dispatch<React.SetStateAction<Process[]>>;
}

export default function ActiveProcesses({ 
  processes, 
  chatTabs, 
  setChatTabs, 
  setProcesses 
}: ActiveProcessesProps) {
  return (
    <aside className={styles.activeProcessesWidget}>
      <div className={styles.widgetHeader}>
        <h3>Active Processes</h3>
        <button className={styles.widgetIcon} style={{ background: 'none', border: 'none', padding: '0', cursor: 'pointer' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.65 2.35C12.2 0.9 10.2 0 8 0C3.58 0 0 3.58 0 8H2C2 4.69 4.69 2 8 2C9.66 2 11.14 2.69 12.22 3.78L10 6H16V0L13.65 2.35Z" fill="var(--foreground-secondary)"/>
            <path d="M14 8C14 11.31 11.31 14 8 14C6.34 14 4.86 13.31 3.78 12.22L6 10H0V16L2.35 13.65C3.8 15.1 5.8 16 8 16C12.42 16 16 12.42 16 8H14Z" fill="var(--foreground-secondary)"/>
          </svg>
        </button>
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
  );
}

// Helper function to initialize processes from chat tabs
export function initializeProcessesFromChats(chatTabs: ChatTab[]): Process[] {
  return chatTabs.map(tab => ({
    id: tab.id,
    name: tab.title,
    type: 'chat' as const,
    status: 'inProgress' as const
  }));
}
