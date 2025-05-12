// Workspace related type definitions

// Import only the isFolder helper, we'll define our own types for workspace items
import { isFolder } from '../../components/FileExplorer';

export type WorkspaceFileReference = {
  originalId: string;   // Original file/folder ID in the knowledgebase
  name: string;         // Name of the file/folder
  type: 'file' | 'folder';
  path?: string;        // Optional path to the file/folder
  parentId?: string;    // Reference to parent folder's originalId
  children?: WorkspaceFileReference[]; // For folders, references to child items
};

export type Workspace = {
  id: string;
  name: string;
  description: string;
  icon: string;
  createdAt: Date;
  lastModified: Date;
  owner: string;
  files: WorkspaceFileReference[];  // References to included files/folders
  status: 'active' | 'archived';
  tags?: string[];
  collaborators?: string[];
};

// Selection type for the workspace file picker
export type FileSelectionState = {
  [id: string]: boolean;
};
