import { useState, useEffect } from 'react';
import { useSupabase } from './useSupabase';
import { getAgentAPI } from '@/lib/api/agents';
import type { Database } from '@/lib/database.types';

type Agent = Database['public']['Tables']['agents']['Row'];
type AgentRun = Database['public']['Tables']['agent_runs']['Row'];
type Workflow = Database['public']['Tables']['workflows']['Row'];

export function useAgents() {
  const { supabase } = useSupabase();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const agentAPI = getAgentAPI(supabase);

  useEffect(() => {
    loadAgents();
  }, []);

  async function loadAgents() {
    try {
      setLoading(true);
      const agents = await agentAPI.listAgents();
      setAgents(agents);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load agents'));
    } finally {
      setLoading(false);
    }
  }

  async function createAgent(params: {
    name: string;
    description?: string;
    type: string;
    config?: Record<string, unknown>;
  }) {
    try {
      const agent = await agentAPI.createAgent(params);
      setAgents(prev => [agent, ...prev]);
      return agent;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create agent');
    }
  }

  async function updateAgent(
    id: string,
    params: {
      name?: string;
      description?: string;
      type?: string;
      config?: Record<string, unknown>;
    }
  ) {
    try {
      const updated = await agentAPI.updateAgent(id, params);
      setAgents(prev => prev.map(agent => 
        agent.id === id ? updated : agent
      ));
      return updated;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update agent');
    }
  }

  async function deleteAgent(id: string) {
    try {
      await agentAPI.deleteAgent(id);
      setAgents(prev => prev.filter(agent => agent.id !== id));
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete agent');
    }
  }

  async function getAgentRuns(agentId: string): Promise<AgentRun[]> {
    try {
      return await agentAPI.getAgentRuns(agentId);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to get agent runs');
    }
  }

  async function createWorkflow(
    agentId: string,
    params: {
      name: string;
      description?: string;
      definition: Record<string, unknown>;
    }
  ): Promise<Workflow> {
    try {
      return await agentAPI.createWorkflow(agentId, params);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create workflow');
    }
  }

  async function getWorkflows(agentId: string): Promise<Workflow[]> {
    try {
      return await agentAPI.getWorkflows(agentId);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to get workflows');
    }
  }

  return {
    agents,
    loading,
    error,
    refresh: loadAgents,
    createAgent,
    updateAgent,
    deleteAgent,
    getAgentRuns,
    createWorkflow,
    getWorkflows
  };
}
