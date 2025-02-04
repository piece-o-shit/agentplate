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

async function initDatabase() {
  try {
    console.log('Initializing database...');
    
    // Read the SQL file
    const sqlContent = fs.readFileSync(
      path.resolve(process.cwd(), 'scripts/setup-database.sql'),
      'utf-8'
    );

    // Split the SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);

    // Execute SQL using Supabase client
    for (const statement of statements) {
      const { error } = await supabase.rpc('run_sql', {
        query: statement
      });

      if (error) {
        console.error('Error executing SQL statement:', error);
        console.error('Failed statement:', statement);
        throw error;
      }
    }

    // Verify database setup by checking if tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('agents')
      .select('id')
      .limit(1);

    if (tablesError) {
      console.error('Error verifying database setup:', tablesError);
      throw tablesError;
    }

    console.log('Database tables verified successfully');
    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase().catch(console.error);
