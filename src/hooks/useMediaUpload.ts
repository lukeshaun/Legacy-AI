import { supabase } from '@/integrations/supabase/client';

export async function uploadMedia(file: File | Blob, userId: string, folder: string = 'general'): Promise<string> {
  const ext = file instanceof File ? file.name.split('.').pop() : 'wav';
  const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const filePath = `${userId}/${folder}/${fileName}`;

  const { error } = await supabase.storage
    .from('user-media')
    .upload(filePath, file, { upsert: false });

  if (error) throw error;
  return filePath;
}

export async function getSignedUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('user-media')
    .createSignedUrl(path, 3600); // 1 hour expiry

  if (error) throw error;
  return data.signedUrl;
}

export async function deleteMedia(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from('user-media')
    .remove([path]);

  if (error) throw error;
}
