import React, { useState, useEffect } from 'react';
import styles from '../page.module.css';
import { ArrowLeftIcon, SearchIcon, TrashIcon, FilterIcon } from 'lucide-react';
import { Agent } from '../utils/agentOperations';

// Types for memory data structure
export type Memory = {
  id: string;
  title: string;
  content: string;
  labels: string[];
  createdAt: Date;
  updatedAt: Date;
  agentId: string;
};

interface AgentMemoriesViewProps {
  agent: Agent;
  onBack: () => void;
}

export default function AgentMemoriesView({ agent, onBack }: AgentMemoriesViewProps) {
  // State for search and filters
  const [textSearch, setTextSearch] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState('');
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  // Mock data for now - replace with API call later
  const mockMemories: Memory[] = [
    {
      id: '1',
      title: 'User Preference: Dark Mode',
      content: 'User prefers dark mode interface and mentioned it improves their productivity during evening work sessions.',
      labels: ['preferences', 'ui'],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      agentId: agent.id
    },
    {
      id: '2',
      title: 'Project Context: E-commerce Platform',
      content: 'User is working on building an e-commerce platform using React and Node.js. They mentioned having experience with MongoDB but are new to TypeScript.',
      labels: ['projects', 'technical', 'experience'],
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-22'),
      agentId: agent.id
    },
    {
      id: '3',
      title: 'Communication Style',
      content: 'User prefers concise explanations with code examples. They appreciate step-by-step instructions and clear documentation.',
      labels: ['communication', 'preferences'],
      createdAt: new Date('2024-01-25'),
      updatedAt: new Date('2024-01-25'),
      agentId: agent.id
    }
  ];

  // Load memories when component mounts
  useEffect(() => {
    setLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setMemories(mockMemories);
      setLoading(false);
    }, 500);
  }, [agent.id]);

  // Filter memories based on search criteria
  const filteredMemories = memories.filter(memory => {
    const matchesText = textSearch === '' || 
      memory.title.toLowerCase().includes(textSearch.toLowerCase()) ||
      memory.content.toLowerCase().includes(textSearch.toLowerCase());
    
    const matchesLabels = selectedLabels.length === 0 || 
      selectedLabels.some(label => memory.labels.includes(label));
    
    // Add date filtering logic here if needed
    
    return matchesText && matchesLabels;
  });

  // Get all unique labels from memories
  const allLabels = Array.from(new Set(memories.flatMap(m => m.labels)));

  const handleSearch = () => {
    // Search functionality is already handled by filteredMemories
    console.log('Searching with:', { textSearch, selectedLabels, dateFilter });
  };

  const handleDeleteMemory = (memoryId: string) => {
    setMemories(prev => prev.filter(m => m.id !== memoryId));
  };

  const handleDeleteAllMemories = () => {
    setMemories([]);
    setShowDeleteAllModal(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={styles.agentMemoriesView}>
      {/* Header */}
      <div className={styles.agentMemoriesHeader}>
        <div className={styles.agentMemoriesHeaderLeft}>
          <button 
            onClick={onBack}
            className={styles.backButton}
            aria-label="Back to Dashboard"
          >
            <ArrowLeftIcon size={20} />
          </button>
          <div className={styles.agentMemoriesTitle}>
            <h1>Mapped Memories</h1>
            <p className={styles.agentMemoriesSubtitle}>
              Browse, search, and manage memories for {agent.name}
            </p>
          </div>
        </div>
        <button className={styles.addMemoryButton}>
          + Add Memory
        </button>
      </div>

      {/* Search & Filters */}
      <div className={styles.searchFiltersSection}>
        <div className={styles.searchFiltersHeader}>
          <FilterIcon size={16} />
          <span>Search & Filters</span>
        </div>
        
        <div className={styles.searchFiltersContent}>
          {/* Text Search */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Text Search</label>
            <div className={styles.searchInputContainer}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search memories by content..."
                value={textSearch}
                onChange={(e) => setTextSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Labels Filter */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Labels</label>
            <div className={styles.labelsContainer}>
              {allLabels.map(label => (
                <button
                  key={label}
                  className={`${styles.labelButton} ${
                    selectedLabels.includes(label) ? styles.labelButtonActive : ''
                  }`}
                  onClick={() => {
                    setSelectedLabels(prev =>
                      prev.includes(label)
                        ? prev.filter(l => l !== label)
                        : [...prev, label]
                    );
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Filters */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Date Filters</label>
            <select
              className={styles.dateSelect}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="">All dates</option>
              <option value="today">Today</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
              <option value="custom">Custom range</option>
            </select>
          </div>

          {/* Search Button */}
          <button 
            className={styles.searchButton}
            onClick={handleSearch}
          >
            <SearchIcon size={16} />
            Search
          </button>
        </div>
      </div>

      {/* Memories List */}
      <div className={styles.memoriesSection}>
        <h2 className={styles.memoriesHeader}>
          Memories ({filteredMemories.length})
          {filteredMemories.length > 0 && (
            <button 
              className={styles.deleteAllButton}
              onClick={() => setShowDeleteAllModal(true)}
            >
              <TrashIcon size={16} />
              Delete All
            </button>
          )}
        </h2>
        
        {loading ? (
          <div className={styles.loadingState}>
            Loading memories...
          </div>
        ) : error ? (
          <div className={styles.errorState}>
            Error loading memories. Please try again.
          </div>
        ) : filteredMemories.length === 0 ? (
          <div className={styles.emptyState}>
            {memories.length === 0 
              ? 'No memories found for this agent.' 
              : 'No memories match your search criteria.'}
          </div>
        ) : (
          <div className={styles.memoriesList}>
            {filteredMemories.map(memory => (
              <div key={memory.id} className={styles.memoryCard}>
                <div className={styles.memoryHeader}>
                  <h3 className={styles.memoryTitle}>{memory.title}</h3>
                  <button
                    onClick={() => handleDeleteMemory(memory.id)}
                    className={styles.deleteButton}
                    aria-label="Delete memory"
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
                
                <p className={styles.memoryContent}>{memory.content}</p>
                
                <div className={styles.memoryFooter}>
                  <div className={styles.memoryLabels}>
                    {memory.labels.map(label => (
                      <span key={label} className={styles.memoryLabel}>
                        {label}
                      </span>
                    ))}
                  </div>
                  <div className={styles.memoryDates}>
                    <span className={styles.memoryDate}>
                      Created: {formatDate(memory.createdAt)}
                    </span>
                    {memory.updatedAt.getTime() !== memory.createdAt.getTime() && (
                      <span className={styles.memoryDate}>
                        Updated: {formatDate(memory.updatedAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showDeleteAllModal && (
        <div className={styles.deleteAllModal}>
          <h2 className={styles.deleteAllModalHeader}>
            Delete All Memories?
          </h2>
          <p className={styles.deleteAllModalText}>
            Are you sure you want to delete all memories for {agent.name}?
          </p>
          <div className={styles.deleteAllModalActions}>
            <button 
              className={styles.deleteAllModalCancelButton}
              onClick={() => setShowDeleteAllModal(false)}
            >
              Cancel
            </button>
            <button 
              className={styles.deleteAllModalDeleteButton}
              onClick={handleDeleteAllMemories}
            >
              Delete All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
