export interface AgentConfig {
  // Define properties for AgentConfig here
}

export interface CreateAgentParams {
  name: string;
  description?: string;
  type: string;
  config?: AgentConfig;
  user_id: string;
}

// Add any other necessary type definitions here
