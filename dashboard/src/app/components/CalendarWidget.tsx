import React, { useState, useEffect } from 'react';
import styles from '../page.module.css';

// Types for calendar data
interface TaskEvent {
  id: string;
  text: string;
  deadline: Date;
  priority?: 'low' | 'medium' | 'high';
  completed: boolean;
}

interface CalendarProps {
  tasks: TaskEvent[];
  onSelectDate: (date: Date) => void;
  onSelectTask: (taskId: string) => void;
}

const CalendarWidget: React.FC<CalendarProps> = ({ tasks, onSelectDate, onSelectTask }) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarDays, setCalendarDays] = useState<Array<{date: Date | null, tasks: TaskEvent[]}>>([]);
  
  // Get month names for display
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get day names for header
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Handle month navigation
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Handle date selection
  const handleDateClick = (date: Date | null) => {
    // Make sure we only process valid dates
    if (date) {
      console.log('Calendar date selected:', date);
      // Set the selected date in the calendar state
      setSelectedDate(date);
      // Call the parent component's handler with the selected date
      // This will trigger task creation with this date
      onSelectDate(date);
    }
  };

  // Handle task selection
  const handleTaskClick = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering date click
    onSelectTask(taskId);
  };

  // Get tasks for a specific date
  const getTasksForDate = (date: Date | null): TaskEvent[] => {
    if (!date) return [];
    
    return tasks.filter(task => {
      const taskDate = new Date(task.deadline);
      return taskDate.getFullYear() === date.getFullYear() && 
             taskDate.getMonth() === date.getMonth() && 
             taskDate.getDate() === date.getDate();
    });
  };

  // Generate calendar days for current month - limited to 35 days max (5 weeks)
  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get the first day of the month
    const firstDay = new Date(year, month, 1);
    // Get the starting day of the week (0 = Sunday, 1 = Monday, etc.)
    const startingDayOfWeek = firstDay.getDay();
    
    // Get the number of days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Generate array of calendar day objects
    const days = [];
    
    // Add empty slots for days from previous month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: null, tasks: [] });
    }
    
    // Add days of current month with their tasks
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, tasks: getTasksForDate(date) });
    }
    
    // Only show 5 weeks maximum (35 days) to keep calendar compact
    const rows = Math.min(5, Math.ceil(days.length / 7));
    const targetDays = rows * 7;
    
    // Fill remaining slots to complete the grid (up to 35 days = 5 weeks max)
    for (let i = days.length; i < targetDays; i++) {
      days.push({ date: null, tasks: [] });
    }
    
    // Trim to exactly the target number of days
    setCalendarDays(days.slice(0, targetDays));
  }, [currentMonth, tasks]);

  // Check if a date is today
  const isToday = (date: Date | null): boolean => {
    if (!date) return false;
    
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  };

  // Check if a date is the selected date
  const isSelected = (date: Date | null): boolean => {
    if (!date || !selectedDate) return false;
    
    return date.getFullYear() === selectedDate.getFullYear() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getDate() === selectedDate.getDate();
  };

  // Get priority style class for a task
  const getPriorityClass = (priority?: 'low' | 'medium' | 'high'): string => {
    if (!priority) return '';
    
    switch (priority) {
      case 'high': return styles.priorityHigh;
      case 'medium': return styles.priorityMedium;
      case 'low': return styles.priorityLow;
      default: return '';
    }
  };

  // Calculate tasks for display in the tasks section
  const getTasksForDisplay = () => {
    const today = new Date();
    
    // If user selected a date, show tasks for that date
    if (selectedDate) {
      const selectedDateTasks = getTasksForDate(selectedDate) || [];
      // Get formatted date string for the header
      const formatDateHeader = (date: Date): string => {
        const todayDate = new Date();
        const isToday = date.getDate() === todayDate.getDate() && 
                        date.getMonth() === todayDate.getMonth() && 
                        date.getFullYear() === todayDate.getFullYear();

        const tomorrowDate = new Date(todayDate);
        tomorrowDate.setDate(todayDate.getDate() + 1);
        
        const isTomorrow = date.getDate() === tomorrowDate.getDate() && 
                           date.getMonth() === tomorrowDate.getMonth() && 
                           date.getFullYear() === tomorrowDate.getFullYear();
        
        if (isToday) return 'Today';
        if (isTomorrow) return 'Tomorrow';
        
        return `${monthNames[date.getMonth()]} ${date.getDate()}`;
      };
      
      const todayTasks = isToday(selectedDate) ? [] : (getTasksForDate(today) || []);
      
      return { 
        selectedDateTasks,
        selectedDateHeader: formatDateHeader(selectedDate),
        todayTasks
      };
    } 
    
    // Default if no date selected - show today's tasks
    const todayTasks = getTasksForDate(today) || [];
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTasks = getTasksForDate(tomorrow) || [];
    
    return { todayTasks, tomorrowTasks, selectedDateTasks: [] };
  };

  const { todayTasks, tomorrowTasks, selectedDateTasks, selectedDateHeader } = getTasksForDisplay();

  return (
    <div className={styles.calendarWidget}>
      <div className={styles.calendarHeader}>
        <button onClick={goToPreviousMonth} className={styles.calendarNavButton}>
          &#8249;
        </button>
        <div className={styles.calendarTitle}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>
        <button onClick={goToNextMonth} className={styles.calendarNavButton}>
          &#8250;
        </button>
      </div>
      
      <div className={styles.calendarCompactGrid}>
        {/* Day names header */}
        {dayNames.map((day, index) => (
          <div key={`day-name-${index}`} className={styles.calendarDayName}>
            {day}
          </div>
        ))}
        
        {/* Calendar days - compact view */}
        {calendarDays.map((day, index) => (
          <div 
            key={`day-${index}`} 
            className={`${styles.calendarDay} 
                       ${day.date ? '' : styles.calendarDayEmpty}
                       ${isToday(day.date) ? styles.calendarDayToday : ''}
                       ${isSelected(day.date) ? styles.calendarDaySelected : ''}
                       ${day.date && day.tasks && day.tasks.length > 0 ? styles.calendarDayWithTasks : ''}`}
            onClick={() => {
              if (day.date) {
                console.log('Clicking calendar day:', day.date);
                // Call the handler directly with the date
                onSelectDate(day.date);
                // Also update our internal state
                setSelectedDate(day.date);
              }
            }}
          >
            {day.date && (
              <div className={styles.calendarDayNumber}>
                {day.date.getDate()}
                {day.tasks.length > 0 && (
                  <span className={styles.calendarDayTaskIndicator}></span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Tasks section */}
      <div className={styles.calendarUpcomingTasks}>
        {/* Selected date tasks */}
        {selectedDate && (
          <div className={styles.calendarTaskGroup}>
            <div className={styles.calendarTaskGroupHeader}>{selectedDateHeader}</div>
            {selectedDateTasks && selectedDateTasks.length > 0 ? (
              <>
                {selectedDateTasks.slice(0, 3).map(task => (
                  <div 
                    key={task.id} 
                    className={`${styles.calendarUpcomingTask} ${getPriorityClass(task.priority)} ${task.completed ? styles.calendarTaskCompleted : ''}`}
                    onClick={() => onSelectTask(task.id)}
                  >
                    <div className={styles.calendarTaskDot}></div>
                    <div className={styles.calendarTaskText}>{task.text}</div>
                  </div>
                ))}
                {selectedDateTasks && selectedDateTasks.length > 3 && (
                  <div className={styles.calendarTaskMore}>+{selectedDateTasks.length - 3} more</div>
                )}
              </>
            ) : (
              <div className={styles.calendarNoTasks}>No tasks for this date</div>
            )}
          </div>
        )}
        
        {/* Today's tasks (if today isn't the selected date) */}
        {todayTasks && todayTasks.length > 0 && (
          <div className={styles.calendarTaskGroup}>
            <div className={styles.calendarTaskGroupHeader}>Today</div>
            {todayTasks && Array.isArray(todayTasks) && todayTasks.slice(0, 2).map(task => (
              <div 
                key={task.id} 
                className={`${styles.calendarUpcomingTask} ${getPriorityClass(task.priority)} ${task.completed ? styles.calendarTaskCompleted : ''}`}
                onClick={() => onSelectTask(task.id)}
              >
                <div className={styles.calendarTaskDot}></div>
                <div className={styles.calendarTaskText}>{task.text}</div>
              </div>
            ))}
            {todayTasks && Array.isArray(todayTasks) && todayTasks.length > 2 && (
              <div className={styles.calendarTaskMore}>+{todayTasks.length - 2} more</div>
            )}
          </div>
        )}
        
        {/* Tomorrow's tasks (only show if no date is selected) */}
        {!selectedDate && tomorrowTasks && Array.isArray(tomorrowTasks) && tomorrowTasks.length > 0 && (
          <div className={styles.calendarTaskGroup}>
            <div className={styles.calendarTaskGroupHeader}>Tomorrow</div>
            {tomorrowTasks && Array.isArray(tomorrowTasks) && tomorrowTasks.slice(0, 2).map(task => (
              <div 
                key={task.id} 
                className={`${styles.calendarUpcomingTask} ${getPriorityClass(task.priority)} ${task.completed ? styles.calendarTaskCompleted : ''}`}
                onClick={() => onSelectTask(task.id)}
              >
                <div className={styles.calendarTaskDot}></div>
                <div className={styles.calendarTaskText}>{task.text}</div>
              </div>
            ))}
            {tomorrowTasks && Array.isArray(tomorrowTasks) && tomorrowTasks.length > 2 && (
              <div className={styles.calendarTaskMore}>+{tomorrowTasks.length - 2} more</div>
            )}
          </div>
        )}
        
        {/* No tasks message */}
        {(selectedDateTasks?.length === 0 || !selectedDateTasks) && 
         (todayTasks?.length === 0 || !todayTasks) && 
         (!selectedDate || !tomorrowTasks || tomorrowTasks?.length === 0) && (
          <div className={styles.calendarNoTasks}>
            {selectedDate ? `No tasks for ${selectedDateHeader}` : 'No upcoming tasks'}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarWidget;
