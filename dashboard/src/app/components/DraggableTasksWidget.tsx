import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PlusIcon } from './Icons';
import styles from '../page.module.css';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  deadline?: Date;
  priority?: 'low' | 'medium' | 'high';
}

interface DraggableTasksWidgetProps {
  id: string;
  tasks: Task[];
  isAddingTask: boolean;
  newTaskText: string;
  newTaskDeadline: Date | null;
  showDatePicker: boolean;
  showPrioritySelector: boolean;
  newTaskPriority: 'low' | 'medium' | 'high' | null;
  isNotificationPanelOpen: boolean;
  newTaskInputRef: React.RefObject<HTMLInputElement | null>;
  onTaskClick: (taskId: string) => void;
  onTaskToggle: (taskId: string) => void;
  onAddTask: () => void;
  onTaskTextChange: (text: string) => void;
  onTaskDeadlineChange: (date: Date | null) => void;
  onTaskPriorityChange: (priority: 'low' | 'medium' | 'high' | null) => void;
  onSaveTask: () => void;
  onCancelTask: () => void;
  onShowDatePicker: () => void;
  onHideDatePicker: () => void;
  onShowPrioritySelector: () => void;
  onHidePrioritySelector: () => void;
  formatDeadline: (deadline: Date | string) => string;
  isDeadlineUrgent: (dateInput: string | number | Date) => boolean;
  isDeadlineSoon: (dateInput: string | number | Date) => boolean;
  isDeadlineNormal: (dateInput: string | number | Date) => boolean;
}

export function DraggableTasksWidget({ 
  id, 
  tasks, 
  isAddingTask, 
  newTaskText, 
  newTaskDeadline, 
  showDatePicker, 
  showPrioritySelector, 
  newTaskPriority, 
  isNotificationPanelOpen, 
  newTaskInputRef, 
  onTaskClick, 
  onTaskToggle, 
  onAddTask, 
  onTaskTextChange, 
  onTaskDeadlineChange, 
  onTaskPriorityChange, 
  onSaveTask, 
  onCancelTask, 
  onShowDatePicker, 
  onHideDatePicker, 
  onShowPrioritySelector, 
  onHidePrioritySelector, 
  formatDeadline, 
  isDeadlineUrgent, 
  isDeadlineSoon, 
  isDeadlineNormal 
}: DraggableTasksWidgetProps) {
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
      className={`${styles.card} ${styles.cardTasks} ${isDragging ? styles.dragging : ''}`}
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
        <h3>My Tasks</h3>
        {!isNotificationPanelOpen && (
          <button 
            className={styles.newTabButton} 
            title="Add New Task"
            type="button"
            onClick={onAddTask}
          >
            <PlusIcon size={20} />
          </button>
        )}
      </div>
      <div className={styles.tasksContainer}>
        {/* Active Tasks */}
        <div className={styles.taskSection}>
          {tasks.filter(task => !task.completed).length === 0 && !isAddingTask ? (
            <div className={styles.emptyTasksMessage}>
              <div className={styles.emptyTasksIcon}>✓</div>
              <p>You&apos;ve completed everything in your plan!</p>
              <button 
                className={styles.addTaskButton}
                onClick={onAddTask}
              >
                Add a new task
              </button>
            </div>
          ) : (
            <ul className={styles.taskList}>
              {tasks
                .filter(task => !task.completed)
                .sort((a, b) => {
                  if (!a.deadline && !b.deadline) return 0;
                  if (!a.deadline) return 1;
                  if (!b.deadline) return -1;
                  
                  try {
                    let aTime, bTime;
                    
                    try {
                      aTime = a.deadline instanceof Date ? 
                        a.deadline.getTime() : 
                        new Date(a.deadline).getTime();
                    } catch (e) {
                      return 1;
                    }
                    
                    try {
                      bTime = b.deadline instanceof Date ? 
                        b.deadline.getTime() : 
                        new Date(b.deadline).getTime();
                    } catch (e) {
                      return -1;
                    }
                    
                    if (isNaN(aTime)) return 1;
                    if (isNaN(bTime)) return -1;
                    
                    return aTime - bTime;
                  } catch (e) {
                    console.error('Error sorting tasks:', e);
                    return 0;
                  }
                })
                .map(task => (
                  <li key={task.id} className={`${styles.taskItem} ${styles.taskItemClickable}`}>
                    <button 
                      className={styles.taskCheckbox} 
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskToggle(task.id);
                      }}
                      aria-label={`Mark ${task.text} as complete`}
                    >
                      <span className={styles.checkboxInner}></span>
                    </button>
                    <div 
                      className={styles.taskContent}
                      onClick={() => onTaskClick(task.id)}
                    >
                      <span className={styles.taskText}>{task.text}</span>
                      {task.deadline && (
                        <span className={`${styles.taskDeadline} 
                          ${isDeadlineUrgent(task.deadline) ? styles.urgentDeadline : ''}
                          ${isDeadlineSoon(task.deadline) ? styles.soonDeadline : ''}
                          ${isDeadlineNormal(task.deadline) ? styles.normalDeadline : ''}`}>
                          {formatDeadline(task.deadline)}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              
              {isAddingTask && (
                <li className={styles.taskItem}>
                  <button className={styles.taskCheckbox}>
                    <span className={styles.checkboxInner}></span>
                  </button>
                  <div className={styles.newTaskContainer}>
                    <input
                      ref={newTaskInputRef}
                      className={styles.newTaskInput}
                      type="text"
                      placeholder="Type a new task..."
                      value={newTaskText}
                      onChange={(e) => onTaskTextChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onSaveTask();
                        } else if (e.key === 'Escape') {
                          onCancelTask();
                        }
                      }}
                    />
                  </div>
                </li>
              )}
            </ul>
          )}
        </div>
        
        {/* Completed Tasks */}
        {tasks.filter(task => task.completed).length > 0 && (
          <div className={styles.taskSection}>
            <h4 className={styles.sectionTitle}>Completed</h4>
            <ul className={styles.taskList}>
              {tasks
                .filter(task => task.completed)
                .map(task => (
                  <li key={task.id} className={`${styles.taskItem} ${styles.taskItemClickable}`}>
                    <button 
                      className={`${styles.taskCheckbox} ${styles.checked}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskToggle(task.id);
                      }}
                      aria-label={`Mark ${task.text} as incomplete`}
                    >
                      <span className={`${styles.checkboxInner} ${styles.checked}`}>
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 6L5 8L9 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </button>
                    <div 
                      className={styles.taskContent}
                      onClick={() => onTaskClick(task.id)}
                    >
                      <span className={styles.taskText}>{task.text}</span>
                      {task.deadline && (
                        <span className={`${styles.taskDeadline} 
                          ${isDeadlineUrgent(task.deadline) ? styles.urgentDeadline : ''}
                          ${isDeadlineSoon(task.deadline) ? styles.soonDeadline : ''}
                          ${isDeadlineNormal(task.deadline) ? styles.normalDeadline : ''}`}>
                          {formatDeadline(task.deadline)}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
