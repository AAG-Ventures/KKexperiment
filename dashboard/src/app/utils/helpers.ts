/**
 * Utility functions for the dashboard application
 */

/**
 * Generates a UUID (Universally Unique Identifier)
 * Works in both server and client environments
 */
export const generateUUID = (): string => {
  // Check if crypto.randomUUID is available (modern browsers)
  if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  
  // Fallback method
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0,
        v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Formats a date into a human-readable string
 * Returns 'Today', 'Tomorrow', or a formatted date string
 */
export const formatDate = (date: Date | string | number): string => {
  if (!date) return '';
  
  // Ensure we're working with a Date object
  let dateObj: Date;
  try {
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string' || typeof date === 'number') {
      dateObj = new Date(date);
    } else {
      return ''; // Invalid date format
    }
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return ''; // Invalid date
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return ''; // Return empty string on error
  }
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const isToday = dateObj.toDateString() === today.toDateString();
  const isTomorrow = dateObj.toDateString() === tomorrow.toDateString();
  
  if (isToday) return 'Today';
  if (isTomorrow) return 'Tomorrow';
  
  return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
