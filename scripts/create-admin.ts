import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { type Database } from '../src/lib/database.types';

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

async function createAdmin() {
  try {
    console.log('Creating admin user...');

    // Get admin email from command line args
    const adminEmail = process.argv[2];
    if (!adminEmail) {
      console.error('Please provide an admin email as an argument');
      console.error('Usage: npm run create-admin your.email@example.com');
      process.exit(1);
    }

    // Check if user exists
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', adminEmail)
      .single();

    if (userError && !userError.message.includes('No rows found')) {
      console.error('Error checking user:', userError);
      throw userError;
    }

    let userId = existingUser?.id;

    // Create user if doesn't exist
    if (!userId) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: adminEmail,
          is_active: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        throw createError;
      }

      userId = newUser.id;
      console.log('Created new user:', adminEmail);
    } else {
      console.log('User already exists:', adminEmail);
    }

    // Check if user already has admin role
    const { data: existingRole, error: roleError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();

    if (roleError && !roleError.message.includes('No rows found')) {
      console.error('Error checking role:', roleError);
      throw roleError;
    }

    if (existingRole) {
      console.log('User is already an admin');
      return;
    }

    // Assign admin role
    const { error: assignError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'admin',
        created_at: new Date().toISOString()
      });

    if (assignError) {
      console.error('Error assigning admin role:', assignError);
      throw assignError;
    }

    // Log activity
    const { error: activityError } = await supabase
      .from('activity_logs')
      .insert({
        user_id: userId,
        user_email: adminEmail,
        action: 'role_assigned',
        details: { role: 'admin' },
        created_at: new Date().toISOString()
      });

    if (activityError) {
      console.error('Error logging activity:', activityError);
      // Don't throw here since the main operation succeeded
    }

    console.log('Successfully assigned admin role to:', adminEmail);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

// Run the script
createAdmin().catch(console.error);
