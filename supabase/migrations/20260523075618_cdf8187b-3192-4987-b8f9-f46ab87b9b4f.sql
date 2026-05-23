
-- Helper: get current user's company_id without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.current_user_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid()
$$;

REVOKE EXECUTE ON FUNCTION public.current_user_company_id() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_company_id() TO authenticated;

-- Fix recursive profiles policy
DROP POLICY IF EXISTS "Users view coworker basic profile" ON public.profiles;
CREATE POLICY "Users view coworker basic profile"
ON public.profiles FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND company_id IS NOT NULL
  AND company_id = public.current_user_company_id()
);

-- Fix projects policy to avoid querying profiles directly
DROP POLICY IF EXISTS "Members and same-company users view projects" ON public.projects;
CREATE POLICY "Members and same-company users view projects"
ON public.projects FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.project_members pm
    WHERE pm.project_id = projects.id AND pm.user_id = auth.uid()
  )
  OR (company_id IS NOT NULL AND company_id = public.current_user_company_id())
);
