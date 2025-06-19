'use client'

import React, { useState, useEffect, useRef } from 'react';
import styles from './FileExplorer.module.css';
import { FolderIcon, FileIcon, ChevronRightIcon, ChevronDownIcon } from '../components/Icons';
import ContextMenu, { ContextMenuItem } from './ContextMenu';
import ShareModal from './ShareModal';

// Define types for our file structure
type FileType = 'document' | 'spreadsheet' | 'presentation' | 'pdf' | 'image' | 'code' | 'other';

interface FileItem {
  id: string;
  name: string;
  type: FileType;
  icon?: string;
  isNew?: boolean; // Flag to indicate if this is a newly created file that needs immediate renaming
}

interface FolderItem {
  id: string;
  name: string;
  icon?: string;
  children: (FileItem | FolderItem)[];
  isNew?: boolean; // Flag to indicate if this is a newly created folder that needs immediate renaming
}

type ExplorerItem = FileItem | FolderItem;

// Interface for file operations
export interface FileOperations {
  onView?: (item: FileItem) => void;
  onRename?: (itemId: string, newName: string) => void;
  onShare?: (itemId: string) => void; // Now only needs fileId, email handled by global component
  onDelete?: (itemId: string) => void;
  onAddFile?: (folderId: string) => void;
  onAddFolder?: (folderId: string) => void;
}

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
  onFileDrop?: (fileId: string, targetFolderId: string) => void;
  fileOperations?: FileOperations;
}

const File: React.FC<FileItemProps> = ({ file, onSelect, selected, onFileDrop, fileOperations }) => {
  const isActive = selected === file.id;
  const fileClass = getFileClass(file.type);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isRenaming, setIsRenaming] = useState(file.isNew || false);
  const [newFileName, setNewFileName] = useState(file.name);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('fileId', file.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleRename = () => {
    setIsRenaming(true);
    // Focus the input after rendering
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 10);
  };
  
  // Auto-focus when isRenaming is true (for new files)
  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleRenameSubmit = () => {
    if (newFileName.trim()) {
      // Always update the name even if it's the same as before to trigger UI update
      fileOperations?.onRename?.(file.id, newFileName);
      // Update local file name to show the change immediately
      file.name = newFileName;
      // Remove the isNew flag to ensure context menu works properly
      if (file.isNew) {
        file.isNew = false;
      }
    }
    setIsRenaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      setNewFileName(file.name); // Reset to original
      setIsRenaming(false);
    }
  };

  const contextMenuItems: ContextMenuItem[] = [
    {
      label: 'View',
      icon: '👁️',
      onClick: () => fileOperations?.onView?.(file)
    },
    ...(fileOperations?.onAddFile ? [{
      label: 'Add File',
      icon: '📄',
      onClick: () => fileOperations.onAddFile?.(file.id)
    }] : []),
    ...(fileOperations?.onAddFolder ? [{
      label: 'Add Folder',
      icon: '📁',
      onClick: () => fileOperations.onAddFolder?.(file.id)
    }] : []),
    {
      label: 'Rename',
      icon: '✏️',
      onClick: handleRename
    },
    {
      label: 'Share',
      icon: '🔗',
      onClick: () => {
        setContextMenu(null); // Close the context menu first
        fileOperations?.onShare?.(file.id);
      }
    },
    {
      label: 'Delete',
      icon: '🗑️',
      onClick: () => {
        // Delete immediately without confirmation
        fileOperations?.onDelete?.(file.id);
      }
    }
  ];
  
  return (
    <>
      <div 
        className={`${styles.fileRow} ${fileClass} ${isActive ? styles.active : ''}`}
        onClick={() => onSelect(file)}
        onContextMenu={handleContextMenu}
        draggable={!isRenaming} // Only draggable when not renaming
        onDragStart={handleDragStart}
      >
        <div className={styles.fileIconWrapper}>
          <FileIcon size={16} />
        </div>
        
        {isRenaming ? (
          <input
            ref={inputRef}
            type="text"
            className={styles.renameInput}
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            // Prevent dragging while renaming
            onDragStart={(e) => e.preventDefault()}
          />
        ) : (
          <span className={styles.name}>{file.name}</span>
        )}
        
        {/* Context menu trigger button */}
        <span 
          className={styles.contextMenuTrigger} 
          onClick={(e) => {
            e.stopPropagation();
            setContextMenu({ x: e.clientX, y: e.clientY });
          }}
        >
          ⋮
        </span>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          items={contextMenuItems}
          position={contextMenu}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>  
  );
};

