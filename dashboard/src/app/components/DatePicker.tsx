import React, { useState, useEffect, useRef } from 'react';

interface DatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onClose: () => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onDateChange, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(selectedDate));
  const datePickerRef = useRef<HTMLDivElement>(null);
  
  // Generate days for the current month view
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  // Handle clicks outside the date picker to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  // Go to previous month
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  // Go to next month
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  // Select a date
  const selectDate = (day: number) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    onDateChange(newDate);
    onClose();
  };
  
  // Check if a date is today
  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };
  
  // Check if a date is the selected date
  const isSelectedDate = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    );
  };
  
  // Type for calendar day items
  type CalendarDay = {
    key: string | number;
    type: 'empty' | 'day';
    day?: number;
    isCurrentDay: boolean;
    isSelected: boolean;
    onClick?: () => void;
  };

  // Render calendar days
  const getCalendarDays = (): CalendarDay[] => {
    const daysInMonth = getDaysInMonth(
      currentMonth.getFullYear(),
      currentMonth.getMonth()
    );
    const firstDay = getFirstDayOfMonth(
      currentMonth.getFullYear(),
      currentMonth.getMonth()
    );
    
    const days: CalendarDay[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push({
        key: `empty-${i}`,
        type: 'empty',
        isCurrentDay: false,
        isSelected: false
      });
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        key: day,
        type: 'day',
        day: day,
        isCurrentDay: isToday(day),
        isSelected: isSelectedDate(day),
        onClick: () => selectDate(day)
      });
    }
    
    return days;
  };
  
  // Get month name
  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  
  return (
    <div 
      ref={datePickerRef}
      style={{
        position: 'absolute',
        zIndex: 1000,
        backgroundColor: 'var(--background-primary)',
        border: '1px solid var(--border-light)',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        padding: '12px',
        width: '280px',
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px'
      }}>
        <button 
          onClick={prevMonth}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px',
            color: 'var(--foreground-primary)',
          }}
        >
          &#8249;
        </button>
        <div style={{ fontWeight: 'bold' }}>
          {monthName} {currentMonth.getFullYear()}
        </div>
        <button 
          onClick={nextMonth}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px',
            color: 'var(--foreground-primary)',
          }}
        >
          &#8250;
        </button>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '5px',
      }}>
        {/* Day headers */}
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div 
            key={day} 
            style={{
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '12px',
              color: 'var(--foreground-secondary)',
              padding: '5px 0',
            }}
          >
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {getCalendarDays().map((day) => {
          if (day.type === 'empty') {
            return <div key={day.key} style={{ textAlign: 'center', padding: '8px 0' }}></div>;
          }
          
          return (
            <div 
              key={day.key}
              onClick={day.onClick}
              style={{
                textAlign: 'center',
                padding: '8px 0',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: day.isSelected 
                  ? 'var(--action-primary)' 
                  : day.isCurrentDay
                    ? 'var(--action-secondary)'
                    : 'transparent',
                color: day.isSelected
                  ? 'white'
                  : 'var(--foreground-primary)',
                transition: 'background-color 0.2s',
              }}
            >
              {day.day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DatePicker;
