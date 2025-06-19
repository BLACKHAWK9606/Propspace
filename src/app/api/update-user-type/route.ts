import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Create admin Supabase client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing user ID' },
        { status: 400 }
      );
    }
    
    console.log('Updating user type to landlord for user:', userId);
    
    // Update user type in profiles table
    const { data: profileUpdate, error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ user_type: 'landlord' })
      .eq('id', userId)
      .select()
      .single();
    
    if (profileError) {
      console.error('Error updating profile:', profileError);
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }
    
    // Also update user metadata in auth.users
    // This requires direct SQL since Supabase JS client doesn't expose raw_user_meta_data
    const { error: metadataError } = await supabaseAdmin.rpc('update_user_metadata', { 
      user_id: userId,
      user_type: 'landlord'
    });
    
    if (metadataError) {
      console.error('Error updating auth metadata:', metadataError);
      // Don't fail if only metadata update fails, return partial success
      return NextResponse.json({ 
        success: true, 
        profile: profileUpdate,
        metadataUpdated: false,
        warning: 'Profile updated but metadata update failed: ' + metadataError.message
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      profile: profileUpdate,
      metadataUpdated: true 
    });
  } catch (error) {
    console.error('Exception in update-user-type route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 