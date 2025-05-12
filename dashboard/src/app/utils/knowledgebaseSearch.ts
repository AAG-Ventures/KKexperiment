/**
 * Knowledgebase search utility functions
 * Provides filtering functionality for knowledgebase file explorer
 */

/**
 * Filter knowledgebase data based on search query
 * 
 * @param knowledgebaseData - The original knowledgebase data
 * @param searchQuery - The search query to filter by
 * @returns The filtered knowledgebase data
 */
export const filterKnowledgebaseData = (knowledgebaseData: any[], searchQuery: string): any[] => {
  if (!searchQuery.trim()) {
    return knowledgebaseData;
  }
  
  const query = searchQuery.toLowerCase();
  
  // Deep clone the data to avoid modifying the original
  const clonedData = JSON.parse(JSON.stringify(knowledgebaseData));
  
  // Function to check if an item or its children match the search query
  const filterItem = (item: any): boolean => {
    const name = item.name.toLowerCase();
    const nameMatches = name.includes(query);
    
    if (nameMatches) {
      return true;
    }
    
    // If it's a folder, check children recursively
    if ('children' in item && item.children && item.children.length > 0) {
      // Filter children and keep only matching ones
      const filteredChildren = item.children.filter(filterItem);
      
      // Update the item's children
      item.children = filteredChildren;
      
      // Return true if any children match
      return filteredChildren.length > 0;
    }
    
    return false;
  };
  
  // Filter top-level items
  return clonedData.filter(filterItem);
};

/**
 * Get a flat list of all items that match a search query (for debugging or alternative display)
 * 
 * @param knowledgebaseData - The knowledgebase data to search through
 * @param searchQuery - The search query to match
 * @returns Array of matching items with their paths
 */
export const getMatchingItems = (knowledgebaseData: any[], searchQuery: string): any[] => {
  if (!searchQuery.trim()) {
    return [];
  }
  
  const query = searchQuery.toLowerCase();
  const matchingItems: any[] = [];
  
  // Recursive function to find all matching items
  const findMatches = (items: any[], parentPath: string = '') => {
    items.forEach(item => {
      const name = item.name.toLowerCase();
      const itemPath = parentPath ? `${parentPath} > ${item.name}` : item.name;
      
      if (name.includes(query)) {
        matchingItems.push({
          ...item,
          path: itemPath
        });
      }
      
      // Check children recursively
      if ('children' in item && item.children && item.children.length > 0) {
        findMatches(item.children, itemPath);
      }
    });
  };
  
  findMatches(knowledgebaseData);
  return matchingItems;
};
