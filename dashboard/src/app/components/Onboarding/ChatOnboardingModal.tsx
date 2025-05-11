"use client";

import React, { useState, useEffect, useRef } from 'react';
import styles from '../../page.module.css';

interface ChatOnboardingProps {
  isVisible: boolean;
  onComplete: (userData: { name: string; occupation: string; interests: string }) => void;
}

type Message = {
  sender: 'agent' | 'user';
  content: string;
  timestamp: Date;
};

const ChatOnboardingModal: React.FC<ChatOnboardingProps> = ({ isVisible, onComplete }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentStep, setCurrentStep] = useState<'name' | 'occupation' | 'complete'>('name');
  const [userName, setUserName] = useState('');
  const [userOccupation, setUserOccupation] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (isVisible) {
      console.log('ChatOnboardingModal is visible, showing welcome message');
      setTimeout(() => {
        addAgentMessage("Hey, welcome to Mind Extension! What is your name?");
      }, 500);
    } else {
      console.log('ChatOnboardingModal isVisible prop is false');
    }
  }, [isVisible]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-focus input when visible
  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible, currentStep]);

  // Add agent message with typing animation
  const addAgentMessage = (content: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        sender: 'agent',
        content,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1000); // Simulate typing delay
  };

  // Add user message
  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, {
      sender: 'user',
      content,
      timestamp: new Date()
    }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentInput.trim()) return;
    
    // Process user input based on current step
    if (currentStep === 'name') {
      const name = currentInput.trim();
      addUserMessage(name);
      setUserName(name);
      setCurrentInput('');
      setCurrentStep('occupation');
      
      // After a short delay, ask for occupation
      setTimeout(() => {
        addAgentMessage(`Nice to meet you, ${name}! Let me create a perfectly personalized dashboard for you. To do that, can you share what your occupation is, and is there anything apart from work you'd like to use this platform for?`);
      }, 1000);
      
    } else if (currentStep === 'occupation') {
      const occupationInfo = currentInput.trim();
      addUserMessage(occupationInfo);
      setUserOccupation(occupationInfo);
      setCurrentInput('');
      setCurrentStep('complete');
      
      // Finalize the onboarding chat
      setTimeout(() => {
        addAgentMessage("Got it! Let's set up the perfect productivity workspace for you!");
        
        // After 2 seconds, transition to the main onboarding
        setTimeout(() => {
          onComplete({ 
            name: userName, 
            occupation: occupationInfo,
            interests: occupationInfo // Storing full response as interests too
          });
        }, 2000);
      }, 1000);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={styles.chatOnboardingOverlay}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        animation: 'fadeIn 0.3s ease-in-out',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className={styles.chatOnboardingModal}
        style={{
          width: '450px',
          maxWidth: '90vw',
          maxHeight: '80vh',
          animation: 'scaleIn 0.4s ease-out',
          backgroundColor: 'var(--background-primary)',
          borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid var(--border-light)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '18px',
            }}
          >
            OG
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--foreground-primary)' }}>
              Onboarding Guide
            </div>
            <div style={{ fontSize: '14px', color: 'var(--foreground-secondary)' }}>
              Setting up your workspace
            </div>
          </div>
        </div>
        
        {/* Chat messages */}
        <div
          style={{
            padding: '20px',
            overflowY: 'auto',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {messages.map((message, index) => (
            <div
              key={index}
              style={{
                alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: message.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  backgroundColor: message.sender === 'user' ? 'var(--brand-primary)' : 'var(--background-secondary)',
                  color: message.sender === 'user' ? 'white' : 'var(--foreground-primary)',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}
              >
                {message.content}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--foreground-muted)',
                  marginTop: '4px',
                  textAlign: message.sender === 'user' ? 'right' : 'left',
                }}
              >
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div
              style={{
                alignSelf: 'flex-start',
                padding: '10px 16px',
                borderRadius: '18px',
                backgroundColor: 'var(--background-secondary)',
                color: 'var(--foreground-primary)',
              }}
            >
              <div className={styles.typingIndicator}>
                <span style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--foreground-muted)',
                  display: 'inline-block',
                  margin: '0 2px',
                  animation: 'typingAnimation 1s infinite ease-in-out alternate',
                  animationDelay: '0s',
                }}></span>
                <span style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--foreground-muted)',
                  display: 'inline-block',
                  margin: '0 2px',
                  animation: 'typingAnimation 1s infinite ease-in-out alternate',
                  animationDelay: '0.2s',
                }}></span>
                <span style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--foreground-muted)',
                  display: 'inline-block',
                  margin: '0 2px',
                  animation: 'typingAnimation 1s infinite ease-in-out alternate',
                  animationDelay: '0.4s',
                }}></span>
              </div>
            </div>
          )}
          
          {/* Reference div for auto-scroll */}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input area - only show if not in 'complete' step */}
        {currentStep !== 'complete' && (
          <form
            onSubmit={handleSubmit}
            style={{
              padding: '12px 16px',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder={
                currentStep === 'name' 
                  ? "Type your name..." 
                  : "Describe your occupation and interests..."
              }
              style={{
                flexGrow: 1,
                padding: '12px 16px',
                borderRadius: '24px',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--background-secondary)',
                color: 'var(--foreground-primary)',
                outline: 'none',
                fontSize: '16px',
              }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: 'var(--brand-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '42px',
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M22 2L11 13" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M22 2L15 22L11 13L2 9L22 2Z" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChatOnboardingModal;
