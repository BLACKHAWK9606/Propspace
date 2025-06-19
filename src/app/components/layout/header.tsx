// src/app/components/layout/header.tsx
'use client';

// Remove useState import since we're not using it
import Link from 'next/link';
// Let's try a more specific path based on your project structure
import { useAuth } from '../../lib/auth-context';
import { Button } from '../ui/button';
import { Home as HomeIcon } from 'lucide-react';

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-md mr-2">
                  <HomeIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Propspace
                </span>
              </Link>
            </div>
            <nav className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <Link href="/properties" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-blue-600 hover:border-blue-300">
                Properties
              </Link>
              {user && (
                <>
                  <Link href="/dashboard" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-blue-600 hover:border-blue-300">
                    Dashboard
                  </Link>
                  <Link href="/messages" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-blue-600 hover:border-blue-300">
                    Messages
                  </Link>
                </>
              )}
            </nav>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/profile" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                  Profile
                </Link>
                <Button onClick={() => signOut()} 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  size="sm">
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/login" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                  Sign In
                </Link>
                <Link href="/auth/register" passHref>
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}