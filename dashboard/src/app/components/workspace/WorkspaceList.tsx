'use client';

import React from 'react';
import styles from '../../page.module.css';
import { Workspace } from '../../utils/workspace/types';

interface WorkspaceListProps {
  workspaces: Workspace[];
  onWorkspaceClick: (workspace: Workspace) => void;
  selectedWorkspace: Workspace | null;
}

const WorkspaceList: React.FC<WorkspaceListProps> = ({
  workspaces,
  onWorkspaceClick,
  selectedWorkspace
}) => {
  return (
    <div className={styles.processList}>
      {workspaces.length > 0 ? (
        workspaces.map(workspace => (
          <div 
            key={workspace.id} 
            className={`${styles.processItem} ${selectedWorkspace?.id === workspace.id ? styles.activeProcess : ''}`}
            onClick={() => onWorkspaceClick(workspace)}
          >
            <div className={styles.processDetails}>
              <div className={styles.processName}>
                <span style={{ marginRight: '8px' }}>{workspace.icon}</span>
                {workspace.name}
              </div>
              <div className={styles.processStatus}>
                <span className={styles.processStatusLabel}>
                  {workspace.files.length} files
                </span>
                <span className={styles.processDate}>
                  {new Date(workspace.lastModified).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className={styles.emptyState}>No workspaces available</div>
      )}
    </div>
  );
};

export default WorkspaceList;
