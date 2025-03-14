'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth-context';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { motion } from 'framer-motion';

export default function Register() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userType, setUserType] = useState<'tenant' | 'landlord'>('tenant');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      await signUp(formData.email, formData.password, userType);
      router.push('/auth/welcome');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred during registration');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-2xl bg-white shadow-2xl"
        >
          <div className="flex flex-col lg:flex-row">
            {/* Image/Left Side */}
            <div className="relative hidden bg-blue-600 lg:block lg:w-1/2">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-indigo-600/90"></div>
              <div className="relative h-full">
                <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white opacity-10"></div>
                <div className="absolute -bottom-16 -left-16 h-80 w-80 rounded-full bg-white opacity-10"></div>
                
                <div className="flex h-full flex-col items-center justify-center p-12 text-white">
                  <h2 className="mb-6 text-4xl font-bold">Welcome to Propspace</h2>
                  <p className="mb-8 text-xl">Your journey to better property management starts here</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="mr-4 rounded-full bg-white/20 p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016a11.955 11.955 0 01-2.633 7.912l-5.06 5.06a3 3 0 01-4.242 0l-5.06-5.06A11.955 11.955 0 013.382 4.716a12.025 12.025 0 018.618-3.046 12.025 12.025 0 018.618 3.046z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium">Trusted Platform</h3>
                        <p className="text-sm text-white/80">Join thousands of users finding their perfect match</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="mr-4 rounded-full bg-white/20 p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium">Secure & Private</h3>
                        <p className="text-sm text-white/80">Your data is protected with the latest security measures</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="mr-4 rounded-full bg-white/20 p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium">Fast & Efficient</h3>
                        <p className="text-sm text-white/80">Find or list properties in minutes, not days</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Form/Right Side */}
            <div className="w-full p-6 sm:p-8 lg:w-1/2 lg:p-12">
              <div className="mb-8">
                <motion.h2 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-3xl font-bold tracking-tight text-gray-900"
                >
                  Create your account
                </motion.h2>
                <p className="mt-2 text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                    Sign in
                  </Link>
                </p>
              </div>
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 rounded-md bg-red-50 p-4"
                >
                  <div className="flex">
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    label="Full Name"
                    placeholder="Your Name"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                  
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    label="Email address"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    label="Password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    label="Confirm Password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <label className="block text-sm font-medium text-gray-700">I am a:</label>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div
                        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border p-4 transition-all ${
                          userType === 'tenant'
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setUserType('tenant')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${userType === 'tenant' ? 'text-blue-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className={`mt-2 block text-sm font-medium ${userType === 'tenant' ? 'text-blue-700' : 'text-gray-700'}`}>
                          Tenant
                        </span>
                        <input
                          type="radio"
                          name="userType"
                          value="tenant"
                          checked={userType === 'tenant'}
                          onChange={() => setUserType('tenant')}
                          className="sr-only"
                        />
                      </div>
                      
                      <div
                        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border p-4 transition-all ${
                          userType === 'landlord'
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setUserType('landlord')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${userType === 'landlord' ? 'text-blue-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className={`mt-2 block text-sm font-medium ${userType === 'landlord' ? 'text-blue-700' : 'text-gray-700'}`}>
                          Landlord
                        </span>
                        <input
                          type="radio"
                          name="userType"
                          value="landlord"
                          checked={userType === 'landlord'}
                          onChange={() => setUserType('landlord')}
                          className="sr-only"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 py-6 transition-all hover:from-blue-700 hover:to-indigo-700"
                    isLoading={isLoading}
                  >
                    Create Account
                  </Button>
                  
                  <p className="mt-4 text-center text-xs text-gray-500">
                    By creating an account, you agree to our{' '}
                    <Link href="/terms" className="font-medium text-blue-600 hover:text-blue-500">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="font-medium text-blue-600 hover:text-blue-500">
                      Privacy Policy
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}