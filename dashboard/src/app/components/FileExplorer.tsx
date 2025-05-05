'use client'

import React, { useState, useEffect } from 'react';
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
  const fileIcon = file.icon || getFileIcon(file.type);
  const fileClass = getFileClass(file.type);
  
  return (
    <div className={`${styles.fileItem} ${fileClass}`}>
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
    </div>
  );
};

interface FolderProps {
  folder: FolderItem;
  onSelect: (item: ExplorerItem) => void;
  selected: string | null;
  defaultExpanded?: boolean;
  expandedFolders?: string[];
}

const Folder: React.FC<FolderProps> = ({ 
  folder, 
  onSelect, 
  selected,
  defaultExpanded = false,
  expandedFolders = []
}) => {
  // Check if this folder should be expanded based on expandedFolders prop
  const shouldBeExpanded = expandedFolders.includes(folder.id) || defaultExpanded;
  
  // Use state for internal tracking of expanded status
  const [expanded, setExpanded] = useState(shouldBeExpanded);
  
  // Use effect to respond to external expansion requests
  useEffect(() => {
    if (shouldBeExpanded && !expanded) {
      setExpanded(true);
    }
  }, [shouldBeExpanded, expanded]);
  
  const isActive = selected === folder.id;
  const folderIcon = folder.icon || (expanded ? '📂' : '📁');
  
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };
  
  return (
    <div className={styles.folderItem}>
      <div 
        className={`${styles.folderRow} ${isActive ? styles.active : ''}`}
        onClick={() => onSelect(folder)}
      >
        {/* Only showing arrow, no bullet */}
        <span 
          className={`${styles.chevron} ${expanded ? styles.chevronExpanded : ''}`}
          onClick={toggleExpand}
        >
          {folder.id === 'topics' ? '↓' : '→'}
        </span>
        <span className={styles.icon}>
          <span className={styles.folderIcon}>{folderIcon}</span>
        </span>
        <span className={styles.name}>{folder.name}</span>
        <span className={styles.contextMenuTrigger}>⋮</span>
      </div>
      
      {expanded && (
        <div className={styles.children}>
          {folder.children.map((item) => (
            <div key={item.id}>
              {isFolder(item) ? (
                <Folder 
                  folder={item} 
                  onSelect={onSelect} 
                  selected={selected}
                  expandedFolders={expandedFolders}
                  defaultExpanded={false} // Let expandedFolders control expansion
                />
              ) : (
                <File 
                  file={item} 
                  onSelect={onSelect} 
                  selected={selected} 
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface FileExplorerProps {
  data: ExplorerItem[];
  onSelect?: (item: ExplorerItem) => void;
  expandedFolders?: string[];
  activeTopicId?: string | null;
  onBackToTopics?: () => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ 
  data,
  onSelect = () => {},
  expandedFolders = [],
  activeTopicId = null,
  onBackToTopics = () => {}
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
