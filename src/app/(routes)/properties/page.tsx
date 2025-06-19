'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Heart, Search, Filter, X, ChevronDown, Home } from 'lucide-react';
import { getEffectiveUserType, isEffectiveLandlord } from '../../lib/user-utils';

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Favorite {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
}

interface Filters {
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
}

export default function BrowseProperties() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]); // Array of property IDs
  const [dataLoading, setDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Filters state
  const [filters, setFilters] = useState<Filters>({
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: ''
  });

  useEffect(() => {
    // If not logged in, redirect to login
    if (!isLoading && !user) {
      router.push('/auth/login');
      return;
    }
    
    // Load properties and user's favorites
    if (!isLoading && user) {
      loadProperties();
      // Only tenants have favorites - use the user-utils function to check
      if (!isEffectiveLandlord(user)) {
        loadFavorites();
      }
    }
  }, [user, isLoading, router]);

  const loadProperties = async () => {
    setDataLoading(true);
    try {
      // Only get active properties
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setProperties(data || []);
    } catch (err) {
      console.error('Error loading properties:', err);
    } finally {
      setDataLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', user?.id);
        
      if (error) throw error;
      setFavorites(data?.map(fav => fav.property_id) || []);
    } catch (err) {
      console.error('Error loading favorites:', err);
    }
  };

  const toggleFavorite = async (propertyId: string) => {
    // Only tenants can favorite properties
    if (isEffectiveLandlord(user)) return;
    
    try {
      if (favorites.includes(propertyId)) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .match({ user_id: user?.id, property_id: propertyId });
          
        if (error) throw error;
        setFavorites(prev => prev.filter(id => id !== propertyId));
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert([{ user_id: user?.id, property_id: propertyId }]);
          
        if (error) throw error;
        setFavorites(prev => [...prev, propertyId]);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Function to filter properties based on search and filters
  const filterProperties = () => {
    return properties.filter(property => {
      // Search filter
      const matchesSearch = !searchTerm || 
        (property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.description?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Price filters
      const matchesMinPrice = !filters.minPrice || property.price >= parseInt(filters.minPrice);
      const matchesMaxPrice = !filters.maxPrice || property.price <= parseInt(filters.maxPrice);
      
      // Bedrooms filter
      const matchesBedrooms = !filters.bedrooms || 
        (property.bedrooms !== undefined && property.bedrooms >= parseInt(filters.bedrooms));
      
      // Bathrooms filter
      const matchesBathrooms = !filters.bathrooms || 
        (property.bathrooms !== undefined && property.bathrooms >= parseFloat(filters.bathrooms));
      
      return matchesSearch && matchesMinPrice && matchesMaxPrice && 
        matchesBedrooms && matchesBathrooms;
    });
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: ''
    });
    setSearchTerm('');
  };

  // Loading state
  if (isLoading || dataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-t-4 border-b-4 border-blue-500"></div>
          <p className="text-lg font-medium text-gray-700">Loading properties...</p>
        </div>
      </div>
    );
  }
  
  // Get the effective user type using our utility function
  const effectiveUserType = getEffectiveUserType(user);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-12 pt-6">
      {/* Page Title */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Browse Properties
          </h1>
          
          <div className="flex items-center space-x-3">
            {effectiveUserType === 'tenant' && (
              <Link href="/properties/favorites" passHref>
                <Button variant="outline" className="border-pink-300 text-pink-700 hover:bg-pink-50">
                  <Heart className="mr-2 h-4 w-4" />
                  Favorites
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search and filter section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col space-y-4">
            {/* Search bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search properties by title, address, or description..."
            />
          </div>
          
            {/* Filter toggle */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
                <ChevronDown className={`ml-1 h-4 w-4 transform transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {(filters.minPrice || filters.maxPrice || filters.bedrooms || filters.bathrooms) && (
                <button 
                  onClick={clearFilters}
                  className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear Filters
                </button>
              )}
              </div>
              
            {/* Filter options */}
            {filtersOpen && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-2 pt-4 border-t border-gray-200">
                {/* Min Price */}
                <div>
                  <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">
                    Min Price
                  </label>
                  <input
                    type="number"
                    id="minPrice"
                    name="minPrice"
                    min="0"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Min $"
                  />
                </div>
                
                {/* Max Price */}
                <div>
                  <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">
                    Max Price
                  </label>
                  <input
                    type="number"
                    id="maxPrice"
                    name="maxPrice"
                    min="0"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Max $"
                  />
                </div>
                
                {/* Bedrooms */}
                <div>
                  <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                    Bedrooms
                  </label>
                  <select
                    id="bedrooms"
                    name="bedrooms"
                    value={filters.bedrooms}
                    onChange={handleFilterChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>
                </div>
                
                {/* Bathrooms */}
                <div>
                  <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
                    Bathrooms
                  </label>
                  <select
                    id="bathrooms"
                    name="bathrooms"
                    value={filters.bathrooms}
                    onChange={handleFilterChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="1.5">1.5+</option>
                    <option value="2">2+</option>
                    <option value="2.5">2.5+</option>
                    <option value="3">3+</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Results count and view options */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {filterProperties().length} {filterProperties().length === 1 ? 'property' : 'properties'} available
          </h2>
        </div>
        
        {/* Property grid */}
        {filterProperties().length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Home className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No properties found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search filters to find what you&apos;re looking for.
            </p>
            <div className="mt-6">
              <button
                onClick={clearFilters}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <X className="mr-2 h-5 w-5 text-gray-400" />
                Clear Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterProperties().map((property) => (
              <div 
                key={property.id} 
                className="bg-white rounded-xl shadow-md overflow-hidden transition-shadow hover:shadow-lg"
              >
                {/* Property image placeholder */}
                <div className="h-48 bg-gray-200 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Home className="h-12 w-12 text-gray-400" />
                  </div>
                  
                  {/* Favorite button */}
                  {effectiveUserType === 'tenant' && (
                    <button
                      onClick={() => toggleFavorite(property.id)}
                      className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-sm hover:bg-gray-100"
                      aria-label={favorites.includes(property.id) ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Heart 
                        className={`h-5 w-5 ${favorites.includes(property.id) ? 'text-pink-500 fill-pink-500' : 'text-gray-400'}`}
                      />
                    </button>
                  )}
                </div>
                
                {/* Property details */}
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{property.title}</h3>
                    <p className="text-lg font-bold text-blue-600">
                      ${property.price.toLocaleString()}
                      {property.price < 10000 ? '/mo' : ''}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{property.address}, {property.city}, {property.state}</p>
                  
                  {/* Property features */}
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    {property.bedrooms !== undefined && (
                      <div className="mr-4">
                        <span className="font-medium">{property.bedrooms}</span> bed{property.bedrooms !== 1 && 's'}
                      </div>
                    )}
                    {property.bathrooms !== undefined && (
                      <div className="mr-4">
                        <span className="font-medium">{property.bathrooms}</span> bath{property.bathrooms !== 1 && 's'}
                      </div>
                    )}
                    {property.size !== undefined && (
                      <div>
                        <span className="font-medium">{property.size.toLocaleString()}</span> sq ft
                      </div>
                    )}
                  </div>
                  
                  {/* Description */}
                  {property.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{property.description}</p>
                  )}
                  
                  {/* View button */}
                  <div className="mt-4">
                  <Link href={`/properties/${property.id}`} passHref>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                        View Property
                    </Button>
                  </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}