'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../lib/auth-context';
import { supabase } from '../../../../lib/supabase';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { 
  ArrowLeft, 
  X, 
  ImagePlus, 
  Trash2, 
  Loader2,
  Save
} from 'lucide-react';
import { isEffectiveLandlord } from '../../../../lib/user-utils';
import { use } from 'react';
import Image from 'next/image';

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
  is_active: boolean;
}

interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  position: number;
  created_at: string;
}

interface PropertyFormData {
  title: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: string;
  description: string;
  bedrooms: string;
  bathrooms: string;
  size: string;
  is_active: boolean;
}

// Define params type
interface PageParams {
  params: Promise<{
    id: string;
  }>
}

export default function EditProperty({ params }: PageParams) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  // Use React.use() to unwrap the params promise
  const resolvedParams = use(params);
  const propertyId = resolvedParams.id;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    price: '',
    description: '',
    bedrooms: '',
    bathrooms: '',
    size: '',
    is_active: true
  });
  
  const [newImages, setNewImages] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [uploading, setUploading] = useState(false);
  
  // Load property data
  useEffect(() => {
    if (isLoading) return;
    
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    const loadProperty = async () => {
      setLoading(true);
      try {
        // Load property details
        const { data: property, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', propertyId)
          .single();
        
        if (error) {
          console.error('Error loading property:', error);
          return;
        }
        
        // Check if user owns this property
        if (property.owner_id !== user.id) {
          router.push('/dashboard');
          return;
        }
        
        setProperty(property);
        
        // Set form data
        setFormData({
          title: property.title || '',
          address: property.address || '',
          city: property.city || '',
          state: property.state || '',
          zip: property.zip || '',
          price: property.price?.toString() || '',
          description: property.description || '',
          bedrooms: property.bedrooms?.toString() || '',
          bathrooms: property.bathrooms?.toString() || '',
          size: property.size?.toString() || '',
          is_active: property.is_active
        });
        
        // Load property images
        const { data: imageData, error: imageError } = await supabase
          .from('images')
          .select('*')
          .eq('property_id', propertyId)
          .order('position');
        
        if (imageError) {
          console.error('Error loading images:', imageError);
        } else {
          setImages(imageData || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (!isEffectiveLandlord(user)) {
      router.push('/dashboard');
      return;
    }
    
    loadProperty();
  }, [user, isLoading, propertyId, router]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle checkbox change
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  // Handle new image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewImages(prev => [...prev, ...filesArray]);
      setUploadProgress(prev => [...prev, ...filesArray.map(() => 0)]);
    }
  };
  
  // Remove new image before upload
  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setUploadProgress(prev => prev.filter((_, i) => i !== index));
  };
  
  // Mark existing image for deletion
  const markImageForDeletion = (imageId: string) => {
    setDeletedImages(prev => [...prev, imageId]);
  };
  
  // Restore image marked for deletion
  const restoreImage = (imageId: string) => {
    setDeletedImages(prev => prev.filter(id => id !== imageId));
  };
  
  // Upload images to storage
  const uploadImagesToStorage = async (): Promise<string[]> => {
    if (newImages.length === 0) return [];
    
    setUploading(true);
    const uploadedUrls: string[] = [];
    
    try {
      for (let i = 0; i < newImages.length; i++) {
        const file = newImages[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `properties/${propertyId}/${fileName}`;
        
        const { error } = await supabase.storage
          .from('property-images')
          .upload(filePath, file);
        
        if (error) {
          console.error('Error uploading file:', error);
          continue;
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath);
        
        uploadedUrls.push(publicUrl);
        
        // Update progress
        setUploadProgress(prev => {
          const newProgress = [...prev];
          newProgress[i] = 100;
          return newProgress;
        });
      }
    } catch (error) {
      console.error('Error in upload process:', error);
    } finally {
      setUploading(false);
    }
    
    return uploadedUrls;
  };
  
  // Save images to database
  const saveImagesToDB = async (urls: string[]) => {
    if (urls.length === 0) return;
    
    try {
      // Get the highest position number
      let maxPosition = 0;
      if (images.length > 0) {
        maxPosition = Math.max(...images.map(img => img.position));
      }
      
      // Prepare new image records
      const imageRecords = urls.map((url, index) => ({
        property_id: propertyId,
        url,
        position: maxPosition + index + 1
      }));
      
      // Insert new images
      const { error } = await supabase
        .from('images')
        .insert(imageRecords);
      
      if (error) {
        console.error('Error saving images to database:', error);
      }
    } catch (error) {
      console.error('Error in save process:', error);
    }
  };
  
  // Delete images from database and storage
  const deleteImagesFromDB = async () => {
    if (deletedImages.length === 0) return;
    
    try {
      // Delete from database
      const { error } = await supabase
        .from('images')
        .delete()
        .in('id', deletedImages);
      
      if (error) {
        console.error('Error deleting images from database:', error);
      }
      
      // We could also delete from storage here but it's often better 
      // to keep the files and just remove the references
    } catch (error) {
      console.error('Error in delete process:', error);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!property) return;
    
    setSaving(true);
    try {
      // Save property details
      const propertyData = {
        title: formData.title,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        price: parseFloat(formData.price),
        description: formData.description,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        size: formData.size ? parseInt(formData.size) : null,
        is_active: formData.is_active
      };
      
      const { error } = await supabase
        .from('properties')
        .update(propertyData)
        .eq('id', propertyId);
      
      if (error) {
        console.error('Error updating property:', error);
        return;
      }
      
      // Handle image uploads
      if (newImages.length > 0) {
        const uploadedUrls = await uploadImagesToStorage();
        await saveImagesToDB(uploadedUrls);
      }
      
      // Handle image deletions
      if (deletedImages.length > 0) {
        await deleteImagesFromDB();
      }
      
      // Navigate back to property page
      router.push(`/properties/${propertyId}`);
    } catch (error) {
      console.error('Error saving property:', error);
    } finally {
      setSaving(false);
    }
  };
  
  // Loading state
  if (isLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-t-4 border-b-4 border-blue-500"></div>
          <p className="text-lg font-medium text-gray-700">Loading property...</p>
        </div>
      </div>
    );
  }
  
  // Not found or access denied
  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Property Not Found</h1>
          <p className="mb-6">The property you are looking for could not be found or you don&apos;t have permission to edit it.</p>
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
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/properties/${propertyId}`} passHref>
              <Button variant="outline" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Property
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">Edit Property</h1>
            <p className="mt-1 text-sm text-gray-500">Update your property details and manage images</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              {/* Property details section */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Property Details</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-1 sm:col-span-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Property Title
                    </label>
                    <Input
                      id="title"
                      name="title"
                      type="text"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter property title"
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                      Price ($)
                    </label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">
                      Bedrooms
                    </label>
                    <Input
                      id="bedrooms"
                      name="bedrooms"
                      type="number"
                      min="0"
                      value={formData.bedrooms}
                      onChange={handleInputChange}
                      placeholder="Number of bedrooms"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">
                      Bathrooms
                    </label>
                    <Input
                      id="bathrooms"
                      name="bathrooms"
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.bathrooms}
                      onChange={handleInputChange}
                      placeholder="Number of bathrooms"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="size" className="block text-sm font-medium text-gray-700">
                      Size (sq ft)
                    </label>
                    <Input
                      id="size"
                      name="size"
                      type="number"
                      min="0"
                      value={formData.size}
                      onChange={handleInputChange}
                      placeholder="Square footage"
                    />
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Street Address
                    </label>
                    <Input
                      id="address"
                      name="address"
                      type="text"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Street address"
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <Input
                      id="city"
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                      State
                    </label>
                    <Input
                      id="state"
                      name="state"
                      type="text"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="State"
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="zip" className="block text-sm font-medium text-gray-700">
                      ZIP Code
                    </label>
                    <Input
                      id="zip"
                      name="zip"
                      type="text"
                      value={formData.zip}
                      onChange={handleInputChange}
                      placeholder="ZIP code"
                    />
                  </div>
                  
                  <div className="space-y-1 sm:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your property..."
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    ></textarea>
                  </div>
                  
                  <div className="space-y-1 sm:col-span-2">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="is_active"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="is_active" className="block text-sm font-medium text-gray-700">
                        Property is active and available for rent
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Image management section */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Property Images</h2>
                
                {/* Current images */}
                {images.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Current Images</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {images.map((image) => (
                        <div 
                          key={image.id} 
                          className={`relative rounded-lg overflow-hidden border ${
                            deletedImages.includes(image.id) ? 'border-red-300 opacity-50' : 'border-gray-300'
                          }`}
                        >
                          <div className="aspect-w-1 aspect-h-1 relative h-32">
                            <Image
                              src={image.url}
                              alt="Property image"
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                            />
                          </div>
                          
                          {deletedImages.includes(image.id) ? (
                            <button
                              type="button"
                              onClick={() => restoreImage(image.id)}
                              className="absolute top-1 right-1 bg-blue-600 text-white rounded-full p-1 hover:bg-blue-700"
                              title="Restore image"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => markImageForDeletion(image.id)}
                              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                              title="Mark for deletion"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {deletedImages.length > 0 && (
                      <p className="mt-2 text-sm text-red-600">
                        {deletedImages.length} image(s) marked for deletion. Changes will apply when you save.
                      </p>
                    )}
                  </div>
                )}
                
                {/* Upload new images */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Add New Images</h3>
                  
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <ImagePlus className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="images" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Upload images</span>
                          <input
                            id="images"
                            name="images"
                            type="file"
                            multiple
                            accept="image/*"
                            className="sr-only"
                            onChange={handleImageSelect}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                  
                  {/* Display selected images */}
                  {newImages.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Images ({newImages.length})</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {newImages.map((file, index) => (
                          <div key={index} className="relative rounded-lg overflow-hidden border border-gray-300">
                            <div className="aspect-w-1 aspect-h-1 relative h-32">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <img 
                                  src={URL.createObjectURL(file)} 
                                  alt={`Preview ${index}`}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => removeNewImage(index)}
                              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                              title="Remove"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            
                            {uploadProgress[index] > 0 && uploadProgress[index] < 100 && (
                              <div className="absolute bottom-0 left-0 right-0 bg-gray-200">
                                <div 
                                  className="bg-blue-600 h-1" 
                                  style={{ width: `${uploadProgress[index]}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Form actions */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-4">
              <Link href={`/properties/${propertyId}`} passHref>
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving || uploading}
                >
                  Cancel
                </Button>
              </Link>
              
              <Button
                type="submit"
                className="bg-blue-600 text-white hover:bg-blue-700"
                disabled={saving || uploading}
              >
                {(saving || uploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
