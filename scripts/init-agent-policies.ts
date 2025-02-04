import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function initAgentPolicies() {
  try {
    console.log('Setting up agent policies...');
    
    // Read and execute the SQL file
    const sqlContent = fs.readFileSync(
      path.resolve(process.cwd(), 'scripts/setup-agent-policies.sql'),
      'utf-8'
    );

    // Execute raw SQL for policy setup
    const { error } = await supabase.rpc('exec_sql', {
      sql: sqlContent
    });

    if (error) {
      console.error('Error setting up agent policies:', error);
      process.exit(1);
    }

    console.log('Agent policies set up successfully!');
  } catch (error) {
    console.error('Error initializing agent policies:', error);
    process.exit(1);
  }
}

initAgentPolicies().catch(console.error);
