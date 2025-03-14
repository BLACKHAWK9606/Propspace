// src/app/(routes)/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

interface ProfileData {
  full_name: string;
  phone: string;
  bio: string;
}

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    phone: '',
    bio: '',
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    } else if (user) {
      const loadProfileData = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user?.id)
            .single();

          if (error) throw error;
          
          if (data) {
            setProfileData({
              full_name: data.full_name || '',
              phone: data.phone || '',
              bio: data.bio || '',
            });
          }
        } catch (err) {
          if (err instanceof Error) {
            console.error('Error loading profile:', err.message);
          } else {
            console.error('Unknown error loading profile');
          }
        }
      };

      loadProfileData();
    }
  }, [user, isLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone,
          bio: profileData.bio,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (error) throw error;
      
      setIsEditing(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Error updating profile');
      } else {
        setError('Error updating profile');
      }
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Profile Information</h3>
            <p className="mt-1 text-sm text-gray-500">Personal details and preferences</p>
          </div>
          {!isEditing && (
            <Button 
              onClick={() => setIsEditing(true)}
              variant="outline"
            >
              Edit Profile
            </Button>
          )}
        </div>
        
        {error && (
          <div className="rounded-md bg-red-50 p-4 mx-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}
        
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                id="full_name"
                name="full_name"
                type="text"
                label="Full Name"
                value={profileData.full_name}
                onChange={handleChange}
              />
              
              <Input
                id="phone"
                name="phone"
                type="tel"
                label="Phone Number"
                value={profileData.phone}
                onChange={handleChange}
              />
              
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Tell us about yourself"
                  value={profileData.bio}
                  onChange={handleChange}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  isLoading={saving}
                >
                  Save
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Full Name</h4>
                <p className="mt-1 text-sm text-gray-900">{profileData.full_name || 'Not provided'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Email Address</h4>
                <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Phone Number</h4>
                <p className="mt-1 text-sm text-gray-900">{profileData.phone || 'Not provided'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">User Type</h4>
                <p className="mt-1 text-sm text-gray-900 capitalize">{user?.user_metadata?.user_type || 'Not specified'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Bio</h4>
                <p className="mt-1 text-sm text-gray-900">{profileData.bio || 'No bio provided'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}