-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create helper function for executing SQL
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION exec_sql TO postgres, anon, authenticated;

-- Create agents table
CREATE TABLE IF NOT EXISTS public.agents (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  type text NOT NULL,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create agent_runs table
CREATE TABLE IF NOT EXISTS public.agent_runs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id uuid REFERENCES public.agents(id) ON DELETE CASCADE,
  status text NOT NULL,
  result jsonb,
  error text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  duration integer
);

-- Create workflows table
CREATE TABLE IF NOT EXISTS public.workflows (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id uuid REFERENCES public.agents(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  definition jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create workflow_runs table
CREATE TABLE IF NOT EXISTS public.workflow_runs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  workflow_id uuid REFERENCES public.workflows(id) ON DELETE CASCADE,
  status text NOT NULL,
  state jsonb DEFAULT '{}'::jsonb,
  result jsonb,
  error text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  duration integer
);

-- Enable RLS
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_runs ENABLE ROW LEVEL SECURITY;

-- Create policies for agents table
CREATE POLICY "Users can create their own agents" ON public.agents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own agents" ON public.agents
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own agents" ON public.agents
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agents" ON public.agents
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for agent_runs table
CREATE POLICY "Users can view runs of their agents" ON public.agent_runs
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.agents
    WHERE agents.id = agent_runs.agent_id
    AND agents.user_id = auth.uid()
  ));

CREATE POLICY "Users can create runs for their agents" ON public.agent_runs
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.agents
    WHERE agents.id = agent_runs.agent_id
    AND agents.user_id = auth.uid()
  ));

-- Create policies for workflows table
CREATE POLICY "Users can create workflows for their agents" ON public.workflows
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.agents
    WHERE agents.id = workflows.agent_id
    AND agents.user_id = auth.uid()
  ));

CREATE POLICY "Users can view workflows of their agents" ON public.workflows
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.agents
    WHERE agents.id = workflows.agent_id
    AND agents.user_id = auth.uid()
  ));

-- Create policies for workflow_runs table
CREATE POLICY "Users can view runs of their workflows" ON public.workflow_runs
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.workflows w
    JOIN public.agents a ON w.agent_id = a.id
    WHERE w.id = workflow_runs.workflow_id
    AND a.user_id = auth.uid()
  ));

CREATE POLICY "Users can create runs for their workflows" ON public.workflow_runs
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.workflows w
    JOIN public.agents a ON w.agent_id = a.id
    WHERE w.id = workflow_runs.workflow_id
    AND a.user_id = auth.uid()
  ));

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
