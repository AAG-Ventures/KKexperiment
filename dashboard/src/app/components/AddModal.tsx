'use client';

import React, { useState, useEffect } from 'react';
import styles from './AddModal.module.css';
import FolderCreateModal from './FolderCreateModal';
import FileUploadModal from './FileUploadModal';
import AgentBrowserModal from './AgentBrowserModal';
import WidgetSelectModal from './WidgetSelectModal';

type AddModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onOptionSelect: (option: string) => void;
  onFolderCreate: (folderName: string, files: File[]) => void;
  onFileUpload: (destinationFolder: string, files: File[]) => void;
  onCreateAgent?: (name: string, description: string, avatar: string, capabilities: string[]) => void;
  onWidgetSelect?: (widgetType: 'calendar' | 'myTasks' | 'activeProcesses' | 'myAgents') => void;
  availableFolders: Array<{id: string, name: string}>;
};

const AddModal: React.FC<AddModalProps> = ({ isOpen, onClose, onOptionSelect, onFolderCreate, onFileUpload, onCreateAgent, onWidgetSelect = () => {}, availableFolders = [] }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  // Reset selectedOption when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setSelectedOption(null);
    }
  }, [isOpen]);
  
  const handleOptionSelect = (option: string) => {
    console.log(`Selected option in AddModal: ${option}`);
    setSelectedOption(option);
    onOptionSelect(option);
  };
  
  const handleClose = () => {
    setSelectedOption(null);
    onClose();
  };
  
  if (!isOpen) return null;
  
  // Show folder creation modal if folder option is selected
  if (selectedOption === 'folder') {
    console.log('Showing FolderCreateModal');
    return (
      <FolderCreateModal 
        isOpen={true}
        onClose={handleClose}
        onSubmit={onFolderCreate}
      />
    );
  }
  
  // Show file upload modal if file option is selected
  if (selectedOption === 'file') {
    return (
      <FileUploadModal 
        isOpen={true}
        onClose={handleClose}
        onSubmit={onFileUpload}
        availableFolders={availableFolders}
      />
    );
  }
  
  // Show agent browser modal if agent option is selected
  if (selectedOption === 'agent' && onCreateAgent) {
    return (
      <AgentBrowserModal 
        onClose={handleClose}
        onCreateAgent={onCreateAgent}
        onSelectAgent={(agent) => {
          console.log(`Selected agent: ${agent.name}`);
          // We'll use the agent's data to create an agent in the dashboard
          onCreateAgent(
            agent.name, 
            agent.description, 
            agent.avatar, 
            agent.capabilities
          );
        }}
      />
    );
  }
  
  // Show widget selection modal if widget option is selected
  if (selectedOption === 'widget') {
    return (
      <WidgetSelectModal
        isOpen={true}
        onClose={handleClose}
        onWidgetSelect={onWidgetSelect}
      />
    );
  }

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
      id: 'widget', 
      label: 'Widget', 
      iconClass: styles.widgetIcon,
      description: 'Add a dashboard widget' 
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
              onClick={() => handleOptionSelect(option.id)}
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
