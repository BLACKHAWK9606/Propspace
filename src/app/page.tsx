// src/app/page.tsx
import Link from 'next/link';
import { Button } from './components/ui/button';

export default function Home() {
  return (
    <div className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block xl:inline">Find your perfect</span>{' '}
                <span className="block text-blue-600 xl:inline">rental home</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Propspace connects landlords with tenants in a simple, social way. 
                Browse properties, save your favorites, and message landlords directly.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <Link href="/properties" passHref>
                    <Button size="lg" className="w-full">
                      Browse Properties
                    </Button>
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link href="/auth/register" passHref>
                    <Button variant="outline" size="lg" className="w-full">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <div className="h-56 w-full bg-blue-100 sm:h-72 md:h-96 lg:w-full lg:h-full">
          {/* Placeholder for a property image */}
        </div>
      </div>
    </div>
  );
}