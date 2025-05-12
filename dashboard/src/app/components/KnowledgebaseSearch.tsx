'use client'

import React, { useRef, useEffect } from 'react';
import styles from './KnowledgebaseSearch.module.css';
import { SearchIcon, CloseIcon } from './Icons';

interface KnowledgebaseSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
}

/**
 * Search bar component for knowledgebase that appears below the header
 */
const KnowledgebaseSearchBar: React.FC<KnowledgebaseSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onClearSearch
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Focus input on mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);
  
  return (
    <div className={styles.searchBar}>
      <div className={styles.searchInputWrapper}>
        <SearchIcon className={styles.searchIcon} size={14} />
        <input
          ref={searchInputRef}
          type="text"
          className={styles.searchInput}
          placeholder="Filter files and folders..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          autoFocus
        />
        {searchQuery && (
          <button 
            className={styles.clearButton}
            onClick={onClearSearch}
            aria-label="Clear search"
            title="Clear search"
          >
            <CloseIcon size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

interface KnowledgebaseSearchButtonProps {
  onClick: () => void;
}

/**
 * Button component to toggle search in knowledgebase header
 */
const KnowledgebaseSearchButton: React.FC<KnowledgebaseSearchButtonProps> = ({
  onClick
}) => {
  return (
    <button 
      className={styles.searchButton}
      onClick={onClick}
      aria-label="Search knowledgebase"
      title="Search knowledgebase"
    >
      <SearchIcon size={16} />
    </button>
  );
};

export { KnowledgebaseSearchBar, KnowledgebaseSearchButton };
