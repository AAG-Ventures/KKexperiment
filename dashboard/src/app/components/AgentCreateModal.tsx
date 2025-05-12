import React, { useState } from 'react';
import styles from './FolderCreateModal.module.css'; // Reusing the same styles

// Define capability options
const CAPABILITY_OPTIONS = [
  { id: 'web-search', name: 'Web Search', description: 'Search the internet for information' },
  { id: 'doc-analysis', name: 'Document Analysis', description: 'Analyze and extract information from documents' },
  { id: 'summarization', name: 'Summarization', description: 'Summarize content and conversations' },
  { id: 'data-processing', name: 'Data Processing', description: 'Process and analyze data sets' },
  { id: 'visualization', name: 'Visualization', description: 'Create visual representations of data' },
  { id: 'coding', name: 'Coding Assistant', description: 'Help with coding and development tasks' },
  { id: 'writing', name: 'Writing Assistant', description: 'Help with writing and content creation' }
];

// Avatars for agents
const AGENT_AVATARS = ['🤖', '🧠', '📊', '🔍', '📝', '💻', '📚', '🧩'];

type AgentCreateModalProps = {
  onClose: () => void;
  onCreateAgent: (name: string, description: string, avatar: string, capabilities: string[]) => void;
};

const AgentCreateModal: React.FC<AgentCreateModalProps> = ({ onClose, onCreateAgent }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AGENT_AVATARS[0]);
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    if (!name.trim()) {
      setError('Please enter a name for your agent');
      return;
    }
    
    if (selectedCapabilities.length === 0) {
      setError('Please select at least one capability');
      return;
    }
    
    // Create the agent
    onCreateAgent(
      name,
      description,
      selectedAvatar,
      selectedCapabilities
    );
    
    // Close the modal
    onClose();
  };
  
  const toggleCapability = (capabilityId: string) => {
    setSelectedCapabilities(prev => {
      if (prev.includes(capabilityId)) {
        return prev.filter(id => id !== capabilityId);
      } else {
        return [...prev, capabilityId];
      }
    });
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <h2>Create New Agent</h2>
        
        {error && <div className={styles.errorMessage}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="agent-name">Name:</label>
            <input
              id="agent-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter agent name"
              className={styles.textInput}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="agent-description">Description:</label>
            <textarea
              id="agent-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this agent do?"
              className={styles.textArea}
              rows={3}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Avatar:</label>
            <div className={styles.avatarSelector}>
              {AGENT_AVATARS.map(avatar => (
                <button
                  key={avatar}
                  type="button"
                  className={`${styles.avatarOption} ${selectedAvatar === avatar ? styles.selectedAvatar : ''}`}
                  onClick={() => setSelectedAvatar(avatar)}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label>Capabilities:</label>
            <div className={styles.capabilitiesList}>
              {CAPABILITY_OPTIONS.map(capability => (
                <div 
                  key={capability.id}
                  className={`${styles.capabilityOption} ${selectedCapabilities.includes(capability.id) ? styles.selectedCapability : ''}`}
                  onClick={() => toggleCapability(capability.id)}
                >
                  <div className={styles.capabilityName}>{capability.name}</div>
                  <div className={styles.capabilityDescription}>{capability.description}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className={styles.buttonGroup}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              Create Agent
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgentCreateModal;
