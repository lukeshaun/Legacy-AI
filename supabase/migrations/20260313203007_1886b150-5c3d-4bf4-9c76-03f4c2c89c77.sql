
-- Create private storage bucket for user media
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-media', 'user-media', false);

-- RLS: Users can upload to their own folder
CREATE POLICY "Users can upload own media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS: Users can view their own media
CREATE POLICY "Users can view own media"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS: Users can delete their own media
CREATE POLICY "Users can delete own media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS: Users can update their own media
CREATE POLICY "Users can update own media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
