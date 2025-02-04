AGENT FRAMEWORK
==============

A flexible and extensible framework for building and managing AI agents with workflow automation capabilities.

FEATURES
--------

[1] Core Agent System
    - Base agent class with plugin support
    - State management using XState
    - Event system for agent lifecycle
    - Built-in error handling and retries

[2] Built-in Tools
    - FileSystem: File operations (read, write, delete)
    - Network: HTTP requests with timeout and error handling
    - Process: System command execution with safety controls

[3] Workflow System
    - State machine based workflow execution
    - Error recovery and retry mechanisms
    - Workflow templating
    - Progress tracking

[4] Optional Drama Engine Integration
    - Narrative-driven agent behaviors
    - State mapping between agent and drama systems
    - Event hooks for story progression

INSTALLATION
-----------

From the project root:
> npm run init-agent-framework

This will:
1. Build the agent framework package
2. Link it to your project
3. Set up the required database tables
4. Configure the necessary environment

USAGE
-----

1. Creating an Agent
-------------------

    import { createAgent } from '@agentplate/agent-framework';

    const agent = createAgent({
      name: 'MyAgent',
      description: 'A simple agent example',
      type: 'basic',
      config: {
        // Agent-specific configuration
      }
    });

    // Start the agent
    const result = await agent.start();

2. Using Tools
-------------

    // Register a tool
    agent.registerTool(new FileSystemTool());

    // Execute tool operations
    await agent.executeTool('filesystem', {
      action: 'write',
      path: '/path/to/file.txt',
      content: 'Hello, World!'
    });

3. Creating Workflows
-------------------

    import { createWorkflow } from '@agentplate/agent-framework';

    const workflow = createWorkflow({
      id: 'my-workflow',
      initial: 'start',
      states: {
        start: {
          on: { NEXT: 'processing' }
        },
        processing: {
          invoke: {
            src: 'processData',
            onDone: 'complete',
            onError: 'error'
          }
        },
        complete: {
          type: 'final'
        },
        error: {
          on: { RETRY: 'processing' }
        }
      }
    });

4. Drama Engine Integration (Optional)
-----------------------------------

    import { integrations } from '@agentplate/agent-framework';

    const { DramaAgent } = await integrations.drama();

    const agent = new DramaAgent({
      name: 'StoryAgent',
      type: 'drama',
      config: {
        // Drama-specific configuration
      }
    });

For more detailed documentation and examples, please refer to the docs/ directory.
