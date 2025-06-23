/**
 * Agent operations utility functions
 * This file contains functions and types related to agent operations in the dashboard
 */

// Agent type definition
export type Agent = {
  id: string;
  name: string;
  description: string;
  avatar: string;
  status: 'online' | 'offline' | 'busy';
  lastActive?: Date;
  createdAt: Date; // Required for compatibility with existing components
  capabilities: string[];
  author: string;
  provider?: 'me' | 'public'; // Add provider property to match AgentBrowserModal usage
};

// AI Agent configuration
export const AI_AGENT_CONFIG = {
  API_KEY: 'test',
  USER_ID: 'user-123456',
  BACKEND_DOMAIN: 'https://agent-template.aag.systems',
  AGENT_ID: 'a7d5c2d2-f395-4e5e-9675-506a04175c17',
};

/**
 * Creates a new agent with the provided details
 * @param name - The name of the agent
 * @param description - A description of the agent's purpose
 * @param avatar - The avatar URL for the agent
 * @param capabilities - A list of the agent's capabilities
 * @returns A new Agent object
 */
export const createAgent = (
  name: string,
  description: string,
  avatar: string,
  capabilities: string[]
): Agent => {
  console.log(`Creating agent: ${name}`);
  
  // Create a new ID for the agent
  const agentId = `agent-${Date.now()}`;
  
  // Create the new agent object
  const newAgent: Agent = {
    id: agentId,
    name,
    description,
    avatar,
    status: 'online',
    lastActive: new Date(),
    createdAt: new Date(),
    capabilities,
    author: 'ME',
  };
  
  return newAgent;
};

/**
 * Sends a message to an AI agent and handles the response
 * @param prompt - The message to send to the agent
 * @param sessionId - The session ID for the conversation
 * @returns A promise that resolves to the agent's response
 */
export const sendMessageToAIAgent = async (prompt: string, sessionId: string): Promise<string> => {
  try {
    console.log('Sending request to AI agent with:', {
      endpoint: `${AI_AGENT_CONFIG.BACKEND_DOMAIN}/api/interact/voice`,
      sessionId,
      agentId: AI_AGENT_CONFIG.AGENT_ID,
      userId: AI_AGENT_CONFIG.USER_ID
    });
    
    // Prepare the request body to match the expected API format
    const requestBody = {
      agentId: AI_AGENT_CONFIG.AGENT_ID,
      userId: AI_AGENT_CONFIG.USER_ID,
      sessionId,
      prompt,
      attachments: []
    };
    
    // Send the request to the agent API
    const response = await fetch(`${AI_AGENT_CONFIG.BACKEND_DOMAIN}/api/interact/voice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': AI_AGENT_CONFIG.API_KEY,
      },
      body: JSON.stringify(requestBody)
    });
    
    // Handle non-OK responses
    if (!response.ok) {
      // Try to get error details from the response
      let errorMessage = `HTTP error ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        // If we can't parse the JSON, use the status text
        errorMessage = `${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    
    // Parse the response
    const data = await response.json();
    
    // Log response for debugging
    console.log('AI agent response data:', data);
    
    // Check if the response has the expected structure (new format with text field)
    if (!data.text && !data.response) {
      throw new Error('Unexpected response format from AI agent API');
    }
    
    // Return the text field from the new response format, fallback to old format
    return data.text || data.response;
  } catch (error) {
    // Handle any errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error communicating with AI agent:', error);
    return `Sorry, I couldn't connect to the AI agent at this moment. Technical details: ${errorMessage}`;
  }
};

/**
 * Selects an agent for a chat session
 * @param agent - The agent to select
 * @param setCurrentAgent - State setter for the current agent
 * @param addNotification - Function to add a notification
 */
export const selectAgent = (
  agent: Agent, 
  setCurrentAgent: React.Dispatch<React.SetStateAction<Agent | null>>,
  addNotification?: (notification: { title: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }) => void
): void => {
  setCurrentAgent(agent);
  
  // Notify user if the notification function is provided
  if (addNotification) {
    addNotification({
      title: 'Agent Selected',
      message: `You are now chatting with ${agent.name}`,
      type: 'info'
    });
  }
};
