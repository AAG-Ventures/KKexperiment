"use client";

import React, { useState, useEffect, CSSProperties } from 'react';
import styles from '../page.module.css';

interface OnboardingStep {
  title: string;
  content: string;
  highlightSelector: string;
  showAnimation?: boolean;
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
    showAnimation: true,
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
    showAnimation: true,
  },
  {
    title: "Create and Explore",
    content: "Click on the 'Create Bubble' to find additional agents, upload more data to your knowledge base, or set up workflows that automate your repetitive tasks.",
    highlightSelector: ".page-module___stickyCreateButton", // Create button
  }
];

const STORAGE_KEY = 'mindextension_onboarding_complete';

const OnboardingModal = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [highlightElement, setHighlightElement] = useState<HTMLElement | null>(null);
  
  // Check if user has completed onboarding
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem(STORAGE_KEY) === 'true';
    if (!hasCompletedOnboarding) {
      // Wait a moment for the dashboard to render
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Find and highlight the element for current step
  useEffect(() => {
    if (!showOnboarding) return;
    
    const step = onboardingSteps[currentStep];
    
    try {
      const targetElement = document.querySelector(step.highlightSelector) as HTMLElement;
      if (targetElement) {
        setHighlightElement(targetElement);
        
        // Special handling for second step to highlight multiple elements
        if (currentStep === 1) { // Personalization step
          // Find all widget cards and add animations to show they are draggable
          const widgetContainers = document.querySelectorAll('[class*="activeProcessesWidget"], [class*="knowledgeWidget"], [class*="taskWidget"]') as NodeListOf<HTMLElement>;
          
          widgetContainers.forEach((widget, index) => {
            // Stagger animations for a nice effect
            setTimeout(() => {
              widget.classList.add(styles.highlightGlow);
              // Only add shake to a couple of widgets to make it clear they can be moved
              if (index < 2) {
                widget.classList.add(styles.shakeAnimation);
              }
            }, index * 300);
          });
          
          // Also try to find specific widgets by their container styles
          const taskWidgets = document.querySelectorAll('aside') as NodeListOf<HTMLElement>;
          taskWidgets.forEach((widget, index) => {
            if (index === 0 || index === 1) { // Target the first few sidebar widgets
              setTimeout(() => {
                widget.classList.add(styles.shakeAnimation);
              }, 600 + index * 300);
            }
          });
          
          // Highlight any drag handles that might exist
          const dragHandles = document.querySelectorAll('[class*="dragHandle"]') as NodeListOf<HTMLElement>;
          dragHandles.forEach((handle) => {
            handle.classList.add(styles.shakeAnimation);
          });
        }
        } else if (step.showAnimation) {
          targetElement.classList.add(styles.shakeAnimation);
        }
      }
    } catch (err) {
      console.error("Error finding target element:", err);
    }
    
    return () => {
      try {
        // Clean up animations
        if (currentStep === 1) {
          // Remove animations from all widgets
          const widgetCards = document.querySelectorAll('.page-module___card') as NodeListOf<HTMLElement>;
          widgetCards.forEach(card => {
            card.classList.remove(styles.highlightGlow, styles.shakeAnimation);
          });
        } else {
          const targetElement = document.querySelector(step.highlightSelector) as HTMLElement;
          if (targetElement && step.showAnimation) {
            targetElement.classList.remove(styles.shakeAnimation);
          }
        }
      } catch (e) {}
    };
  }, [currentStep, showOnboarding]);
  
  const handleNext = () => {
    console.log('Next button clicked, current step:', currentStep);
    if (currentStep < onboardingSteps.length - 1) {
      const nextStep = currentStep + 1;
      console.log('Moving to next step:', nextStep);
      setCurrentStep(nextStep);
      
      // Find and highlight the element for the next step immediately
      try {
        const step = onboardingSteps[nextStep];
        const targetElement = document.querySelector(step.highlightSelector) as HTMLElement;
        if (targetElement) {
          setHighlightElement(targetElement);
          
          if (step.showAnimation) {
            targetElement.classList.add(styles.shakeAnimation);
          }
        }
      } catch (err) {
        console.error("Error updating target element for next step:", err);
      }
    } else {
      completeOnboarding();
    }
  };
  
  const handleSkip = () => {
    completeOnboarding();
  };
  
  const completeOnboarding = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setShowOnboarding(false);
    setCurrentStep(0);
    
    // Clean up any animations
    onboardingSteps.forEach(step => {
      if (step.showAnimation) {
        try {
          const el = document.querySelector(step.highlightSelector) as HTMLElement;
          if (el) el.classList.remove(styles.shakeAnimation);
        } catch (e) {}
      }
    });
  };
  
  // For debugging/testing - add button to reset onboarding
  const resetOnboarding = () => {
    localStorage.removeItem(STORAGE_KEY);
    setShowOnboarding(true);
    setCurrentStep(0);
  };
  
  if (!showOnboarding) {
    return (
      // Development mode only - button to reset onboarding
      process.env.NODE_ENV === 'development' ? (
        <button 
          onClick={resetOnboarding}
          style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            zIndex: 9999,
            background: '#333',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '5px 10px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Show Onboarding
        </button>
      ) : null
    );
  }
  
  const currentStepData = onboardingSteps[currentStep];
  
  // Calculate modal position
  let modalStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 10000,
    maxWidth: '400px',
    backgroundColor: 'var(--card-bg)',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    padding: '20px',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  };
  
  // Position modal near highlight element if available
  if (highlightElement) {
    const rect = highlightElement.getBoundingClientRect();
    
    // Default to bottom positioning
    modalStyle = {
      ...modalStyle,
      top: `${rect.bottom + 20}px`,
      left: `${rect.left + rect.width / 2}px`,
      transform: 'translateX(-50%)',
    };
    
    // Keep modal within viewport
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    if (rect.bottom + 200 > viewportHeight) {
      // Position above element if not enough room below
      modalStyle.top = `${rect.top - 20}px`;
      modalStyle.transform = 'translate(-50%, -100%)';
    }
    
    // Adjust horizontal position if needed
    if (rect.left < 200) {
      modalStyle.left = '200px';
      if (modalStyle.transform && typeof modalStyle.transform === 'string') {
        modalStyle.transform = modalStyle.transform.replace('translateX(-50%)', 'translateX(0)');
      }
    } else if (rect.right + 200 > viewportWidth) {
      modalStyle.left = `${viewportWidth - 200}px`;
      if (modalStyle.transform && typeof modalStyle.transform === 'string') {
        modalStyle.transform = modalStyle.transform.replace('translateX(-50%)', 'translateX(-100%)');
      }
    }
  }
  
  return (
    <div className={styles.onboardingOverlay} style={{ pointerEvents: 'auto' }}>
      {/* Semi-transparent overlay - add pointer-events: auto to capture all clicks */}
      {currentStep !== 1 && ( // Don't show overlay for second step (index 1)
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
            pointerEvents: 'auto', // This captures clicks on the overlay
          }}
          onClick={(e) => e.stopPropagation()} // Prevent clicks from passing through
        />
      )}
      
      {/* Highlight effect for target element */}
      {highlightElement && (
        <div
          style={{
            position: 'absolute',
            top: highlightElement.getBoundingClientRect().top,
            left: highlightElement.getBoundingClientRect().left,
            width: highlightElement.getBoundingClientRect().width,
            height: highlightElement.getBoundingClientRect().height,
            zIndex: 9999,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
            borderRadius: '8px',
            animation: 'pulse 2s infinite',
          }}
        />
      )}
      
      {/* Onboarding modal */}
      <div 
        style={{
          ...modalStyle,
          pointerEvents: 'auto' // Ensure the modal captures all clicks
        }}
        onClick={(e) => e.stopPropagation()} // Prevent clicks from reaching elements below
      >
        {/* Step indicator dots */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', gap: '8px' }}>
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
        
        <h3 style={{ margin: '0 0 12px 0', color: 'var(--foreground-primary)' }}>
          {currentStepData.title}
        </h3>
        
        <p style={{ margin: '0 0 24px 0', color: 'var(--foreground-secondary)', lineHeight: 1.5 }}>
          {currentStepData.content}
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            onClick={handleSkip}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--foreground-secondary)',
              cursor: 'pointer',
              padding: '8px 16px',
            }}
          >
            Skip
          </button>
          
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleNext();
            }}
            style={{
              backgroundColor: 'var(--brand-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            {currentStep === onboardingSteps.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
