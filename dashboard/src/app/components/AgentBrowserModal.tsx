import React, { useState, useEffect } from 'react';
import styles from './FolderCreateModal.module.css'; // Reusing the same styles
import AgentCreateModal from './AgentCreateModal';
import AgentDetailPage from './AgentDetailPage';
import { useRouter } from 'next/navigation';

// Define types for agents
type Agent = {
  id: string;
  name: string;
  description: string;
  avatar: string;
  price?: number; // Monthly price in dollars, undefined means free
  provider: 'me' | 'public'; // 'me' for Mind Extension, 'public' for Public Library
  status?: 'online' | 'offline' | 'busy';
  capabilities: string[];
  author: string; // Agent creator/publisher
};

// Sample ME agents
const ME_AGENTS: Agent[] = [
  {
    id: 'me-agent-1',
    name: 'Research Assistant',
    description: 'Helps with research tasks, summarizing articles, and finding relevant information.',
    avatar: '🔍',
    provider: 'me',
    status: 'online',
    capabilities: ['research', 'summarization', 'information retrieval'],
    author: 'ME',
  },
  {
    id: 'me-agent-2',
    name: 'Code Helper',
    description: 'Assists with writing, debugging, and refactoring code across multiple programming languages.',
    avatar: '👨‍💻',
    provider: 'me',
    status: 'online',
    capabilities: ['coding', 'debugging', 'code explanation'],
    author: 'ME',
  },
  {
    id: 'me-agent-3',
    name: 'Creative Writer',
    description: 'Helps draft, edit, and improve various types of creative and professional writing.',
    avatar: '✍️',
    provider: 'me',
    status: 'online',
    capabilities: ['writing', 'editing', 'ideation'],
    author: 'ME',
  },
];

// Sample Public agents
const PUBLIC_AGENTS: Agent[] = [
  {
    id: 'public-agent-1',
    name: 'AI Tutor',
    description: 'Personalized learning assistant for various subjects. Adapts to your learning style.',
    avatar: '🧠',
    price: 9.99,
    provider: 'public',
    capabilities: ['education', 'tutoring', 'quiz generation'],
    author: 'EduTech AI',
  },
  {
    id: 'public-agent-2',
    name: 'Financial Advisor',
    description: 'Helps with budgeting, investment strategies, and financial planning advice.',
    avatar: '💰',
    price: 14.99,
    provider: 'public',
    capabilities: ['finance', 'budgeting', 'investment advice'],
    author: 'FinExpert Inc.',
  },
  {
    id: 'public-agent-3',
    name: 'Fitness Coach',
    description: 'Creates personalized workout plans and provides nutrition guidance based on your goals.',
    avatar: '💪',
    price: 12.99,
    provider: 'public',
    capabilities: ['fitness', 'nutrition', 'workout planning'],
    author: 'FitLife Systems',
  },
  {
    id: 'public-agent-4',
    name: 'Travel Planner',
    description: 'Generates travel itineraries, finds accommodation, and recommends local attractions.',
    avatar: '✈️',
    price: 9.99,
    provider: 'public',
    capabilities: ['travel planning', 'accommodation finding', 'local recommendations'],
    author: 'WanderBot',
  },
  {
    id: 'public-agent-5',
    name: 'Language Tutor',
    description: 'Teaches new languages through conversation, exercises, and personalized lessons.',
    avatar: '🗣️',
    provider: 'public',
    capabilities: ['language learning', 'translation', 'pronunciation'],
    author: 'PolyGlotAI',
  },
];

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

  // Filter agents based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMEAgents(ME_AGENTS);
      setFilteredPublicAgents(PUBLIC_AGENTS);
      return;
    }

    const query = searchQuery.toLowerCase();
    setFilteredMEAgents(
      ME_AGENTS.filter(
        (agent) =>
          agent.name.toLowerCase().includes(query) ||
          agent.description.toLowerCase().includes(query) ||
          agent.author.toLowerCase().includes(query)
      )
    );

    setFilteredPublicAgents(
      PUBLIC_AGENTS.filter(
        (agent) =>
          agent.name.toLowerCase().includes(query) ||
          agent.description.toLowerCase().includes(query) ||
          agent.author.toLowerCase().includes(query)
      )
    );
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
    <div className={styles.modalOverlay}>
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
