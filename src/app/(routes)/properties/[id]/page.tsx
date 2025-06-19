'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, Edit, Heart, MapPin, Home, Ruler, BedDouble, Bath, ExternalLink } from 'lucide-react';
import { isEffectiveLandlord } from '../../../lib/user-utils';
import Image from 'next/image';
import { use } from 'react';

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
  zip?: string;
  latitude?: number;
  longitude?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  owner?: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

// Image type definition
interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  position: number;
  created_at: string;
}

// Define params type
interface PageParams {
  params: Promise<{
    id: string;
  }>
}

export default function PropertyDetail({ params }: PageParams) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [propertyLoading, setPropertyLoading] = useState(true);
  const [toggleFavoriteLoading, setToggleFavoriteLoading] = useState(false);
  const [owner, setOwner] = useState<Property['owner'] | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  
  // Use React.use() to unwrap the params promise
  const resolvedParams = use(params);
  const propertyId = resolvedParams.id;

  // Load property data on mount
  useEffect(() => {
    if (isLoading) return;
    
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    const fetchData = async () => {
      await loadProperty();
      await loadPropertyImages();
      
      if (!isEffectiveLandlord(user)) {
        await checkIfFavorited();
      }
    };
    
    fetchData();
  }, [user, isLoading, propertyId]);

  // Load property data
  const loadProperty = async () => {
    setPropertyLoading(true);
    try {
      const { data: property, error } = await supabase
        .from('properties')
        .select('*, owner:profiles!owner_id(*)')
        .eq('id', propertyId)
        .single();
      
      if (error) {
        console.error('Error loading property:', error);
        return;
      }
      
      setProperty(property);
      setOwner(property.owner);
      
      // Check if the current user is the owner of this property
      const userOwnsProperty = user?.id === property.owner_id;
      console.log('Property owner check:', {
        userId: user?.id,
        propertyOwnerId: property.owner_id,
        isMatch: userOwnsProperty,
        isLandlord: isEffectiveLandlord(user)
      });
      
      setIsOwner(userOwnsProperty);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setPropertyLoading(false);
    }
  };

  // Load property images
  const loadPropertyImages = async () => {
    try {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('property_id', propertyId)
        .order('position');
      
      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  // Check if property is in user's favorites
  const checkIfFavorited = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user?.id)
        .eq('property_id', propertyId)
        .maybeSingle();
      
      if (error) throw error;
      setIsFavorite(!!data);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  // Toggle favorite status
  const toggleFavorite = async () => {
    if (isEffectiveLandlord(user)) return; // Landlords can't favorite properties
    
    setToggleFavoriteLoading(true);
    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .match({ user_id: user?.id, property_id: propertyId });
          
        if (error) throw error;
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert([{ user_id: user?.id, property_id: propertyId }]);
          
        if (error) throw error;
      }
      
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setToggleFavoriteLoading(false);
    }
  };

  // Loading state
  if (isLoading || propertyLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-t-4 border-b-4 border-blue-500"></div>
          <p className="text-lg font-medium text-gray-700">Loading property details...</p>
        </div>
      </div>
    );
  }

  // Property not found
  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Property Not Found</h1>
          <p className="mb-6">The property you are looking for could not be found.</p>
          <Link href="/properties">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Properties
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-12">
      {/* Navigation header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/properties" passHref>
              <Button variant="outline" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Properties
              </Button>
            </Link>
            
            <div className="flex items-center space-x-3">
              {/* Edit button (only for owner/landlord) */}
              {(isOwner || isEffectiveLandlord(user)) && (
                <Link href={`/properties/edit/${property.id}`} passHref>
                  <Button className="flex items-center bg-blue-600 hover:bg-blue-700">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Property
                  </Button>
                </Link>
              )}
              
              {/* Favorite button (only for tenants) */}
              {!isEffectiveLandlord(user) && (
                <Button
                  onClick={toggleFavorite}
                  disabled={toggleFavoriteLoading}
                  variant="outline"
                  className={`flex items-center ${
                    isFavorite ? 'border-pink-300 text-pink-700 hover:bg-pink-50' : ''
                  }`}
                >
                  <Heart className={`mr-2 h-4 w-4 ${isFavorite ? 'fill-pink-500' : ''}`} />
                  {isFavorite ? 'Favorited' : 'Add to Favorites'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Property info section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          {/* Images gallery */}
          <div className="relative">
            {images.length > 0 ? (
              <div className="aspect-w-16 aspect-h-9 relative h-96 w-full">
                <Image
                  src={images[0].url}
                  alt={property.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 flex items-center justify-center h-96">
                <Home className="h-20 w-20 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Property details */}
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 md:mb-0">{property.title}</h1>
              <div className="text-2xl font-semibold text-blue-600">${property.price.toLocaleString()}</div>
            </div>
            
            <div className="flex items-center text-gray-500 mb-6">
              <MapPin className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>
                {property.address}, {property.city}, {property.state} {property.zip || ''}
              </span>
            </div>
            
            {/* Property attributes */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {property.bedrooms && (
                <div className="flex items-center">
                  <BedDouble className="h-5 w-5 mr-2 text-blue-500" />
                  <span>{property.bedrooms} {property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</span>
                </div>
              )}
              
              {property.bathrooms && (
                <div className="flex items-center">
                  <Bath className="h-5 w-5 mr-2 text-blue-500" />
                  <span>{property.bathrooms} {property.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}</span>
                </div>
              )}
              
              {property.size && (
                <div className="flex items-center">
                  <Ruler className="h-5 w-5 mr-2 text-blue-500" />
                  <span>{property.size.toLocaleString()} sq ft</span>
                </div>
              )}
            </div>
            
            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">
                {property.description || 'No description provided.'}
              </p>
            </div>
            
            {/* Image Gallery */}
            {images.length > 1 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Images</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={image.id} className="aspect-w-1 aspect-h-1 relative h-32 rounded-lg overflow-hidden">
                      <Image
                        src={image.url}
                        alt={`${property.title} - Image ${index + 1}`}
                        fill
                        className="object-cover hover:opacity-90 transition-opacity"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Owner info (if available) */}
            {owner && (
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Listed by</h2>
                <div className="flex items-center">
                  {owner.avatar_url ? (
                    <div className="h-12 w-12 rounded-full overflow-hidden mr-4 relative">
                      <Image
                        src={owner.avatar_url}
                        alt={owner.full_name || 'Property Owner'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-blue-600 font-medium text-lg">
                        {(owner.full_name || owner.email || 'U')[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{owner.full_name || 'Property Owner'}</div>
                    {!isOwner && (
                      <Button variant="outline" size="sm" className="mt-2 text-sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Contact Owner
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
