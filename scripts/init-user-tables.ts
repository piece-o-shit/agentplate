import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function initializeUserTables() {
  try {
    console.log('Initializing user tables...');

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'setup-user-tables.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Split the SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);

    // Execute each statement
    for (const statement of statements) {
      const { error } = await supabase.rpc('exec', { sql: statement });
      if (error) {
        console.error('Error executing SQL:', error);
        throw error;
      }
    }

    console.log('User tables initialized successfully');

    // Verify tables were created
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .in('table_name', ['profiles', 'user_settings', 'activity_logs', 'agents'])
      .eq('table_schema', 'public');

    if (tablesError) {
      console.error('Error fetching tables:', tablesError);
    } else {
      console.log('Created tables:', tables.map(t => t.table_name));
    }

    // Create profiles and settings for existing users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
    } else if (users) {
      console.log(`Creating profiles and settings for ${users.users.length} existing users...`);
      
      for (const user of users.users) {
        // Try to create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({ 
            user_id: user.id,
            full_name: user.email?.split('@')[0] || 'User'
          });

        if (profileError && profileError.code !== '23505') { // Ignore unique violation
          console.error(`Error creating profile for ${user.email}:`, profileError);
        }

        // Try to create settings
        const { error: settingsError } = await supabase
          .from('user_settings')
          .upsert({ user_id: user.id });

        if (settingsError && settingsError.code !== '23505') { // Ignore unique violation
          console.error(`Error creating settings for ${user.email}:`, settingsError);
        }
      }
    }

  } catch (error) {
    console.error('Error initializing user tables:', error);
    process.exit(1);
  }
}

initializeUserTables();
