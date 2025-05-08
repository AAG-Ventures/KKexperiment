"use client";

import React, { useState, useEffect } from 'react';
import styles from './onboarding.module.css';

export type OnboardingStep = {
  id: number;
  title: string;
  content: string;
  targetSelector: string;
  showAnimation?: boolean;
  position?: 'top' | 'right' | 'bottom' | 'left' | 'center';
};

interface OnboardingGuideProps {
  steps: OnboardingStep[];
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({
  steps,
  isActive,
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

  // Find and highlight the target element for the current step
  useEffect(() => {
    if (!isActive) return;

    const step = steps[currentStep];
    const target = document.querySelector(step.targetSelector) as HTMLElement;
    
    if (target) {
      setTargetElement(target);
      
      // Position the modal relative to the target
      const rect = target.getBoundingClientRect();
      const position = step.position || 'bottom';
      
      let top = 0;
      let left = 0;
      
      switch (position) {
        case 'top':
          top = rect.top - 10 - 180; // Modal height + spacing
          left = rect.left + rect.width / 2 - 200; // Modal width / 2
          break;
        case 'right':
          top = rect.top + rect.height / 2 - 90; // Modal height / 2
          left = rect.right + 10;
          break;
        case 'bottom':
          top = rect.bottom + 10;
          left = rect.left + rect.width / 2 - 200; // Modal width / 2
          break;
        case 'left':
          top = rect.top + rect.height / 2 - 90; // Modal height / 2
          left = rect.left - 10 - 400; // Modal width + spacing
          break;
        case 'center':
          top = rect.top + rect.height / 2 - 90;
          left = rect.left + rect.width / 2 - 200;
          break;
      }
      
      // Ensure the modal stays within viewport bounds
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      if (left < 20) left = 20;
      if (left + 400 > viewportWidth - 20) left = viewportWidth - 420;
      if (top < 20) top = 20;
      if (top + 180 > viewportHeight - 20) top = viewportHeight - 200;
      
      setModalPosition({ top, left });
      
      // Add animation class if specified
      if (step.showAnimation) {
        target.classList.add(styles.shakeAnimation);
      } else {
        target.classList.remove(styles.shakeAnimation);
      }
    }
    
    return () => {
      if (target && step.showAnimation) {
        target.classList.remove(styles.shakeAnimation);
      }
    };
  }, [currentStep, isActive, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
      setCurrentStep(0);
    }
  };

  const handleSkip = () => {
    onSkip();
    setCurrentStep(0);
    
    // Remove animation classes from all potential targets
    steps.forEach(step => {
      if (step.showAnimation) {
        const el = document.querySelector(step.targetSelector) as HTMLElement;
        if (el) el.classList.remove(styles.shakeAnimation);
      }
    });
  };

  if (!isActive) return null;

  return (
    <div className={styles.onboardingOverlay}>
      {/* Semi-transparent overlay that blurs the background */}
      <div className={styles.blurOverlay}></div>
      
      {/* Highlight the target element */}
      {targetElement && (
        <div 
          className={styles.highlight}
          style={{
            top: targetElement.getBoundingClientRect().top + 'px',
            left: targetElement.getBoundingClientRect().left + 'px',
            width: targetElement.getBoundingClientRect().width + 'px',
            height: targetElement.getBoundingClientRect().height + 'px',
          }}
        ></div>
      )}
      
      {/* Step modal */}
      <div 
        className={styles.stepModal}
        style={{
          top: modalPosition.top + 'px',
          left: modalPosition.left + 'px',
        }}
      >
        <div className={styles.stepIndicator}>
          {steps.map((_, index) => (
            <div 
              key={index} 
              className={`${styles.stepDot} ${index === currentStep ? styles.active : ''}`}
            ></div>
          ))}
        </div>
        <h3>{steps[currentStep].title || `Step ${currentStep + 1} of ${steps.length}`}</h3>
        <p>{steps[currentStep].content}</p>
        <div className={styles.modalButtons}>
          <button onClick={handleSkip} className={styles.skipButton}>
            Skip Tutorial
          </button>
          <button onClick={handleNext} className={styles.nextButton}>
            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};
