'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { isEffectiveLandlord } from '../../../lib/user-utils';

// Define the simplified property form data interface
interface PropertyFormData {
  title: string;
  address: string;
  city: string;
  state: string;
  price: string;
  description: string;
  bedrooms: string;
  bathrooms: string;
  size: string;
}

export default function NewProperty() {
  const { user, isLoading, refreshUserProfile } = useAuth();
  const router = useRouter();
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [creatingProfile, setCreatingProfile] = useState(false);
  
  // Simplified form data state
  const [propertyData, setPropertyData] = useState<PropertyFormData>({
    title: '',
    address: '',
    city: '',
    state: '',
    price: '',
    description: '',
    bedrooms: '',
    bathrooms: '',
    size: ''
  });
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPropertyData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Function to manually create a profile
  const createProfile = async () => {
    if (!user?.id) return;
    
    setCreatingProfile(true);
    
    try {
      // First try the API route approach
      const response = await fetch('/api/create-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          userType: 'landlord', 
          fullName: user.user_metadata?.name || user.email?.split('@')[0]
        })
      });
      
      const result = await response.json();
      
      // If API route fails, try direct creation as fallback
      if (!response.ok) {
        console.error('API route failed:', result.error);
        console.log('Attempting direct profile creation as fallback...');
        
        // Direct profile creation attempt
        const { error: directError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            user_type: 'landlord',
            full_name: user.user_metadata?.name || user.email?.split('@')[0] || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (directError) {
          console.error('Direct profile creation failed:', directError);
          throw new Error(directError.message);
        } else {
          console.log('Direct profile creation successful');
        }
      } else {
        console.log('Profile creation via API successful:', result);
      }
      
      alert('Profile created successfully! Please refresh the page.');
      // Refresh user profile data
      await refreshUserProfile();
      // Force a page reload to ensure profile is loaded
      window.location.reload();
    } catch (error) {
      console.error('Error creating profile:', error);
      alert(`Failed to create profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreatingProfile(false);
    }
  };
  
  // Submit the form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    
    try {
      // Validate required fields
      if (!propertyData.title || !propertyData.address || !propertyData.city || 
          !propertyData.state || !propertyData.price) {
        alert('Please fill in all required fields');
        setFormSubmitting(false);
        return;
      }
      
      // Check if user is logged in
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      // Log critical user information for debugging
      console.log('User authentication state:', {
        id: user.id,
        email: user.email,
        userType: user.user_metadata?.user_type,
        profileData: user.profile
      });
      
      // Force a profile check and refresh user info if needed
      if (!user.profile) {
        alert("We need to set up your user profile first. Please refresh the page or log out and back in.");
        setFormSubmitting(false);
        
        // Redirect to dashboard to refresh user state
        router.push('/dashboard');
        return;
      }
      
      // Explicitly check if user is a landlord
      if (user.user_metadata?.user_type !== 'landlord' && user.profile?.user_type !== 'landlord') {
        alert("Only landlords can create properties. Your account is not set up as a landlord.");
        setFormSubmitting(false);
        return;
      }
      
      // Prepare property data for submission
      const propertyToSubmit = {
        owner_id: user.id,
        title: propertyData.title.trim(),
        description: propertyData.description.trim(),
        address: propertyData.address.trim(),
        city: propertyData.city.trim(),
        state: propertyData.state.trim(),
        price: parseFloat(propertyData.price) || 0,
        bedrooms: propertyData.bedrooms ? parseInt(propertyData.bedrooms) : null,
        bathrooms: propertyData.bathrooms ? parseInt(propertyData.bathrooms) : null,
        size: propertyData.size ? parseInt(propertyData.size) : null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Submitting property with data:', propertyToSubmit);
      
      // Insert into Supabase
      const { data: newProperty, error } = await supabase
        .from('properties')
        .insert([propertyToSubmit])
        .select()
        .single();
      
      if (error) {
        console.error('Error inserting property:', error);
        throw new Error(`Failed to create property: ${error.message}`);
      }
      
      // Success! Redirect to property listing
      alert('Property created successfully!');
      router.push(`/properties/${newProperty.id}`);
    } catch (error: unknown) {
      console.error('Error creating property:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Error creating property: ${errorMessage}`);
    } finally {
      setFormSubmitting(false);
    }
  };
  
  // If user is not loading and is either not logged in or not a landlord, redirect
  if (!isLoading) {
    if (!user) {
      router.push('/auth/login');
      return null;
    } else if (!isEffectiveLandlord(user)) {
      router.push('/dashboard');
      return null;
    }
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }
  
  // Profile error state - show button to create profile
  if (!user?.profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Setup Required</h1>
          <p className="text-gray-600 mb-6">
            To create properties, you need a user profile. Your profile hasn&apos;t been set up yet.
          </p>
          
          <div className="space-y-4">
            <Button
              onClick={createProfile}
              isLoading={creatingProfile}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Set Up Profile as Landlord
            </Button>
            
            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Not a landlord
  if (user?.profile?.user_type !== 'landlord' && user?.user_metadata?.user_type !== 'landlord') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Landlord Access Only</h1>
          <p className="text-gray-600 mb-6">
            Only landlords can create properties. Your account is set up as a tenant.
          </p>
          
          <Button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Add New Property (Simple)
            </h1>
          </div>
        </div>
      </div>
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Form container */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-8 space-y-6">
              <Input
                label="Property Title"
                name="title"
                value={propertyData.title}
                onChange={handleInputChange}
                placeholder="e.g. Cozy 2-Bedroom Apartment Downtown"
                required
              />
              
              <Input
                label="Street Address"
                name="address"
                value={propertyData.address}
                onChange={handleInputChange}
                placeholder="e.g. 123 Main St"
                required
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  name="city"
                  value={propertyData.city}
                  onChange={handleInputChange}
                  placeholder="e.g. San Francisco"
                  required
                />
                
                <Input
                  label="State"
                  name="state"
                  value={propertyData.state}
                  onChange={handleInputChange}
                  placeholder="e.g. CA"
                  required
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Bedrooms"
                  name="bedrooms"
                  type="number"
                  min="0"
                  value={propertyData.bedrooms}
                  onChange={handleInputChange}
                  placeholder="0"
                />
                
                <Input
                  label="Bathrooms"
                  name="bathrooms"
                  type="number"
                  min="0"
                  value={propertyData.bathrooms}
                  onChange={handleInputChange}
                  placeholder="0"
                />
                
                <Input
                  label="Size (sq ft)"
                  name="size"
                  type="number"
                  min="0"
                  value={propertyData.size}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>
              
              <Input
                label="Price (monthly rent)"
                name="price"
                type="number"
                min="0"
                value={propertyData.price}
                onChange={handleInputChange}
                placeholder="e.g. 1500"
                required
              />
              
              <div className="space-y-1">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Property Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={propertyData.description}
                  onChange={handleInputChange}
                  placeholder="Provide a description of your property..."
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                ></textarea>
              </div>
            </div>
            
            {/* Form submission buttons */}
            <div className="bg-gray-50 px-8 py-5 flex justify-end">
              <Button
                type="submit"
                isLoading={formSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create Property
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}