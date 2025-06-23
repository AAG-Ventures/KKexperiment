"use client";

import React, { useState, useEffect, useRef } from 'react';
import styles from '../../page.module.css';

interface ChatOnboardingStepProps {
  onComplete: (userData: { name: string; occupation: string }) => void;
  stepNumber: number;
  totalSteps: number;
}

interface Message {
  text: string;
  isAgent: boolean;
  typing?: boolean;
}

const ChatOnboardingStep: React.FC<ChatOnboardingStepProps> = ({ onComplete, stepNumber, totalSteps }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [waitingForResponse, setWaitingForResponse] = useState<boolean>(false);
  const [chatStep, setChatStep] = useState<'name' | 'occupation' | 'complete'>('name');
  const [userData, setUserData] = useState<{ name: string; occupation: string }>({ name: '', occupation: '' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize with welcome message
  useEffect(() => {
    setTimeout(() => {
      addAgentMessage("Hey, welcome to Mind Extension! What is your name?");
    }, 500);
  }, []);
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const addAgentMessage = (text: string) => {
    // First add a message with typing indicator
    setMessages(prevMessages => [...prevMessages, { text, isAgent: true, typing: true }]);
    
    // After a short delay, remove the typing indicator
    setTimeout(() => {
      setMessages(prevMessages => {
        // Replace the last message (remove typing indicator)
        const updatedMessages = [...prevMessages];
        if (updatedMessages.length > 0) {
          updatedMessages[updatedMessages.length - 1] = { text, isAgent: true };
        }
        return updatedMessages;
      });
    }, 1500);
  };
  
  const addUserMessage = (text: string) => {
    setMessages(prevMessages => [...prevMessages, { text, isAgent: false }]);
  };
  
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    
    addUserMessage(userInput);
    
    // Process user response based on current chat step
    if (chatStep === 'name') {
      setUserData(prev => ({ ...prev, name: userInput.trim() }));
      setWaitingForResponse(true);
      
      setTimeout(() => {
        addAgentMessage(`Let me create a perfectly personalized dashboard for you. To do that, could you share your occupation? Also, is there anything besides work that you'd like to use this platform for?`);
        setChatStep('occupation');
        setWaitingForResponse(false);
      }, 1000);
    } else if (chatStep === 'occupation') {
      setUserData(prev => ({ ...prev, occupation: userInput.trim() }));
      setWaitingForResponse(true);
      
      setTimeout(() => {
        addAgentMessage(`Thanks! I'll be your personal assistant for ${userInput.trim()}. Let's continue setting up your workspace.`);
        setChatStep('complete');
        setWaitingForResponse(false);
        
        // Save user data to localStorage
        const userDataToSave = {
          name: userData.name,
          occupation: userInput.trim()
        };
        localStorage.setItem('userData', JSON.stringify(userDataToSave));
        
        // Move to next step after a short delay
        setTimeout(() => {
          onComplete(userDataToSave);
        }, 5000);
      }, 1000);
    }
    
    setUserInput('');
  };
  
  return (
    <div className={styles.onboardingContent} style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
      <div className={styles.onboardingHeader}>
        <span className={styles.stepIndicator}>
          Step {stepNumber} of {totalSteps}
        </span>
        <h2>Onboarding Guide</h2>
      </div>
      
      {/* Chat messages */}
      <div className={styles.chatMessagesContainer} style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '10px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`${styles.chatMessage} ${message.isAgent ? styles.agentMessage : styles.userMessage}`}
            style={{
              alignSelf: message.isAgent ? 'flex-start' : 'flex-end',
              backgroundColor: message.isAgent ? 'var(--background-secondary)' : 'var(--brand-primary)',
              color: message.isAgent ? 'var(--foreground)' : 'white',
              padding: '12px 16px',
              borderRadius: message.isAgent ? '12px 12px 12px 0' : '12px 12px 0 12px',
              maxWidth: '85%',
              margin: '2px 0',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              animation: 'fadeIn 0.3s ease-out',
              border: message.isAgent ? '1px solid var(--border-color)' : 'none',
            }}
          >
            {message.typing ? (
              <div className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            ) : (
              message.text
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat input */}
      <form onSubmit={handleChatSubmit} style={{ marginTop: '15px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          backgroundColor: 'var(--background-secondary)',
          borderRadius: '8px',
          padding: '4px',
          border: '1px solid var(--border-color)'
        }}>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your response..."
            disabled={waitingForResponse}
            style={{
              flex: 1,
              padding: '12px 15px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--foreground)',
              outline: 'none',
              fontSize: '14px'
            }}
          />
          <button
            type="submit"
            disabled={waitingForResponse || !userInput.trim()}
            style={{
              marginLeft: '4px',
              backgroundColor: waitingForResponse || !userInput.trim() ? 'var(--background-tertiary)' : 'var(--brand-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: waitingForResponse || !userInput.trim() ? 'not-allowed' : 'pointer',
              opacity: waitingForResponse || !userInput.trim() ? 0.7 : 1,
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatOnboardingStep;
