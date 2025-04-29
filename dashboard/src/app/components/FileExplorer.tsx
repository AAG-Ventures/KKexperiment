'use client'

import React, { useState } from 'react';
import styles from './FileExplorer.module.css';

// Define types for our file structure
type FileType = 'document' | 'spreadsheet' | 'presentation' | 'pdf' | 'image' | 'code' | 'other';

interface FileItem {
  id: string;
  name: string;
  type: FileType;
  icon?: string;
}

interface FolderItem {
  id: string;
  name: string;
  icon?: string;
  children: (FileItem | FolderItem)[];
}

type ExplorerItem = FileItem | FolderItem;

// Utility to check if item is a folder
const isFolder = (item: ExplorerItem): item is FolderItem => {
  return 'children' in item;
};

// File icon mapping
const getFileIcon = (type: FileType): string => {
  switch (type) {
    case 'document':
      return '📝';
    case 'spreadsheet':
      return '📊';
    case 'presentation':
      return '📈';
    case 'pdf':
      return '📄';
    case 'image':
      return '🖼️';
    case 'code':
      return '📜';
    default:
      return '📃';
  }
};

// Get CSS class based on file type
const getFileClass = (type: FileType): string => {
  switch (type) {
    case 'document':
      return styles.docFile;
    case 'spreadsheet':
      return styles.spreadsheetFile;
    case 'presentation':
      return styles.presentationFile;
    case 'pdf':
      return styles.pdfFile;
    case 'image':
      return styles.imageFile;
    default:
      return '';
  }
};

interface FileItemProps {
  file: FileItem;
  onSelect: (item: ExplorerItem) => void;
  selected: string | null;
}

const File: React.FC<FileItemProps> = ({ file, onSelect, selected }) => {
  const isActive = selected === file.id;
  const fileIcon = file.icon || getFileIcon(file.type);
  const fileClass = getFileClass(file.type);
  
  return (
    <li className={`${styles.fileItem} ${fileClass}`}>
      <div 
        className={`${styles.fileRow} ${isActive ? styles.active : ''}`}
        onClick={() => onSelect(file)}
      >
        <span className={styles.icon}>
          <span className={styles.fileIcon}>{fileIcon}</span>
        </span>
        <span className={styles.name}>{file.name}</span>
        <span className={styles.contextMenuTrigger}>⋮</span>
      </div>
    </li>
  );
};

interface FolderProps {
  folder: FolderItem;
  onSelect: (item: ExplorerItem) => void;
  selected: string | null;
  defaultExpanded?: boolean;
}

const Folder: React.FC<FolderProps> = ({ 
  folder, 
  onSelect, 
  selected,
  defaultExpanded = false
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const isActive = selected === folder.id;
  const folderIcon = folder.icon || (expanded ? '📂' : '📁');
  
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };
  
  return (
    <li className={styles.folderItem}>
      <div 
        className={`${styles.folderRow} ${isActive ? styles.active : ''}`}
        onClick={() => onSelect(folder)}
      >
        <span 
          className={`${styles.chevron} ${expanded ? styles.chevronExpanded : ''}`}
          onClick={toggleExpand}
        >
          ▶
        </span>
        <span className={styles.icon}>
          <span className={styles.folderIcon}>{folderIcon}</span>
        </span>
        <span className={styles.name}>{folder.name}</span>
        <span className={styles.contextMenuTrigger}>⋮</span>
      </div>
      
      {expanded && (
        <ul className={styles.children}>
          {folder.children.map((item) => (
            <React.Fragment key={item.id}>
              {isFolder(item) ? (
                <Folder 
                  folder={item} 
                  onSelect={onSelect} 
                  selected={selected} 
                />
              ) : (
                <File 
                  file={item} 
                  onSelect={onSelect} 
                  selected={selected} 
                />
              )}
            </React.Fragment>
          ))}
        </ul>
      )}
    </li>
  );
};

interface FileExplorerProps {
  data: ExplorerItem[];
  onSelect?: (item: ExplorerItem) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ 
  data,
  onSelect = () => {} 
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const handleSelect = (item: ExplorerItem) => {
    setSelectedId(item.id);
    onSelect(item);
  };
  
  return (
    <div className={styles.fileExplorer}>
      <ul className={styles.fileTree}>
        {data.map((item) => (
          <React.Fragment key={item.id}>
            {isFolder(item) ? (
              <Folder 
                folder={item} 
                onSelect={handleSelect} 
                selected={selectedId}
                defaultExpanded={item.id === 'topics' || item.id === 'shared'} // Auto-expand main folders
              />
            ) : (
              <File 
                file={item} 
                onSelect={handleSelect} 
                selected={selectedId} 
              />
            )}
          </React.Fragment>
        ))}
      </ul>
    </div>
  );
};

export default FileExplorer;
