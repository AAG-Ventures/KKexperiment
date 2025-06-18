import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import CalendarWidget from './CalendarWidget';
import styles from '../page.module.css';

interface DraggableCalendarWidgetProps {
  id: string;
  tasks: any[];
  onSelectDate: (date: Date) => void;
  onSelectTask: (taskId: string) => void;
}

export function DraggableCalendarWidget({ id, tasks, onSelectDate, onSelectTask }: DraggableCalendarWidgetProps) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.card} ${styles.cardCalendar} ${isDragging ? styles.dragging : ''}`}
      data-onboarding-target="calendar-card"
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
        <h3>Calendar</h3>
        <span className={styles.widgetIcon}>📅</span>
      </div>
      <div className={styles.calendarContainer}>
        <CalendarWidget 
          tasks={tasks}
          onSelectDate={onSelectDate}
          onSelectTask={onSelectTask}
        />
      </div>
    </div>
  );
}