interface FolderProps {
  folder: FolderItem;
  onSelect: (item: ExplorerItem) => void;
  selected: string | null;
  defaultExpanded?: boolean;
  expandedFolders?: string[];
  onToggleFolder?: (folderId: string) => void;
  onFileDrop?: (fileId: string, targetFolderId: string) => void;
  fileOperations?: FileOperations;
}

const Folder: React.FC<FolderProps> = ({ 
  folder, 
  onSelect, 
  selected,
  defaultExpanded = false,
  expandedFolders = [],
  onToggleFolder,
  onFileDrop,
  fileOperations
}) => {
  // Check if this folder should be expanded based on expandedFolders prop
  const shouldBeExpanded = expandedFolders.includes(folder.id) || defaultExpanded;
  
  // Use state for internal tracking of expanded status
  // Always use external state for expansion status
  const [expanded, setExpanded] = useState(shouldBeExpanded);
  
  // Add rename functionality for folders
  const [isRenaming, setIsRenaming] = useState(folder.isNew || false);
  const [newFolderName, setNewFolderName] = useState(folder.name);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Use effect to respond to external expansion requests
  useEffect(() => {
    // For special folders (Topics and Shared Space), always use the external state
    if (folder.id === 'topics' || folder.id === 'shared') {
      const isExpanded = folder.id === 'topics' ? 
        expandedFolders.includes('topics') : 
        expandedFolders.includes('shared');
      setExpanded(isExpanded);
    } else {
      // For other folders, use the provided expanded state
      setExpanded(shouldBeExpanded);
    }
  }, [expandedFolders, folder.id, shouldBeExpanded]);
  
  const isActive = selected === folder.id;
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [contextMenuTargetId, setContextMenuTargetId] = useState<string | null>(null);
  
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuTargetId(folder.id);
    setContextMenu({ x: e.clientX, y: e.clientY });
  };
  
  // Auto-focus when isRenaming is true (for new folders)
  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);
  
  const handleRename = () => {
    setIsRenaming(true);
    // Focus the input after rendering
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 10);
  };
  
  const handleRenameSubmit = () => {
    if (newFolderName.trim()) {
      // Always update the name even if it's the same as before to trigger UI update
      fileOperations?.onRename?.(folder.id, newFolderName);
      // Update local folder name to show the change immediately
      folder.name = newFolderName;
      // Remove the isNew flag to ensure context menu works properly
      if (folder.isNew) {
        folder.isNew = false;
      }
    }
    setIsRenaming(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      setNewFolderName(folder.name); // Reset to original
      setIsRenaming(false);
    }
  };
  
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Use external state management for all folders if available
    if (onToggleFolder) {
      onToggleFolder(folder.id);
    } else {
      // Fallback to internal state only if no external handler
      setExpanded(!expanded);
    }
  };
  
  // Drag & drop handlers for folders
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const fileId = e.dataTransfer.getData('fileId');
    if (fileId && onFileDrop) {
      onFileDrop(fileId, folder.id);
    }
  };

  return (
    <div 
      className={styles.folderItem}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onContextMenu={!isRenaming ? handleContextMenu : (e) => e.preventDefault()}
    >
      <div 
        className={`${styles.folderRow} ${isActive ? styles.active : ''} ${folder.id === 'topics' ? styles.topicsRow : ''}`}
        onClick={(e) => {
          // For all folders, prioritize toggle expansion when clicking the row
          if (onToggleFolder) {
            e.stopPropagation();
            onToggleFolder(folder.id);
          } else {
            // Fallback to toggle expand if no external handler
            toggleExpand(e);
          }
        }}
      >
        {/* Only showing arrow, no bullet */}
        <span 
          className={`${styles.chevron} ${expanded ? styles.chevronExpanded : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            
            // Direct implementation for Topics and Shared Space folder open/close functionality
            if ((folder.id === 'topics' || folder.id === 'shared') && onToggleFolder) {
              onToggleFolder(folder.id);
            } else {
              toggleExpand(e);
            }
          }}
        >
          {folder.id === 'topics' && expandedFolders.includes('topics') ? 
            <ChevronDownIcon size={14} /> : 
            folder.id === 'topics' ? 
            <ChevronRightIcon size={14} /> :
            folder.id === 'shared' && expandedFolders.includes('shared') ? 
            <ChevronDownIcon size={14} /> : 
            folder.id === 'shared' ? 
            <ChevronRightIcon size={14} /> :
            expanded ? 
            <ChevronDownIcon size={14} /> : 
            <ChevronRightIcon size={14} />}
        </span>
        <span className={styles.icon}>
          <span className={styles.folderIcon}><FolderIcon size={16} /></span>
        </span>
        {isRenaming ? (
          <input 
            ref={inputRef}
            className={styles.renameInput}
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on input
          />
        ) : (
          <span className={styles.name}>{folder.name}</span>
        )}
        <span 
          className={styles.contextMenuTrigger} 
          onClick={(e) => {
            e.stopPropagation();
            // Store the target folder ID for context menu actions
            setContextMenuTargetId(folder.id);
            setContextMenu({ x: e.clientX, y: e.clientY });
          }}
        >⋮</span>
      </div>
      
      {contextMenu && (
        <ContextMenu
          items={[
            ...(fileOperations?.onAddFile ? [{
              label: 'Add File',
              icon: '📄',
              onClick: () => {
                const targetId = contextMenuTargetId || folder.id;
                // First, expand the folder if it's not already expanded
                if (onToggleFolder && !expandedFolders.includes(targetId)) {
                  onToggleFolder(targetId);
                  // Add a small delay to ensure expansion completes before adding file
                  setTimeout(() => {
                    fileOperations.onAddFile?.(targetId);
                  }, 50);
                } else {
                  // Folder is already expanded, add immediately
                  fileOperations.onAddFile?.(targetId);
                }
              }
            }] : []),
            ...(fileOperations?.onAddFolder ? [{
              label: 'Add Folder',
              icon: '📁',
              onClick: () => {
                const targetId = contextMenuTargetId || folder.id;
                // First, expand the folder if it's not already expanded
                if (onToggleFolder && !expandedFolders.includes(targetId)) {
                  onToggleFolder(targetId);
                  // Add a small delay to ensure expansion completes before adding folder
                  setTimeout(() => {
                    fileOperations.onAddFolder?.(targetId);
                  }, 50);
                } else {
                  // Folder is already expanded, add immediately
                  fileOperations.onAddFolder?.(targetId);
                }
              }
            }] : []),
            ...(fileOperations?.onRename ? [{
              label: 'Rename',
              icon: '✏️',
              onClick: handleRename
            }] : []),
            ...(fileOperations?.onDelete ? [{
              label: 'Delete',
              icon: '🗑️',
              onClick: () => fileOperations.onDelete?.(contextMenuTargetId || folder.id)
            }] : [])
          ]}
          position={contextMenu}
          onClose={() => {
            setContextMenu(null);
            setContextMenuTargetId(null);
          }}
        />
      )}
      
      {expanded && (
        <div className={styles.children}>
          {/* Only show children if folder is expanded according to external state */}
          {(folder.id === 'topics' ? expandedFolders.includes('topics') : 
            folder.id === 'shared' ? expandedFolders.includes('shared') : expanded) && 
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
                    onFileDrop={onFileDrop}
                    fileOperations={fileOperations}
                />
                ) : (
                  <File 
                    file={item} 
                    onSelect={onSelect} 
                    selected={selected}
                    onFileDrop={onFileDrop}
                    fileOperations={fileOperations}
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
  onFileDrop?: (fileId: string, targetFolderId: string) => void;
  fileOperations?: FileOperations;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ 
  data,
  onSelect = () => {},
  expandedFolders = [],
  activeTopicId = null,
  onBackToTopics = () => {},
  onToggleFolder = () => {},
  onFileDrop = () => {},
  fileOperations
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
                  onFileDrop={onFileDrop}
                />
              ) : (
                <File 
                  file={item} 
                  onSelect={handleSelect} 
                  selected={selectedId}
                  onFileDrop={onFileDrop} 
                  fileOperations={fileOperations}
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
                    onFileDrop={onFileDrop}
                    fileOperations={fileOperations}
                  />
                ) : (
                  <File 
                    file={item} 
                    onSelect={handleSelect} 
                    selected={selectedId}
                    onFileDrop={onFileDrop} 
                    fileOperations={fileOperations}
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
