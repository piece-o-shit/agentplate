import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestAccounts() {
  try {
    // Create test user account
    const { data: userData, error: userError } = await supabase.auth.signUp({
      email: 'user@user.com',
      password: 'password',
    });

    if (userError) {
      console.error('Error creating user account:', userError.message);
    } else {
      console.log('Test user account created successfully:', userData.user.email);
    }

    // Create admin account
    const { data: adminData, error: adminError } = await supabase.auth.signUp({
      email: 'admin@admin.com',
      password: 'password',
    });

    if (adminError) {
      console.error('Error creating admin account:', adminError.message);
    } else {
      console.log('Admin account created successfully:', adminData.user.email);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  } finally {
    process.exit(0);
  }
}

createTestAccounts();
