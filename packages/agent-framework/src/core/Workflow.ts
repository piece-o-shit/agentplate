import { 
  createMachine, 
  interpret, 
  StateValue,
  AnyEventObject,
  InterpreterFrom,
  assign
} from 'xstate';
import type { WorkflowDefinition, WorkflowState } from '../types';

interface WorkflowContext {
  data: Record<string, unknown>;
  error?: Error;
}

type WorkflowEvent = 
  | { type: 'NEXT' }
  | { type: 'ERROR'; error: Error }
  | { type: 'UPDATE'; data: Record<string, unknown> };

export class Workflow {
  private machine: any;
  private definition: WorkflowDefinition;

  constructor(definition: WorkflowDefinition) {
    this.definition = definition;
    this.machine = this.createWorkflowMachine();
  }

  public start(): Promise<WorkflowContext> {
    return new Promise((resolve, reject) => {
      const service = this.machine
        .onTransition((state: any) => {
          if (state.matches('error')) {
            reject(state.context.error);
          } else if (state.done) {
            resolve(state.context);
          }
        })
        .start();
    });
  }

  public getDefinition(): WorkflowDefinition {
    return this.definition;
  }

  private createWorkflowMachine() {
    return interpret(
      createMachine({
        id: this.definition.id,
        initial: this.definition.initial,
        context: {
          data: {},
          error: undefined
        } as WorkflowContext,
        states: this.transformStates(this.definition.states),
        on: {
          UPDATE: {
            actions: assign({
              data: (context, event) => ({
                ...context.data,
                ...(event as { data: Record<string, unknown> }).data
              })
            })
          },
          ERROR: {
            target: 'error',
            actions: assign({
              error: (_, event) => (event as { error: Error }).error
            })
          }
        }
      })
    );
  }

  private transformStates(states: Record<string, WorkflowState>): Record<string, any> {
    const transformedStates: Record<string, any> = {};

    for (const [key, state] of Object.entries(states)) {
      transformedStates[key] = {
        ...state,
        ...(state.invoke && {
          invoke: {
            src: state.invoke.src,
            onDone: {
              target: state.invoke.onDone,
              actions: assign({
                data: (context: WorkflowContext, event: AnyEventObject) => ({
                  ...context.data,
                  [key]: event.data
                })
              })
            },
            onError: {
              target: state.invoke.onError || 'error',
              actions: assign({
                error: (_, event: AnyEventObject) => event.data
              })
            }
          }
        })
      };
    }

    // Add default error state if not defined
    if (!transformedStates.error) {
      transformedStates.error = {
        type: 'final',
        entry: assign({
          error: (context: WorkflowContext) => context.error
        })
      };
    }

    return transformedStates;
  }

  public static createFromTemplate(
    templateId: string,
    params: Record<string, unknown>
  ): Workflow {
    // In a real implementation, this would load workflow templates
    // and create a new instance with the provided parameters
    throw new Error('Not implemented');
  }

  public static async loadTemplate(templateId: string): Promise<WorkflowDefinition> {
    // In a real implementation, this would load workflow templates
    // from a template store (file system, database, etc.)
    throw new Error('Not implemented');
  }
}
