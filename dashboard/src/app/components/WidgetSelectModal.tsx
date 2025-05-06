import React from 'react';
import styles from './WidgetSelectModal.module.css';

type WidgetType = 'calendar' | 'myTasks' | 'activeProcesses' | 'myAgents';

interface WidgetSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWidgetSelect: (widgetType: WidgetType) => void;
}

const WidgetSelectModal: React.FC<WidgetSelectModalProps> = ({ 
  isOpen, 
  onClose,
  onWidgetSelect
}) => {
  const widgetOptions: Array<{id: WidgetType, name: string, description: string, icon: string}> = [
    {
      id: 'calendar',
      name: 'Calendar',
      description: 'Track your schedule and appointments',
      icon: '📅'
    },

    {
      id: 'myTasks',
      name: 'My Tasks',
      description: 'View and manage your to-do list',
      icon: '✓'
    },
    {
      id: 'activeProcesses',
      name: 'Active Processes',
      description: 'Monitor your ongoing workflows',
      icon: '🔄'
    },
    {
      id: 'myAgents',
      name: 'My Agents',
      description: 'Access and manage your AI assistants',
      icon: '🤖'
    }
  ];

  const handleWidgetSelect = (widgetType: WidgetType) => {
    onWidgetSelect(widgetType);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>Select Widget</h3>
          <button 
            className={styles.closeButton} 
            onClick={onClose}
            aria-label="Close"
          >
            <span className={styles.closeIcon}>×</span>
          </button>
        </div>
        
        <div className={styles.widgetGrid}>
          {widgetOptions.map((widget) => (
            <div
              key={widget.id}
              className={styles.widgetCard}
              onClick={() => handleWidgetSelect(widget.id)}
              draggable={true}
            >
              <div className={styles.widgetIconWrapper}>
                <span>{widget.icon}</span>
              </div>
              <h4 className={styles.widgetTitle}>{widget.name}</h4>
              <p className={styles.widgetDescription}>{widget.description}</p>
            </div>
          ))}
        </div>
        
        <div className={styles.formActions}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default WidgetSelectModal;
