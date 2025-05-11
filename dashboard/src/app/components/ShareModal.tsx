'use client'

import React, { useState } from 'react';
import styles from './ShareModal.module.css';

interface ShareModalProps {
  fileName: string;
  onClose: () => void;
  onShare: (email: string) => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ fileName, onClose, onShare }) => {
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(true);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateEmail(email)) {
      onShare(email);
      onClose();
    } else {
      setIsValid(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <h2 className={styles.title}>Share "{fileName}"</h2>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Enter email address to share with:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setIsValid(true); // Reset validation on change
              }}
              placeholder="colleague@example.com"
              className={`${styles.emailInput} ${!isValid ? styles.invalid : ''}`}
              autoFocus
            />
            {!isValid && <p className={styles.errorMessage}>Please enter a valid email address</p>}
          </div>
          
          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.shareButton}>
              Share
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareModal;
