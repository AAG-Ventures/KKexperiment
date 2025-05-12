'use client';

import React from 'react';
import AgentDetailPage from '../components/AgentDetailPage';
import styles from './modalWrapper.module.css';

// Agent type (consistent with other components)
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
  rating?: number;
  downloads?: number;
  category?: string;
  tags?: string[];
  createdAt?: Date;
};

interface AgentDetailModalProps {
  agent: Agent;
  onClose: () => void;
  onAddAgent: (agent: Agent) => void;
}

const AgentDetailModal: React.FC<AgentDetailModalProps> = ({
  agent,
  onClose,
  onAddAgent
}) => {
  return (
    <div className={styles.modalWrapper}>
      <AgentDetailPage
        agent={agent}
        onBack={onClose}
        onAddAgent={onAddAgent}
      />
    </div>
  );
};

export default AgentDetailModal;
