import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function initTestUser() {
  try {
    console.log('Creating test user...');
    
    // Read and execute the SQL file
    const sqlContent = fs.readFileSync(
      path.resolve(process.cwd(), 'scripts/create-test-user.sql'),
      'utf-8'
    );

    const { error } = await supabase.from('profiles').upsert({
      id: '00000000-0000-0000-0000-000000000000',
      email: 'test@example.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    if (error) {
      console.error('Error creating test user profile:', error);
      process.exit(1);
    }

    // Execute raw SQL for auth schema operations
    const { error: sqlError } = await supabase.rpc('exec_sql', {
      sql: sqlContent
    });

    if (sqlError) {
      console.error('Error executing SQL:', sqlError);
      process.exit(1);
    }

    console.log('Test user created successfully!');
  } catch (error) {
    console.error('Error initializing test user:', error);
    process.exit(1);
  }
}

initTestUser().catch(console.error);
