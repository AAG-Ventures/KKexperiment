/**
 * Utility functions for managing AI workflow status indicators
 */

export type WorkflowStatus = {
  stage: 'thinking' | 'editing' | 'generating' | 'analyzing' | 'complete';
  description: string;
  startTime: Date;
  filesInvolved?: string[];
  currentFile?: string;
};

export type WorkflowAction = {
  id: string;
  label: string;
  type: 'file' | 'diff' | 'preview' | 'download';
  payload?: any;
};

/**
 * Creates a new workflow status
 */
export const createWorkflowStatus = (
  stage: WorkflowStatus['stage'],
  description: string,
  currentFile?: string,
  filesInvolved?: string[]
): WorkflowStatus => ({
  stage,
  description,
  startTime: new Date(),
  currentFile,
  filesInvolved,
});

/**
 * Creates workflow actions for a completed operation
 */
export const createWorkflowActions = (
  filesModified: string[],
  changes?: any
): WorkflowAction[] => {
  const actions: WorkflowAction[] = [];

  // Add file action for each modified file
  filesModified.forEach((filePath, index) => {
    actions.push({
      id: `file-${index}`,
      label: `Open ${filePath.split('/').pop()}`,
      type: 'file',
      payload: { filePath }
    });
  });

  // Add diff action if changes are available
  if (changes) {
    actions.push({
      id: 'diff',
      label: 'View Changes',
      type: 'diff',
      payload: { changes }
    });
  }

  return actions;
};

/**
 * Example usage in your chat message handler
 */
export const simulateAIWorkflow = async (
  updateWorkflowStatus: (status: WorkflowStatus) => void,
  onComplete: (actions: WorkflowAction[]) => void
) => {
  // Step 1: Thinking
  updateWorkflowStatus(createWorkflowStatus(
    'thinking',
    'Analyzing your request and planning the approach...'
  ));
  
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Step 2: Editing
  updateWorkflowStatus(createWorkflowStatus(
    'editing',
    'Modifying the component files...',
    'ChatSidebar.tsx',
    ['ChatSidebar.tsx', 'page.module.css']
  ));
  
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Step 3: Generating
  updateWorkflowStatus(createWorkflowStatus(
    'generating',
    'Adding new features and updating styles...',
    'page.module.css',
    ['ChatSidebar.tsx', 'page.module.css']
  ));
  
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Step 4: Complete
  updateWorkflowStatus(createWorkflowStatus(
    'complete',
    'Successfully implemented AI workflow status indicators!'
  ));

  // Create actions for the completed workflow
  const actions = createWorkflowActions(
    ['src/app/components/ChatSidebar.tsx', 'src/app/page.module.css'],
    {
      added: ['WorkflowStatusDisplay component', 'CSS styles'],
      modified: ['ChatTab type', 'Message rendering']
    }
  );

  onComplete(actions);
};

/**
 * Integration example for your chat component
 */
export const integrateWorkflowStatus = {
  // Example of how to update a chat tab with workflow status
  updateChatTabWorkflow: (
    chatTabs: any[],
    setChatTabs: (tabs: any[]) => void,
    tabId: string,
    workflowStatus: WorkflowStatus
  ) => {
    setChatTabs(chatTabs.map(tab => 
      tab.id === tabId 
        ? { ...tab, currentWorkflow: workflowStatus }
        : tab
    ));
  },

  // Example of how to add workflow status to a message
  addWorkflowToMessage: (
    chatTabs: any[],
    setChatTabs: (tabs: any[]) => void,
    tabId: string,
    messageIndex: number,
    workflowStatus: WorkflowStatus,
    workflowActions?: WorkflowAction[]
  ) => {
    setChatTabs(chatTabs.map(tab => {
      if (tab.id === tabId) {
        const newMessages = [...tab.messages];
        if (newMessages[messageIndex]) {
          newMessages[messageIndex] = {
            ...newMessages[messageIndex],
            workflowStatus,
            workflowActions
          };
        }
        return { ...tab, messages: newMessages };
      }
      return tab;
    }));
  },

  // Example of clearing workflow status
  clearWorkflowStatus: (
    chatTabs: any[],
    setChatTabs: (tabs: any[]) => void,
    tabId: string
  ) => {
    setChatTabs(chatTabs.map(tab => 
      tab.id === tabId 
        ? { ...tab, currentWorkflow: undefined }
        : tab
    ));
  }
};
