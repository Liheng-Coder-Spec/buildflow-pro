-- Idempotent partial unique index for task codes (so re-runs don't duplicate seed tasks)
CREATE UNIQUE INDEX IF NOT EXISTS tasks_code_unique_idx
  ON public.tasks (code) WHERE code IS NOT NULL;

-- Unique index for wbs_assignments (idempotent grants)
CREATE UNIQUE INDEX IF NOT EXISTS wbs_assignments_unique_idx
  ON public.wbs_assignments (user_id, wbs_node_id, permission);

-- Unique index for project_members
CREATE UNIQUE INDEX IF NOT EXISTS project_members_unique_idx
  ON public.project_members (project_id, user_id, project_role);

-- Unique index for department_members
CREATE UNIQUE INDEX IF NOT EXISTS department_members_unique_idx
  ON public.department_members (user_id, department, role_in_dept);

-- Unique index for task_predecessors
CREATE UNIQUE INDEX IF NOT EXISTS task_predecessors_unique_idx
  ON public.task_predecessors (task_id, predecessor_id);

-- Unique partial index for active task_assignments
CREATE UNIQUE INDEX IF NOT EXISTS task_assignments_active_unique_idx
  ON public.task_assignments (task_id, user_id) WHERE unassigned_at IS NULL;


CREATE OR REPLACE FUNCTION public.seed_demo_run()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  -- Project ids
  v_rt uuid;  -- Riverside Tower
  v_hb uuid;  -- Hattha Bank Tower

  -- Existing user ids (looked up by full_name to stay portable)
  v_alex uuid;   -- admin
  v_erin uuid;   -- engineer
  v_pat  uuid;   -- project_manager
  v_sam  uuid;   -- supervisor
  v_quinn uuid;  -- qaqc_inspector
  v_wes  uuid;   -- worker
  v_avery uuid;  -- accountant

  -- Approver users (created by edge function; may be NULL if not yet seeded)
  v_aria uuid;
  v_stella uuid;
  v_marco uuid;
  v_pierre uuid;
  v_connor uuid;

  -- WBS node ids we resolve as we insert
  v_node uuid;
  v_parent uuid;

  -- Tasks we'll need to wire predecessors for
  v_arch_hb uuid;
  v_struct_hb uuid;
  v_proc_hb uuid;
  v_constr_hb uuid;
  v_arch_rt uuid;
  v_constr_rt uuid;

  v_result jsonb := '{}'::jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can seed demo data';
  END IF;

  -- ---------- Resolve projects ----------
  SELECT id INTO v_rt FROM projects WHERE code = 'PRJ-001' LIMIT 1;
  SELECT id INTO v_hb FROM projects WHERE code = 'PRJ-002' LIMIT 1;
  IF v_rt IS NULL OR v_hb IS NULL THEN
    RAISE EXCEPTION 'Demo projects PRJ-001 / PRJ-002 not found';
  END IF;

  -- ---------- Resolve existing users ----------
  SELECT id INTO v_alex   FROM profiles WHERE full_name = 'Alex Admin' LIMIT 1;
  SELECT id INTO v_erin   FROM profiles WHERE full_name = 'Erin Engineer' LIMIT 1;
  SELECT id INTO v_pat    FROM profiles WHERE full_name = 'Pat Planner' LIMIT 1;
  SELECT id INTO v_sam    FROM profiles WHERE full_name = 'Sam Supervisor' LIMIT 1;
  SELECT id INTO v_quinn  FROM profiles WHERE full_name = 'Quinn Inspector' LIMIT 1;
  SELECT id INTO v_wes    FROM profiles WHERE full_name = 'Wes Worker' LIMIT 1;
  SELECT id INTO v_avery  FROM profiles WHERE full_name = 'Avery Accountant' LIMIT 1;

  -- New approver users (may be NULL if edge function hasn't run)
  SELECT id INTO v_aria   FROM profiles WHERE full_name = 'Aria Architect' LIMIT 1;
  SELECT id INTO v_stella FROM profiles WHERE full_name = 'Stella Struct' LIMIT 1;
  SELECT id INTO v_marco  FROM profiles WHERE full_name = 'Marco MEP' LIMIT 1;
  SELECT id INTO v_pierre FROM profiles WHERE full_name = 'Pierre Procurement' LIMIT 1;
  SELECT id INTO v_connor FROM profiles WHERE full_name = 'Connor Construction' LIMIT 1;

  -- ===========================================================
  -- 1. WBS for Riverside Tower (project has none today)
  -- ===========================================================
  INSERT INTO wbs_nodes (project_id, parent_id, code, name, node_type, sort_order)
  VALUES (v_rt, NULL, 'RT-A', 'Tower Building', 'building', 1)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_parent FROM wbs_nodes WHERE project_id = v_rt AND parent_id IS NULL AND code = 'RT-A';

  INSERT INTO wbs_nodes (project_id, parent_id, code, name, node_type, sort_order)
  VALUES
    (v_rt, v_parent, 'L01', 'Ground Floor',     'level', 1),
    (v_rt, v_parent, 'L02', 'Office Level 1',   'level', 2),
    (v_rt, v_parent, 'L03', 'Office Level 2',   'level', 3)
  ON CONFLICT DO NOTHING;

  -- L01 zones
  SELECT id INTO v_node FROM wbs_nodes WHERE project_id=v_rt AND parent_id=v_parent AND code='L01';
  INSERT INTO wbs_nodes (project_id, parent_id, code, name, node_type, sort_order) VALUES
    (v_rt, v_node, 'Z01', 'Lobby Zone',  'zone', 1),
    (v_rt, v_node, 'Z02', 'Retail Zone', 'zone', 2)
  ON CONFLICT DO NOTHING;

  -- L02 zones
  SELECT id INTO v_node FROM wbs_nodes WHERE project_id=v_rt AND parent_id=v_parent AND code='L02';
  INSERT INTO wbs_nodes (project_id, parent_id, code, name, node_type, sort_order) VALUES
    (v_rt, v_node, 'Z01', 'Open Office',   'zone', 1),
    (v_rt, v_node, 'Z02', 'Meeting Rooms', 'zone', 2)
  ON CONFLICT DO NOTHING;

  -- L03 zones
  SELECT id INTO v_node FROM wbs_nodes WHERE project_id=v_rt AND parent_id=v_parent AND code='L03';
  INSERT INTO wbs_nodes (project_id, parent_id, code, name, node_type, sort_order) VALUES
    (v_rt, v_node, 'Z01', 'Open Office', 'zone', 1)
  ON CONFLICT DO NOTHING;

  -- Annex
  INSERT INTO wbs_nodes (project_id, parent_id, code, name, node_type, sort_order)
  VALUES (v_rt, NULL, 'RT-B', 'Annex Building', 'building', 2)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_parent FROM wbs_nodes WHERE project_id=v_rt AND parent_id IS NULL AND code='RT-B';
  INSERT INTO wbs_nodes (project_id, parent_id, code, name, node_type, sort_order) VALUES
    (v_rt, v_parent, 'L01', 'Service Level', 'level', 1)
  ON CONFLICT DO NOTHING;
  SELECT id INTO v_node FROM wbs_nodes WHERE project_id=v_rt AND parent_id=v_parent AND code='L01';
  INSERT INTO wbs_nodes (project_id, parent_id, code, name, node_type, sort_order) VALUES
    (v_rt, v_node, 'Z01', 'MEP Plant Room', 'zone', 1)
  ON CONFLICT DO NOTHING;

  -- ===========================================================
  -- 2. WBS extensions for Hattha Bank Tower
  -- ===========================================================
  -- BA > 01-GF zones
  SELECT id INTO v_parent FROM wbs_nodes WHERE project_id=v_hb AND code='01-GF' LIMIT 1;
  IF v_parent IS NOT NULL THEN
    INSERT INTO wbs_nodes (project_id, parent_id, code, name, node_type, sort_order) VALUES
      (v_hb, v_parent, 'Z01', 'Lobby',         'zone', 1),
      (v_hb, v_parent, 'Z02', 'Banking Hall',  'zone', 2)
    ON CONFLICT DO NOTHING;
  END IF;

  -- BA > 02-L1 zones
  SELECT id INTO v_parent FROM wbs_nodes WHERE project_id=v_hb AND code='02-L1' LIMIT 1;
  IF v_parent IS NOT NULL THEN
    INSERT INTO wbs_nodes (project_id, parent_id, code, name, node_type, sort_order) VALUES
      (v_hb, v_parent, 'Z01', 'Office East', 'zone', 1),
      (v_hb, v_parent, 'Z02', 'Office West', 'zone', 2)
    ON CONFLICT DO NOTHING;
  END IF;

  -- BA > 03-L2 zones
  SELECT id INTO v_parent FROM wbs_nodes WHERE project_id=v_hb AND code='03-L2' LIMIT 1;
  IF v_parent IS NOT NULL THEN
    INSERT INTO wbs_nodes (project_id, parent_id, code, name, node_type, sort_order) VALUES
      (v_hb, v_parent, 'Z01', 'Trading Floor', 'zone', 1)
    ON CONFLICT DO NOTHING;
  END IF;

  -- BB Parking > L01 > Z01
  SELECT id INTO v_parent FROM wbs_nodes WHERE project_id=v_hb AND code='BB' LIMIT 1;
  IF v_parent IS NOT NULL THEN
    INSERT INTO wbs_nodes (project_id, parent_id, code, name, node_type, sort_order) VALUES
      (v_hb, v_parent, 'L01', 'Basement P1', 'level', 1)
    ON CONFLICT DO NOTHING;
    SELECT id INTO v_node FROM wbs_nodes WHERE project_id=v_hb AND parent_id=v_parent AND code='L01';
    INSERT INTO wbs_nodes (project_id, parent_id, code, name, node_type, sort_order) VALUES
      (v_hb, v_node, 'Z01', 'Parking Bay A', 'zone', 1)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ===========================================================
  -- 3. Project members (all 7 base users in both projects)
  -- ===========================================================
  INSERT INTO project_members (project_id, user_id, project_role)
  SELECT p.id, u.user_id, u.role
  FROM projects p
  CROSS JOIN (VALUES
    (v_alex,'admin'::app_role), (v_pat,'project_manager'::app_role),
    (v_erin,'engineer'::app_role), (v_sam,'supervisor'::app_role),
    (v_quinn,'qaqc_inspector'::app_role), (v_wes,'worker'::app_role),
    (v_avery,'accountant'::app_role)
  ) u(user_id, role)
  WHERE p.code IN ('PRJ-001','PRJ-002') AND u.user_id IS NOT NULL
  ON CONFLICT DO NOTHING;

  -- ===========================================================
  -- 4. Department members for EXISTING users
  -- ===========================================================
  INSERT INTO department_members (user_id, department, role_in_dept) VALUES
    (v_erin,  'architecture', 'member'),
    (v_erin,  'mep',          'reviewer'),
    (v_pat,   'procurement',  'reviewer'),
    (v_pat,   'construction', 'reviewer'),
    (v_sam,   'construction', 'member'),
    (v_sam,   'structure',    'reviewer'),
    (v_quinn, 'construction', 'reviewer'),
    (v_quinn, 'mep',          'member'),
    (v_wes,   'construction', 'member')
  ON CONFLICT DO NOTHING;

  -- Approvers (only if those users have been created by the edge function)
  IF v_aria   IS NOT NULL THEN INSERT INTO department_members (user_id, department, role_in_dept) VALUES (v_aria,   'architecture','approver') ON CONFLICT DO NOTHING; END IF;
  IF v_stella IS NOT NULL THEN INSERT INTO department_members (user_id, department, role_in_dept) VALUES (v_stella, 'structure',   'approver') ON CONFLICT DO NOTHING; END IF;
  IF v_marco  IS NOT NULL THEN INSERT INTO department_members (user_id, department, role_in_dept) VALUES (v_marco,  'mep',         'approver') ON CONFLICT DO NOTHING; END IF;
  IF v_pierre IS NOT NULL THEN INSERT INTO department_members (user_id, department, role_in_dept) VALUES (v_pierre, 'procurement', 'approver') ON CONFLICT DO NOTHING; END IF;
  IF v_connor IS NOT NULL THEN INSERT INTO department_members (user_id, department, role_in_dept) VALUES (v_connor, 'construction','approver') ON CONFLICT DO NOTHING; END IF;

  -- Approvers also need to be project members
  IF v_aria IS NOT NULL THEN
    INSERT INTO project_members (project_id, user_id, project_role)
    SELECT id, v_aria, 'engineer' FROM projects WHERE code IN ('PRJ-001','PRJ-002')
    ON CONFLICT DO NOTHING;
  END IF;
  IF v_stella IS NOT NULL THEN
    INSERT INTO project_members (project_id, user_id, project_role)
    SELECT id, v_stella, 'engineer' FROM projects WHERE code IN ('PRJ-001','PRJ-002')
    ON CONFLICT DO NOTHING;
  END IF;
  IF v_marco IS NOT NULL THEN
    INSERT INTO project_members (project_id, user_id, project_role)
    SELECT id, v_marco, 'engineer' FROM projects WHERE code IN ('PRJ-001','PRJ-002')
    ON CONFLICT DO NOTHING;
  END IF;
  IF v_pierre IS NOT NULL THEN
    INSERT INTO project_members (project_id, user_id, project_role)
    SELECT id, v_pierre, 'project_manager' FROM projects WHERE code IN ('PRJ-001','PRJ-002')
    ON CONFLICT DO NOTHING;
  END IF;
  IF v_connor IS NOT NULL THEN
    INSERT INTO project_members (project_id, user_id, project_role)
    SELECT id, v_connor, 'supervisor' FROM projects WHERE code IN ('PRJ-001','PRJ-002')
    ON CONFLICT DO NOTHING;
  END IF;

  -- ===========================================================
  -- 5. WBS assignments (per-zone access grants)
  -- ===========================================================
  -- Erin: view RT-A
  SELECT id INTO v_node FROM wbs_nodes WHERE project_id=v_rt AND parent_id IS NULL AND code='RT-A';
  IF v_node IS NOT NULL AND v_erin IS NOT NULL THEN
    INSERT INTO wbs_assignments (user_id, wbs_node_id, permission)
    VALUES (v_erin, v_node, 'view') ON CONFLICT DO NOTHING;
  END IF;
  -- Sam: edit BA > 02-L1
  SELECT id INTO v_node FROM wbs_nodes WHERE project_id=v_hb AND code='02-L1';
  IF v_node IS NOT NULL AND v_sam IS NOT NULL THEN
    INSERT INTO wbs_assignments (user_id, wbs_node_id, permission)
    VALUES (v_sam, v_node, 'edit') ON CONFLICT DO NOTHING;
  END IF;
  -- Marco MEP: edit RT-B > L01
  IF v_marco IS NOT NULL THEN
    SELECT n.id INTO v_node FROM wbs_nodes n
    JOIN wbs_nodes p ON p.id = n.parent_id
    WHERE n.project_id=v_rt AND n.code='L01' AND p.code='RT-B';
    IF v_node IS NOT NULL THEN
      INSERT INTO wbs_assignments (user_id, wbs_node_id, permission)
      VALUES (v_marco, v_node, 'edit') ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  -- Pierre: manage BA > 02-L1 > Z01
  IF v_pierre IS NOT NULL THEN
    SELECT n.id INTO v_node FROM wbs_nodes n
    JOIN wbs_nodes p ON p.id = n.parent_id
    WHERE n.project_id=v_hb AND n.code='Z01' AND p.code='02-L1';
    IF v_node IS NOT NULL THEN
      INSERT INTO wbs_assignments (user_id, wbs_node_id, permission)
      VALUES (v_pierre, v_node, 'manage') ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  -- Wes: view BA > 01-GF
  SELECT id INTO v_node FROM wbs_nodes WHERE project_id=v_hb AND code='01-GF';
  IF v_node IS NOT NULL AND v_wes IS NOT NULL THEN
    INSERT INTO wbs_assignments (user_id, wbs_node_id, permission)
    VALUES (v_wes, v_node, 'view') ON CONFLICT DO NOTHING;
  END IF;

  -- ===========================================================
  -- 6. Tasks — disable validation triggers, insert at target stages
  -- ===========================================================
  ALTER TABLE tasks DISABLE TRIGGER trg_validate_dept_status;
  ALTER TABLE tasks DISABLE TRIGGER trg_validate_dependencies;

  -- Helper: resolve common WBS nodes
  -- Hattha BA > 02-L1 > Z01 (Office East) — used for canonical chain
  SELECT n.id INTO v_node FROM wbs_nodes n
  JOIN wbs_nodes p ON p.id = n.parent_id
  WHERE n.project_id=v_hb AND n.code='Z01' AND p.code='02-L1';

  -- ARCHITECTURE — Hattha (3 tasks)
  INSERT INTO tasks (project_id, code, title, task_type, department, dept_status, status, wbs_node_id, discipline_meta, created_by)
  VALUES
    (v_hb, 'T-ARCH-001', 'Floor plan – Lobby', 'other','architecture','draft','open',
       (SELECT n.id FROM wbs_nodes n JOIN wbs_nodes p ON p.id=n.parent_id WHERE n.project_id=v_hb AND n.code='Z01' AND p.code='01-GF'),
       '{"drawing_no":"A-101","revision":"Rev. 0"}'::jsonb, v_alex),
    (v_hb, 'T-ARCH-002', 'Office East layout', 'other','architecture','dept_approved','approved',
       v_node, '{"drawing_no":"A-201","revision":"Rev. 1"}'::jsonb, v_alex),
    (v_hb, 'T-ARCH-003', 'Trading Floor layout', 'other','architecture','internal_review','pending_approval',
       (SELECT n.id FROM wbs_nodes n JOIN wbs_nodes p ON p.id=n.parent_id WHERE n.project_id=v_hb AND n.code='Z01' AND p.code='03-L2'),
       '{"drawing_no":"A-301","revision":"Rev. 0"}'::jsonb, v_alex)
  ON CONFLICT (code) DO NOTHING;

  -- ARCHITECTURE — Riverside (3 tasks)
  INSERT INTO tasks (project_id, code, title, task_type, department, dept_status, status, wbs_node_id, discipline_meta, created_by)
  VALUES
    (v_rt, 'T-ARCH-101', 'Lobby concept', 'other','architecture','draft','open',
       (SELECT n.id FROM wbs_nodes n JOIN wbs_nodes p ON p.id=n.parent_id JOIN wbs_nodes b ON b.id=p.parent_id WHERE n.project_id=v_rt AND n.code='Z01' AND p.code='L01' AND b.code='RT-A'),
       '{"drawing_no":"A-001","revision":"Rev. 0"}'::jsonb, v_alex),
    (v_rt, 'T-ARCH-102', 'Retail zone plan', 'other','architecture','dept_approved','approved',
       (SELECT n.id FROM wbs_nodes n JOIN wbs_nodes p ON p.id=n.parent_id JOIN wbs_nodes b ON b.id=p.parent_id WHERE n.project_id=v_rt AND n.code='Z02' AND p.code='L01' AND b.code='RT-A'),
       '{"drawing_no":"A-002","revision":"Rev. 1"}'::jsonb, v_alex),
    (v_rt, 'T-ARCH-103', 'Open office L2', 'other','architecture','internal_review','pending_approval',
       (SELECT n.id FROM wbs_nodes n JOIN wbs_nodes p ON p.id=n.parent_id JOIN wbs_nodes b ON b.id=p.parent_id WHERE n.project_id=v_rt AND n.code='Z01' AND p.code='L03' AND b.code='RT-A'),
       '{"drawing_no":"A-003","revision":"Rev. 0"}'::jsonb, v_alex)
  ON CONFLICT (code) DO NOTHING;

  -- STRUCTURE — Hattha
  INSERT INTO tasks (project_id, code, title, task_type, department, dept_status, status, wbs_node_id, discipline_meta, created_by)
  VALUES
    (v_hb, 'T-STRUCT-001', 'Foundation calc', 'concrete','structure','draft','open',
       (SELECT id FROM wbs_nodes WHERE project_id=v_hb AND code='00-UG'),
       '{"drawing_no":"S-100","revision":"Rev. 0"}'::jsonb, v_alex),
    (v_hb, 'T-STRUCT-002', 'Office East slab', 'concrete','structure','coordination','in_progress',
       v_node, '{"drawing_no":"S-201","revision":"Rev. 0"}'::jsonb, v_alex),
    (v_hb, 'T-STRUCT-003', 'Roof beams', 'steel','structure','issued','completed',
       (SELECT id FROM wbs_nodes WHERE project_id=v_hb AND code='04-RF'),
       '{"drawing_no":"S-401","revision":"Rev. 2"}'::jsonb, v_alex)
  ON CONFLICT (code) DO NOTHING;

  -- STRUCTURE — Riverside
  INSERT INTO tasks (project_id, code, title, task_type, department, dept_status, status, wbs_node_id, discipline_meta, created_by)
  VALUES
    (v_rt, 'T-STRUCT-101', 'Tower foundations', 'concrete','structure','draft','open',
       (SELECT id FROM wbs_nodes WHERE project_id=v_rt AND code='RT-A'),
       '{"drawing_no":"S-001","revision":"Rev. 0"}'::jsonb, v_alex),
    (v_rt, 'T-STRUCT-102', 'L01 slab', 'concrete','structure','coordination','in_progress',
       (SELECT n.id FROM wbs_nodes n JOIN wbs_nodes p ON p.id=n.parent_id JOIN wbs_nodes b ON b.id=p.parent_id WHERE n.project_id=v_rt AND n.code='Z01' AND p.code='L01' AND b.code='RT-A'),
       '{"drawing_no":"S-002","revision":"Rev. 0"}'::jsonb, v_alex),
    (v_rt, 'T-STRUCT-103', 'Steel columns L02', 'steel','structure','issued','completed',
       (SELECT n.id FROM wbs_nodes n JOIN wbs_nodes p ON p.id=n.parent_id JOIN wbs_nodes b ON b.id=p.parent_id WHERE n.project_id=v_rt AND n.code='Z01' AND p.code='L02' AND b.code='RT-A'),
       '{"drawing_no":"S-003","revision":"Rev. 1"}'::jsonb, v_alex)
  ON CONFLICT (code) DO NOTHING;

  -- MEP — Hattha
  INSERT INTO tasks (project_id, code, title, task_type, department, dept_status, status, wbs_node_id, discipline_meta, created_by)
  VALUES
    (v_hb, 'T-MEP-001', 'HVAC layout L1', 'mep','mep','draft','open',
       v_node,'{"drawing_no":"M-201","revision":"Rev. 0"}'::jsonb, v_alex),
    (v_hb, 'T-MEP-002', 'Electrical risers', 'mep','mep','internal_review','pending_approval',
       (SELECT id FROM wbs_nodes WHERE project_id=v_hb AND code='00-UG'),
       '{"drawing_no":"M-101","revision":"Rev. 0"}'::jsonb, v_alex),
    (v_hb, 'T-MEP-003', 'Plumbing GF', 'mep','mep','coordination','in_progress',
       (SELECT id FROM wbs_nodes WHERE project_id=v_hb AND code='01-GF'),
       '{"drawing_no":"M-301","revision":"Rev. 0"}'::jsonb, v_alex)
  ON CONFLICT (code) DO NOTHING;

  -- MEP — Riverside
  INSERT INTO tasks (project_id, code, title, task_type, department, dept_status, status, wbs_node_id, discipline_meta, created_by)
  VALUES
    (v_rt, 'T-MEP-101', 'Plant room layout', 'mep','mep','draft','open',
       (SELECT n.id FROM wbs_nodes n JOIN wbs_nodes p ON p.id=n.parent_id WHERE n.project_id=v_rt AND n.code='Z01' AND p.code='L01' AND n.parent_id IN (SELECT id FROM wbs_nodes WHERE project_id=v_rt AND code='L01' AND parent_id IN (SELECT id FROM wbs_nodes WHERE project_id=v_rt AND code='RT-B'))),
       '{"drawing_no":"M-001","revision":"Rev. 0"}'::jsonb, v_alex),
    (v_rt, 'T-MEP-102', 'Lighting Lobby', 'mep','mep','internal_review','pending_approval',
       (SELECT n.id FROM wbs_nodes n JOIN wbs_nodes p ON p.id=n.parent_id JOIN wbs_nodes b ON b.id=p.parent_id WHERE n.project_id=v_rt AND n.code='Z01' AND p.code='L01' AND b.code='RT-A'),
       '{"drawing_no":"M-002","revision":"Rev. 0"}'::jsonb, v_alex),
    (v_rt, 'T-MEP-103', 'Sprinkler L2', 'mep','mep','coordination','in_progress',
       (SELECT n.id FROM wbs_nodes n JOIN wbs_nodes p ON p.id=n.parent_id JOIN wbs_nodes b ON b.id=p.parent_id WHERE n.project_id=v_rt AND n.code='Z01' AND p.code='L02' AND b.code='RT-A'),
       '{"drawing_no":"M-003","revision":"Rev. 0"}'::jsonb, v_alex)
  ON CONFLICT (code) DO NOTHING;

  -- PROCUREMENT — Hattha
  INSERT INTO tasks (project_id, code, title, task_type, department, dept_status, status, wbs_node_id, discipline_meta, created_by)
  VALUES
    (v_hb, 'T-PROC-001', 'Steel order – Roof', 'other','procurement','request','open',
       (SELECT id FROM wbs_nodes WHERE project_id=v_hb AND code='04-RF'),
       '{"supplier":"Acme Steel Co.","po_number":"PO-0001","rfq_due":"2026-05-15"}'::jsonb, v_alex),
    (v_hb, 'T-PROC-002', 'Rebar – Office East', 'other','procurement','rfq','in_progress',
       v_node,'{"supplier":"Rebar Inc.","po_number":"PO-0002","rfq_due":"2026-05-20"}'::jsonb, v_alex),
    (v_hb, 'T-PROC-003', 'HVAC units', 'other','procurement','po_issued','approved',
       (SELECT id FROM wbs_nodes WHERE project_id=v_hb AND code='02-L1'),
       '{"supplier":"CoolAir Ltd.","po_number":"PO-0003"}'::jsonb, v_alex)
  ON CONFLICT (code) DO NOTHING;

  -- PROCUREMENT — Riverside
  INSERT INTO tasks (project_id, code, title, task_type, department, dept_status, status, wbs_node_id, discipline_meta, created_by)
  VALUES
    (v_rt, 'T-PROC-101', 'Concrete order', 'other','procurement','request','open',
       (SELECT id FROM wbs_nodes WHERE project_id=v_rt AND code='RT-A'),
       '{"supplier":"ReadyMix Co.","po_number":"PO-0101","rfq_due":"2026-05-10"}'::jsonb, v_alex),
    (v_rt, 'T-PROC-102', 'Lobby finishes', 'other','procurement','rfq','in_progress',
       (SELECT n.id FROM wbs_nodes n JOIN wbs_nodes p ON p.id=n.parent_id JOIN wbs_nodes b ON b.id=p.parent_id WHERE n.project_id=v_rt AND n.code='Z01' AND p.code='L01' AND b.code='RT-A'),
       '{"supplier":"FineFinish","po_number":"PO-0102","rfq_due":"2026-05-25"}'::jsonb, v_alex),
    (v_rt, 'T-PROC-103', 'Elevators', 'other','procurement','po_issued','approved',
       (SELECT id FROM wbs_nodes WHERE project_id=v_rt AND code='RT-A'),
       '{"supplier":"OtisLift","po_number":"PO-0103"}'::jsonb, v_alex)
  ON CONFLICT (code) DO NOTHING;

  -- CONSTRUCTION — Hattha
  INSERT INTO tasks (project_id, code, title, task_type, department, dept_status, status, wbs_node_id, discipline_meta, created_by)
  VALUES
    (v_hb, 'T-CONSTR-001', 'Site prep – Underground', 'excavation','construction','assigned','assigned',
       (SELECT id FROM wbs_nodes WHERE project_id=v_hb AND code='00-UG'),
       '{"inspection_ref":"INS-0001","lot_no":"Lot-01"}'::jsonb, v_alex),
    (v_hb, 'T-CONSTR-002', 'Slab pour Office East', 'concrete','construction','assigned','assigned',
       v_node, '{"inspection_ref":"INS-0002","lot_no":"Lot-12"}'::jsonb, v_alex),
    (v_hb, 'T-CONSTR-003', 'Banking Hall finish', 'finishing','construction','inspection','pending_approval',
       (SELECT n.id FROM wbs_nodes n JOIN wbs_nodes p ON p.id=n.parent_id WHERE n.project_id=v_hb AND n.code='Z02' AND p.code='01-GF'),
       '{"inspection_ref":"INS-0003","lot_no":"Lot-08"}'::jsonb, v_alex)
  ON CONFLICT (code) DO NOTHING;

  -- CONSTRUCTION — Riverside
  INSERT INTO tasks (project_id, code, title, task_type, department, dept_status, status, wbs_node_id, discipline_meta, created_by)
  VALUES
    (v_rt, 'T-CONSTR-101', 'Site prep', 'excavation','construction','assigned','assigned',
       (SELECT id FROM wbs_nodes WHERE project_id=v_rt AND code='RT-A'),
       '{"inspection_ref":"INS-0101","lot_no":"Lot-01"}'::jsonb, v_alex),
    (v_rt, 'T-CONSTR-102', 'Retail zone build', 'finishing','construction','in_progress','in_progress',
       (SELECT n.id FROM wbs_nodes n JOIN wbs_nodes p ON p.id=n.parent_id JOIN wbs_nodes b ON b.id=p.parent_id WHERE n.project_id=v_rt AND n.code='Z02' AND p.code='L01' AND b.code='RT-A'),
       '{"inspection_ref":"INS-0102","lot_no":"Lot-04"}'::jsonb, v_alex),
    (v_rt, 'T-CONSTR-103', 'Steel erection L02', 'steel','construction','inspection','pending_approval',
       (SELECT n.id FROM wbs_nodes n JOIN wbs_nodes p ON p.id=n.parent_id JOIN wbs_nodes b ON b.id=p.parent_id WHERE n.project_id=v_rt AND n.code='Z01' AND p.code='L02' AND b.code='RT-A'),
       '{"inspection_ref":"INS-0103","lot_no":"Lot-07"}'::jsonb, v_alex)
  ON CONFLICT (code) DO NOTHING;

  -- Re-enable triggers
  ALTER TABLE tasks ENABLE TRIGGER trg_validate_dept_status;
  ALTER TABLE tasks ENABLE TRIGGER trg_validate_dependencies;

  -- ===========================================================
  -- 7. Predecessors — cross-dept chain (Hattha) + Riverside soft chain
  -- ===========================================================
  SELECT id INTO v_arch_hb   FROM tasks WHERE code='T-ARCH-002';
  SELECT id INTO v_struct_hb FROM tasks WHERE code='T-STRUCT-002';
  SELECT id INTO v_proc_hb   FROM tasks WHERE code='T-PROC-002';
  SELECT id INTO v_constr_hb FROM tasks WHERE code='T-CONSTR-002';

  IF v_struct_hb IS NOT NULL AND v_arch_hb IS NOT NULL THEN
    INSERT INTO task_predecessors (task_id, predecessor_id, is_hard_block, note)
    VALUES (v_struct_hb, v_arch_hb, true, 'Structure waits on architecture sign-off')
    ON CONFLICT DO NOTHING;
  END IF;
  IF v_proc_hb IS NOT NULL AND v_struct_hb IS NOT NULL THEN
    INSERT INTO task_predecessors (task_id, predecessor_id, is_hard_block, note)
    VALUES (v_proc_hb, v_struct_hb, true, 'Procurement needs structural BOM')
    ON CONFLICT DO NOTHING;
  END IF;
  IF v_constr_hb IS NOT NULL AND v_struct_hb IS NOT NULL THEN
    INSERT INTO task_predecessors (task_id, predecessor_id, is_hard_block, note)
    VALUES (v_constr_hb, v_struct_hb, true, 'Cannot start until structure issued')
    ON CONFLICT DO NOTHING;
  END IF;
  IF v_constr_hb IS NOT NULL AND v_proc_hb IS NOT NULL THEN
    INSERT INTO task_predecessors (task_id, predecessor_id, is_hard_block, note)
    VALUES (v_constr_hb, v_proc_hb, false, 'Materials should be on site (soft warning)')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Riverside: soft chain
  SELECT id INTO v_arch_rt   FROM tasks WHERE code='T-ARCH-102';
  SELECT id INTO v_constr_rt FROM tasks WHERE code='T-CONSTR-102';
  IF v_constr_rt IS NOT NULL AND v_arch_rt IS NOT NULL THEN
    INSERT INTO task_predecessors (task_id, predecessor_id, is_hard_block, note)
    VALUES (v_constr_rt, v_arch_rt, false, 'Architecture should be approved (soft)')
    ON CONFLICT DO NOTHING;
  END IF;

  -- ===========================================================
  -- 8. Task assignments — link each dept task to its dept user
  -- ===========================================================
  -- Architecture tasks → Erin (member); approver tasks also → Aria if available
  IF v_erin IS NOT NULL THEN
    INSERT INTO task_assignments (task_id, user_id)
    SELECT id, v_erin FROM tasks WHERE department='architecture' AND code LIKE 'T-ARCH-%'
    ON CONFLICT DO NOTHING;
  END IF;
  -- Structure tasks → Sam (reviewer) and Stella (approver) if avail
  IF v_sam IS NOT NULL THEN
    INSERT INTO task_assignments (task_id, user_id)
    SELECT id, v_sam FROM tasks WHERE department='structure' AND code LIKE 'T-STRUCT-%'
    ON CONFLICT DO NOTHING;
  END IF;
  -- MEP tasks → Quinn (member)
  IF v_quinn IS NOT NULL THEN
    INSERT INTO task_assignments (task_id, user_id)
    SELECT id, v_quinn FROM tasks WHERE department='mep' AND code LIKE 'T-MEP-%'
    ON CONFLICT DO NOTHING;
  END IF;
  -- Procurement → Pat (reviewer) and Pierre (approver) if avail
  IF v_pat IS NOT NULL THEN
    INSERT INTO task_assignments (task_id, user_id)
    SELECT id, v_pat FROM tasks WHERE department='procurement' AND code LIKE 'T-PROC-%'
    ON CONFLICT DO NOTHING;
  END IF;
  -- Construction → Wes (member)
  IF v_wes IS NOT NULL THEN
    INSERT INTO task_assignments (task_id, user_id)
    SELECT id, v_wes FROM tasks WHERE department='construction' AND code LIKE 'T-CONSTR-%'
    ON CONFLICT DO NOTHING;
  END IF;

  v_result := jsonb_build_object(
    'wbs_nodes', (SELECT count(*) FROM wbs_nodes),
    'tasks_seeded', (SELECT count(*) FROM tasks WHERE code LIKE 'T-%'),
    'predecessors', (SELECT count(*) FROM task_predecessors),
    'department_members', (SELECT count(*) FROM department_members),
    'wbs_assignments', (SELECT count(*) FROM wbs_assignments)
  );

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.seed_demo_run() TO authenticated;