-- Remove legacy demo staff IDs from existing profiles without deleting users.
-- Deleting users can fail or cascade into project history; clearing the IDs
-- removes EMP-001..EMP-007 from staff-facing system views safely.
UPDATE public.profiles
SET employee_id = NULL,
    updated_at = now()
WHERE employee_id IN (
  'EMP-001',
  'EMP-002',
  'EMP-003',
  'EMP-004',
  'EMP-005',
  'EMP-006',
  'EMP-007'
);
