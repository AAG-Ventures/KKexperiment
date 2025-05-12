'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './marketplace.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { Search } from 'lucide-react';
import AgentDetailModal from './AgentDetailModal';


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
  rating?: number; // 0-5 rating
  downloads?: number; // Number of downloads/purchases
  category?: string; // Category for filtering
  tags?: string[]; // Tags for filtering
  createdAt?: Date; // When the agent was added to marketplace
};

// Sample marketplace data - would come from API in production
const MARKETPLACE_AGENTS: Agent[] = [
  {
    id: 'market-agent-1',
    name: 'Advanced Research Assistant',
    description: 'Enhanced research capabilities with academic database access and citation formatting.',
    avatar: '🔍',
    price: 14.99,
    provider: 'public',
    capabilities: ['Academic research', 'Citation formatting', 'Literature review'],
    author: 'ResearchAI Labs',
    rating: 4.8,
    downloads: 15420,
    category: 'Productivity',
    tags: ['research', 'academic', 'writing'],
    createdAt: new Date(2024, 11, 12)
  },
  {
    id: 'market-agent-2',
    name: 'Full-Stack Developer',
    description: 'Expert coding assistant for modern web stack including React, Node.js, and database integration.',
    avatar: '👨‍💻',
    price: 19.99,
    provider: 'public',
    capabilities: ['Web development', 'API integration', 'Code review'],
    author: 'DevTools Pro',
    rating: 4.9,
    downloads: 24830,
    category: 'Development',
    tags: ['coding', 'webdev', 'fullstack'],
    createdAt: new Date(2024, 10, 5)
  },
  {
    id: 'market-agent-3',
    name: 'Financial Analyst Pro',
    description: 'Advanced financial analysis with market trends, investment strategies, and portfolio management.',
    avatar: '📊',
    price: 24.99,
    provider: 'public',
    capabilities: ['Market analysis', 'Portfolio optimization', 'Financial forecasting'],
    author: 'FinTech Solutions',
    rating: 4.7,
    downloads: 9870,
    category: 'Finance',
    tags: ['finance', 'investing', 'markets'],
    createdAt: new Date(2024, 9, 18)
  },
  {
    id: 'market-agent-4',
    name: 'Language Tutor Plus',
    description: 'Comprehensive language learning with pronunciation feedback, cultural context, and personalized lessons.',
    avatar: '🗣️',
    price: 12.99,
    provider: 'public',
    capabilities: ['Language teaching', 'Pronunciation feedback', 'Cultural context'],
    author: 'LinguaLearn',
    rating: 4.9,
    downloads: 32150,
    category: 'Education',
    tags: ['language', 'learning', 'education'],
    createdAt: new Date(2024, 8, 22)
  },
  {
    id: 'market-agent-5',
    name: 'Creative Writer Pro',
    description: 'Professional writing assistance for novels, screenplays, poetry with style analysis and suggestions.',
    avatar: '✍️',
    price: 16.99,
    provider: 'public',
    capabilities: ['Creative writing', 'Style analysis', 'Editing assistance'],
    author: 'WriteCraft Inc.',
    rating: 4.6,
    downloads: 12780,
    category: 'Creative',
    tags: ['writing', 'creative', 'editing'],
    createdAt: new Date(2024, 7, 14)
  },
  {
    id: 'market-agent-6',
    name: 'Health & Fitness Coach',
    description: 'Personalized fitness plans, nutritional guidance, and wellness tracking with progress analytics.',
    avatar: '💪',
    price: 18.99,
    provider: 'public',
    capabilities: ['Workout planning', 'Nutrition advice', 'Progress tracking'],
    author: 'FitLife Pro',
    rating: 4.7,
    downloads: 19540,
    category: 'Health',
    tags: ['fitness', 'nutrition', 'health'],
    createdAt: new Date(2024, 6, 28)
  },
  {
    id: 'market-agent-7',
    name: 'Social Media Manager',
    description: 'Complete social media management with content creation, scheduling, and analytics reporting.',
    avatar: '📱',
    price: 22.99,
    provider: 'public',
    capabilities: ['Content creation', 'Post scheduling', 'Analytics reporting'],
    author: 'SocialBoost Systems',
    rating: 4.5,
    downloads: 8920,
    category: 'Marketing',
    tags: ['social media', 'marketing', 'content'],
    createdAt: new Date(2024, 5, 11)
  },
  {
    id: 'market-agent-8',
    name: 'Design Assistant',
    description: 'Creative design assistance for UI/UX, graphics, and visual content with style suggestions.',
    avatar: '🎨',
    price: 17.99,
    provider: 'public',
    capabilities: ['UI/UX design', 'Graphic creation', 'Visual feedback'],
    author: 'DesignFlow Studios',
    rating: 4.8,
    downloads: 14720,
    category: 'Design',
    tags: ['design', 'graphics', 'visual'],
    createdAt: new Date(2024, 4, 19)
  },
  // Add more agents to fill out the marketplace
  {
    id: 'market-agent-9',
    name: 'Travel Planner Pro',
    description: 'Comprehensive travel planning with itineraries, local recommendations, and budget optimization.',
    avatar: '✈️',
    price: 15.99,
    provider: 'public',
    capabilities: ['Itinerary creation', 'Local recommendations', 'Budget planning'],
    author: 'WanderWise',
    rating: 4.6,
    downloads: 11340,
    category: 'Travel',
    tags: ['travel', 'planning', 'vacation'],
    createdAt: new Date(2024, 3, 7)
  },
  {
    id: 'market-agent-10',
    name: 'Legal Assistant',
    description: 'Basic legal document preparation and research assistance with contract review capabilities.',
    avatar: '⚖️',
    price: 29.99,
    provider: 'public',
    capabilities: ['Document preparation', 'Legal research', 'Contract review'],
    author: 'LegalTech Solutions',
    rating: 4.7,
    downloads: 6280,
    category: 'Legal',
    tags: ['legal', 'documents', 'contracts'],
    createdAt: new Date(2024, 2, 15)
  },
  {
    id: 'market-agent-11',
    name: 'Study Buddy',
    description: 'Academic learning assistant with study planning, note-taking, and exam preparation.',
    avatar: '📚',
    price: 9.99,
    provider: 'public',
    capabilities: ['Study planning', 'Note assistance', 'Exam prep'],
    author: 'EduTech Partners',
    rating: 4.9,
    downloads: 28760,
    category: 'Education',
    tags: ['education', 'study', 'academic'],
    createdAt: new Date(2024, 1, 23)
  },
  {
    id: 'market-agent-12',
    name: 'Music Producer',
    description: 'Music composition and production assistance with genre analysis and technique suggestions.',
    avatar: '🎵',
    price: 21.99,
    provider: 'public',
    capabilities: ['Composition assistance', 'Production tips', 'Genre analysis'],
    author: 'SoundCraft AI',
    rating: 4.5,
    downloads: 7840,
    category: 'Creative',
    tags: ['music', 'composition', 'production'],
    createdAt: new Date(2024, 0, 9)
  },
];

