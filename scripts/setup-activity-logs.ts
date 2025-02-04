import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { type Database } from '@/lib/database.types';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

async function setupActivityLogs() {
  try {
    console.log('Setting up activity logs system...');

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

    // Create stored procedure for executing SQL if it doesn't exist
    const createProcedure = async () => {
      const { error } = await supabase.rpc('exec_sql', {
        query: `
          CREATE OR REPLACE FUNCTION exec_sql(query text)
          RETURNS void
          LANGUAGE plpgsql
          SECURITY DEFINER
          SET search_path = public
          AS $$
          BEGIN
            EXECUTE query;
          END;
          $$;
        `
      });

      // If the function doesn't exist, create it directly through SQL
      if (error?.message.includes('function exec_sql() does not exist')) {
        // Try creating the function through raw SQL
        let directError;
        try {
          const result = await supabase.rpc('exec_sql', {
            query: `
              CREATE OR REPLACE FUNCTION exec_sql(query text)
              RETURNS void
              LANGUAGE plpgsql
              SECURITY DEFINER
              SET search_path = public
              AS $$
              BEGIN
                EXECUTE query;
              END;
              $$;
            `
          });
          directError = result.error;
        } catch (err) {
          directError = new Error('Failed to create exec_sql function');
        }
        if (directError) {
          console.error('Error creating exec_sql function directly:', directError);
          throw directError;
        }
      } else if (error && !error.message.includes('already exists')) {
        console.error('Error creating exec_sql function:', error);
        throw error;
      }
    };

    await createProcedure();

    // Execute each statement separately with better error handling
    for (const statement of statements) {
      try {
        const { error } = await supabase.rpc('exec_sql', {
          query: statement + ';'
        });

        if (error) {
          // Ignore specific expected errors
          const ignoredErrors = [
            'already exists',
            'duplicate key value',
            'does not exist'
          ];

          if (!ignoredErrors.some(msg => error.message.includes(msg))) {
            console.error('Error executing statement:', error);
            console.error('Failed statement:', statement);
            throw error;
          } else {
            console.log(`Skipping statement (${error.message}):`, statement.slice(0, 50) + '...');
          }
        } else {
          console.log('Successfully executed:', statement.slice(0, 50) + '...');
        }
      } catch (err) {
        console.error('Unexpected error executing statement:', err);
        console.error('Failed statement:', statement);
        throw err;
      }
    }

    // Verify the setup by testing the activity logs system
    const verifySetup = async () => {
      console.log('Verifying activity logs setup...');
      
      const testUserId = '00000000-0000-0000-0000-000000000000';
      const testEmail = 'test@example.com';

      try {
        // Test insertion
        const { error: insertError } = await supabase
          .from('activity_logs')
          .insert({
            user_id: testUserId,
            user_email: testEmail,
            action: 'test_action',
            details: { test: true },
            created_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error testing activity logs insertion:', insertError);
          throw insertError;
        }

        // Test querying
        const { data, error: queryError } = await supabase
          .from('activity_logs')
          .select('*')
          .eq('user_id', testUserId)
          .single();

        if (queryError) {
          console.error('Error testing activity logs query:', queryError);
          throw queryError;
        }

        if (!data) {
          throw new Error('Test record not found');
        }

        // Clean up test data
        const { error: deleteError } = await supabase
          .from('activity_logs')
          .delete()
          .eq('user_id', testUserId);

        if (deleteError) {
          console.error('Error cleaning up test data:', deleteError);
          throw deleteError;
        }

        console.log('Activity logs verification completed successfully');
      } catch (err) {
        console.error('Activity logs verification failed:', err);
        throw err;
      }
    };

    await verifySetup();

    console.log('Activity logs system setup completed successfully');
    console.log('Next steps:');
    console.log('1. Run migrations to create necessary tables');
    console.log('2. Update your application code to use the activity logging functions');
    console.log('3. Test the system with real user actions');
  } catch (error) {
    console.error('Error setting up activity logs:', error);
    process.exit(1);
  }
}

// Run the setup
setupActivityLogs().catch(console.error);
