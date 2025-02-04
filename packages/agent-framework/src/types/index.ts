import { Drama, CompanionConfig as DramaCompanionConfig } from "@write-with-laika/drama-engine";

export interface Tool {
  name: string;
  description: string;
  execute(params: Record<string, unknown>): Promise<unknown>;
  validate(params: Record<string, unknown>): boolean;
}

export interface AgentMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  created: Date;
  lastModified: Date;
}

export interface AgentConfig {
  tools: Tool[];
  initialContext?: Record<string, unknown>;
  maxRetries?: number;
  timeout?: number;
}

export interface AgentContext {
  status: 'idle' | 'running' | 'completed' | 'failed';
  data: Record<string, unknown>;
  error?: Error;
  startTime?: Date;
  endTime?: Date;
  retryCount?: number;
}

export interface AgentState {
  value: string;
  context: AgentContext;
}

export interface AgentEvent {
  type: string;
  payload?: Record<string, unknown>;
}

export interface AgentResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: Error;
  duration?: number;
}

export interface WorkflowState {
  invoke?: {
    src: string;
    onDone: string;
    onError?: string;
  };
  on?: Record<string, string>;
  type?: 'final';
}

export interface WorkflowDefinition {
  id: string;
  initial: string;
  states: Record<string, WorkflowState>;
  context?: Record<string, unknown>;
}

export interface DramaAgentConfig extends AgentConfig {
  dramaConfig: {
    situation: string;
    companions: DramaCompanionConfig[];
  };
}

export type { DramaCompanionConfig as CompanionConfig };

export interface DramaAgentContext extends AgentContext {
  drama?: Drama;
  currentSituation?: string;
  messageHistory: {
    role: string;
    content: string;
    timestamp: Date;
  }[];
}

export interface DramaAgentState extends AgentState {
  context: DramaAgentContext;
}

export interface DramaAgentEvent extends AgentEvent {
  type: 'START' | 'SEND_MESSAGE' | 'CHANGE_SITUATION' | 'COMPLETE' | 'ERROR';
  payload?: {
    message?: string;
    situation?: string;
    error?: Error;
  };
}

export interface DramaAgentResult extends AgentResult {
  messageHistory?: {
    role: string;
    content: string;
    timestamp: Date;
  }[];
  currentSituation?: string;
}
