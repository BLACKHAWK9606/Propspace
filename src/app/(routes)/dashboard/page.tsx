'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Home, PlusCircle, Heart, MessageCircle, Search, RefreshCw, Building, MapPin, Users, Bell, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

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
  properties?: Property;
}

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [greetingTime, setGreetingTime] = useState('');

  useEffect(() => {
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
          const userType = user?.user_metadata?.user_type;
          
          if (userType === 'landlord') {
            // Load landlord's properties
            const { data, error } = await supabase
              .from('properties')
              .select('*')
              .eq('owner_id', user?.id);
              
            if (error) throw error;
            setProperties(data || []);
          } else {
            // Load tenant's favorite properties
            const { data, error } = await supabase
              .from('favorites')
              .select('*, properties(*)')
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

  const userType = user?.user_metadata?.user_type;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-12">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl font-bold text-gray-900">
                {greetingTime}, {userName}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome to your Propspace dashboard
              </p>
            </div>
            
            {userType === 'landlord' ? (
              <Link href="/properties/new" passHref>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Property
                </Button>
              </Link>
            ) : (
              <Link href="/properties" passHref>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all">
                  <Search className="mr-2 h-4 w-4" />
                  Browse Properties
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="bg-white overflow-hidden shadow-lg rounded-xl transition-all hover:shadow-xl"
            variants={itemVariants}
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4">
                  <Home className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {userType === 'landlord' ? 'My Properties' : 'Favorite Properties'}
                    </dt>
                    <dd>
                      <div className="text-2xl font-semibold text-gray-900">
                        {userType === 'landlord' ? properties.length : favorites.length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-3">
              <div className="text-sm">
                <Link 
                  href={userType === 'landlord' ? "/properties/my-properties" : "/properties/favorites"}
                  className="flex items-center font-medium text-blue-700 hover:text-blue-900"
                >
                  View all
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-white overflow-hidden shadow-lg rounded-xl transition-all hover:shadow-xl"
            variants={itemVariants}
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Messages
                    </dt>
                    <dd className="flex items-center">
                      <div className="text-2xl font-semibold text-gray-900">
                        0
                      </div>
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        All caught up
                      </span>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-3">
              <div className="text-sm">
                <Link 
                  href="/messages"
                  className="flex items-center font-medium text-blue-700 hover:text-blue-900"
                >
                  View all
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
          
          {userType === 'tenant' ? (
            <motion.div 
              className="bg-white overflow-hidden shadow-lg rounded-xl transition-all hover:shadow-xl"
              variants={itemVariants}
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-4">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Saved Searches
                      </dt>
                      <dd>
                        <div className="text-2xl font-semibold text-gray-900">
                          0
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3">
                <div className="text-sm">
                  <Link 
                    href="/saved-searches"
                    className="flex items-center font-medium text-blue-700 hover:text-blue-900"
                  >
                    View all
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              className="bg-white overflow-hidden shadow-lg rounded-xl transition-all hover:shadow-xl"
              variants={itemVariants}
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Tenant Inquiries
                      </dt>
                      <dd>
                        <div className="text-2xl font-semibold text-gray-900">
                          0
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3">
                <div className="text-sm">
                  <Link 
                    href="/inquiries"
                    className="flex items-center font-medium text-blue-700 hover:text-blue-900"
                  >
                    View all
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
        
        {/* Recent Activity Section */}
        <motion.div 
          variants={itemVariants}
          initial="hidden" 
          animate="visible"
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <RefreshCw className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {userType === 'landlord' 
                      ? 'Add properties or respond to inquiries to see activity here.'
                      : 'Start browsing and favoriting properties to see activity here.'}
                  </p>
                  <div className="mt-6">
                    <Link 
                      href={userType === 'landlord' ? "/properties/new" : "/properties"}
                      passHref
                    >
                      <Button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                        {userType === 'landlord' ? 'Add Property' : 'Browse Properties'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Quick Actions */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div 
              variants={itemVariants}
              className="bg-white shadow-lg rounded-xl overflow-hidden transition-all hover:shadow-xl"
            >
              <div className="p-6">
                <div className="bg-blue-50 rounded-xl w-12 h-12 flex items-center justify-center mb-4">
                  {userType === 'landlord' ? (
                    <Building className="h-6 w-6 text-blue-600" />
                  ) : (
                    <Search className="h-6 w-6 text-blue-600" />
                  )}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {userType === 'landlord' 
                    ? 'Manage Properties' 
                    : 'Find Your Next Home'}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {userType === 'landlord'
                    ? 'Create and manage your property listings to find the perfect tenants.'
                    : 'Browse properties that match your preferences and save your favorites.'}
                </p>
                <Link 
                  href={userType === 'landlord' ? "/properties/my-properties" : "/properties"}
                  passHref
                >
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all">
                    {userType === 'landlord' ? 'Manage Properties' : 'Browse Properties'}
                  </Button>
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="bg-white shadow-lg rounded-xl overflow-hidden transition-all hover:shadow-xl"
            >
              <div className="p-6">
                <div className="bg-purple-50 rounded-xl w-12 h-12 flex items-center justify-center mb-4">
                  <MessageCircle className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Messages & Communication
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {userType === 'landlord'
                    ? 'Communicate with potential and current tenants about your properties.'
                    : 'Contact landlords and ask questions about properties you are interested in.'}
                </p>
                <Link 
                  href="/messages"
                  passHref
                >
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all">
                    View Messages
                  </Button>
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="bg-white shadow-lg rounded-xl overflow-hidden transition-all hover:shadow-xl"
            >
              <div className="p-6">
                <div className="bg-green-50 rounded-xl w-12 h-12 flex items-center justify-center mb-4">
                  {userType === 'landlord' ? (
                    <Bell className="h-6 w-6 text-green-600" />
                  ) : (
                    <MapPin className="h-6 w-6 text-green-600" />
                  )}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {userType === 'landlord' 
                    ? 'Manage Notifications' 
                    : 'Saved Searches & Alerts'}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {userType === 'landlord'
                    ? 'Set up notifications for new inquiries and manage your preferences.'
                    : 'Save your search criteria and get notified when new matching properties become available.'}
                </p>
                <Link 
                  href={userType === 'landlord' ? "/notifications" : "/saved-searches"}
                  passHref
                >
                  <Button className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 transition-all">
                    {userType === 'landlord' ? 'Notification Settings' : 'Manage Searches'}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}