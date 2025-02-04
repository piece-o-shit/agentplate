// Core exports
export { Agent } from './core/Agent';
export { Workflow } from './core/Workflow';

// Tool exports
export { FileSystemTool } from './tools/FileSystem';
export { NetworkTool } from './tools/Network';
export { ProcessTool } from './tools/Process';

// Type exports
export type {
  AgentConfig,
  AgentContext,
  AgentEvent,
  AgentMetadata,
  AgentResult,
  AgentState,
  AgentStatus,
  Tool,
  WorkflowDefinition,
  WorkflowState
} from './types';

// Optional drama engine integration
export const integrations = {
  drama: async () => {
    try {
      const { DramaAgent } = await import('./integrations/drama/DramaAgent');
      return { DramaAgent };
    } catch {
      throw new Error('Drama engine integration not available. Install @agentplate/drama-integration to use this feature.');
    }
  }
};

// Create a default agent with basic tools
export function createAgent(config: AgentConfig, metadata: AgentMetadata): Agent {
  const agent = new Agent(config, metadata);
  
  // Register basic tools
  agent.registerTool(new FileSystemTool());
  agent.registerTool(new NetworkTool());
  agent.registerTool(new ProcessTool());
  
  return agent;
}

// Create a workflow from a definition
export function createWorkflow(definition: WorkflowDefinition): Workflow {
  return new Workflow(definition);
}
