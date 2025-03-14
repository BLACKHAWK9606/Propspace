// src/app/components/layout/header.tsx
'use client';

// Remove useState import since we're not using it
import Link from 'next/link';
// Let's try a more specific path based on your project structure
import { useAuth } from '../../lib/auth-context';
import { Button } from '../ui/button';

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-blue-600 text-xl font-bold">
                Propspace
              </Link>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/properties" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
                Properties
              </Link>
              {user && (
                <>
                  <Link href="/dashboard" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
                    Dashboard
                  </Link>
                  <Link href="/messages" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
                    Messages
                  </Link>
                </>
              )}
            </nav>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/profile" className="text-sm font-medium text-gray-700">
                  Profile
                </Link>
                <Button onClick={() => signOut()} variant="outline" size="sm">
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/login" className="text-sm font-medium text-gray-700">
                  Sign In
                </Link>
                <Link href="/auth/register" passHref>
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}