// All available categories
const CATEGORIES = [
  'All',
  'Productivity',
  'Development',
  'Finance',
  'Education',
  'Creative',
  'Health',
  'Marketing',
  'Design',
  'Travel',
  'Legal',
];

// Price filter options
const PRICE_FILTERS = [
  { id: 'all', label: 'All Prices' },
  { id: 'free', label: 'Free' },
  { id: 'under10', label: 'Under $10' },
  { id: 'under20', label: 'Under $20' },
  { id: 'premium', label: '$20 & Above' },
];

const AgentMarketplace: React.FC = () => {
  const router = useRouter();
  
  // State for filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular'); // 'popular', 'rating', 'newest', 'price-low', 'price-high'
  
  // Filtered and sorted agents
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>(MARKETPLACE_AGENTS);
  
  // Apply filters and sorting whenever the dependencies change
  useEffect(() => {
    let results = [...MARKETPLACE_AGENTS];
    
    // Apply search filtering
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(agent => 
        agent.name.toLowerCase().includes(query) || 
        agent.description.toLowerCase().includes(query) ||
        agent.author.toLowerCase().includes(query) ||
        agent.capabilities.some(capability => capability.toLowerCase().includes(query)) ||
        (agent.tags && agent.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    // Apply category filtering
    if (selectedCategory !== 'All') {
      results = results.filter(agent => agent.category === selectedCategory);
    }

    // Apply price filtering
    if (priceFilter === 'free') {
      results = results.filter(agent => !agent.price || agent.price === 0);
    } else if (priceFilter === 'paid') {
      results = results.filter(agent => agent.price && agent.price > 0);
    } else if (priceFilter === 'under10') {
      results = results.filter(agent => agent.price && agent.price < 10);
    } else if (priceFilter === 'under20') {
      results = results.filter(agent => agent.price && agent.price < 20);
    }
    
    // Apply sorting
    switch(sortBy) {
      case 'popular':
        results.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
        break;
      case 'rating':
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        results.sort((a, b) => {
          const dateA = a.createdAt || new Date(0);
          const dateB = b.createdAt || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
        break;
      case 'price-low':
        results.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        results.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
    }
    
    setFilteredAgents(results);
  }, [searchQuery, selectedCategory, priceFilter, sortBy]);
  
  // Get agents for a specific section based on criteria
  const getMostPopularAgents = () => {
    return [...MARKETPLACE_AGENTS]
      .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
      .slice(0, 4);
  };
  
  const getBestRatedAgents = () => {
    return [...MARKETPLACE_AGENTS]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 4);
  };
  
  // State for agent detail modal
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showAgentDetails, setShowAgentDetails] = useState(false);

  // Handle agent selection
  const handleAgentSelect = (agent: Agent) => {
    console.log('Selected agent:', agent.name);
    setSelectedAgent(agent);
    setShowAgentDetails(true);
  };
  
  // Handle adding agent to user's agents list
  const handleAddAgent = (agent: Agent) => {
    // In a real app, this would call an API endpoint to add the agent to the user's account
    console.log('Adding agent to My Agents:', agent.name);
    
    // Store in localStorage for demo purposes
    const existingAgents = localStorage.getItem('user_agents');
    let userAgents = existingAgents ? JSON.parse(existingAgents) : [];
    
    // Check if agent already exists in user's agents
    if (!userAgents.some((a: Agent) => a.id === agent.id)) {
      // Add agent to user's agents
      userAgents.push({
        ...agent,
        status: 'online',
        lastActive: new Date(),
        createdAt: new Date()
      });
      localStorage.setItem('user_agents', JSON.stringify(userAgents));
      
      // Show a success message
      alert(`${agent.name} has been added to your agents!`);
      // Close the agent details modal
      setShowAgentDetails(false);
    } else {
      alert('This agent is already in your collection.');
    }
  };
  
  // Handle back navigation
  const handleBackToHome = () => {
    router.push('/');
  };
  
  return (
    <div className={styles.marketplaceContainer}>
      {/* Header with back button and logo */}
      <header className={styles.marketplaceHeader}>
        <div className={styles.headerLeft}>
          <Link href="/" className={styles.backLink}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Dashboard
          </Link>
          <h1 className={styles.marketplaceTitle}>Agent Marketplace</h1>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.mindExtensionLogo}>
            <span>🧠</span> Mind Extension AI
          </div>
        </div>
      </header>

      {/* Search bar - moved to below header */}
      <div className={styles.searchContainer}>
        <div className={styles.searchInputWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search agents by name, author, tags, or capabilities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button 
              className={styles.clearSearchButton}
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        {searchQuery && (
          <div className={styles.searchResults}>
            <p className={styles.searchResultsCount}>
              {filteredAgents.length} results for "{searchQuery}"
            </p>
          </div>
        )}
      </div>
      
      {/* Agent Details Modal */}
      {showAgentDetails && selectedAgent && (
        <AgentDetailModal
          agent={selectedAgent}
          onClose={() => setShowAgentDetails(false)}
          onAddAgent={handleAddAgent}
        />
      )}
      
      {/* Filters sidebar */}
      <div className={styles.marketplaceLayout}>
        <aside className={styles.filterSidebar}>
          <div className={styles.filterSection}>
            <h3>Categories</h3>
            <div className={styles.categoryList}>
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  className={`${styles.categoryButton} ${selectedCategory === category ? styles.activeCategory : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          <div className={styles.filterSection}>
            <h3>Price</h3>
            <div className={styles.priceFilters}>
              {PRICE_FILTERS.map(filter => (
                <label key={filter.id} className={styles.filterCheckbox}>
                  <input
                    type="radio"
                    name="price"
                    checked={priceFilter === filter.id}
                    onChange={() => setPriceFilter(filter.id)}
                  />
                  <span>{filter.label}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className={styles.filterSection}>
            <h3>Sort By</h3>
            <select 
              className={styles.sortSelect} 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </aside>
        
        {/* Main content */}
        <main className={styles.marketplaceContent}>
          {searchQuery ? (
            /* Search Results Section */
            <section className={styles.marketplaceSection}>
              <h2 className={styles.resultsHeading}>
                Results
                <span className={styles.resultCount}>({filteredAgents.length} agents found)</span>
              </h2>
              {filteredAgents.length > 0 ? (
                <div className={styles.agentGrid}>
                  {filteredAgents.map(agent => (
                    <div 
                      key={agent.id}
                      className={styles.agentCard}
                      onClick={() => handleAgentSelect(agent)}
                    >
                      <div className={styles.agentCardHeader}>
                        <div className={styles.agentAvatar}>{agent.avatar}</div>
                        <div className={styles.agentCardHeaderInfo}>
                          <h3>{agent.name}</h3>
                          <div className={styles.agentRating}>
                            <span className={styles.ratingStars}>
                              {'★'.repeat(Math.floor(agent.rating || 0))}
                              {'☆'.repeat(5 - Math.floor(agent.rating || 0))}
                            </span>
                            <span className={styles.ratingValue}>{agent.rating?.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                      <p className={styles.agentDescription}>{agent.description}</p>
                      <div className={styles.agentCardFooter}>
                        <span className={styles.agentAuthor}>By {agent.author}</span>
                        <span className={styles.agentPrice}>
                          {agent.price ? `$${agent.price.toFixed(2)}` : 'Free'}
                        </span>
                      </div>
                      <div className={styles.agentTags}>
                        {agent.tags?.slice(0, 3).map(tag => (
                          <span key={tag} className={styles.agentTag}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <p>No agents found matching your search criteria</p>
                </div>
              )}
            </section>
          ) : (
            /* Default content when no search is active */
            <>
              {/* Most Popular Section */}
              <section className={styles.marketplaceSection}>
                <h2>Most Popular</h2>
                <div className={styles.agentGrid}>
                  {getMostPopularAgents().map(agent => (
                <div 
                  key={agent.id}
                  className={styles.agentCard}
                  onClick={() => handleAgentSelect(agent)}
                >
                  <div className={styles.agentCardHeader}>
                    <div className={styles.agentAvatar}>{agent.avatar}</div>
                    <div className={styles.agentCardHeaderInfo}>
                      <h3>{agent.name}</h3>
                      <div className={styles.agentRating}>
                        <span className={styles.ratingStars}>
                          {'★'.repeat(Math.floor(agent.rating || 0))}
                          {'☆'.repeat(5 - Math.floor(agent.rating || 0))}
                        </span>
                        <span className={styles.ratingValue}>{agent.rating?.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  <p className={styles.agentDescription}>{agent.description}</p>
                  <div className={styles.agentCardFooter}>
                    <span className={styles.agentAuthor}>By {agent.author}</span>
                    <span className={styles.agentPrice}>
                      {agent.price ? `$${agent.price.toFixed(2)}` : 'Free'}
                    </span>
                  </div>
                  <div className={styles.agentTags}>
                    {agent.tags?.slice(0, 3).map(tag => (
                      <span key={tag} className={styles.agentTag}>{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          {/* Best Rated Section */}
          <section className={styles.marketplaceSection}>
            <h2>Best Rated</h2>
            <div className={styles.agentGrid}>
              {getBestRatedAgents().map(agent => (
                <div 
                  key={agent.id}
                  className={styles.agentCard}
                  onClick={() => handleAgentSelect(agent)}
                >
                  <div className={styles.agentCardHeader}>
                    <div className={styles.agentAvatar}>{agent.avatar}</div>
                    <div className={styles.agentCardHeaderInfo}>
                      <h3>{agent.name}</h3>
                      <div className={styles.agentRating}>
                        <span className={styles.ratingStars}>
                          {'★'.repeat(Math.floor(agent.rating || 0))}
                          {'☆'.repeat(5 - Math.floor(agent.rating || 0))}
                        </span>
                        <span className={styles.ratingValue}>{agent.rating?.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  <p className={styles.agentDescription}>{agent.description}</p>
                  <div className={styles.agentCardFooter}>
                    <span className={styles.agentAuthor}>By {agent.author}</span>
                    <span className={styles.agentPrice}>
                      {agent.price ? `$${agent.price.toFixed(2)}` : 'Free'}
                    </span>
                  </div>
                  <div className={styles.agentTags}>
                    {agent.tags?.slice(0, 3).map(tag => (
                      <span key={tag} className={styles.agentTag}>{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          {/* All Agents Section */}
          <section className={styles.marketplaceSection}>
            <h2>
              {selectedCategory === 'All' 
                ? 'All Agents' 
                : `${selectedCategory} Agents`}
              <span className={styles.resultCount}>
                ({filteredAgents.length} results)
              </span>
            </h2>
            
            {filteredAgents.length > 0 ? (
              <div className={styles.agentGrid}>
                {filteredAgents.map(agent => (
                  <div 
                    key={agent.id}
                    className={styles.agentCard}
                    onClick={() => handleAgentSelect(agent)}
                  >
                    <div className={styles.agentCardHeader}>
                      <div className={styles.agentAvatar}>{agent.avatar}</div>
                      <div className={styles.agentCardHeaderInfo}>
                        <h3>{agent.name}</h3>
                        <div className={styles.agentRating}>
                          <span className={styles.ratingStars}>
                            {'★'.repeat(Math.floor(agent.rating || 0))}
                            {'☆'.repeat(5 - Math.floor(agent.rating || 0))}
                          </span>
                          <span className={styles.ratingValue}>{agent.rating?.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    <p className={styles.agentDescription}>{agent.description}</p>
                    <div className={styles.agentCardFooter}>
                      <span className={styles.agentAuthor}>By {agent.author}</span>
                      <span className={styles.agentPrice}>
                        {agent.price ? `$${agent.price.toFixed(2)}` : 'Free'}
                      </span>
                    </div>
                    <div className={styles.agentTags}>
                      {agent.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className={styles.agentTag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noResults}>
                <p>No agents found matching your criteria.</p>
                <button 
                  className={styles.resetButton}
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setPriceFilter('all');
                  }}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </section>
            </>
          )}
        </main>
      </div>
    
      {/* Agent Details Modal */}
      {showAgentDetails && selectedAgent && (
        <div className={styles.agentDetailModal}>
          <div className={styles.agentDetailContent}>
            <button 
              className={styles.closeButton}
              onClick={() => setShowAgentDetails(false)}
            >
              &times;
            </button>
            
            <div className={styles.agentDetailHeader}>
              <div className={styles.agentDetailAvatar}>{selectedAgent.avatar}</div>
              <div>
                <h2>{selectedAgent.name}</h2>
                <div className={styles.agentRating}>
                  <span className={styles.ratingStars}>
                    {'★'.repeat(Math.floor(selectedAgent.rating || 0))}
                    {'☆'.repeat(5 - Math.floor(selectedAgent.rating || 0))}
                  </span>
                  <span>{selectedAgent.rating?.toFixed(1)}</span>
                </div>
                <p className={styles.agentAuthor}>By {selectedAgent.author}</p>
              </div>
              <button 
                className={styles.addAgentButton}
                onClick={() => handleAddAgent(selectedAgent)}
              >
                Add to My Agents
              </button>
            </div>
            
            <p className={styles.agentDetailDescription}>{selectedAgent.description}</p>
            
            <div className={styles.agentDetailSection}>
              <h3>Capabilities</h3>
              <ul className={styles.agentCapabilities}>
                {selectedAgent.capabilities.map(capability => (
                  <li key={capability}>{capability}</li>
                ))}
              </ul>
            </div>
            
            {selectedAgent.tags && (
              <div className={styles.agentDetailSection}>
                <h3>Tags</h3>
                <div className={styles.agentTags}>
                  {selectedAgent.tags.map(tag => (
                    <span key={tag} className={styles.agentTag}>{tag}</span>
                  ))}
                </div>
              </div>
            )}
            
            <div className={styles.agentDetailFooter}>
              <div className={styles.agentStats}>
                <div>
                  <strong>{selectedAgent.downloads?.toLocaleString()}</strong>
                  <span>Downloads</span>
                </div>
                <div>
                  <strong>{selectedAgent.price ? `$${selectedAgent.price.toFixed(2)}` : 'Free'}</strong>
                  <span>Price</span>
                </div>
                <div>
                  <strong>{new Date(selectedAgent.createdAt || new Date()).toLocaleDateString()}</strong>
                  <span>Added</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentMarketplace;
