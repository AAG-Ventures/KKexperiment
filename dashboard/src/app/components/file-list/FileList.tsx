"use client";

import React from 'react';
import { FileIcon, FolderIcon, FileTextIcon, FileCodeIcon } from 'lucide-react';
import styles from './fileList.module.css';

// File status types
type FileStatus = 'unchanged' | 'modified' | 'added' | 'deleted';

interface FileItem {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  status: FileStatus;
  lastModified: Date;
  fileType?: string; // e.g., "tsx", "css", "json"
}

interface FileListProps {
  files: FileItem[];
  onFileClick: (file: FileItem) => void;
}

export const FileList: React.FC<FileListProps> = ({ files, onFileClick }) => {
  // Helper to get appropriate icon based on file type
  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') {
      return <FolderIcon size={16} className={styles.fileIcon} />;
    }
    
    // Based on file extension
    switch (file.fileType) {
      case 'tsx':
      case 'jsx':
      case 'ts':
      case 'js':
        return <FileCodeIcon size={16} className={styles.fileIcon} />;
      case 'md':
      case 'txt':
        return <FileTextIcon size={16} className={styles.fileIcon} />;
      default:
        return <FileIcon size={16} className={styles.fileIcon} />;
    }
  };
  
  // Format the relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <div className={styles.fileListContainer}>
      {files.map((file) => (
        <div 
          key={file.id} 
          className={`${styles.fileItem} ${file.status !== 'unchanged' ? styles.hasChanges : ''}`}
          onClick={() => onFileClick(file)}
        >
          <div className={`${styles.fileStatus} ${styles[file.status]}`} />
          {getFileIcon(file)}
          <span className={styles.fileName}>{file.name}</span>
          <span className={styles.filePath}>{file.path}</span>
          <span className={styles.fileModified}>{formatRelativeTime(file.lastModified)}</span>
        </div>
      ))}
    </div>
  );
};

export default FileList;
