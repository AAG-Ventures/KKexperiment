'use client';

import React, { useState, useMemo } from 'react';
import styles from '../../page.module.css';
import { PlusIcon } from 'lucide-react';
import { Workspace } from '../../utils/workspace/types';
import WorkspaceCreateModal from './WorkspaceCreateModal';
import FileExplorer, { isFolder } from '../../components/FileExplorer';

interface WorkspaceWidgetProps {
  workspaces: Workspace[];
  setWorkspaces: React.Dispatch<React.SetStateAction<Workspace[]>>;
  knowledgebaseData: any[];
  onOpenCreateModal: () => void;
  /** Called when user wants to edit a workspace */
  onEditWorkspace?: (workspace: Workspace) => void;
}

const WorkspaceWidget: React.FC<WorkspaceWidgetProps> = ({
  workspaces,
  setWorkspaces,
  knowledgebaseData,
  onOpenCreateModal,
  onEditWorkspace
}) => {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  
  // Convert workspaces to FileExplorer format
  const workspacesData = useMemo(() => {
    // Helper function to transform our workspace data to the FileExplorer expected format
    const buildWorkspacesFolders = () => {
      // Process a file or folder and its children recursively
      const processFileOrFolder = (file: any, workspaceId: string): any => {
        // Ensure we have a valid name, or use a fallback
        const displayName = file.name && file.name.trim() 
          ? file.name 
          : `File ${file.originalId.slice(0, 6)}`;
        
        if (file.type === 'folder') {
          // If it's a folder, build a proper folder structure with children
          return {
            id: `${workspaceId}-${file.originalId}`,
            name: displayName,
            icon: '📁',
            children: Array.isArray(file.children) 
              ? file.children.map((child: any) => processFileOrFolder(child, workspaceId))
              : []
          };
        } else {
          // If it's a file, return a file structure
          return {
            id: `${workspaceId}-${file.originalId}`,
            name: displayName,
            type: 'document' as const // Must use a valid FileType
          };
        }
      };

      // Map each workspace to a root folder
      return workspaces.map(workspace => {
        // Each workspace is a folder
        return {
          id: workspace.id,
          name: workspace.name,
          icon: workspace.icon || '📂',
          children: workspace.files.map(file => processFileOrFolder(file, workspace.id))
        };
      });
    };
    
    return buildWorkspacesFolders();
  }, [workspaces]);

  const handleCreateWorkspace = (newWorkspace: Workspace) => {
    setWorkspaces(prev => [...prev, newWorkspace]);
    // Close modal is handled at the parent level
  };

  const toggleFolderExpansion = (folderId: string) => {
    setExpandedFolders(prev => {
      if (prev.includes(folderId)) {
        return prev.filter(id => id !== folderId);
      } else {
        return [...prev, folderId];
      }
    });
  };

  const handleSelectItem = (item: any) => {
    setSelectedWorkspaceId(item.id);
    console.log(`Selected workspace item: ${item.name}`);
  };

  const handleViewFile = (item: any) => {
    console.log(`View file: ${item.name}`);
  };

  const handleRenameFile = (itemId: string, newName: string) => {
    console.log(`Rename ${itemId} to ${newName}`);
  };

  const handleDeleteFile = (itemId: string) => {
    console.log(`Attempting to delete item with ID: ${itemId}`);
    
    // Check if this is a direct workspace ID (not a composite ID)
    // Workspaces have IDs that directly match their original ID
    const workspaceToDelete = workspaces.find(workspace => workspace.id === itemId);
    
    if (workspaceToDelete) {
      // This is a workspace root - delete the whole workspace
      console.log(`Deleting entire workspace: ${workspaceToDelete.name} (${itemId})`);
      setWorkspaces(prevWorkspaces => prevWorkspaces.filter(workspace => workspace.id !== itemId));
    } else {
      // This is a file within a workspace - extract the workspace prefix
      // File IDs are in format: workspaceId-fileOriginalId
      const idParts = itemId.split('-');
      if (idParts.length >= 2) {
        // Reconstruct the workspace ID (which might contain hyphens)
        // Get workspace ID prefix (typically "workspace-[number]")
        const workspaceIdPrefix = `workspace-${idParts[1]}`;
        
        // Find the workspace that contains this file
        const workspaceIndex = workspaces.findIndex(workspace => {
          return workspace.id.startsWith(workspaceIdPrefix) && 
                 workspace.files.some(file => `${workspace.id}-${file.originalId}` === itemId);
        });
        
        if (workspaceIndex >= 0) {
          // Create a new copy of workspaces array
          const updatedWorkspaces = [...workspaces];
          
          // Get the workspace we need to update
          const workspaceToUpdate = updatedWorkspaces[workspaceIndex];
          console.log(`Removing file from workspace: ${workspaceToUpdate.name}`);
          
          // Filter out the file with the matching composite ID
          updatedWorkspaces[workspaceIndex] = {
            ...workspaceToUpdate,
            files: workspaceToUpdate.files.filter(file => 
              `${workspaceToUpdate.id}-${file.originalId}` !== itemId
            )
          };
          
          // Update workspaces state
          setWorkspaces(updatedWorkspaces);
        } else {
          console.error(`Could not find workspace for file ID: ${itemId}`);
        }
      } else {
        console.error(`Invalid file ID format: ${itemId}`);
      }
    }
  };

  const handleAddFile = (folderId: string) => {
    // For workspaces, the folderId is the workspace ID
    const workspaceToEdit = workspaces.find(workspace => workspace.id === folderId);
    
    if (workspaceToEdit && onEditWorkspace) {
      // Call the parent component's edit handler to open the edit modal
      onEditWorkspace(workspaceToEdit);
    } else {
      console.error(`Could not find workspace with ID: ${folderId}`);
    }
  };

  const handleAddFolder = (folderId: string) => {
    // For workspaces, the folderId is the workspace ID
    const workspaceToEdit = workspaces.find(workspace => workspace.id === folderId);
    
    if (workspaceToEdit && onEditWorkspace) {
      // Call the parent component's edit handler
      onEditWorkspace(workspaceToEdit);
    } else {
      console.error(`Could not find workspace with ID: ${folderId}`);
    }
  };

  // No longer need local edit handlers as they're now in the parent component

  return (
    <aside className={styles.knowledgeWidget}>
      <div className={styles.widgetHeader}>
        <h3>Workspaces</h3>
        <button 
          className={styles.newTabButton}
          onClick={onOpenCreateModal}
          title="Create Workspace"
          type="button"
        >
          <PlusIcon size={20} />
        </button>
      </div>
      
      <div className={styles.fileExplorerContainer}>
        <FileExplorer 
          data={workspacesData}
          expandedFolders={expandedFolders}
          onToggleFolder={toggleFolderExpansion}
          onSelect={handleSelectItem}
          fileOperations={{
            onView: handleViewFile,
            onRename: handleRenameFile,
            onDelete: handleDeleteFile,
            onAddFile: handleAddFile,
            onAddFolder: handleAddFolder
          }}
        />
      </div>
    </aside>
  );
};

export default WorkspaceWidget;
