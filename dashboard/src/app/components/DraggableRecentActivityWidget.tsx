import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ClockIcon, EditIcon, FolderIcon, MessageIcon, FileIcon, CheckIcon } from './Icons';
import styles from '../page.module.css';

export type Activity = {
  id: string;
  type: 'edit' | 'folder' | 'message' | 'file' | 'task';
  subject: string;
  time: string;
};

interface DraggableRecentActivityWidgetProps {
  id: string;
  activities?: Activity[];
}

// Default activities if none are provided
const defaultActivities: Activity[] = [
  {
    id: '1',
    type: 'edit',
    subject: 'Marketing Plan',
    time: '10 minutes ago'
  },
  {
    id: '2',
    type: 'folder',
    subject: 'Q2 Reports',
    time: 'Yesterday'
  },
  {
    id: '3',
    type: 'message',
    subject: 'Team Chat',
    time: 'Yesterday'
  },
  {
    id: '4',
    type: 'file',
    subject: 'Presentation.pdf',
    time: '2 days ago'
  },
  {
    id: '5',
    type: 'task',
    subject: 'Project Review',
    time: '3 days ago'
  }
];

export function DraggableRecentActivityWidget({ id, activities = defaultActivities }: DraggableRecentActivityWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  // Helper function to get the appropriate icon based on activity type
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'edit':
        return <EditIcon size={20} />;
      case 'folder':
        return <FolderIcon size={20} />;
      case 'message':
        return <MessageIcon size={20} />;
      case 'file':
        return <FileIcon size={20} />;
      case 'task':
        return <CheckIcon size={20} />;
      default:
        return <ClockIcon size={20} />;
    }
  };

  // Helper function to get the appropriate text based on activity type
  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'edit':
        return `Updated <strong>${activity.subject}</strong>`;
      case 'folder':
        return `Created <strong>${activity.subject}</strong> folder`;
      case 'message':
        return `New message in <strong>${activity.subject}</strong>`;
      case 'file':
        return `Uploaded <strong>${activity.subject}</strong>`;
      case 'task':
        return `Completed <strong>${activity.subject}</strong>`;
      default:
        return `<strong>${activity.subject}</strong>`;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.card} ${styles.cardActivity} ${isDragging ? styles.dragging : ''}`}
    >
      <div className={styles.widgetHeader}>
        <div 
          className={`${styles.dragHandle} drag-handle-active`}
          {...attributes} 
          {...listeners}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <span className={styles.dragIcon}>⋮⋮</span>
        </div>
        <h3>Recent Activity</h3>
        <span className={styles.widgetIcon}>
          <ClockIcon size={20} />
        </span>
      </div>
      <div className={styles.cardContent}>
        <ul className={styles.activityList}>
          {activities.map(activity => (
            <li key={activity.id} className={styles.activityItem}>
              <span className={styles.activityIcon}>
                {getActivityIcon(activity.type)}
              </span>
              <div className={styles.activityText}>
                <div dangerouslySetInnerHTML={{ __html: getActivityText(activity) }} />
                <div className={styles.activityTime}>{activity.time}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
