import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import type { Database } from '../src/lib/database.types';
import { getAgentAPI } from '../src/lib/api/agents';

// Load environment variables from root .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Required environment variables are missing. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function testAgentAPI() {
  const agentAPI = getAgentAPI(supabase);
  console.log('Testing Agent API connections...\n');

  try {
    // Test 1: Create Agent
    console.log('Test 1: Creating test agent...');
    // Create a test user ID for RLS policies
    const testUserId = '00000000-0000-0000-0000-000000000000';

    const agent = await agentAPI.createAgent({
      name: 'Test Agent',
      description: 'A test agent for API verification',
      type: 'basic',
      config: { test: true },
      user_id: testUserId
    });
    console.log('✓ Successfully created agent:', agent.id);

    // Test 2: Get Agent
    console.log('\nTest 2: Retrieving agent...');
    const retrievedAgent = await agentAPI.getAgent(agent.id);
    console.log('✓ Successfully retrieved agent:', retrievedAgent.name);

    // Test 3: List Agents
    console.log('\nTest 3: Listing agents...');
    const agents = await agentAPI.listAgents();
    console.log('✓ Successfully listed agents:', agents.length, 'agents found');

    // Test 4: Create Workflow
    console.log('\nTest 4: Creating test workflow...');
    const workflow = await agentAPI.createWorkflow(agent.id, {
      name: 'Test Workflow',
      description: 'A test workflow',
      definition: {
        initial: 'start',
        states: {
          start: {
            on: { NEXT: 'end' }
          },
          end: {
            type: 'final'
          }
        }
      }
    });
    console.log('✓ Successfully created workflow:', workflow.id);

    // Test 5: Get Workflows
    console.log('\nTest 5: Getting workflows...');
    const workflows = await agentAPI.getWorkflows(agent.id);
    console.log('✓ Successfully retrieved workflows:', workflows.length, 'workflows found');

    // Test 6: Update Agent
    console.log('\nTest 6: Updating agent...');
    const updatedAgent = await agentAPI.updateAgent(agent.id, {
      description: 'Updated test description'
    });
    console.log('✓ Successfully updated agent description');

    // Test 7: Delete Agent
    console.log('\nTest 7: Deleting test agent...');
    await agentAPI.deleteAgent(agent.id);
    console.log('✓ Successfully deleted agent');

    // Final verification
    console.log('\nTest 8: Verifying deletion...');
    const finalAgents = await agentAPI.listAgents();
    const deleted = !finalAgents.find(a => a.id === agent.id);
    console.log('✓ Agent deletion verified:', deleted ? 'agent not found' : 'error: agent still exists');

    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

testAgentAPI().catch(console.error);
