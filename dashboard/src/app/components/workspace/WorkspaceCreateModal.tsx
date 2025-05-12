'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Workspace, WorkspaceFileReference, FileSelectionState } from '../../utils/workspace/types';
import { createWorkspace } from '../../utils/workspace/operations';
import { FolderIcon, FileIcon, ChevronRightIcon, ChevronDownIcon } from '../../components/Icons';
import { isFolder } from '../../components/FileExplorer';
import styles from './WorkspaceModal.module.css'; // Use our custom modal styles
import fileExplorerStyles from '../FileExplorer.module.css'; // Import file explorer styles to match knowledgebase

interface WorkspaceCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateWorkspace: (workspace: Workspace) => void;
  knowledgebaseData: any[];
  /**
   * Existing workspace to edit - if provided, the modal will be in edit mode
   * If not provided, it will be in create mode
   */
  existingWorkspace?: Workspace;
  /**
   * Title for the modal - defaults to "Create New Workspace" or "Edit Workspace"
   * based on mode
   */
  modalTitle?: string;
}

// Workspace icons removed as requested

const WorkspaceCreateModal: React.FC<WorkspaceCreateModalProps> = ({
  isOpen,
  onClose,
  onCreateWorkspace,
  knowledgebaseData,
  existingWorkspace,
  modalTitle
}) => {
  // Determine if we're in edit mode
  const isEditMode = !!existingWorkspace;
  
  // Set default title based on mode
  const title = modalTitle || (isEditMode ? "Edit Workspace" : "Create New Workspace");
  
  // Initialize state with existing workspace data if in edit mode
  const [name, setName] = useState(existingWorkspace?.name || '');
  const [selectedFiles, setSelectedFiles] = useState<FileSelectionState>({});
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [error, setError] = useState('');
  // File details map to store name and type for selected files
  const [fileDetailsMap, setFileDetailsMap] = useState<Record<string, { name: string, type: 'file' | 'folder' }>>({});

  // Initialize or reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      // Set name from existing workspace if in edit mode
      setName(existingWorkspace?.name || '');
      setError('');
      
      // Initialize selected files from existing workspace if in edit mode
      if (existingWorkspace) {
        const initialSelectedFiles: FileSelectionState = {};
        const processFiles = (files: WorkspaceFileReference[]) => {
          files.forEach(file => {
            initialSelectedFiles[file.originalId] = true;
            if (file.type === 'folder' && file.children) {
              processFiles(file.children);
            }
          });
        };
        processFiles(existingWorkspace.files);
        setSelectedFiles(initialSelectedFiles);
        
        // Expand all folders that contain selected files
        const foldersToExpand: string[] = [];
        const findFoldersToExpand = (items: any[]) => {
          items.forEach(item => {
            if (isFolder(item)) {
              // If this folder or any of its children are selected, expand it
              const hasSelectedChild = item.children?.some((child: any) => 
                initialSelectedFiles[child.id] || (isFolder(child) && child.children)
              );
              if (hasSelectedChild) {
                foldersToExpand.push(item.id);
              }
              if (item.children) {
                findFoldersToExpand(item.children);
              }
            }
          });
        };
        findFoldersToExpand(knowledgebaseData);
        setExpandedFolders(foldersToExpand);
      } else {
        // Reset for creation mode
        setSelectedFiles({});
        setExpandedFolders([]);
      }
    }
  }, [isOpen, existingWorkspace, knowledgebaseData]);
  
  // Build file details map for all knowledgebase items
  useEffect(() => {
    const buildFileMap = (items: any[], map: Record<string, { name: string, type: 'file' | 'folder' }>) => {
      items.forEach(item => {
        if (isFolder(item)) {
          map[item.id] = { name: item.name, type: 'folder' };
          if (item.children) {
            buildFileMap(item.children, map);
          }
        } else {
          map[item.id] = { name: item.name, type: 'file' };
        }
      });
    };
    
    const newMap: Record<string, { name: string, type: 'file' | 'folder' }> = {};
    buildFileMap(knowledgebaseData, newMap);
    setFileDetailsMap(newMap);
  }, [knowledgebaseData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    if (!name.trim()) {
      setError('Workspace name is required');
      return;
    }
    
    // Get selected files and folders
    const selectedIds = Object.entries(selectedFiles)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id);
    
    // Build a map of parent-child relationships from the knowledgebase structure
    const parentChildMap: Record<string, string> = {};
    const buildParentChildMap = (items: any[], parentId?: string) => {
      items.forEach(item => {
        if (parentId) {
          parentChildMap[item.id] = parentId;
        }
        if (isFolder(item) && item.children) {
          buildParentChildMap(item.children, item.id);
        }
      });
    };
    buildParentChildMap(knowledgebaseData);
    
    // Create file references with proper hierarchy information
    const fileReferences = selectedIds.map(id => {
      const fileType = getItemType(id);
      return {
        originalId: id,
        name: getFileName(id),
        type: fileType,
        parentId: parentChildMap[id]
      };
    });

    // Organize files into a tree structure by identifying root folders and their children
    const organizeFiles = () => {
      // First, find all top-level items (no parent or parent not selected)
      const topLevel = fileReferences.filter(file => 
        !file.parentId || !selectedIds.includes(file.parentId)
      );
      
      // Process children recursively
      const processChildren = (parent: string): WorkspaceFileReference[] => {
        const children = fileReferences.filter(file => file.parentId === parent);
        
        return children.map(child => {
          if (child.type === 'folder') {
            return {
              ...child,
              children: processChildren(child.originalId)
            };
          }
          return child;
        });
      };
      
      // For each top-level item, attach its children if it's a folder
      return topLevel.map(item => {
        if (item.type === 'folder') {
          return {
            ...item,
            children: processChildren(item.originalId)
          };
        }
        return item;
      });
    };
    
    // Create new workspace or update existing one with hierarchical file structure
    const updatedWorkspace: Workspace = isEditMode 
      ? {
          // Keep the existing ID and creation date if editing
          ...existingWorkspace!,
          name: name.trim(),
          files: organizeFiles(),
          lastModified: new Date()
        }
      : {
          // Generate new ID if creating
          id: `workspace-${Date.now()}`,
          name: name.trim(),
          description: '', 
          icon: '📁', // Default icon
          files: organizeFiles(),
          createdAt: new Date(),
          lastModified: new Date(),
          owner: 'current-user',
          status: 'active'
        };
    
    // Call parent handler with the new or updated workspace
    onCreateWorkspace(updatedWorkspace);
    
    // Reset form
    setName('');
    setSelectedFiles({});
    setError('');
    
    // Close modal - handled by parent
    onClose();
  };
  
  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      if (prev.includes(folderId)) {
        return prev.filter(id => id !== folderId);
      } else {
        return [...prev, folderId];
      }
    });
  };
  
  // Find all descendant file IDs for a given folder
  const findAllChildrenIds = (itemId: string): string[] => {
    // Helper function to extract all IDs from a folder and its descendants
    const getAllDescendantIds = (folder: any): string[] => {
      if (!folder.children || !Array.isArray(folder.children) || folder.children.length === 0) {
        return [];
      }
      
      let result: string[] = [];
      
      // Process each child
      for (const child of folder.children) {
        // Add this child's ID
        result.push(child.id);
        
        // If this child is also a folder, add all its descendants
        if (isFolder(child)) {
          result = [...result, ...getAllDescendantIds(child)];
        }
      }
      
      return result;
    };
    
    // Find the folder with the specified ID
    const findFolder = (items: any[]): any => {
      for (const item of items) {
        // If this is the folder we're looking for
        if (item.id === itemId) {
          return item;
        }
        
        // If this is a folder, search its children
        if (isFolder(item) && item.children) {
          const found = findFolder(item.children);
          if (found) return found;
        }
      }
      
      return null;
    };
    
    // Find the folder and get all its descendants
    const folder = findFolder(knowledgebaseData);
    if (!folder) {
      console.warn(`Folder with ID ${itemId} not found`);
      return [];
    }
    
    return getAllDescendantIds(folder);
  };
  
  const toggleFileSelection = (fileId: string) => {
    // Get the file details to check if it's a folder
    const fileDetails = fileDetailsMap[fileId];
    
    if (fileDetails && fileDetails.type === 'folder') {
      // If it's a folder, toggle all its children recursively
      setSelectedFiles(prev => {
        // Get the new state for this folder (toggled from current state)
        const newFolderState = !prev[fileId];
        
        // Get all child IDs for this folder
        const allChildIds = findAllChildrenIds(fileId);
        
        // Create a new selection state object
        const newState = { ...prev, [fileId]: newFolderState };
        
        // Set all children to the same state as the parent folder
        for (const childId of allChildIds) {
          newState[childId] = newFolderState;
        }
        
        return newState;
      });
    } else {
      // If it's a regular file, just toggle its selection
      setSelectedFiles(prev => ({
        ...prev,
        [fileId]: !prev[fileId]
      }));
    }
  };
  
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  // Recursive function to render file tree with checkboxes - exactly matching knowledgebase
  const renderFileTree = (items: any[], level = 0) => {
    return items.map(item => {
      if (isFolder(item)) {
        const isExpanded = expandedFolders.includes(item.id);
        return (
          <div key={item.id} className={fileExplorerStyles.folderItem}>
            <div className={fileExplorerStyles.folderRow}>
              <input
                type="checkbox"
                id={`folder-${item.id}`}
                className={styles.checkbox}
                checked={!!selectedFiles[item.id]}
                onChange={() => toggleFileSelection(item.id)}
              />
              <div 
                onClick={() => toggleFolder(item.id)}
                style={{ display: 'flex', alignItems: 'center', flex: 1 }}
              >
                <span style={{ marginRight: '4px' }}>
                  {isExpanded ? <ChevronDownIcon size={16} /> : <ChevronRightIcon size={16} />}
                </span>
                <span className={fileExplorerStyles.folderIcon}>
                  <FolderIcon size={16} />
                </span>
                <span className={fileExplorerStyles.name}>{item.name}</span>
              </div>
            </div>
            
            {isExpanded && item.children && (
              <div className={fileExplorerStyles.children}>
                {renderFileTree(item.children, level + 1)}
              </div>
            )}
          </div>
        );
      } else {
        return (
          <div key={item.id} className={fileExplorerStyles.fileItem}>
            <div className={fileExplorerStyles.fileRow}>
              <input
                type="checkbox"
                id={`file-${item.id}`}
                className={styles.checkbox}
                checked={!!selectedFiles[item.id]}
                onChange={() => toggleFileSelection(item.id)}
              />
              <span className={fileExplorerStyles.fileIcon}>
                <FileIcon size={16} />
              </span>
              <span className={fileExplorerStyles.name}>{item.name}</span>
            </div>
          </div>
        );
      }
    });
  };
  
  // Helper function to get file name from ID with better error handling
  const getFileName = (id: string): string => {
    // Find the file/folder in the knowledgebase data
    const findItem = (items: any[]): string | null => {
      for (const item of items) {
        if (item.id === id) {
          console.log(`Found item: ${item.id} with name: ${item.name}`);
          return item.name;
        }
        if (isFolder(item) && item.children && Array.isArray(item.children)) {
          const found = findItem(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    const name = findItem(knowledgebaseData);
    if (name) return name;
    
    // If we get here, use the ID as a fallback with nice formatting
    const segments = id.split('-');
    const lastSegment = segments[segments.length - 1];
    return `File ${lastSegment.slice(0, 6)}`;
  };
  
  // Helper function to determine if an item is a folder or file
  const getItemType = (id: string): 'file' | 'folder' => {
    // Find the item in the knowledgebase data
    const findItem = (items: any[]): 'file' | 'folder' | null => {
      for (const item of items) {
        if (item.id === id) {
          return isFolder(item) ? 'folder' : 'file';
        }
        if (isFolder(item) && item.children) {
          const found = findItem(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    return findItem(knowledgebaseData) || 'file';
  };
  
  // Function to render the file tree directly from knowledgebase data
  const renderTopicsTree = () => {
    return renderFileTree(knowledgebaseData);
  };

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modalContent} data-component-name="WorkspaceCreateModal">
        <div className={styles.modalHeader}>
          <h2>{title}</h2>
          <button 
            className={styles.closeButton} 
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>
        
        <form className={styles.folderForm} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="workspace-name">Workspace Name*</label>
            <input
              id="workspace-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter workspace name"
              className={styles.input}
              required
            />
          </div>
          
          {/* Description field and icon selector removed as requested */}
          
          <div className={styles.inputGroup}>
            <label>Select Files & Folders</label>
            <div className={styles.fileSelectionContainer}>
              {renderTopicsTree()}
            </div>
          </div>
          
          {error && <div className={styles.error}>{error}</div>}
          
          <div className={styles.modalFooter}>
            <button type="button" className={styles.secondaryButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.primaryButton}>
              Create Workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkspaceCreateModal;
