'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

// Enhanced User type that includes profile data
type EnhancedUser = User & {
  profile?: {
    id: string;
    email: string;
    user_type: string;
    full_name?: string;
    avatar_url?: string;
    phone?: string;
    bio?: string;
    created_at: string;
    updated_at: string;
  }
};

type AuthContextType = {
  user: EnhancedUser | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, userType: string, fullName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<EnhancedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to fetch profile data for a user
  const fetchUserProfile = async (userId: string) => {
    try {
      // First check if the profile exists
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Don't try to create profile automatically if it doesn't exist
        if (error.code === 'PGRST116') { // PostgreSQL not found
          console.log('Profile not found for user:', userId);
          return null;
        }
        
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Exception when fetching user profile:', err);
      return null;
    }
  };

  // Helper function to create a profile using our API route
  const createUserProfile = async (user: User) => {
    try {
      // Extract user type from metadata and log it
      const userTypeFromMetadata = user.user_metadata?.user_type;
      console.log('Creating profile with user type from metadata:', userTypeFromMetadata);
      
      // If no user type in metadata, this is an error condition
      if (!userTypeFromMetadata) {
        console.error('No user_type found in metadata during profile creation for user:', user.id);
      }
      
      const response = await fetch('/api/create-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          // Explicitly pass the user type from metadata, with no fallback to ensure we use what was chosen during signup
          userType: userTypeFromMetadata,
          fullName: user.user_metadata?.name || user.email?.split('@')[0]
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        console.error('API route error:', result.error);
        return null;
      }
      
      console.log('Profile created successfully via API with user_type:', result.profile?.user_type);
      return result.profile;
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      return null;
    }
  };

  // Helper function to set up a user with their profile data
  const setupUser = async (authUser: User | null) => {
    if (!authUser) {
      setUser(null);
      return;
    }

    try {
      // Get user type from metadata and log it clearly
      const userTypeFromMetadata = authUser.user_metadata?.user_type;
      console.log('User type from metadata during setup:', userTypeFromMetadata);
      
      // Try to find existing profile
      let profileData = await fetchUserProfile(authUser.id);
      console.log('Initial profile data during setup:', profileData);
      
      // If no profile exists and we have metadata, create it
      if (!profileData && userTypeFromMetadata) {
        console.log('Creating profile with explicit user type:', userTypeFromMetadata);
        profileData = await createUserProfile(authUser);
      } else if (!profileData) {
        // This is a serious error - we have a user with no profile and no metadata
        console.error('Cannot determine user type - missing both profile and metadata user_type');
      }
      
      // Get final user type (prefer profile over metadata)
      // Never default to tenant - if both are missing, it's an error condition
      const finalUserType = profileData?.user_type || userTypeFromMetadata;
      
      console.log('Final determined user type:', finalUserType);
                     
      // Create enhanced user with the determined user type
      const enhancedUser: EnhancedUser = {
        ...authUser,
        profile: profileData || undefined,
        user_metadata: {
          ...authUser.user_metadata,
          user_type: finalUserType
        } as Record<string, unknown>
      };

      setUser(enhancedUser);
    } catch (error) {
      console.error('Error in setupUser:', error);
      // Still set the user even if there was an error getting profile
      setUser(authUser as EnhancedUser);
    }
  };

  // Function to manually refresh user profile data
  const refreshUserProfile = async () => {
    if (!user) return;
    
    const profileData = await fetchUserProfile(user.id);
    
    const enhancedUser: EnhancedUser = {
      ...user,
      profile: profileData || undefined
    };

    setUser(enhancedUser);
  };

  useEffect(() => {
    const setData = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          setIsLoading(false);
          return;
        }
        
        setSession(session);
        await setupUser(session?.user || null);
      } catch (err) {
        console.error('Exception in auth setup:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      await setupUser(session?.user || null);
      setIsLoading(false);
    });

    setData();

    return () => {
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signUp = async (email: string, password: string, userType: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_type: userType,
          name: fullName || email.split('@')[0]
        }
      }
    });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error('User creation failed');
    }

    // Don't try to create profile here - let it be a separate operation
    // This ensures authentication works even if profile creation fails

    // Set up the enhanced user
    await setupUser(data.user);
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    // Set up the enhanced user
    await setupUser(data.user);
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    setUser(null);
    setSession(null);
  };

  const value = {
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}