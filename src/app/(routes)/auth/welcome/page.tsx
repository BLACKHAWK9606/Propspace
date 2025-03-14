'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { Button } from '../../../components/ui/button';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Welcome() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // If not logged in and done loading, redirect to login
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
    setMounted(true);
  }, [user, isLoading, router]);

  const handleContinue = () => {
    router.push('/dashboard');
  };

  const isLandlord = user?.user_metadata?.user_type === 'landlord';

  if (isLoading || !mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-t-4 border-blue-500 border-opacity-50"></div>
          <p className="text-lg font-medium text-gray-700">Setting up your Propspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        >
          {/* Decorative elements */}
          <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-blue-500 opacity-10"></div>
          <div className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-indigo-500 opacity-10"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row">
            {/* Image side */}
            <div className="relative h-64 w-full md:h-auto md:w-1/2">
              <Image
                src={isLandlord ? "/images/landlord-welcome.jpg" : "/images/tenant-welcome.jpg"}
                alt="Welcome to Propspace"
                className="h-full w-full object-cover"
                width={600}
                height={800}
                priority
                // Use a placeholder if image isn't available during development
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://via.placeholder.com/600x800?text=Propspace";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <p className="text-xl font-medium text-white md:text-2xl">
                    {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Valued User'}
                  </p>
                  <p className="text-sm text-white/80 md:text-base">
                    {isLandlord ? 'Property Manager' : 'Home Seeker'}
                  </p>
                </motion.div>
              </div>
            </div>
            
            {/* Content side */}
            <div className="flex w-full flex-col justify-center p-6 sm:p-8 md:w-1/2 md:p-12">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    Welcome to <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Propspace</span>
                  </h1>
                  <p className="text-lg text-gray-600">
                    Your journey to {isLandlord ? 'property success' : 'your dream home'} starts now
                  </p>
                </div>
                
                <div className="space-y-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
                  <h3 className="font-semibold text-gray-800">
                    {isLandlord 
                      ? 'Ready to showcase your properties?' 
                      : 'Ready to find your perfect place?'}
                  </h3>
                  <ul className="space-y-2">
                    {isLandlord ? (
                      <>
                        <li className="flex items-center">
                          <div className="mr-2 rounded-full bg-green-100 p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-sm text-gray-600">List your properties with rich details</span>
                        </li>
                        <li className="flex items-center">
                          <div className="mr-2 rounded-full bg-green-100 p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-sm text-gray-600">Connect with quality tenants</span>
                        </li>
                        <li className="flex items-center">
                          <div className="mr-2 rounded-full bg-green-100 p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-sm text-gray-600">Manage your rental portfolio efficiently</span>
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-center">
                          <div className="mr-2 rounded-full bg-green-100 p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-sm text-gray-600">Discover curated properties that match your needs</span>
                        </li>
                        <li className="flex items-center">
                          <div className="mr-2 rounded-full bg-green-100 p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-sm text-gray-600">Save favorites and organize your search</span>
                        </li>
                        <li className="flex items-center">
                          <div className="mr-2 rounded-full bg-green-100 p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-sm text-gray-600">Connect directly with landlords</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="space-y-4"
                >
                  <Button 
                    onClick={handleContinue} 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 py-6 text-lg transition-all hover:from-blue-700 hover:to-indigo-700"
                  >
                    Go to Dashboard
                    <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Button>
                  <p className="text-center text-sm text-gray-500">
                    Need help getting started? <a href="/help" className="font-medium text-blue-600 hover:text-blue-800">Check our guide</a>
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}