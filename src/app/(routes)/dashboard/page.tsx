'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { 
  Home, 
  PlusCircle, 
  Heart, 
  MessageCircle, 
  Search, 
  RefreshCw, 
  Building, 
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getEffectiveUserType } from '../../lib/user-utils';

// Define proper types for our data
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
  property?: Property;
}

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [greetingTime, setGreetingTime] = useState('');

  useEffect(() => {
    // Debug user data
    console.log('User data:', user);
    console.log('User metadata:', user?.user_metadata);
    console.log('User type from metadata:', user?.user_metadata?.user_type);
    console.log('User profile:', user?.profile);
    console.log('User type from profile:', user?.profile?.user_type);
    console.log('Effective user type:', getEffectiveUserType(user));
    console.log('Is this getUserType giving landlord?', user?.user_metadata?.user_type === 'landlord');
    
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreetingTime('Good morning');
    else if (hour < 18) setGreetingTime('Good afternoon');
    else setGreetingTime('Good evening');

    if (!isLoading && !user) {
      router.push('/auth/login');
    } else if (user) {
      const loadDashboardData = async () => {
        setDataLoading(true);
        
        try {
          // Get effective user type
          const effectiveUserType = getEffectiveUserType(user);
          
          if (effectiveUserType === 'landlord') {
            // Load landlord's properties
            const { data, error } = await supabase
              .from('properties')
              .select('*')
              .eq('owner_id', user?.id)
              .order('created_at', { ascending: false });
              
            if (error) throw error;
            setProperties(data || []);
          } else {
            // Load tenant's favorite properties
            const { data, error } = await supabase
              .from('favorites')
              .select('*, property:properties(*)')
              .eq('user_id', user?.id);
              
            if (error) throw error;
            setFavorites(data || []);
          }
        } catch (err) {
          console.error('Error loading dashboard data:', err);
        } finally {
          setDataLoading(false);
        }
      };
      
      loadDashboardData();
    }
  }, [user, isLoading, router]);

  if (isLoading || dataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-t-4 border-b-4 border-blue-500"></div>
          <p className="text-lg font-medium text-gray-700">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Get user info
  const effectiveUserType = getEffectiveUserType(user);
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'there';
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  // Format price as currency
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Get property status badge
  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Active
      </span>;
    }
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
      Inactive
    </span>;
  };

  // Handle direct navigation to property creation
  const handleCreateProperty = () => {
    console.log('Navigating to property creation page');
    router.push('/properties/new');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-12 pt-6">
      {/* Welcome Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 sm:p-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <h1 className="text-3xl font-bold text-white">
                  {greetingTime}, {userName}
                </h1>
                <p className="mt-1 text-lg text-blue-100">
                  Welcome to your Propspace dashboard
                </p>
              </div>
              
              {effectiveUserType === 'landlord' ? (
                <div className="flex space-x-3">
                  <Button 
                    onClick={handleCreateProperty}
                    className="bg-green-500 text-white hover:bg-green-600 shadow-md font-medium text-base px-6 py-2.5"
                    size="lg"
                  >
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Add New Property
                  </Button>
                  <Link href="/properties/my-properties" passHref>
                    <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                      <Building className="mr-2 h-4 w-4" />
                      My Properties
                    </Button>
                  </Link>
                </div>
              ) : (
                <Link href="/properties" passHref>
                  <Button className="bg-green-500 text-white hover:bg-green-600 shadow-md font-medium">
                    <Search className="mr-2 h-4 w-4" />
                    Browse Properties
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div 
                className="bg-white overflow-hidden shadow-lg rounded-xl transition-all hover:shadow-xl border border-gray-100"
                variants={itemVariants}
              >
                <div className="p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3">
                      <Home className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {effectiveUserType === 'landlord' ? 'My Properties' : 'Favorite Properties'}
                        </dt>
                        <dd>
                          <div className="text-xl font-semibold text-gray-900">
                            {effectiveUserType === 'landlord' ? properties.length : favorites.length}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-white overflow-hidden shadow-lg rounded-xl transition-all hover:shadow-xl border border-gray-100"
                variants={itemVariants}
              >
                <div className="p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3">
                      <MessageCircle className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Messages
                        </dt>
                        <dd>
                          <div className="text-xl font-semibold text-gray-900">
                            0
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-white overflow-hidden shadow-lg rounded-xl transition-all hover:shadow-xl border border-gray-100"
                variants={itemVariants}
              >
                <div className="p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-3">
                      <RefreshCw className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Recent Activity
                        </dt>
                        <dd>
                          <div className="text-xl font-semibold text-gray-900">
                            0
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Property or Favorites List */}
            {effectiveUserType === 'landlord' ? (
              // LANDLORD VIEW
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 flex justify-between items-center border-b border-gray-100">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">My Recent Properties</h2>
                    <p className="text-sm text-gray-500">Properties you&apos;ve listed recently</p>
                  </div>
                  <Link href="/properties/my-properties" passHref>
                    <Button variant="outline" className="text-sm">
                      View All
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {properties.length === 0 ? (
                    <div className="p-10 text-center">
                      <Building className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                      <p className="mt-2 text-gray-500 text-lg mb-6">You haven&apos;t listed any properties yet</p>
                      <Button 
                        onClick={handleCreateProperty}
                        className="mt-4 bg-green-600 text-white hover:bg-green-700 shadow-md font-medium px-6 py-3 text-base"
                      >
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Add Your First Property
                      </Button>
                    </div>
                  ) : (
                    // Show up to 3 most recent properties
                    properties.slice(0, 3).map((property) => (
                      <div key={property.id} className="p-4 sm:px-6 hover:bg-gray-50">
                        <Link href={`/properties/${property.id}`}>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="mb-2 sm:mb-0">
                              <div className="flex items-center">
                                <h3 className="text-base font-medium text-blue-600 truncate">{property.title}</h3>
                                <div className="ml-2">{getStatusBadge(property.is_active)}</div>
                              </div>
                              <div className="mt-1 text-sm text-gray-500">
                                {property.address}, {property.city}, {property.state}
                              </div>
                            </div>
                            <div className="flex items-center mt-2 sm:mt-0">
                              <span className="text-base font-semibold text-gray-900">
                                {formatPrice(property.price)}
                              </span>
                              <ChevronRight className="ml-2 h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))
                  )}
                </div>
                
                {properties.length > 0 && (
                  <div className="bg-gray-50 px-6 py-4">
                    <Link href="/properties/my-properties" passHref className="text-sm font-medium text-blue-600 hover:text-blue-500">
                      View all properties ({properties.length})
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              // TENANT VIEW
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 flex justify-between items-center border-b border-gray-100">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">My Favorite Properties</h2>
                    <p className="text-sm text-gray-500">Properties you&apos;ve saved</p>
                  </div>
                  <Link href="/properties/favorites" passHref>
                    <Button variant="outline" className="text-sm">
                      View All
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {favorites.length === 0 ? (
                    <div className="p-6 text-center">
                      <Heart className="h-12 w-12 mx-auto text-gray-300" />
                      <p className="mt-2 text-gray-500">You haven&apos;t favorited any properties yet</p>
                      <Link href="/properties" passHref>
                        <Button 
                          className="mt-4 bg-blue-500 text-white hover:bg-blue-600"
                        >
                          <Search className="mr-2 h-4 w-4" />
                          Browse Properties
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    // Show up to 3 favorite properties
                    favorites.slice(0, 3).map((favorite) => {
                      const property = favorite.property;
                      if (!property) return null;
                      
                      return (
                        <div key={favorite.id} className="p-4 sm:px-6 hover:bg-gray-50">
                          <Link href={`/properties/${property.id}`}>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <div className="mb-2 sm:mb-0">
                                <h3 className="text-base font-medium text-blue-600 truncate">{property.title}</h3>
                                <div className="mt-1 text-sm text-gray-500">
                                  {property.address}, {property.city}, {property.state}
                                </div>
                              </div>
                              <div className="flex items-center mt-2 sm:mt-0">
                                <span className="text-base font-semibold text-gray-900">
                                  {formatPrice(property.price)}
                                </span>
                                <ChevronRight className="ml-2 h-4 w-4 text-gray-400" />
                              </div>
                            </div>
                          </Link>
                        </div>
                      );
                    })
                  )}
                </div>
                
                {favorites.length > 0 && (
                  <div className="bg-gray-50 px-6 py-4">
                    <Link href="/properties/favorites" passHref className="text-sm font-medium text-blue-600 hover:text-blue-500">
                      View all favorites ({favorites.length})
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-4">
                {effectiveUserType === 'landlord' && (
                  <Button 
                    onClick={handleCreateProperty}
                    className="w-full justify-start bg-green-600 text-white hover:bg-green-700 border border-green-500 shadow-sm"
                  >
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Add New Property
                  </Button>
                )}
                
                <Link href="/properties" passHref>
                  <Button className="w-full justify-start bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100">
                    <Search className="mr-2 h-4 w-4" />
                    Browse Properties
                  </Button>
                </Link>
                
                {effectiveUserType === 'landlord' ? (
                  <Link href="/properties/my-properties" passHref>
                    <Button className="w-full justify-start bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100">
                      <Building className="mr-2 h-4 w-4" />
                      My Properties
                    </Button>
                  </Link>
                ) : (
                  <Link href="/properties/favorites" passHref>
                    <Button className="w-full justify-start bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-100">
                      <Heart className="mr-2 h-4 w-4" />
                      View Favorites
                    </Button>
                  </Link>
                )}
                
                <Link href="/messages" passHref>
                  <Button className="w-full justify-start bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-100">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Messages
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Tips Section */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Tips</h2>
              </div>
              <div className="p-6">
                <ul className="space-y-4 text-sm text-gray-600">
                  {effectiveUserType === 'landlord' ? (
                    <>
                      <li className="flex">
                        <div className="flex-shrink-0 h-5 w-5 flex items-center justify-center rounded-full bg-blue-100 text-blue-500 mr-3">
                          1
                        </div>
                        <p>Add high-quality photos to make your listings stand out</p>
                      </li>
                      <li className="flex">
                        <div className="flex-shrink-0 h-5 w-5 flex items-center justify-center rounded-full bg-blue-100 text-blue-500 mr-3">
                          2
                        </div>
                        <p>Provide detailed descriptions of your properties</p>
                      </li>
                      <li className="flex">
                        <div className="flex-shrink-0 h-5 w-5 flex items-center justify-center rounded-full bg-blue-100 text-blue-500 mr-3">
                          3
                        </div>
                        <p>Respond quickly to tenant inquiries</p>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex">
                        <div className="flex-shrink-0 h-5 w-5 flex items-center justify-center rounded-full bg-blue-100 text-blue-500 mr-3">
                          1
                        </div>
                        <p>Save your favorite properties to view them later</p>
                      </li>
                      <li className="flex">
                        <div className="flex-shrink-0 h-5 w-5 flex items-center justify-center rounded-full bg-blue-100 text-blue-500 mr-3">
                          2
                        </div>
                        <p>Use filters to narrow down your property search</p>
                      </li>
                      <li className="flex">
                        <div className="flex-shrink-0 h-5 w-5 flex items-center justify-center rounded-full bg-blue-100 text-blue-500 mr-3">
                          3
                        </div>
                        <p>Contact landlords directly for more information</p>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}