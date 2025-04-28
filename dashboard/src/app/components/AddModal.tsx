'use client';

import React from 'react';
import styles from './AddModal.module.css';

type AddModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onOptionSelect: (option: string) => void;
};

const AddModal: React.FC<AddModalProps> = ({ isOpen, onClose, onOptionSelect }) => {
  if (!isOpen) return null;

  const options = [
    { 
      id: 'folder', 
      label: 'Folder', 
      iconClass: styles.folderIcon,
      description: 'Organize your content' 
    },
    { 
      id: 'file', 
      label: 'File', 
      iconClass: styles.fileIcon,
      description: 'Create a new document' 
    },
    { 
      id: 'agent', 
      label: 'Agent', 
      iconClass: styles.agentIcon,
      description: 'Add an AI assistant' 
    },
    { 
      id: 'workflow', 
      label: 'Workflow', 
      iconClass: styles.workflowIcon,
      description: 'Set up automation' 
    },
    { 
      id: 'custom', 
      label: 'Custom / Other', 
      iconClass: styles.customIcon,
      description: 'Create something else' 
    }
  ];

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>Create New</h3>
          <button 
            className={styles.closeButton} 
            onClick={onClose}
            aria-label="Close"
          >
            <span className={styles.closeIcon}>×</span>
          </button>
        </div>
        <div className={styles.optionsList}>
          {options.map((option) => (
            <button
              key={option.id}
              className={styles.optionButton}
              onClick={() => onOptionSelect(option.id)}
            >
              <div className={styles.optionIconWrapper}>
                <div className={`${styles.optionIcon} ${option.iconClass}`}></div>
              </div>
              <div className={styles.optionContent}>
                <span className={styles.optionLabel}>{option.label}</span>
                <span className={styles.optionDescription}>{option.description}</span>
              </div>
              <span className={styles.arrowIcon}>›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddModal;
