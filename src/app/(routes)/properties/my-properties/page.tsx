'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, PlusCircle, Edit, Trash2, Eye, Home, Search } from 'lucide-react';

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

export default function MyProperties() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, propertyId: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const loadProperties = async () => {
    setDataLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setProperties(data || []);
    } catch (err) {
      console.error('Error loading properties:', err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    // Redirect if not logged in or not a landlord
    if (!isLoading && (!user || user.user_metadata?.user_type !== 'landlord')) {
      router.push('/dashboard');
      return;
    }
    
    // Load properties if user is a landlord
    if (!isLoading && user && user.user_metadata?.user_type === 'landlord') {
      loadProperties();
    }
  }, [user, isLoading, router, loadProperties]);
  
  // Delete a property
  const deleteProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId)
        .eq('owner_id', user?.id); // Extra security check
      
      if (error) throw error;
      
      // Refresh the properties list
      loadProperties();
      setDeleteModal({ isOpen: false, propertyId: '' });
    } catch (err) {
      console.error('Error deleting property:', err);
    }
  };
  
  // Toggle property active status
  const togglePropertyStatus = async (propertyId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ is_active: !currentStatus })
        .eq('id', propertyId)
        .eq('owner_id', user?.id); // Extra security check
      
      if (error) throw error;
      
      // Refresh the properties list
      loadProperties();
    } catch (err) {
      console.error('Error updating property status:', err);
    }
  };
  
  // Filter properties based on search term
  const filteredProperties = properties.filter(property => 
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading state
  if (isLoading || dataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-t-4 border-b-4 border-blue-500"></div>
          <p className="text-lg font-medium text-gray-700">Loading your properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-12">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 mr-4">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                My Properties
              </h1>
            </div>
            
            <Link href="/properties/new" passHref>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Property
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Search and filters */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="relative mb-4 sm:mb-0 sm:max-w-xs">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search properties..."
              className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          
          <div className="text-sm text-gray-500">
            Showing {filteredProperties.length} of {properties.length} properties
          </div>
        </div>
        
        {/* Properties list */}
        {filteredProperties.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-lg">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Home className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No properties found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {properties.length === 0 
                ? "You haven't listed any properties yet." 
                : "No properties match your search."}
            </p>
            {properties.length === 0 && (
              <div className="mt-6">
                <Link href="/properties/new" passHref>
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Your First Property
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProperties.map((property) => (
              <div 
                key={property.id} 
                className={`relative overflow-hidden rounded-xl bg-white shadow-lg transition-all hover:shadow-xl ${
                  !property.is_active ? 'opacity-75' : ''
                }`}
              >
                {/* Property image placeholder */}
                <div className="h-48 bg-gray-200 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Home className="h-12 w-12 text-gray-400" />
                  </div>
                  {!property.is_active && (
                    <div className="absolute top-2 right-2 rounded-full bg-gray-800 px-3 py-1 text-xs font-medium text-white">
                      Inactive
                    </div>
                  )}
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
                    ${property.price}/month
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {property.bedrooms && (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        {property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}
                      </span>
                    )}
                    {property.bathrooms && (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        {property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}
                      </span>
                    )}
                    {property.size && (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        {property.size} sqft
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <Link href={`/properties/${property.id}`} passHref>
                        <Button 
                          className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-2 py-1 h-8"
                          aria-label="View property"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/properties/edit/${property.id}`} passHref>
                        <Button 
                          className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-2 py-1 h-8"
                          aria-label="Edit property"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        onClick={() => setDeleteModal({ isOpen: true, propertyId: property.id })}
                        className="bg-white border border-gray-300 text-red-600 hover:bg-red-50 hover:border-red-300 px-2 py-1 h-8"
                        aria-label="Delete property"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={property.is_active}
                          onChange={() => togglePropertyStatus(property.id, property.is_active)}
                        />
                        <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-focus:ring-4 peer-focus:ring-blue-300"></div>
                        <span className="ml-2 text-sm font-medium text-gray-900">
                          {property.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Delete confirmation modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Delete Property</h3>
              <p className="mt-2 text-sm text-gray-500">
                Are you sure you want to delete this property? This action cannot be undone.
              </p>
              
              <div className="mt-6 flex justify-end space-x-4">
                <Button
                  onClick={() => setDeleteModal({ isOpen: false, propertyId: '' })}
                  className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => deleteProperty(deleteModal.propertyId)}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}