-- Storage policies for eleave-attachments bucket
-- Folder pattern: {user_id}/{filename}

CREATE POLICY "E-Leave attachments: users read own"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'eleave-attachments'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'supervisor')
    OR public.has_role(auth.uid(), 'project_manager')
  )
);

CREATE POLICY "E-Leave attachments: users upload own"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'eleave-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "E-Leave attachments: users delete own"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'eleave-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);