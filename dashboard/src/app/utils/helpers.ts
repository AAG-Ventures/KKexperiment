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
