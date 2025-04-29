// Sample data for the File Explorer component in the Knowledgebase widget

export const knowledgebaseData = [
  {
    id: 'topics',
    name: 'Topics',
    icon: '📚',
    children: [
      {
        id: 'work',
        name: 'Work',
        icon: '💼',
        children: [
          {
            id: 'work-projects',
            name: 'Projects',
            icon: '📋',
            children: [
              { id: 'project-alpha', name: 'Project Alpha', type: 'document' as const },
              { id: 'project-beta', name: 'Project Beta', type: 'document' as const },
              { 
                id: 'project-gamma', 
                name: 'Project Gamma', 
                icon: '📂',
                children: [
                  { id: 'gamma-specs', name: 'Specifications', type: 'document' as const },
                  { id: 'gamma-timeline', name: 'Timeline', type: 'spreadsheet' as const }
                ]
              }
            ]
          },
          { id: 'work-meetings', name: 'Meeting Notes', type: 'document' as const },
          { id: 'work-tasks', name: 'Task List', type: 'spreadsheet' as const }
        ]
      },
      {
        id: 'health',
        name: 'Health',
        icon: '❤️',
        children: [
          { id: 'health-exercise', name: 'Exercise Plan', type: 'spreadsheet' as const },
          { id: 'health-diet', name: 'Diet Log', type: 'spreadsheet' as const },
          { id: 'health-checkups', name: 'Checkup Schedule', type: 'document' as const }
        ]
      },
      {
        id: 'finance',
        name: 'Finance',
        icon: '💰',
        children: [
          { id: 'finance-budget', name: 'Monthly Budget', type: 'spreadsheet' as const },
          { id: 'finance-investments', name: 'Investment Portfolio', type: 'spreadsheet' as const },
          { id: 'finance-taxes', name: 'Tax Documents', type: 'pdf' as const }
        ]
      },
      {
        id: 'travel',
        name: 'Travel',
        icon: '✈️',
        children: [
          { 
            id: 'travel-japan', 
            name: 'Japan Trip', 
            icon: '🇯🇵',
            children: [
              { id: 'japan-itinerary', name: 'Itinerary', type: 'document' as const },
              { id: 'japan-budget', name: 'Budget', type: 'spreadsheet' as const },
              { id: 'japan-photos', name: 'Photos', type: 'image' as const }
            ]
          },
          { id: 'travel-wishlist', name: 'Travel Wishlist', type: 'document' as const }
        ]
      },
      {
        id: 'hobbies',
        name: 'Hobbies',
        icon: '🎮',
        children: [
          { id: 'hobbies-books', name: 'Book List', type: 'document' as const },
          { id: 'hobbies-games', name: 'Game Collection', type: 'spreadsheet' as const },
          { id: 'hobbies-recipes', name: 'Recipes', type: 'document' as const }
        ]
      }
    ]
  },
  { 
    id: 'meeting-notes', 
    name: 'Meeting Notes', 
    type: 'document' as const,
    icon: '📝'
  },
  {
    id: 'shared',
    name: 'Shared Space',
    icon: '👥',
    children: [
      { id: 'shared-marketing', name: 'Marketing Plan', type: 'presentation' as const },
      { id: 'shared-documentation', name: 'Team Documentation', type: 'document' as const },
      { 
        id: 'shared-analytics', 
        name: 'Analytics', 
        icon: '📊',
        children: [
          { id: 'analytics-q1', name: 'Q1 Report', type: 'spreadsheet' as const },
          { id: 'analytics-q2', name: 'Q2 Report', type: 'spreadsheet' as const }
        ]
      }
    ]
  }
];
