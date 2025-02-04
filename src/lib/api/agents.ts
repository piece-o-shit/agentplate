import { createClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';

type Agent = Database['public']['Tables']['agents']['Row'];
type AgentRun = Database['public']['Tables']['agent_runs']['Row'];
type Workflow = Database['public']['Tables']['workflows']['Row'];
type WorkflowRun = Database['public']['Tables']['workflow_runs']['Row'];

export interface CreateAgentParams {
  name: string;
  description?: string;
  type: string;
  config?: Record<string, unknown>;
  user_id: string;
}

export interface UpdateAgentParams {
  name?: string;
  description?: string;
  type?: string;
  config?: Record<string, unknown>;
}

export class AgentAPI {
  private supabase: ReturnType<typeof createClient<Database>>;

  constructor(supabase: ReturnType<typeof createClient<Database>>) {
    this.supabase = supabase;
  }

  // Agent Operations
  async createAgent(params: CreateAgentParams): Promise<Agent> {
    const { data, error } = await this.supabase
      .from('agents')
      .insert({
        name: params.name,
        description: params.description,
        type: params.type,
        config: params.config || {},
        user_id: params.user_id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getAgent(id: string): Promise<Agent> {
    const { data, error } = await this.supabase
      .from('agents')
      .select()
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async listAgents(): Promise<Agent[]> {
    const { data, error } = await this.supabase
      .from('agents')
      .select()
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async updateAgent(id: string, params: UpdateAgentParams): Promise<Agent> {
    const { data, error } = await this.supabase
      .from('agents')
      .update(params)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteAgent(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('agents')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Agent Run Operations
  async getAgentRuns(agentId: string): Promise<AgentRun[]> {
    const { data, error } = await this.supabase
      .from('agent_runs')
      .select()
      .eq('agent_id', agentId)
      .order('started_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Workflow Operations
  async createWorkflow(agentId: string, params: {
    name: string;
    description?: string;
    definition: Record<string, unknown>;
  }): Promise<Workflow> {
    const { data, error } = await this.supabase
      .from('workflows')
      .insert({
        agent_id: agentId,
        name: params.name,
        description: params.description,
        definition: params.definition
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getWorkflows(agentId: string): Promise<Workflow[]> {
    const { data, error } = await this.supabase
      .from('workflows')
      .select()
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getWorkflowRuns(workflowId: string): Promise<WorkflowRun[]> {
    const { data, error } = await this.supabase
      .from('workflow_runs')
      .select()
      .eq('workflow_id', workflowId)
      .order('started_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}

// Create a singleton instance
let agentAPI: AgentAPI | null = null;

export function getAgentAPI(supabase: ReturnType<typeof createClient<Database>>): AgentAPI {
  if (!agentAPI) {
    agentAPI = new AgentAPI(supabase);
  }
  return agentAPI;
}
