import React, { useState, useEffect } from 'react';
import styles from './FolderCreateModal.module.css'; // Reusing the same styles
import AgentCreateModal from './AgentCreateModal';
import AgentDetailPage from './AgentDetailPage';
import { useRouter } from 'next/navigation';
import { Agent } from '../utils/agentOperations';
import { ME_AGENTS, PUBLIC_AGENTS, PublicAgent, filterAgents } from '../utils/agentDiscovery';

// Use the Agent type from our utility
type AgentBrowserModalProps = {
  onClose: () => void;
  onSelectAgent: (agent: Agent) => void;
  onCreateAgent: (name: string, description: string, avatar: string, capabilities: string[]) => void;
};

const AgentBrowserModal: React.FC<AgentBrowserModalProps> = ({ onClose, onSelectAgent, onCreateAgent }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filteredMEAgents, setFilteredMEAgents] = useState<Agent[]>(ME_AGENTS);
  const [filteredPublicAgents, setFilteredPublicAgents] = useState<Agent[]>(PUBLIC_AGENTS);
  const [showAllME, setShowAllME] = useState(false);
  const [showAllPublic, setShowAllPublic] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Update filtered agents based on search query
  useEffect(() => {
    // Use the filterAgents utility function
    setFilteredMEAgents(filterAgents(ME_AGENTS, searchQuery));
    setFilteredPublicAgents(filterAgents(PUBLIC_AGENTS, searchQuery));
  }, [searchQuery]);

  // Get the agents to display based on view more state
  const displayedMEAgents = showAllME ? filteredMEAgents : filteredMEAgents.slice(0, 6);
  const displayedPublicAgents = showAllPublic ? filteredPublicAgents : filteredPublicAgents.slice(0, 6);

  // Handle agent selection
  const handleAgentClick = (agent: Agent) => {
    setSelectedAgent(agent);
  };
  
  const handleViewMarketplace = () => {
    onClose();
    router.push('/marketplace');
  };

  // Handle back button from detail page
  const handleBackFromDetail = () => {
    setSelectedAgent(null);
  };

  // Handle adding an agent from the detail page
  const handleAddAgent = (agent: Agent) => {
    onSelectAgent(agent);
    onClose();
  };

  // If create modal is shown, render that instead
  if (showCreateModal) {
    return (
      <AgentCreateModal
        onClose={() => setShowCreateModal(false)}
        onCreateAgent={onCreateAgent}
      />
    );
  }

  // If an agent is selected, show the detail page
  if (selectedAgent) {
    return (
      <AgentDetailPage
        agent={selectedAgent}
        onBack={handleBackFromDetail}
        onAddAgent={handleAddAgent}
      />
    );
  }

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent} style={{ width: '650px', maxWidth: '90vw', position: 'relative' }}>
        <div className={styles.modalHeader}>
          <h2>Discover Agents</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        {/* Search bar */}
        <div className={styles.searchContainer}>
          <input 
            type="text" 
            placeholder="Search agents..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        {/* My Agents (ME) section */}
        <div className={styles.sectionHeader}>
          <h3>Agents by ME</h3>
          <button 
            className={styles.createButton}
            onClick={() => setShowCreateModal(true)}
          >
            + Create Custom Agent
          </button>
        </div>
        
        <div className={styles.agentGrid}>
          {filteredMEAgents.length > 0 ? (
            (showAllME ? filteredMEAgents : filteredMEAgents.slice(0, 6)).map((agent) => (
              <div key={agent.id} className={styles.agentCard} onClick={() => handleAgentClick(agent)}>
                <div className={styles.agentNameRow}>
                  <div className={styles.agentAvatar}>{agent.avatar}</div>
                  <h4>{agent.name}</h4>
                </div>
                <div className={styles.agentMeta}>
                  <span className={styles.author}>By: {agent.author}</span>
                  <span className={styles.price}>Free</span>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.emptyState}>No agents found matching your search criteria</p>
          )}
        </div>
        {filteredMEAgents.length > 6 && !showAllME && (
          <div className={styles.viewMoreContainer}>
            <button className={styles.viewMoreButton} onClick={() => setShowAllME(true)}>
              View More
            </button>
          </div>
        )}
        
        {/* Public Agent Library section */}
        <div className={styles.sectionHeader}>
          <h3>Public Agent Library</h3>
        </div>
        
        <div className={styles.agentGrid}>
          {filteredPublicAgents.length > 0 ? (
            (showAllPublic ? filteredPublicAgents : filteredPublicAgents.slice(0, 6)).map((agent) => (
              <div key={agent.id} className={styles.agentCard} onClick={() => handleAgentClick(agent)}>
                <div className={styles.agentNameRow}>
                  <div className={styles.agentAvatar}>{agent.avatar}</div>
                  <h4>{agent.name}</h4>
                </div>
                <div className={styles.agentMeta}>
                  <span className={styles.author}>By: {agent.author}</span>
                  {agent.price ? (
                    <span className={styles.price}>${agent.price.toFixed(2)}/mo</span>
                  ) : (
                    <span className={styles.price}>Free</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className={styles.emptyState}>No public agents found matching your search criteria</p>
          )}
        </div>
        {filteredPublicAgents.length > 6 && !showAllPublic && (
          <div className={styles.viewMoreContainer}>
            <button className={styles.viewMoreButton} onClick={() => setShowAllPublic(true)}>
              View More
            </button>
          </div>
        )}
        
        <button 
          className={styles.viewMarketplaceButton} 
          onClick={handleViewMarketplace}
        >
          View All
        </button>
      </div>
    </div>
  );
};

export default AgentBrowserModal;
