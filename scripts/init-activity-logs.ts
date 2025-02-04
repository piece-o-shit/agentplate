import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { type Database } from '@/lib/database.types';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Required environment variables are missing');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initActivityLogs() {
  try {
    console.log('Initializing activity logs system...');

    // Read and execute the SQL setup script
    const sqlScript = fs.readFileSync(
      path.join(__dirname, 'setup-activity-logs.sql'),
      'utf8'
    );

    // Split the script into individual statements
    const statements = sqlScript
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Execute each statement
    for (const statement of statements) {
      const { error } = await supabase.rpc('exec_sql', {
        query: statement + ';'
      });

      if (error && !error.message.includes('already exists')) {
        console.error('Error executing SQL:', error);
        throw error;
      }
    }

    // Create test data
    const testData = [
      {
        user_id: '00000000-0000-0000-0000-000000000000',
        user_email: 'admin@example.com',
        action: 'user_login',
        details: { ip: '127.0.0.1', device: 'Desktop - Chrome' }
      },
      {
        user_id: '00000000-0000-0000-0000-000000000000',
        user_email: 'admin@example.com',
        action: 'user_created',
        details: { email: 'newuser@example.com', role: 'user' }
      },
      {
        user_id: '00000000-0000-0000-0000-000000000000',
        user_email: 'admin@example.com',
        action: 'settings_updated',
        details: {
          old: { theme: 'light', notifications: true },
          new: { theme: 'dark', notifications: false },
          changed_fields: { theme: true, notifications: true }
        }
      }
    ];

    console.log('Creating test activity logs...');

    for (const log of testData) {
      const { error } = await supabase
        .from('activity_logs')
        .insert({
          ...log,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error creating test log:', error);
        throw error;
      }
    }

    // Test the get_activity_logs function
    console.log('Testing get_activity_logs function...');
    const { data: logs, error: queryError } = await supabase
      .rpc('get_activity_logs', {
        p_timeframe: '24h',
        p_limit: 10,
        p_offset: 0
      });

    if (queryError) {
      console.error('Error testing get_activity_logs:', queryError);
      throw queryError;
    }

    console.log(`Retrieved ${logs?.length || 0} test logs`);

    // Test the delete_old_activity_logs function
    console.log('Testing delete_old_activity_logs function...');
    const { data: deleted, error: deleteError } = await supabase
      .rpc('delete_old_activity_logs', {
        p_days: 90
      });

    if (deleteError) {
      console.error('Error testing delete_old_activity_logs:', deleteError);
      throw deleteError;
    }

    console.log(`Deleted ${deleted || 0} old logs`);

    console.log('Activity logs system initialized successfully');
    console.log('Next steps:');
    console.log('1. Add activity logging to your application code');
    console.log('2. Test the activity logs in the admin panel');
    console.log('3. Set up a cron job to clean up old logs');
  } catch (error) {
    console.error('Error initializing activity logs:', error);
    process.exit(1);
  }
}

// Run the initialization
initActivityLogs().catch(console.error);
