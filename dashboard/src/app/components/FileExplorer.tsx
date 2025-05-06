'use client'

import React, { useState, useEffect } from 'react';
import styles from './FileExplorer.module.css';
import { FolderIcon, FileIcon, ChevronRightIcon, ChevronDownIcon } from '../components/Icons';

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
export const isFolder = (item: ExplorerItem): item is FolderItem => {
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
  const fileClass = getFileClass(file.type);
  
  return (
    <div 
      className={`${styles.fileRow} ${fileClass} ${isActive ? styles.active : ''}`}
      onClick={() => onSelect(file)}
    >
      <div className={styles.fileIconWrapper}>
        <FileIcon size={16} />
      </div>
      <span className={styles.name}>{file.name}</span>
      <span className={styles.contextMenuTrigger}>⋮</span>
    </div>
  );
};

interface FolderProps {
  folder: FolderItem;
  onSelect: (item: ExplorerItem) => void;
  selected: string | null;
  defaultExpanded?: boolean;
  expandedFolders?: string[];
  onToggleFolder?: (folderId: string) => void;
}

const Folder: React.FC<FolderProps> = ({ 
  folder, 
  onSelect, 
  selected,
  defaultExpanded = false,
  expandedFolders = [],
  onToggleFolder
}) => {
  // Check if this folder should be expanded based on expandedFolders prop
  const shouldBeExpanded = expandedFolders.includes(folder.id) || defaultExpanded;
  
  // Use state for internal tracking of expanded status
  // Always use external state for expansion status
  const [expanded, setExpanded] = useState(shouldBeExpanded);
  
  // Use effect to respond to external expansion requests
  useEffect(() => {
    // Always sync with external state
    setExpanded(shouldBeExpanded);
  }, [shouldBeExpanded]);
  
  const isActive = selected === folder.id;
  
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If this is the topics folder or we have an external toggle handler,
    // use the external state management
    if (folder.id === 'topics' && onToggleFolder) {
      onToggleFolder(folder.id);
    } else {
      // For other folders, use internal state
      setExpanded(!expanded);
    }
  };
  
  return (
    <div className={styles.folderItem}>
      <div 
        className={`${styles.folderRow} ${isActive ? styles.active : ''} ${folder.id === 'topics' ? styles.topicsRow : ''}`}
        onClick={(e) => {
          // Select the folder in all cases
          onSelect(folder);
          
          // Special handling for Topics folder
          if (folder.id === 'topics' && onToggleFolder) {
            e.stopPropagation();
            onToggleFolder('topics');
            return;
          }
        }}
      >
        {/* Only showing arrow, no bullet */}
        <span 
          className={`${styles.chevron} ${expanded ? styles.chevronExpanded : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            
            // Direct implementation for Topics folder open/close functionality
            if (folder.id === 'topics' && onToggleFolder) {
              onToggleFolder('topics');
            } else {
              toggleExpand(e);
            }
          }}
        >
          {folder.id === 'topics' && expandedFolders.includes('topics') ? 
            <ChevronDownIcon size={14} /> : 
            folder.id === 'topics' ? 
            <ChevronRightIcon size={14} /> : 
            expanded ? 
            <ChevronDownIcon size={14} /> : 
            <ChevronRightIcon size={14} />}
        </span>
        <span className={styles.icon}>
          <span className={styles.folderIcon}><FolderIcon size={16} /></span>
        </span>
        <span className={styles.name}>{folder.name}</span>
        <span className={styles.contextMenuTrigger}>⋮</span>
      </div>
      
      {expanded && (
        <div className={styles.children}>
          {/* Only show children if folder is expanded according to external state */}
          {(folder.id === 'topics' ? expandedFolders.includes('topics') : expanded) && 
            folder.children.map((item) => (
              <div key={item.id}>
                {isFolder(item) ? (
                  <Folder 
                    folder={item} 
                    onSelect={onSelect} 
                    selected={selected}
                    expandedFolders={expandedFolders}
                    defaultExpanded={false} // Let expandedFolders control expansion
                    onToggleFolder={onToggleFolder}
                  />
                ) : (
                  <File 
                    file={item} 
                    onSelect={onSelect} 
                    selected={selected} 
                  />
                )}
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
};

// Export the props interface to make it available outside this file
export interface FileExplorerProps {
  data: ExplorerItem[];
  onSelect?: (item: ExplorerItem) => void;
  expandedFolders?: string[];
  activeTopicId?: string | null;
  onBackToTopics?: () => void;
  onToggleFolder?: (folderId: string) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ 
  data,
  onSelect = () => {},
  expandedFolders = [],
  activeTopicId = null,
  onBackToTopics = () => {},
  onToggleFolder = () => {}
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const handleSelect = (item: ExplorerItem) => {
    setSelectedId(item.id);
    onSelect(item);
  };
  
  // Get active topic data if we're showing a topic as root
  const activeTopic = activeTopicId ? 
    (data.find(item => item.id === 'topics') as FolderItem)?.children?.find((topic: ExplorerItem) => topic.id === activeTopicId) as FolderItem : 
    null;

  return (
    <div className={`${styles.fileExplorer} ${activeTopic ? styles.topicAsRoot : ''}`}>
      {/* Breadcrumb navigation when showing a topic as root */}
      {activeTopic && (
        <div className={styles.breadcrumbNav}>
          <span 
            className={styles.breadcrumbItem} 
            onClick={onBackToTopics}
          >
            Topics
          </span>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbItem}>{activeTopic.name}</span>
        </div>
      )}
      
      <div className={styles.fileTree}>
        {/* When showing a topic as root, only render that topic's children */}
        {activeTopic ? (
          activeTopic.children?.map((item: ExplorerItem) => (
            <div key={item.id}>
              {isFolder(item) ? (
                <Folder 
                  folder={item} 
                  onSelect={handleSelect} 
                  selected={selectedId}
                  expandedFolders={expandedFolders}
                  onToggleFolder={onToggleFolder}
                  defaultExpanded={false}
                />
              ) : (
                <File 
                  file={item} 
                  onSelect={handleSelect} 
                  selected={selectedId} 
                />
              )}
            </div>
          ))
        ) : (
          data.map((item: ExplorerItem) => (
            <div key={item.id}>
              {/* Add a class to hide the topics section when showing a topic as root */}
              <div className={item.id === 'topics' ? styles.topicsSection : ''}>
                {isFolder(item) ? (
                  <Folder 
                    folder={item} 
                    onSelect={handleSelect} 
                    selected={selectedId}
                    expandedFolders={expandedFolders}
                    defaultExpanded={item.id === 'topics' || item.id === 'shared'}
                    onToggleFolder={onToggleFolder}
                  />
                ) : (
                  <File 
                    file={item} 
                    onSelect={handleSelect} 
                    selected={selectedId} 
                  />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FileExplorer;
