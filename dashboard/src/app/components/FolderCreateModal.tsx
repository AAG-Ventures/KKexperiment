'use client';

import React, { useState, useRef, useCallback } from 'react';
import styles from './FolderCreateModal.module.css';

interface FolderCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (folderName: string, files: File[]) => void;
}

const FolderCreateModal: React.FC<FolderCreateModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit 
}) => {
  const [folderName, setFolderName] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (folderName.trim()) {
      onSubmit(folderName, files);
      setFolderName('');
      setFiles([]);
      onClose();
    }
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
          <h3>Create New Folder</h3>
          <button 
            className={styles.closeButton} 
            onClick={onClose}
            aria-label="Close"
          >
            <span className={styles.closeIcon}>×</span>
          </button>
        </div>
        <form className={styles.folderForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="folderName" className={styles.formLabel}>Folder Name</label>
            <input
              id="folderName"
              type="text"
              className={styles.formInput}
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Add Files (Optional)</label>
            <div 
              className={`${styles.dropzone} ${isDragging ? styles.dragging : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className={styles.fileInput}
                onChange={handleFileChange}
                multiple
                hidden
              />
              <div className={styles.dropzoneContent}>
                <span className={`icon icon-upload ${styles.uploadIcon}`}></span>
                <p>Drag & drop files here or click to browse</p>
              </div>
            </div>
          </div>
          
          {files.length > 0 && (
            <div className={styles.filePreviewArea}>
              <h4 className={styles.previewHeading}>Selected Files ({files.length})</h4>
              <ul className={styles.fileList}>
                {files.map((file, index) => (
                  <li key={index} className={styles.fileItem}>
                    <div className={styles.fileInfo}>
                      <div className={styles.fileName}>
                        <span className={`icon icon-document ${styles.fileIcon}`}></span>
                        {file.name}
                      </div>
                      <div className={styles.fileSize}>
                        {(file.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    <button 
                      type="button" 
                      className={styles.removeButton}
                      onClick={() => handleRemoveFile(index)}
                      aria-label="Remove file"
                    >
                      <span className={styles.removeIcon}>×</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={!folderName.trim()}
            >
              Create Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FolderCreateModal;
