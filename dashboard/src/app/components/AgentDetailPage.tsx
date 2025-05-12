'use client'

import React from 'react';
import styles from './FolderCreateModal.module.css';

// Same Agent type as in other components
type Agent = {
  id: string;
  name: string;
  description: string;
  avatar: string;
  price?: number;
  provider: 'me' | 'public';
  status?: 'online' | 'offline' | 'busy';
  capabilities: string[];
  author: string;
};

interface AgentDetailPageProps {
  agent: Agent;
  onBack: () => void;
  onAddAgent: (agent: Agent) => void;
}

const AgentDetailPage: React.FC<AgentDetailPageProps> = ({ agent, onBack, onAddAgent }) => {
  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent} style={{ width: '600px', maxWidth: '90vw' }}>
        <div className={styles.modalHeader}>
          <button onClick={onBack} className={styles.backButton}>
            ← Back
          </button>
          <h2>{agent.name}</h2>
          <div></div> {/* Empty div for flex spacing */}
        </div>

        <div className={styles.agentDetailContent}>
          {/* Agent info section */}
          <div className={styles.agentDetailInfo}>
            <div className={styles.agentDetailAvatar}>{agent.avatar}</div>
            <div className={styles.agentDetailMeta}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Created by:</span>
                <span className={styles.metaValue}>{agent.author}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Pricing:</span>
                <span className={styles.metaValue}>
                  {agent.price ? `$${agent.price.toFixed(2)}/month` : 'Free'}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Status:</span>
                <span className={`${styles.metaValue} ${styles.statusBadge} ${agent.status ? styles[agent.status] : styles.offline}`}>
                  {agent.status || 'offline'}
                </span>
              </div>
            </div>
          </div>

          {/* Description section */}
          <div className={styles.agentDetailSection}>
            <h3>Description</h3>
            <p>{agent.description}</p>
          </div>

          {/* Capabilities section */}
          <div className={styles.agentDetailSection}>
            <h3>Capabilities</h3>
            <ul className={styles.capabilitiesList}>
              {agent.capabilities.map((capability, index) => (
                <li key={index} className={styles.capabilityItem}>
                  {capability}
                </li>
              ))}
            </ul>
          </div>

          {/* Usage examples section */}
          <div className={styles.agentDetailSection}>
            <h3>Example Use Cases</h3>
            <ul className={styles.useCasesList}>
              <li>
                Ask "{agent.name}" to help with {agent.capabilities[0]?.toLowerCase() || 'tasks'}
              </li>
              {agent.capabilities[1] && (
                <li>
                  Use for {agent.capabilities[1]?.toLowerCase()}
                </li>
              )}
              <li>
                Integrate with your existing projects
              </li>
            </ul>
          </div>

          {/* Add button */}
          <div className={styles.agentDetailActions}>
            <button 
              className={styles.addAgentButton}
              onClick={() => onAddAgent(agent)}
            >
              {agent.price ? 'Subscribe & Add Agent' : 'Add Agent'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDetailPage;
