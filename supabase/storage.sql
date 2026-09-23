-- ============================================================
-- SkillSync — Supabase Storage Setup & Row Level Security (RLS)
-- ============================================================

-- 1. Create Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp']),
  ('project-images', 'project-images', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Storage Policies for `avatars` Bucket

-- Allow public read access to all avatars
CREATE POLICY "Public Read Avatars" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

-- Allow authenticated users / service role to upload avatar
CREATE POLICY "Authenticated Upload Avatars" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' 
  AND (auth.role() = 'authenticated' OR auth.role() = 'service_role')
);

-- Allow users to update their own avatars
CREATE POLICY "Authenticated Update Avatars" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'avatars' 
  AND (auth.role() = 'authenticated' OR auth.role() = 'service_role')
);

-- Allow users to delete their own avatars
CREATE POLICY "Authenticated Delete Avatars" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'avatars' 
  AND (auth.role() = 'authenticated' OR auth.role() = 'service_role')
);

-- 4. Storage Policies for `project-images` Bucket

-- Allow public read access to all project images
CREATE POLICY "Public Read Project Images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'project-images');

-- Allow authenticated users / service role to upload project images
CREATE POLICY "Authenticated Upload Project Images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'project-images' 
  AND (auth.role() = 'authenticated' OR auth.role() = 'service_role')
);

-- Allow owners to update project images
CREATE POLICY "Authenticated Update Project Images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'project-images' 
  AND (auth.role() = 'authenticated' OR auth.role() = 'service_role')
);
