-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Agent runs table for tracking execution history
CREATE TABLE IF NOT EXISTS agent_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents NOT NULL,
  status TEXT NOT NULL,
  result JSONB,
  error TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER -- in milliseconds
);

-- Workflows table
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  definition JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Workflow runs table
CREATE TABLE IF NOT EXISTS workflow_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES workflows NOT NULL,
  status TEXT NOT NULL,
  state JSONB NOT NULL DEFAULT '{}',
  result JSONB,
  error TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER -- in milliseconds
);

-- RLS Policies
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_runs ENABLE ROW LEVEL SECURITY;

-- Policies for agents
CREATE POLICY "Users can view their own agents"
  ON agents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agents"
  ON agents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agents"
  ON agents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agents"
  ON agents FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for agent runs
CREATE POLICY "Users can view runs of their agents"
  ON agent_runs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM agents
    WHERE agents.id = agent_runs.agent_id
    AND agents.user_id = auth.uid()
  ));

-- Policies for workflows
CREATE POLICY "Users can view workflows of their agents"
  ON workflows FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM agents
    WHERE agents.id = workflows.agent_id
    AND agents.user_id = auth.uid()
  ));

CREATE POLICY "Users can create workflows for their agents"
  ON workflows FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM agents
    WHERE agents.id = workflows.agent_id
    AND agents.user_id = auth.uid()
  ));

-- Policies for workflow runs
CREATE POLICY "Users can view runs of their workflows"
  ON workflow_runs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM workflows
    JOIN agents ON agents.id = workflows.agent_id
    WHERE workflows.id = workflow_runs.workflow_id
    AND agents.user_id = auth.uid()
  ));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_agent_id ON agent_runs(agent_id);
CREATE INDEX IF NOT EXISTS idx_workflows_agent_id ON workflows(agent_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_workflow_id ON workflow_runs(workflow_id);
