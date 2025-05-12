// Utility functions for workspace operations
import { Workspace, WorkspaceFileReference, FileSelectionState } from './types';
import { sampleWorkspaces } from './data';
// Simple ID generation based on timestamp and random numbers
const generateId = () => `ws-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

/**
 * Create a new workspace with the provided details
 */
export const createWorkspace = (
  name: string,
  description: string,
  icon: string,
  selectedFiles: FileSelectionState,
  fileDetailsMap: Record<string, { name: string, type: 'file' | 'folder' }>
): Workspace => {
  const workspaceId = generateId();
  
  // Convert selected files to workspace file references
  const files: WorkspaceFileReference[] = Object.keys(selectedFiles)
    .filter(id => selectedFiles[id])
    .map(id => ({
      originalId: id,
      name: fileDetailsMap[id].name,
      type: fileDetailsMap[id].type
    }));
  
  const newWorkspace: Workspace = {
    id: workspaceId,
    name,
    description,
    icon,
    createdAt: new Date(),
    lastModified: new Date(),
    owner: 'ME',
    files,
    status: 'active',
    tags: []
  };
  
  return newWorkspace;
};

/**
 * Add a file or folder to a workspace
 */
export const addFileToWorkspace = (
  workspace: Workspace,
  fileId: string,
  fileName: string,
  fileType: 'file' | 'folder'
): Workspace => {
  // Check if file already exists in workspace
  if (workspace.files.some(file => file.originalId === fileId)) {
    return workspace; // File already exists, no change needed
  }
  
  // Create a copy of the workspace with the new file
  const updatedWorkspace = {
    ...workspace,
    files: [
      ...workspace.files,
      {
        originalId: fileId,
        name: fileName,
        type: fileType
      }
    ],
    lastModified: new Date()
  };
  
  return updatedWorkspace;
};

/**
 * Remove a file or folder from a workspace
 */
export const removeFileFromWorkspace = (
  workspace: Workspace,
  fileId: string
): Workspace => {
  // Create a copy of the workspace with the file removed
  const updatedWorkspace = {
    ...workspace,
    files: workspace.files.filter(file => file.originalId !== fileId),
    lastModified: new Date()
  };
  
  return updatedWorkspace;
};

/**
 * Update workspace details
 */
export const updateWorkspace = (
  workspaceId: string,
  updates: Partial<Workspace>,
  workspaces: Workspace[]
): Workspace[] => {
  return workspaces.map(workspace => {
    if (workspace.id === workspaceId) {
      return {
        ...workspace,
        ...updates,
        lastModified: new Date()
      };
    }
    return workspace;
  });
};

/**
 * Archive a workspace
 */
export const archiveWorkspace = (
  workspaceId: string,
  workspaces: Workspace[]
): Workspace[] => {
  return updateWorkspace(workspaceId, { status: 'archived' }, workspaces);
};

/**
 * Get workspace by ID
 */
export const getWorkspaceById = (
  workspaceId: string,
  workspaces: Workspace[]
): Workspace | undefined => {
  return workspaces.find(workspace => workspace.id === workspaceId);
};

/**
 * Get all active workspaces
 */
export const getActiveWorkspaces = (workspaces: Workspace[]): Workspace[] => {
  return workspaces.filter(workspace => workspace.status === 'active');
};
