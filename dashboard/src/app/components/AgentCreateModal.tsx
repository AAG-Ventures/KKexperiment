import React, { useState } from 'react';
import styles from './FolderCreateModal.module.css'; // Reusing the same styles
import { CAPABILITY_OPTIONS, AGENT_AVATARS, toggleCapability, validateAgentCreation } from '../utils/agentDiscovery';

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
    
    // Use validateAgentCreation utility function for validation
    const validationError = validateAgentCreation(name, selectedCapabilities);
    if (validationError) {
      setError(validationError);
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
  
  const handleToggleCapability = (capabilityId: string) => {
    setSelectedCapabilities(toggleCapability(selectedCapabilities, capabilityId));
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
                  onClick={() => handleToggleCapability(capability.id)}
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
