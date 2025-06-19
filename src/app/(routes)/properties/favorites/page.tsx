'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, Home, Heart, Search } from 'lucide-react';
import { isEffectiveLandlord } from '../../../lib/user-utils';

// Property type definition
interface Property {
  id: string;
  owner_id: string;
  title: string;
  description?: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  address: string;
  city: string;
  state: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Favorite {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
  properties: Property;
}

export default function FavoriteProperties() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Use useCallback to memoize the function
  const loadFavorites = useCallback(async () => {
    setDataLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*, properties(*)')
        .eq('user_id', user?.id);
        
      if (error) throw error;
      setFavorites(data || []);
    } catch (err) {
      console.error('Error loading favorites:', err);
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Redirect if not logged in or not a tenant
    if (!isLoading && (!user || isEffectiveLandlord(user))) {
      router.push('/dashboard');
      return;
    }
    
    // Load favorites if user is a tenant
    if (!isLoading && user && !isEffectiveLandlord(user)) {
      loadFavorites();
    }
  }, [user, isLoading, router, loadFavorites]);

  const removeFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId)
        .eq('user_id', user?.id); // Extra security check
      
      if (error) throw error;
      
      // Refresh the favorites list
      loadFavorites();
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  // Filter favorites based on search term
  const filteredFavorites = favorites.filter(favorite => {
    const property = favorite.properties;
    
    return property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (property.description && property.description.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  // Loading state
  if (isLoading || dataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-t-4 border-b-4 border-blue-500"></div>
          <p className="text-lg font-medium text-gray-700">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-12">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              My Favorite Properties
            </h1>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Search */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="relative mb-4 sm:mb-0 sm:max-w-xs">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search favorites..."
              className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          
          <div className="text-sm text-gray-500">
            Showing {filteredFavorites.length} of {favorites.length} favorite properties
          </div>
        </div>
        
        {/* Favorites list */}
        {filteredFavorites.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-lg">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Heart className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No favorite properties</h3>
            <p className="mt-1 text-sm text-gray-500">
              {favorites.length === 0 
                ? "You haven't added any properties to your favorites yet." 
                : "No properties match your search."}
            </p>
            {favorites.length === 0 && (
              <div className="mt-6">
                <Link href="/properties" passHref>
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all">
                    Browse Properties
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredFavorites.map((favorite) => {
              const property = favorite.properties;
              return (
                <div 
                  key={favorite.id} 
                  className="relative overflow-hidden rounded-xl bg-white shadow-lg transition-all hover:shadow-xl"
                >
                  {/* Property image placeholder */}
                  <div className="h-48 bg-gray-200 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Home className="h-12 w-12 text-gray-400" />
                    </div>
                    
                    {/* Remove favorite button */}
                    <button
                      onClick={() => removeFavorite(favorite.id)}
                      className="absolute top-2 right-2 rounded-full bg-white p-2 shadow-md hover:bg-gray-100 focus:outline-none"
                      aria-label="Remove from favorites"
                    >
                      <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                    </button>
                  </div>
                  
                  {/* Property details */}
                  <div className="p-5">
                    <h3 className="mb-1 text-lg font-semibold text-gray-900 line-clamp-1">
                      {property.title}
                    </h3>
                    <p className="mb-2 text-sm text-gray-500 line-clamp-1">
                      {property.address}, {property.city}, {property.state}
                    </p>
                    <div className="mb-4 text-lg font-bold text-blue-600">
                      ${property.price.toLocaleString()}
                      {property.price < 10000 ? '/mo' : ''}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {property.bedrooms !== undefined && (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          {property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}
                        </span>
                      )}
                      {property.bathrooms !== undefined && (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          {property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}
                        </span>
                      )}
                      {property.size !== undefined && (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          {property.size} sqft
                        </span>
                      )}
                    </div>
                    
                    <Link href={`/properties/${property.id}`} passHref>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all">
                        View Property
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}