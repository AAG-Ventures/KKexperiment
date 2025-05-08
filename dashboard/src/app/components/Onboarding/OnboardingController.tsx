"use client";

import React, { useState, useEffect } from 'react';
import { OnboardingGuide, OnboardingStep } from './OnboardingGuide';

// Define onboarding steps based on the user's requirements
const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Dashboard',
    content: "Welcome to MindExtension.me! This is your personalized dashboard where you can manage tasks, view your calendar and other widgets, work with your files, and monitor your AI activities. Your productivity journey starts here.",
    targetSelector: '[data-component-name="Dashboard"] .page-module___pageTitle', // Target main dashboard heading
    position: 'bottom',
  },
  {
    id: 2,
    title: 'Personalization',
    content: "You can customize your dashboard by rearranging widgets to suit your workflow. Drag and drop elements to personalize your experience.",
    targetSelector: '.page-module___cardGrid', // Target the widgets grid
    showAnimation: true,
    position: 'center',
  },
  {
    id: 3,
    title: 'AI Assistants',
    content: "Here you can chat with your assistants, give them tasks and monitor their progress. Your AI agents are ready to help with research, content creation, and more.",
    targetSelector: '.page-module___chatInterface', // Target chat area
    position: 'right',
  },
  {
    id: 4,
    title: 'Create and Explore',
    content: "Click on the 'Create Bubble' to find additional agents, upload more data to your knowledge base, or set up workflows that automate your repetitive tasks.",
    targetSelector: '.page-module___addButtonWrapper', // Target create button
    position: 'left',
  }
];

const ONBOARDING_STORAGE_KEY = 'mindextension_onboarding_complete';

interface OnboardingControllerProps {
  // This component doesn't need props currently, but we might add some in the future
}

export const OnboardingController: React.FC<OnboardingControllerProps> = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(true); // Default to true until we check localStorage

  useEffect(() => {
    // Check if user has completed onboarding before
    const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
    setOnboardingComplete(hasCompletedOnboarding);
    
    // Show onboarding after a small delay to ensure dashboard has fully loaded
    const timer = setTimeout(() => {
      if (!hasCompletedOnboarding) {
        setShowOnboarding(true);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setOnboardingComplete(true);
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setOnboardingComplete(true);
    setShowOnboarding(false);
  };

  // Function to reset onboarding (for testing purposes)
  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    setOnboardingComplete(false);
    setShowOnboarding(true);
  };

  return (
    <>
      <OnboardingGuide 
        steps={onboardingSteps}
        isActive={showOnboarding}
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
      
      {/* Only show this button when in development, for testing */}
      {process.env.NODE_ENV === 'development' && (
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
          Reset Onboarding
        </button>
      )}
    </>
  );
};

export default OnboardingController;
