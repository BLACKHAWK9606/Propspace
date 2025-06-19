// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from './components/ui/button';
import { ArrowRight, Search, MessageCircle, Users, ChevronRight, Star } from 'lucide-react';
import { Home as HomeIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const features = [
    {
      icon: <Search className="h-6 w-6 text-blue-500" />,
      title: "Smart Property Search",
      description: "Find the perfect home with our AI-powered search that learns your preferences over time."
    },
    {
      icon: <MessageCircle className="h-6 w-6 text-blue-500" />,
      title: "Direct Messaging",
      description: "Connect directly with landlords or tenants with our real-time messaging system."
    },
    {
      icon: <HomeIcon className="h-6 w-6 text-blue-500" />,
      title: "Virtual Tours",
      description: "Explore properties from anywhere with immersive 3D tours and detailed floor plans."
    },
    {
      icon: <Users className="h-6 w-6 text-blue-500" />,
      title: "Verified Profiles",
      description: "Trust who you&apos;re dealing with through our comprehensive verification process."
    }
  ];

  const testimonials = [
    {
      quote: "PropSpace helped me find my dream apartment in just two days. The interface is so intuitive!",
      author: "Sarah J.",
      role: "Tenant"
    },
    {
      quote: "As a landlord, I've reduced my vacancy rate by 70% since using PropSpace. The tenant matches are spot on.",
      author: "Michael T.",
      role: "Property Owner"
    },
    {
      quote: "The direct messaging feature saved me countless hours of phone tag with potential landlords.",
      author: "David L.",
      role: "Student Renter"
    }
  ];

  return (
    <div className="relative bg-gradient-to-b from-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100 rounded-full opacity-40 blur-3xl"></div>
          <div className="absolute top-64 -left-20 w-80 h-80 bg-indigo-100 rounded-full opacity-40 blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative pt-6 pb-16 sm:pb-24">
            {/* Navigation Placeholder */}
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                  <HomeIcon className="h-6 w-6 text-white" />
                </div>
                <span className="ml-3 text-2xl font-bold text-gray-900">PropSpace</span>
              </div>
              <div className="hidden md:flex space-x-8 items-center">
                <Link href="/properties" className="text-base font-medium text-gray-500 hover:text-gray-900">Properties</Link>
                <Link href="/how-it-works" className="text-base font-medium text-gray-500 hover:text-gray-900">How It Works</Link>
                <Link href="/landlords" className="text-base font-medium text-gray-500 hover:text-gray-900">For Landlords</Link>
                <Link href="/auth/login" className="text-base font-medium text-gray-500 hover:text-gray-900">Log In</Link>
                <Link href="/auth/register" passHref>
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    Sign Up
                  </Button>
                </Link>
              </div>
              <div className="md:hidden">
                <Button variant="outline" size="sm">Menu</Button>
              </div>
            </div>
            
            {/* Hero Content */}
            <div className="mt-16 lg:mt-24 lg:grid lg:grid-cols-12 lg:gap-8">
              <motion.div 
                className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left lg:flex lg:flex-col lg:justify-center"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                <motion.div variants={fadeIn} className="relative z-10">
                  <span className="inline-block px-3 py-1 text-sm font-semibold text-indigo-600 bg-indigo-100 rounded-full mb-4">
                    Reimagining Rental Experience
                  </span>
                </motion.div>
                <motion.h1 
                  variants={fadeIn}
                  className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl"
                >
                  <span className="block">Find your perfect</span>{' '}
                  <span className="block mt-1 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    space to call home
                  </span>
                </motion.h1>
                <motion.p 
                  variants={fadeIn}
                  className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl"
                >
                  PropSpace connects landlords with tenants through a seamless, social platform. 
                  Browse verified properties, schedule viewings, and secure your next home—all in one place.
                </motion.p>
                <motion.div 
                  variants={fadeIn}
                  className="mt-8 sm:mt-10"
                >
                  <form className="sm:flex">
                    <div className="min-w-0 flex-1">
                      <label htmlFor="search" className="sr-only">Location</label>
                      <input 
                        id="search" 
                        type="text" 
                        placeholder="Enter city or neighborhood..."
                        className="block w-full px-4 py-3 rounded-l-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <Link href="/properties" passHref>
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center py-3 px-4 border border-transparent text-base font-medium rounded-r-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          Search Properties
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </form>
                  <p className="mt-3 text-sm text-gray-500">
                    No commitment. Browse thousands of properties for free.
                  </p>
                </motion.div>
                
                <motion.div 
                  variants={fadeIn}
                  className="mt-6 sm:mt-8"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 flex -space-x-1">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-xs text-white font-bold">
                          {String.fromCharCode(65 + i)}
                        </div>
                      ))}
                    </div>
                    <div className="ml-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-sm text-gray-500">Trusted by over 10,000 happy renters</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
              
              <motion.div 
                className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
                  <div className="relative block w-full bg-white rounded-lg overflow-hidden">
                    <div
                      style={{
                        paddingBottom: '56.25%', /* 16:9 Aspect Ratio */
                      }}
                    >
                      <div className="absolute inset-0 flex">
                        <div className="relative flex-1 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg overflow-hidden">
                          {/* Property Card 1 - More prominent */}
                          <div 
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-80 bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100"
                            style={{ transform: `translate(-50%, -55%) rotate(${scrollY * 0.02}deg)` }}
                          >
                            <div className="h-32 bg-blue-500"></div>
                            <div className="p-4">
                              <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
                              <div className="h-3 w-1/2 bg-gray-200 rounded mb-4"></div>
                              <div className="flex items-center mb-3">
                                <div className="h-5 w-5 rounded-full bg-blue-100 mr-2"></div>
                                <div className="h-3 w-16 bg-gray-200 rounded"></div>
                              </div>
                              <div className="h-10 bg-blue-100 rounded-lg"></div>
                            </div>
                          </div>
                          
                          {/* Property Card 2 - Behind on the left */}
                          <div 
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-64 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 opacity-70"
                            style={{ transform: `translate(-85%, -65%) rotate(${-8 - scrollY * 0.01}deg)` }}
                          >
                            <div className="h-24 bg-indigo-400"></div>
                            <div className="p-3">
                              <div className="h-3 w-3/4 bg-gray-200 rounded mb-2"></div>
                              <div className="h-2 w-1/2 bg-gray-200 rounded mb-3"></div>
                              <div className="h-8 bg-indigo-100 rounded-lg"></div>
                            </div>
                          </div>
                          
                          {/* Property Card 3 - Behind on the right */}
                          <div 
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-64 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 opacity-70"
                            style={{ transform: `translate(-15%, -60%) rotate(${10 + scrollY * 0.015}deg)` }}
                          >
                            <div className="h-24 bg-purple-400"></div>
                            <div className="p-3">
                              <div className="h-3 w-3/4 bg-gray-200 rounded mb-2"></div>
                              <div className="h-2 w-1/2 bg-gray-200 rounded mb-3"></div>
                              <div className="h-8 bg-purple-100 rounded-lg"></div>
                            </div>
                          </div>
                          
                          {/* Decorative elements */}
                          <div className="absolute top-1/4 left-1/4 w-8 h-8 rounded-full bg-blue-200 opacity-50"></div>
                          <div className="absolute bottom-1/4 right-1/4 w-12 h-12 rounded-full bg-indigo-200 opacity-50"></div>
                          <div className="absolute top-3/4 left-1/3 w-6 h-6 rounded-full bg-purple-200 opacity-50"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-16 sm:py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Features</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              A smarter way to rent
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              Our platform simplifies every step of the rental process for both tenants and landlords.
            </p>
          </motion.div>
          
          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <motion.div 
                  key={index} 
                  className="pt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8 h-full">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md shadow-lg">
                          {feature.icon}
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">{feature.title}</h3>
                      <p className="mt-5 text-base text-gray-500">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Call to Action 1 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Ready to find your next home?</span>
              <span className="block text-indigo-200">Sign up for free and start browsing.</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-indigo-100">
              Join thousands of happy renters who found their perfect space.
            </p>
          </motion.div>
          <motion.div 
            className="mt-8 flex lg:mt-0 lg:flex-shrink-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="inline-flex rounded-md shadow">
              <Link href="/auth/register" passHref>
                <Button size="lg" className="bg-white text-blue-600 hover:bg-indigo-50">
                  Get Started
                </Button>
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link href="/properties" passHref>
                <Button variant="outline" size="lg" className="text-white border-white hover:bg-blue-700">
                  Browse Properties
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Testimonials */}
      <div className="py-16 bg-gray-50 overflow-hidden lg:py-24">
        <div className="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8 lg:max-w-7xl">
          <div className="relative">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Testimonials</h2>
              <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
                Hear from our users
              </p>
              <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
                Discover why thousands trust PropSpace for their rental needs.
              </p>
            </motion.div>
            
            <div className="mt-12">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {testimonials.map((testimonial, index) => (
                  <motion.div 
                    key={index} 
                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    <div className="pt-10 pb-8 px-6">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 inline-flex rounded-full border-2 border-blue-600">
                          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {testimonial.author.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">{testimonial.author}</h3>
                          <p className="text-sm text-gray-500">{testimonial.role}</p>
                        </div>
                      </div>
                      <div className="mt-6">
                        <p className="mt-5 text-gray-600 italic leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Call to Action 2 */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <motion.div 
            className="bg-blue-50 rounded-3xl overflow-hidden shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="lg:grid lg:grid-cols-2">
              <div className="px-6 pt-10 pb-12 sm:px-16 lg:py-16 lg:pr-0 xl:py-20 xl:px-20">
                <div className="lg:self-center">
                  <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                    <span className="block">Are you a landlord?</span>
                    <span className="block text-blue-600">List your properties for free.</span>
                  </h2>
                  <p className="mt-4 text-lg leading-6 text-gray-500">
                    Join thousands of property owners who trust PropSpace to find qualified tenants quickly and efficiently.
                  </p>
                  <Link href="/landlords" passHref>
                    <Button 
                      className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      size="lg"
                    >
                      Learn More
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative h-64 sm:h-72 md:h-96 lg:h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                  <div className="px-8 text-center">
                    <p className="text-3xl font-bold text-white">
                      95%
                    </p>
                    <p className="mt-2 text-xl text-blue-100">
                      of landlords find tenants within 30 days
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="pb-8 xl:grid xl:grid-cols-5 xl:gap-8">
            <div className="grid grid-cols-2 gap-8 xl:col-span-4">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                    For Renters
                  </h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <Link href="/properties" className="text-base text-gray-300 hover:text-white">
                        Browse Properties
                      </Link>
                    </li>
                    <li>
                      <Link href="/how-it-works" className="text-base text-gray-300 hover:text-white">
                        How It Works
                      </Link>
                    </li>
                    <li>
                      <Link href="/pricing" className="text-base text-gray-300 hover:text-white">
                        Pricing
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                    For Landlords
                  </h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <Link href="/landlords" className="text-base text-gray-300 hover:text-white">
                        List a Property
                      </Link>
                    </li>
                    <li>
                      <Link href="/landlord-resources" className="text-base text-gray-300 hover:text-white">
                        Resources
                      </Link>
                    </li>
                    <li>
                      <Link href="/pricing" className="text-base text-gray-300 hover:text-white">
                        Pricing
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                    Company
                  </h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <Link href="/about" className="text-base text-gray-300 hover:text-white">
                        About
                      </Link>
                    </li>
                    <li>
                      <Link href="/blog" className="text-base text-gray-300 hover:text-white">
                        Blog
                      </Link>
                    </li>
                    <li>
                      <Link href="/contact" className="text-base text-gray-300 hover:text-white">
                        Contact
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                    Legal
                  </h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <Link href="/privacy" className="text-base text-gray-300 hover:text-white">
                        Privacy
                      </Link>
                    </li>
                    <li>
                      <Link href="/terms" className="text-base text-gray-300 hover:text-white">
                        Terms
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-12 xl:mt-0">
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                Subscribe to our newsletter
              </h3>
              <p className="mt-4 text-base text-gray-300">
                The latest news, articles, and resources, sent to your inbox weekly.
              </p>
              <form className="mt-4 sm:flex sm:max-w-md">
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <input
                  type="email"
                  name="email-address"
                  id="email-address"
                  autoComplete="email"
                  required
                  className="appearance-none min-w-0 w-full bg-white border border-transparent rounded-md py-2 px-4 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white focus:border-white focus:placeholder-gray-400"
                  placeholder="Enter your email"
                />
                <div className="mt-3 rounded-md sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 border border-transparent rounded-md py-2 px-4 flex items-center justify-center text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
                  >
                    Subscribe
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 mt-8 md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              {/* Social links */}
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
            <div className="mt-8 md:mt-0 md:order-1">
              <p className="text-center text-base text-gray-400">
                &copy; 2025 PropSpace, Inc. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}