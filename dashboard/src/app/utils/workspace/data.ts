// Sample data for workspaces
import { Workspace } from './types';

export const sampleWorkspaces: Workspace[] = [
  {
    id: 'workspace-1',
    name: 'Project Alpha',
    description: 'Main workspace for Project Alpha development',
    icon: '💻',
    createdAt: new Date('2025-04-15'),
    lastModified: new Date('2025-05-10'),
    owner: 'ME',
    files: [
      { originalId: 'project-alpha', name: 'Project Alpha', type: 'file' },
      { originalId: 'work-projects', name: 'Projects', type: 'folder' },
    ],
    status: 'active',
    tags: ['development', 'active'],
  },
  {
    id: 'workspace-2',
    name: 'Marketing Campaign',
    description: 'Q2 Marketing Campaign materials',
    icon: '📊',
    createdAt: new Date('2025-04-01'),
    lastModified: new Date('2025-05-08'),
    owner: 'ME',
    files: [
      { originalId: 'finance-budget', name: 'Monthly Budget', type: 'file' },
      { originalId: 'work-meetings', name: 'Meeting Notes', type: 'file' },
    ],
    status: 'active',
    tags: ['marketing', 'q2'],
    collaborators: ['Sarah', 'Mike'],
  },
  {
    id: 'workspace-3',
    name: 'Personal Projects',
    description: 'Various personal projects and ideas',
    icon: '🎯',
    createdAt: new Date('2025-03-20'),
    lastModified: new Date('2025-05-05'),
    owner: 'ME',
    files: [
      { originalId: 'hobbies-books', name: 'Book List', type: 'file' },
      { originalId: 'travel-wishlist', name: 'Travel Wishlist', type: 'file' },
      { originalId: 'hobbies', name: 'Hobbies', type: 'folder' },
    ],
    status: 'active',
    tags: ['personal', 'ideas'],
  }
];
