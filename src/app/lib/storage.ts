// app/lib/storage.ts
import { supabase } from './supabase';

export async function uploadPropertyImage(
  propertyId: string, 
  file: File, 
  position: number
): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${propertyId}/${position}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error } = await supabase.storage
    .from('property-images')
    .upload(filePath, file, { upsert: true });

  if (error) {
    console.error('Error uploading image:', error);
    return null;
  }

  const { data } = supabase.storage
    .from('property-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
}