ALTER TABLE public.timesheet_entries
  ADD COLUMN IF NOT EXISTS morning_start time,
  ADD COLUMN IF NOT EXISTS morning_end time,
  ADD COLUMN IF NOT EXISTS afternoon_start time,
  ADD COLUMN IF NOT EXISTS afternoon_end time,
  ADD COLUMN IF NOT EXISTS ot_start time,
  ADD COLUMN IF NOT EXISTS ot_end time;