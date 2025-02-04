import { createMachine, interpret, assign } from 'xstate';
import { Drama } from '@write-with-laika/drama-engine';
import type {
  DramaAgentConfig,
  DramaAgentContext,
  DramaAgentEvent,
  DramaAgentResult,
  DramaAgentState,
  Tool
} from '../../types';

export class DramaAgent {
  private machine: any;
  private tools: Map<string, Tool>;
  private config: DramaAgentConfig;

  constructor(config: DramaAgentConfig) {
    this.config = config;
    this.tools = new Map(config.tools.map(tool => [tool.name, tool]));
    
    this.machine = createMachine<DramaAgentContext, DramaAgentEvent, DramaAgentState>({
      id: 'drama-agent',
      initial: 'idle',
      context: {
        status: 'idle',
        data: {},
        messageHistory: [],
        ...(config.initialContext || {})
      },
      states: {
        idle: {
          on: {
            START: {
              target: 'initializing',
              actions: assign({
                status: 'running',
                startTime: () => new Date()
              })
            }
          }
        },
        initializing: {
          invoke: {
            src: async (context) => {
              const drama = await Drama.initialize(
                this.config.dramaConfig.situation,
                this.config.dramaConfig.companions
              );
              return { drama };
            },
            onDone: {
              target: 'ready',
              actions: assign({
                drama: (_, event) => event.data.drama,
                currentSituation: (context) => this.config.dramaConfig.situation
              })
            },
            onError: {
              target: 'failed',
              actions: assign({
                error: (_, event) => event.data,
                status: 'failed',
                endTime: () => new Date()
              })
            }
          }
        },
        ready: {
          on: {
            SEND_MESSAGE: {
              target: 'processing',
              actions: assign({
                messageHistory: (context, event) => [
                  ...context.messageHistory,
                  {
                    role: 'user',
                    content: event.payload?.message || '',
                    timestamp: new Date()
                  }
                ]
              })
            },
            CHANGE_SITUATION: {
              target: 'changingSituation'
            },
            COMPLETE: 'completed'
          }
        },
        processing: {
          invoke: {
            src: async (context, event) => {
              if (!context.drama) throw new Error('Drama not initialized');
              const response = await context.drama.sendMessage(event.payload?.message || '');
              return { response };
            },
            onDone: {
              target: 'ready',
              actions: assign({
                messageHistory: (context, event) => [
                  ...context.messageHistory,
                  {
                    role: 'assistant',
                    content: event.data.response,
                    timestamp: new Date()
                  }
                ]
              })
            },
            onError: {
              target: 'failed',
              actions: assign({
                error: (_, event) => event.data,
                status: 'failed',
                endTime: () => new Date()
              })
            }
          }
        },
        changingSituation: {
          invoke: {
            src: async (context, event) => {
              if (!context.drama) throw new Error('Drama not initialized');
              await context.drama.changeSituation(event.payload?.situation || '');
              return { situation: event.payload?.situation };
            },
            onDone: {
              target: 'ready',
              actions: assign({
                currentSituation: (_, event) => event.data.situation
              })
            },
            onError: {
              target: 'failed',
              actions: assign({
                error: (_, event) => event.data,
                status: 'failed',
                endTime: () => new Date()
              })
            }
          }
        },
        completed: {
          type: 'final',
          entry: assign({
            status: 'completed',
            endTime: () => new Date()
          })
        },
        failed: {
          on: {
            RETRY: {
              target: 'initializing',
              actions: assign({
                status: 'running',
                error: undefined,
                retryCount: (context) => (context.retryCount || 0) + 1
              }),
              cond: (context) => {
                const maxRetries = this.config.maxRetries || 3;
                return (context.retryCount || 0) < maxRetries;
              }
            }
          }
        }
      }
    });
  }

  public async start(): Promise<DramaAgentResult> {
    return new Promise((resolve, reject) => {
      const service = interpret(this.machine)
        .onTransition((state) => {
          if (state.matches('completed')) {
            resolve({
              success: true,
              data: state.context.data,
              messageHistory: state.context.messageHistory,
              currentSituation: state.context.currentSituation,
              duration: this.calculateDuration(state.context)
            });
          } else if (state.matches('failed') && !this.canRetry(state.context)) {
            resolve({
              success: false,
              error: state.context.error,
              messageHistory: state.context.messageHistory,
              currentSituation: state.context.currentSituation,
              duration: this.calculateDuration(state.context)
            });
          }
        })
        .start();

      service.send({ type: 'START' });
    });
  }

  public async sendMessage(message: string): Promise<void> {
    const service = interpret(this.machine).start();
    service.send({ type: 'SEND_MESSAGE', payload: { message } });
  }

  public async changeSituation(situation: string): Promise<void> {
    const service = interpret(this.machine).start();
    service.send({ type: 'CHANGE_SITUATION', payload: { situation } });
  }

  private calculateDuration(context: DramaAgentContext): number | undefined {
    if (context.startTime && context.endTime) {
      return context.endTime.getTime() - context.startTime.getTime();
    }
    return undefined;
  }

  private canRetry(context: DramaAgentContext): boolean {
    const maxRetries = this.config.maxRetries || 3;
    return (context.retryCount || 0) < maxRetries;
  }
}
