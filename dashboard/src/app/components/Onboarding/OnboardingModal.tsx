"use client";

import React, { useState, useEffect } from 'react';
import styles from '../../page.module.css';
import ChatOnboardingStep from './ChatOnboardingStep';

interface OnboardingStep {
  title: string;
  content: string;
  highlightSelector: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    title: 'Dashboard',
    content: 'Welcome to MindExtension.me! This is your personalized dashboard where you can manage tasks, view your calendar and other widgets, work with your files, and monitor your AI activities. Your productivity journey starts here.',
    highlightSelector: '.page-module___dashboardWrapper',
  },
  {
    title: 'Personalization',
    content: 'Personalize your workspace by dragging widgets to rearrange them. Try moving some of these cards to the layout that works best for your workflow.',
    highlightSelector: '.page-module___mainContentWrapper',
  },
  {
    title: 'AI Assistants',
    content: 'Access your AI Assistants here. They can help you with various tasks, from answering questions to helping you write code or content.',
    highlightSelector: '.page-module___sidebarSection',
  },
  {
    title: 'Content Creation',
    content: 'Create new documents, start projects, or add new widgets to your dashboard from the quick add menu.',
    highlightSelector: '.page-module___quickAdd',
  },
];

const OnboardingModal: React.FC = () => {
  // State hooks defined at the top level of the component
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [elementPositions, setElementPositions] = useState<Array<{
    id: string;
    rect?: DOMRect;
    animation: 'pulse' | 'shake' | 'bounce' | 'glow';
    color: string;
  }>>([]);
  
  // User data from chat step
  const [userData, setUserData] = useState<{ name: string; occupation: string } | null>(null);
  
  // Flag to check if we're in the chat step or regular onboarding steps
  const [showChatStep, setShowChatStep] = useState<boolean>(true);

  // Check if onboarding has been completed before
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('onboardingCompleted') === 'true';
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, []);
  
  // Handle chat step completion
  const handleChatComplete = (data: { name: string; occupation: string }) => {
    setUserData(data);
    setShowChatStep(false);
  };
  
  // Handle Next button click
  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  // Handle Skip button click - directly update localStorage and close modal
  const handleSkip = () => {
    // Immediately mark as completed in localStorage
    localStorage.setItem('onboardingCompleted', 'true');
    
    // Clear any animations
    setElementPositions([]);
    
    // Hide the modal
    setShowOnboarding(false);
  };

  // Mark onboarding as completed
  const completeOnboarding = () => {
    // Clear any element positions to remove animations
    setElementPositions([]);
    
    // Mark as completed in localStorage
    localStorage.setItem('onboardingCompleted', 'true');
    
    // Hide the onboarding modal
    setShowOnboarding(false);
    
    // Add a small delay before adding a completion class to show a nice transition
    setTimeout(() => {
      const dashboardWrapper = document.querySelector('.page-module___dashboardWrapper');
      if (dashboardWrapper) {
        dashboardWrapper.classList.add('page-module___onboardingCompleted');
      }
    }, 300);
  };

  // Reset onboarding (for testing)
  const resetOnboarding = () => {
    localStorage.removeItem('onboardingCompleted');
    setShowOnboarding(true);
    setCurrentStep(0);
  };
  
  // Find elements on the page and store their positions
  useEffect(() => {
    if (!showOnboarding || (currentStep !== 0 && currentStep !== 1 && currentStep !== 2 && currentStep !== 3)) return;
    
    // Helper function to find parent card/widget container
    const findParentCard = (element: HTMLElement): HTMLElement | null => {
      let parent = element.parentElement;
      // Look for parent container with sufficient size to be a widget
      while (parent && parent.offsetHeight < 100) {
        parent = parent.parentElement;
      }
      return parent as HTMLElement;
    };
    
    // Helper to update element positions with their bounding rects
    const updateElementPositions = (elements: Array<{id: string; element: HTMLElement; animation: 'pulse' | 'shake' | 'bounce' | 'glow'; color: string}>) => {
      setElementPositions(elements.map(item => ({
        id: item.id,
        rect: item.element.getBoundingClientRect(),
        animation: item.animation,
        color: item.color
      })));
    };
    
    const findElements = () => {
      // First clear any existing positions
      setElementPositions([]);
      
      type ElementData = {id: string; element: HTMLElement; animation: 'pulse' | 'shake' | 'bounce' | 'glow'; color: string};
      const elementsToHighlight: ElementData[] = [];
      
      // Step 1: No highlights at all
      if (currentStep === 0) {
        // No highlights for step 1
        return;
      }
      
      // Step 2: Highlight only Active Processes and Calendar widget borders
      else if (currentStep === 1) {
        // Find Active Processes widget (the aside element)
        const activeProcessesWidget = document.querySelector('aside[class*="activeProcessesWidget"]');
        if (activeProcessesWidget && activeProcessesWidget instanceof HTMLElement) {
          elementsToHighlight.push({
            id: 'active-processes',
            element: activeProcessesWidget,
            animation: 'pulse',
            color: '#0AF6BB' // brand accent color
          });
        }
          
        // Find Calendar widget (the div element with Calendar header)
        const calendarWidget = Array.from(document.querySelectorAll('div[class*="cardCalendar"], div[class*="calendarWidget"], div[class*="Calendar"]'))
          .find(el => {
            // Look for calendar widget with a header
            const header = el.querySelector('h3');
            return header && header.textContent?.includes('Calendar');
          });
          
        if (calendarWidget && calendarWidget instanceof HTMLElement) {
          elementsToHighlight.push({
            id: 'calendar-widget',
            element: calendarWidget,
            animation: 'pulse',
            color: '#0AF6BB' // brand accent color
          });
        }
        
        // Update positions with new elements
        updateElementPositions(elementsToHighlight);
      }
      
      // Step 3: Highlight only Chat interface and My Agents widget borders
      else if (currentStep === 2) {
        // Find Chat widget container
        const chatWidget = document.querySelector('div[class*="chatbox"], div[class*="Chat"]');
        if (chatWidget && chatWidget instanceof HTMLElement) {
          elementsToHighlight.push({
            id: 'chat-widget',
            element: chatWidget,
            animation: 'pulse',
            color: '#0AF6BB' // brand accent color
          });
        }
        
        // Find My Agents widget (the aside element with My Agents header)
        const agentElements = Array.from(document.querySelectorAll('aside'));
        const agentsWidget = agentElements.find(el => {
          const header = el.querySelector('h3');
          return header && (header.textContent?.includes('Agent') || header.textContent?.includes('Agents'));
        });
        
        if (agentsWidget && agentsWidget instanceof HTMLElement) {
          elementsToHighlight.push({
            id: 'agents-widget',
            element: agentsWidget,
            animation: 'pulse',
            color: '#0AF6BB' // brand accent color
          });
        }
        
        // Update positions
        updateElementPositions(elementsToHighlight);
      }
      
      // Step 4: Highlight only the Create bubble button
      else if (currentStep === 3) {
        // Target specifically the sticky create button
        const createButton = document.querySelector('button[class*="stickyCreateButton"]');
        if (createButton && createButton instanceof HTMLElement) {
          elementsToHighlight.push({
            id: 'create-button',
            element: createButton,
            animation: 'pulse',
            color: '#0AF6BB' // brand accent color
          });
        }
        
        // Update positions
        updateElementPositions(elementsToHighlight);
      }
    };
    
    // Find elements immediately and then refresh positions when window resizes
    findElements();
    window.addEventListener('resize', findElements);
    
    return () => {
      window.removeEventListener('resize', findElements);
    };
  }, [currentStep]);

  // Render animation overlays based on current step
  const renderStepAnimations = () => {
    if (currentStep < 1 || currentStep > 3 || elementPositions.length === 0) {
      return null;
    }
    
    return (
      <div style={{ pointerEvents: 'none', position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9998 }}>
        {/* Create an SVG overlay with cutouts for the highlighted elements */}
        {currentStep > 0 && (
          <svg 
            width="100%" 
            height="100%" 
            style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              zIndex: 1, 
              pointerEvents: 'none' 
            }}
          >
            {/* Create a filter for the blur effect */}
            <defs>
              <filter id="blur-filter">
                <feGaussianBlur stdDeviation="4" />
              </filter>
            </defs>
            
            {/* Create a path that covers everything except the highlighted elements */}
            <path 
              d={`
                M0,0 H${window.innerWidth} V${window.innerHeight} H0 Z
                ${elementPositions.map(item => {
                  if (!item.rect) return '';
                  const x = item.rect.left - 10;
                  const y = item.rect.top - 10;
                  const width = item.rect.width + 20;
                  const height = item.rect.height + 20;
                  const radius = 8;
                  
                  // Create a rounded rectangle cutout using SVG path
                  return `
                    M${x + radius},${y}
                    H${x + width - radius}
                    A${radius},${radius} 0 0 1 ${x + width},${y + radius}
                    V${y + height - radius}
                    A${radius},${radius} 0 0 1 ${x + width - radius},${y + height}
                    H${x + radius}
                    A${radius},${radius} 0 0 1 ${x},${y + height - radius}
                    V${y + radius}
                    A${radius},${radius} 0 0 1 ${x + radius},${y}
                    Z
                  `;
                }).join(' ')}
              `}
              fillRule="evenodd"
              fill="rgba(0, 0, 0, 0.5)"
              filter="url(#blur-filter)"
            />
          </svg>
        )}
        
        {/* SVG for animations and cutouts in the overlay */}
        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 2 }}>
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            
            <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(10, 246, 187, 0.7)" />
              <stop offset="100%" stopColor="rgba(10, 246, 187, 0.4)" />
            </linearGradient>
          </defs>
          
          {/* Render animations for each element */}
          {elementPositions.map(item => {
            if (!item.rect) return null;
            
            return (
              <g key={item.id}>
                {/* Subtler glow effect with consistent accent color */}
                <rect 
                  x={item.rect.left - 2} 
                  y={item.rect.top - 2} 
                  width={item.rect.width + 4} 
                  height={item.rect.height + 4} 
                  rx="6" 
                  fill="none"
                  stroke="url(#accentGradient)"
                  strokeWidth="2"
                  filter="url(#glow)"
                  strokeOpacity="0.6"
                >
                  {/* All steps now use the same subtle pulsing effect */}
                  <animate 
                    attributeName="stroke-opacity" 
                    values="0.4;0.7;0.4" 
                    dur="2.5s" 
                    repeatCount="indefinite" 
                  />
                  <animate 
                    attributeName="stroke-width" 
                    values="1.5;3;1.5" 
                    dur="2.5s" 
                    repeatCount="indefinite" 
                  />
                </rect>
                
                {/* Inner rectangle that matches the element exactly */}
                <rect 
                  x={item.rect.left} 
                  y={item.rect.top} 
                  width={item.rect.width} 
                  height={item.rect.height} 
                  rx="4" 
                  fill="none" 
                  stroke="rgba(10, 246, 187, 0.5)"
                  strokeWidth="1"
                  strokeOpacity="0.5"
                />
              </g>
            );
          })}
        </svg>
      </div>
    );
  };



  const handleNextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };
  
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Render appropriate content based on current step
  const renderContent = () => {
    // Show chat step first
    if (showChatStep) {
      return (
        <ChatOnboardingStep 
          onComplete={handleChatComplete}
          stepNumber={1}
          totalSteps={onboardingSteps.length + 1}
        />
      );
    }
    
    // Show regular onboarding steps after chat
    return (
      <div className={styles.onboardingContent}>
        {/* Step indicator dots */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', gap: '8px' }}>
          {/* Render chat step dot */}
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: 'transparent',
              border: `2px solid var(--foreground-muted)`,
              transition: 'all 0.2s ease',
            }}
          />
          {/* Render dots for each regular step */}
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: index === currentStep ? 'var(--brand-primary)' : 'transparent',
                border: `2px solid ${index === currentStep ? 'var(--brand-primary)' : 'var(--foreground-muted)'}`,
                transition: 'all 0.2s ease',
              }}
            />
          ))}
        </div>
        
        <div className={styles.onboardingHeader}>
          <h2 style={{ 
            margin: '0 0 16px 0', 
            fontWeight: '600', 
            fontSize: '24px',
            color: 'var(--foreground-primary)'
          }}>{onboardingSteps[currentStep].title}</h2>
        </div>
        
        <p style={{ 
          margin: '0 0 24px 0', 
          lineHeight: '1.5',
          color: 'var(--foreground-secondary)' 
        }}>{onboardingSteps[currentStep].content}</p>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <button
            onClick={handleNext}
            style={{
              backgroundColor: 'var(--brand-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 24px',
              cursor: 'pointer',
              fontWeight: 600,
              boxShadow: '0 2px 10px rgba(10, 246, 187, 0.3)',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(10, 246, 187, 0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(10, 246, 187, 0.3)';
            }}
          >
            {currentStep < onboardingSteps.length - 1 ? 'Next' : 'Get Started'}
          </button>
        </div>
      </div>
    );
    

  };

  // If onboarding is not shown, don't render anything
  if (!showOnboarding) {
    return null;
  }
  
  // Render the modal
  return (
    <>
      {/* Render step-specific animation overlays - only for regular onboarding steps */}
      {!showChatStep && renderStepAnimations()}

      {/* Semi-transparent overlay - only for chat step */}
      {showChatStep && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(2px)',
            zIndex: 9998,
            pointerEvents: 'auto', // Capture clicks during chat step
          }}
          onClick={(e) => e.stopPropagation()} // Prevent clicks from passing through
        />
      )}
      
      {/* Onboarding modal */}
      <div
        style={{
          position: 'fixed',
          zIndex: 9999,
          width: showChatStep ? '450px' : '360px',
          padding: '24px',
          backgroundColor: 'var(--background-primary)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
          borderRadius: '8px',
          border: '1px solid var(--border-light)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '90vw',
          pointerEvents: 'auto', // Ensure the modal captures all clicks
        }}
        onClick={(e) => e.stopPropagation()} // Prevent clicks from reaching elements below
      >
        {renderContent()}
      </div>
    </>
  );
};

export default OnboardingModal;
