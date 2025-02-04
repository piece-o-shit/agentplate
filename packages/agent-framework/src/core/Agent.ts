import { createMachine, interpret } from 'xstate';
import type {
  AgentConfig,
  AgentContext,
  AgentEvent,
  AgentMetadata,
  AgentResult,
  AgentState,
  Tool
} from '../types';

export class Agent {
  private machine: any;
  private tools: Map<string, Tool>;
  private metadata: AgentMetadata;

  constructor(config: AgentConfig, metadata: AgentMetadata) {
    this.metadata = metadata;
    this.tools = new Map();
    
    // Initialize the state machine
    this.machine = createMachine({
      id: 'agent',
      initial: 'idle',
      context: {
        status: 'idle',
        data: {},
      },
      states: {
        idle: {
          on: {
            START: 'running'
          }
        },
        running: {
          entry: ['setStartTime'],
          on: {
            COMPLETE: 'completed',
            ERROR: 'failed'
          }
        },
        completed: {
          entry: ['setEndTime'],
          type: 'final'
        },
        failed: {
          entry: ['setEndTime', 'setError'],
            on: {
              RETRY: {
                target: 'running',
                guard: 'canRetry'
              }
            }
        }
      }
    });
  }

  public async start(): Promise<AgentResult> {
    return new Promise((resolve, reject) => {
      const service = interpret(this.machine).start();

      service.subscribe((state: any) => {
        if (state.value === 'completed') {
          resolve({
            success: true,
            data: state.context.data,
            duration: this.calculateDuration(state.context)
          });
        } else if (state.value === 'failed') {
          resolve({
            success: false,
            error: state.context.error,
            duration: this.calculateDuration(state.context)
          });
        }
      });

      service.send({ type: 'START' });
    });
  }

  public registerTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  public async executeTool(name: string, params: Record<string, unknown>): Promise<unknown> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool '${name}' not found`);
    }

    if (tool.validate && !tool.validate(params)) {
      throw new Error(`Invalid parameters for tool '${name}'`);
    }

    return tool.execute(params);
  }

  public getMetadata(): AgentMetadata {
    return this.metadata;
  }

  public getState(): AgentState {
    const state = this.machine.getSnapshot();
    return {
      value: state.value,
      context: state.context
    };
  }

  private calculateDuration(context: AgentContext): number | undefined {
    if (context.startTime && context.endTime) {
      return context.endTime.getTime() - context.startTime.getTime();
    }
    return undefined;
  }
}
