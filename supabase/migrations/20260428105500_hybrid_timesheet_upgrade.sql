-- Upgrade timesheet_entries to support Hybrid Time Entry design
ALTER TABLE public.timesheet_entries
  ADD COLUMN IF NOT EXISTS is_sunday boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_public_holiday boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS morning_task_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS afternoon_task_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS ot_task_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS break_task_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS break_start time,
  ADD COLUMN IF NOT EXISTS break_end time,
  ADD COLUMN IF NOT EXISTS morning_non_work boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS afternoon_non_work boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS ot_non_work boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS break_non_work boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS ticked_task_ids uuid[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]'::jsonb;

-- Update the validation function to handle the new hour calculations if needed
-- (Though for now we'll handle the math in the frontend as requested)
