import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function initExecFunction() {
  try {
    console.log('Setting up exec_sql function...');
    
    // Read the SQL file
    const sqlContent = fs.readFileSync(
      path.resolve(process.cwd(), 'scripts/setup-exec-function.sql'),
      'utf-8'
    );

    // Execute raw SQL directly using POST request
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({
        sql: sqlContent
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error setting up exec_sql function:', error);
      process.exit(1);
    }

    console.log('exec_sql function set up successfully!');
  } catch (error) {
    console.error('Error initializing exec_sql function:', error);
    process.exit(1);
  }
}

initExecFunction().catch(console.error);
