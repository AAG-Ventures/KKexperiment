/**
 * Agent discovery utility functions and data
 * This file contains types, sample data, and functions related to agent discovery in the dashboard
 */

import { Agent } from './agentOperations';

// Sample avatar options for agent creation
export const AGENT_AVATARS = ['🤖', '🧠', '📊', '🔍', '📝', '💻', '📚', '🧩'];

// Define capability options for agent creation
export const CAPABILITY_OPTIONS = [
  { id: 'web-search', name: 'Web Search', description: 'Search the internet for information' },
  { id: 'doc-analysis', name: 'Document Analysis', description: 'Analyze and extract information from documents' },
  { id: 'summarization', name: 'Summarization', description: 'Summarize content and conversations' },
  { id: 'data-processing', name: 'Data Processing', description: 'Process and analyze data sets' },
  { id: 'visualization', name: 'Visualization', description: 'Create visual representations of data' },
  { id: 'coding', name: 'Coding Assistant', description: 'Help with coding and development tasks' },
  { id: 'writing', name: 'Writing Assistant', description: 'Help with writing and content creation' }
];

// Sample ME agents
export const ME_AGENTS: Agent[] = [
  {
    id: 'me-agent-1',
    name: 'Research Assistant',
    description: 'Helps with research tasks, summarizing articles, and finding relevant information.',
    avatar: '🔍',
    status: 'online',
    capabilities: ['research', 'summarization', 'information retrieval'],
    author: 'ME',
  },
  {
    id: 'me-agent-2',
    name: 'Code Helper',
    description: 'Assists with writing, debugging, and refactoring code across multiple programming languages.',
    avatar: '👨‍💻',
    status: 'online',
    capabilities: ['coding', 'debugging', 'code explanation'],
    author: 'ME',
  },
  {
    id: 'me-agent-3',
    name: 'Creative Writer',
    description: 'Helps draft, edit, and improve various types of creative and professional writing.',
    avatar: '✍️',
    status: 'online',
    capabilities: ['writing', 'editing', 'ideation'],
    author: 'ME',
  },
];

// Sample Public agents with pricing details
export interface PublicAgent extends Agent {
  price?: number; // Monthly price in dollars, undefined means free
  provider: 'me' | 'public'; // 'me' for Mind Extension, 'public' for Public Library
}

export const PUBLIC_AGENTS: PublicAgent[] = [
  {
    id: 'public-agent-1',
    name: 'AI Tutor',
    description: 'Personalized learning assistant for various subjects. Adapts to your learning style.',
    avatar: '🧠',
    price: 9.99,
    provider: 'public',
    status: 'online',
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
    status: 'online',
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
    status: 'online',
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
    status: 'online',
    capabilities: ['travel planning', 'accommodation finding', 'local recommendations'],
    author: 'WanderBot',
  },
  {
    id: 'public-agent-5',
    name: 'Language Tutor',
    description: 'Teaches new languages through conversation, exercises, and personalized lessons.',
    avatar: '🗣️',
    provider: 'public',
    status: 'online',
    capabilities: ['language learning', 'translation', 'pronunciation'],
    author: 'PolyGlotAI',
  },
];

/**
 * Filters agents based on search query
 * @param agents - List of agents to filter
 * @param query - Search query string
 * @returns Filtered list of agents
 */
export function filterAgents<T extends Agent>(agents: T[], query: string): T[] {
  const searchLower = query.toLowerCase().trim();
  
  if (!searchLower) {
    return agents;
  }
  
  return agents.filter(agent => {
    return (
      agent.name.toLowerCase().includes(searchLower) ||
      agent.description.toLowerCase().includes(searchLower) ||
      agent.capabilities.some(cap => cap.toLowerCase().includes(searchLower)) ||
      agent.author.toLowerCase().includes(searchLower)
    );
  });
}

/**
 * Toggles a capability selection
 * @param selectedCapabilities - Current list of selected capabilities
 * @param capabilityId - ID of the capability to toggle
 * @returns Updated list of selected capabilities
 */
export function toggleCapability(
  selectedCapabilities: string[],
  capabilityId: string
): string[] {
  if (selectedCapabilities.includes(capabilityId)) {
    return selectedCapabilities.filter(id => id !== capabilityId);
  } else {
    return [...selectedCapabilities, capabilityId];
  }
}

/**
 * Gets all available agents from both ME and public sources
 * @returns Combined list of all agents
 */
export function getAllAgents(): Agent[] {
  return [...ME_AGENTS, ...PUBLIC_AGENTS];
}

/**
 * Gets an agent by its ID
 * @param agentId - ID of the agent to find
 * @returns The found agent or undefined if not found
 */
export function getAgentById(agentId: string): Agent | undefined {
  const allAgents = getAllAgents();
  return allAgents.find(agent => agent.id === agentId);
}

/**
 * Validates agent creation inputs
 * @param name - Agent name
 * @param capabilities - Selected capabilities
 * @returns Error message if validation fails, empty string if validation passes
 */
export function validateAgentCreation(
  name: string, 
  capabilities: string[]
): string {
  if (!name.trim()) {
    return 'Please enter a name for your agent';
  }
  
  if (capabilities.length === 0) {
    return 'Please select at least one capability';
  }
  
  return '';
}
