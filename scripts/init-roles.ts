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

async function initializeRoles() {
  try {
    console.log('Initializing roles...');

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'setup-roles.sql');
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

    console.log('Roles initialized successfully');

    // Verify roles were created
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('*');

    if (rolesError) {
      console.error('Error fetching roles:', rolesError);
    } else {
      console.log('Created roles:', roles);
    }

  } catch (error) {
    console.error('Error initializing roles:', error);
    process.exit(1);
  }
}

initializeRoles();
