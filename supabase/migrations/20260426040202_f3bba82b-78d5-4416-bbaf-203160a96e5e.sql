-- Replace partial unique index with a regular unique constraint
-- so ON CONFLICT (code) works in seed_demo_run().
DROP INDEX IF EXISTS public.tasks_code_unique_idx;

ALTER TABLE public.tasks
  ADD CONSTRAINT tasks_code_unique UNIQUE (code);