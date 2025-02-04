import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Required environment variables are missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function initAgentTables() {
  try {
    console.log('Setting up agent tables...');

    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), 'scripts', 'setup-agent-tables.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql_query: sqlContent
    });

    if (error) {
      throw error;
    }

    console.log('Successfully set up agent tables and policies');

    // Verify tables were created
    const tables = ['agents', 'agent_runs', 'workflows', 'workflow_runs'];
    for (const table of tables) {
      const { error: checkError } = await supabase
        .from(table)
        .select('id')
        .limit(1);

      if (checkError) {
        console.error(`Error verifying table ${table}:`, checkError);
      } else {
        console.log(`Verified table ${table} exists`);
      }
    }

  } catch (error) {
    console.error('Error setting up agent tables:', error);
    process.exit(1);
  }
}

initAgentTables()
  .then(() => {
    console.log('Agent tables initialization complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to initialize agent tables:', error);
    process.exit(1);
  });
