-- The existing UPDATE policy uses only USING, which Postgres also applies to the
-- NEW row. That blocks transitioning draft/rejected -> submitted because the new
-- status is no longer in ('draft','rejected'). Split into USING (old row) and
-- WITH CHECK (new row) so users can submit their own entries.

DROP POLICY IF EXISTS "Users update own draft/rejected" ON public.timesheet_entries;

CREATE POLICY "Users update own draft/rejected"
ON public.timesheet_entries
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
  AND status IN ('draft'::timesheet_status, 'rejected'::timesheet_status)
)
WITH CHECK (
  user_id = auth.uid()
  AND status IN ('draft'::timesheet_status, 'submitted'::timesheet_status)
);