import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Log environment variables without exposing sensitive information
console.log('API Environment Check:', {
  supabaseUrlExists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  serviceRoleKeyExists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  nodeEnv: process.env.NODE_ENV
});

// Create a regular Supabase client as fallback if admin client fails
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if we have the required environment variables
if (!supabaseUrl) {
  console.error('NEXT_PUBLIC_SUPABASE_URL is not defined');
}

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is not defined, profile creation via admin route will not work');
}

// Create admin client only if we have the service role key
let supabaseAdmin: SupabaseClient | null = null;
try {
  if (supabaseUrl && supabaseServiceKey) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
} catch (error) {
  console.error('Failed to create admin Supabase client:', error);
}

// Regular client as fallback
let supabase: SupabaseClient | null = null;
try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (error) {
  console.error('Failed to create regular Supabase client:', error);
}

export async function POST(request: Request) {
  try {
    // Check if we have a working Supabase client
    if (!supabaseAdmin && !supabase) {
      return NextResponse.json(
        { error: 'Database connection not available. Please check server configuration.' },
        { status: 500 }
      );
    }

    const { userId, email, userType, fullName } = await request.json();
    
    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    console.log('Creating profile for user:', userId, email, userType);
    
    // Determine which client to use
    const client: SupabaseClient = supabaseAdmin || supabase as SupabaseClient;
    const isAdminClient = !!supabaseAdmin;
    
    console.log('Using admin client:', isAdminClient);
    
    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking profile existence:', checkError);
      return NextResponse.json(
        { error: `Error checking profile existence: ${checkError.message}` },
        { status: 500 }
      );
    }
    
    if (existingProfile) {
      console.log('Profile already exists for user:', userId);
      return NextResponse.json({ 
        success: true, 
        profile: existingProfile,
        message: 'Profile already exists'
      });
    }
    
    // Create new profile
    const profileData = {
      id: userId,
      email: email,
      user_type: userType,
      full_name: fullName || email.split('@')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Log exactly what we're creating to verify the user type
    console.log('Creating profile with exact data:', {
      ...profileData,
      user_type_source: 'From request parameter: ' + userType
    });
    
    const { data: newProfile, error: insertError } = await client
      .from('profiles')
      .insert(profileData)
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating profile:', insertError);
      return NextResponse.json(
        { 
          error: `Failed to create profile: ${insertError.message}`,
          isAdmin: isAdminClient
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      profile: newProfile,
      isAdmin: isAdminClient
    });
  } catch (error) {
    console.error('Exception in create-profile route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 