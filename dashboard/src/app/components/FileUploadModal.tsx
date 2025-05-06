import React, { useState, useRef, useCallback, useEffect } from 'react';
import styles from './FolderCreateModal.module.css'; // Reuse existing styles initially
import { UploadIcon } from './Icons';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (destinationFolder: string, files: File[]) => void;
  availableFolders: Array<{id: string, name: string}>;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  availableFolders
}) => {
  const [destinationFolder, setDestinationFolder] = useState(availableFolders[0]?.id || '');
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setFiles([]);
      setDestinationFolder(availableFolders[0]?.id || '');
    }
  }, [isOpen, availableFolders]);

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

  const handleSubmit = () => {
    onSubmit(destinationFolder, files);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Upload Files</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <span className={styles.closeIcon}>×</span>
          </button>
        </div>
        
        <div className={styles.folderForm}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Destination Folder</label>
            <select 
              value={destinationFolder} 
              onChange={(e) => setDestinationFolder(e.target.value)}
              className={styles.formInput}
            >
              {availableFolders.map(folder => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          {/* Drag & drop area */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Files</label>
            <div 
              className={`${styles.dropzone} ${isDragging ? styles.dragging : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className={styles.dropzoneContent}>
                <UploadIcon size={32} />
                <p>Drag & drop files here or click to browse</p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className={styles.filePreviewArea}>
              <div className={styles.previewHeading}>
                {files.length} file{files.length !== 1 ? 's' : ''} selected
              </div>
              <ul className={styles.fileList}>
                {files.map((file, index) => (
                  <li key={index} className={styles.fileItem}>
                    <div className={styles.fileInfo}>
                      <span className={styles.fileName}>
                        <span className={styles.fileIcon}>📄</span>
                        {file.name}
                      </span>
                      <span className={styles.fileSize}>({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button
                      className={styles.removeButton}
                      onClick={() => handleRemoveFile(index)}
                      aria-label="Remove file"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className={styles.formActions}>
            <button className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button
              className={styles.submitButton}
              onClick={handleSubmit}
              disabled={files.length === 0}
            >
              Upload Files
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;
