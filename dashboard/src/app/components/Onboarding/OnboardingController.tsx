"use client";

import React, { useState, useEffect } from 'react';
import { OnboardingGuide, OnboardingStep } from './OnboardingGuide';
import ChatOnboardingModal from './ChatOnboardingModal';

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
  // Set to true by default to ensure the chat onboarding appears
  const [showChatOnboarding, setShowChatOnboarding] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(true); // Default to true until we check localStorage
  const [userData, setUserData] = useState<{ name: string; occupation: string; interests: string } | null>(null);

  useEffect(() => {
    // Check if user has completed onboarding before
    const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
    setOnboardingComplete(hasCompletedOnboarding);
    
    // Show onboarding after a small delay to ensure dashboard has fully loaded
    const timer = setTimeout(() => {
      if (!hasCompletedOnboarding) {
        // Show chat onboarding first
        setShowChatOnboarding(true);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle completion of chat onboarding
  const handleChatOnboardingComplete = (data: { name: string; occupation: string; interests: string }) => {
    // Save user data
    setUserData(data);
    
    // Save name to localStorage (can be used elsewhere in the app)
    localStorage.setItem('user_name', data.name);
    
    // Hide chat onboarding
    setShowChatOnboarding(false);
    
    // Show regular onboarding steps
    setShowOnboarding(true);
  };

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
    localStorage.removeItem('user_name');
    setOnboardingComplete(false);
    setUserData(null);
    setShowOnboarding(false);
    setShowChatOnboarding(true);
  };

  return (
    <>
      {/* Show ChatOnboardingModal before the main onboarding flow */}
      <ChatOnboardingModal
        isVisible={showChatOnboarding}
        onComplete={handleChatOnboardingComplete}
      />
      
      <OnboardingGuide 
        steps={onboardingSteps}
        isActive={showOnboarding}
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
      
      {/* Reset button for testing */}
      {
        <button 
          onClick={resetOnboarding}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9999,
            background: 'var(--brand-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          }}
        >
          Reset Onboarding
        </button>
      )}
    </>
  );
};

export default OnboardingController;
