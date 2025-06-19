import { User } from '@supabase/supabase-js';

// Get user type from any available source - profile table or user metadata
export function getUserType(user: User | null): string {
  if (!user) return 'guest';

  // Check profile data first
  if (user.user_metadata?.profile?.user_type) {
    return user.user_metadata.profile.user_type;
  }

  // Then check direct user metadata
  if (user.user_metadata?.user_type) {
    return user.user_metadata.user_type;
  }

  // Then check any added profile property (from our EnhancedUser type)
  if ((user as any).profile?.user_type) {
    return (user as any).profile.user_type;
  }

  // Default to tenant if we can't find a user type
  return 'tenant';
}

// Check if user is a landlord
export function isLandlord(user: User | null): boolean {
  return getUserType(user) === 'landlord';
}

// Get the effective user type - always returns actual user type
export function getEffectiveUserType(user: User | null): string {
  return getUserType(user);
}

// Check if user is a landlord
export function isEffectiveLandlord(user: User | null): boolean {
  return getEffectiveUserType(user) === 'landlord';
} 