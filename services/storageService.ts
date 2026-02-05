import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export const storageService = {
  uploadImage: async (file: File, bucket: string = 'images', folder: string = 'uploads'): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Math.random().toString(36).substr(2, 9)}_${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  }
};
