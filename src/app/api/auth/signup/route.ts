import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { assignDefaultRole } from '@/lib/roles';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (data.user) {
      try {
        // Assign default role to the new user
        await assignDefaultRole(data.user.id);
      } catch (roleError) {
        console.error('Error assigning default role:', roleError);
        // Even if role assignment fails, we still want to return the user
        // The role can be assigned later by an admin
      }
    }

    return NextResponse.json({ 
      user: data.user,
      session: data.session
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
