-- ============================================================
-- DCOS Task Template Seed Data
-- Generated from: DCOS_Full_Task_Template_Library_R0.md
-- ============================================================

-- This file seeds the master task template library with all
-- standard construction work package templates organized by
-- discipline: STR (Structural), ARC (Architectural), MEP (MEP).

BEGIN;

-- ============================================================
-- STR-001 — Bored Pile Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-001', 'STR', 'Construction', 'STR-001', 'Bored Pile Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-001-S01', 'Review approved piling drawing and coordinates', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-001-S02', 'Survey setting out and mark pile position', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-001-S03', 'Mobilize piling rig and prepare working platform', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-001-S04', 'Execute drilling/driving/micropile installation', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-001-S05', 'Install reinforcement/casing/grout as applicable', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-001-S06', 'Place concrete or grout to approved level', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-001-S07', 'Record installation data and as-built location', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'STR-001-S08', 'Carry out required pile testing', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'STR-001-S09', 'Submit pile record and close inspection', '1 day', 'Engineer', true, 9);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check pile coordinates and cut-off level', true, 1),
    (v_template_id, 'Verify depth/refusal/grout/concrete volume', true, 2),
    (v_template_id, 'Inspect reinforcement cage or pile section', true, 3),
    (v_template_id, 'Concrete slump/cube test where applicable', true, 4),
    (v_template_id, 'Pile integrity/load test record accepted', true, 5);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-002 — Driven Pile Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-002', 'STR', 'Construction', 'STR-002', 'Driven Pile Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-002-S01', 'Review approved piling drawing and coordinates', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-002-S02', 'Survey setting out and mark pile position', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-002-S03', 'Mobilize piling rig and prepare working platform', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-002-S04', 'Execute drilling/driving/micropile installation', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-002-S05', 'Install reinforcement/casing/grout as applicable', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-002-S06', 'Place concrete or grout to approved level', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-002-S07', 'Record installation data and as-built location', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'STR-002-S08', 'Carry out required pile testing', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'STR-002-S09', 'Submit pile record and close inspection', '1 day', 'Engineer', true, 9);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check pile coordinates and cut-off level', true, 1),
    (v_template_id, 'Verify depth/refusal/grout/concrete volume', true, 2),
    (v_template_id, 'Inspect reinforcement cage or pile section', true, 3),
    (v_template_id, 'Concrete slump/cube test where applicable', true, 4),
    (v_template_id, 'Pile integrity/load test record accepted', true, 5);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-003 — Micro Pile Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-003', 'STR', 'Construction', 'STR-003', 'Micro Pile Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-003-S01', 'Review approved piling drawing and coordinates', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-003-S02', 'Survey setting out and mark pile position', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-003-S03', 'Mobilize piling rig and prepare working platform', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-003-S04', 'Execute drilling/driving/micropile installation', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-003-S05', 'Install reinforcement/casing/grout as applicable', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-003-S06', 'Place concrete or grout to approved level', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-003-S07', 'Record installation data and as-built location', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'STR-003-S08', 'Carry out required pile testing', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'STR-003-S09', 'Submit pile record and close inspection', '1 day', 'Engineer', true, 9);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check pile coordinates and cut-off level', true, 1),
    (v_template_id, 'Verify depth/refusal/grout/concrete volume', true, 2),
    (v_template_id, 'Inspect reinforcement cage or pile section', true, 3),
    (v_template_id, 'Concrete slump/cube test where applicable', true, 4),
    (v_template_id, 'Pile integrity/load test record accepted', true, 5);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-004 — Pile Cap Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-004', 'STR', 'Construction', 'STR-004', 'Pile Cap Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-004-S01', 'Review approved foundation drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-004-S02', 'Survey setting out and excavation limit', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-004-S03', 'Prepare formation level and blinding', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-004-S04', 'Install formwork or edge shutter', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-004-S05', 'Fix reinforcement and embedded items', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-004-S06', 'MEP/earthing/sleeve coordination check', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-004-S07', 'Request rebar/formwork inspection', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'STR-004-S08', 'Cast concrete', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'STR-004-S09', 'Cure concrete and remove formwork', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'STR-004-S10', 'Survey as-built and close inspection', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check formation level and bearing condition', true, 1),
    (v_template_id, 'Verify rebar size, spacing, cover, laps, chairs', true, 2),
    (v_template_id, 'Check embedded items and sleeves', true, 3),
    (v_template_id, 'Concrete slump/cube test', true, 4),
    (v_template_id, 'Curing record completed', true, 5);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-005 — Raft Foundation Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-005', 'STR', 'Construction', 'STR-005', 'Raft Foundation Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-005-S01', 'Review approved foundation drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-005-S02', 'Survey setting out and excavation limit', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-005-S03', 'Prepare formation level and blinding', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-005-S04', 'Install formwork or edge shutter', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-005-S05', 'Fix reinforcement and embedded items', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-005-S06', 'MEP/earthing/sleeve coordination check', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-005-S07', 'Request rebar/formwork inspection', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'STR-005-S08', 'Cast concrete', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'STR-005-S09', 'Cure concrete and remove formwork', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'STR-005-S10', 'Survey as-built and close inspection', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check formation level and bearing condition', true, 1),
    (v_template_id, 'Verify rebar size, spacing, cover, laps, chairs', true, 2),
    (v_template_id, 'Check embedded items and sleeves', true, 3),
    (v_template_id, 'Concrete slump/cube test', true, 4),
    (v_template_id, 'Curing record completed', true, 5);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-006 — Strip Footing Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-006', 'STR', 'Construction', 'STR-006', 'Strip Footing Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-006-S01', 'Review approved foundation drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-006-S02', 'Survey setting out and excavation limit', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-006-S03', 'Prepare formation level and blinding', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-006-S04', 'Install formwork or edge shutter', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-006-S05', 'Fix reinforcement and embedded items', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-006-S06', 'MEP/earthing/sleeve coordination check', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-006-S07', 'Request rebar/formwork inspection', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'STR-006-S08', 'Cast concrete', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'STR-006-S09', 'Cure concrete and remove formwork', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'STR-006-S10', 'Survey as-built and close inspection', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check formation level and bearing condition', true, 1),
    (v_template_id, 'Verify rebar size, spacing, cover, laps, chairs', true, 2),
    (v_template_id, 'Check embedded items and sleeves', true, 3),
    (v_template_id, 'Concrete slump/cube test', true, 4),
    (v_template_id, 'Curing record completed', true, 5);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-007 — Pad Footing Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-007', 'STR', 'Construction', 'STR-007', 'Pad Footing Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-007-S01', 'Review approved foundation drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-007-S02', 'Survey setting out and excavation limit', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-007-S03', 'Prepare formation level and blinding', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-007-S04', 'Install formwork or edge shutter', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-007-S05', 'Fix reinforcement and embedded items', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-007-S06', 'MEP/earthing/sleeve coordination check', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-007-S07', 'Request rebar/formwork inspection', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'STR-007-S08', 'Cast concrete', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'STR-007-S09', 'Cure concrete and remove formwork', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'STR-007-S10', 'Survey as-built and close inspection', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check formation level and bearing condition', true, 1),
    (v_template_id, 'Verify rebar size, spacing, cover, laps, chairs', true, 2),
    (v_template_id, 'Check embedded items and sleeves', true, 3),
    (v_template_id, 'Concrete slump/cube test', true, 4),
    (v_template_id, 'Curing record completed', true, 5);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-008 — Ground Beam Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-008', 'STR', 'Construction', 'STR-008', 'Ground Beam Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-008-S01', 'Review approved foundation drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-008-S02', 'Survey setting out and excavation limit', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-008-S03', 'Prepare formation level and blinding', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-008-S04', 'Install formwork or edge shutter', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-008-S05', 'Fix reinforcement and embedded items', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-008-S06', 'MEP/earthing/sleeve coordination check', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-008-S07', 'Request rebar/formwork inspection', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'STR-008-S08', 'Cast concrete', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'STR-008-S09', 'Cure concrete and remove formwork', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'STR-008-S10', 'Survey as-built and close inspection', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check formation level and bearing condition', true, 1),
    (v_template_id, 'Verify rebar size, spacing, cover, laps, chairs', true, 2),
    (v_template_id, 'Check embedded items and sleeves', true, 3),
    (v_template_id, 'Concrete slump/cube test', true, 4),
    (v_template_id, 'Curing record completed', true, 5);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-009 — Tie Beam Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-009', 'STR', 'Construction', 'STR-009', 'Tie Beam Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-009-S01', 'Review approved foundation drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-009-S02', 'Survey setting out and excavation limit', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-009-S03', 'Prepare formation level and blinding', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-009-S04', 'Install formwork or edge shutter', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-009-S05', 'Fix reinforcement and embedded items', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-009-S06', 'MEP/earthing/sleeve coordination check', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-009-S07', 'Request rebar/formwork inspection', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'STR-009-S08', 'Cast concrete', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'STR-009-S09', 'Cure concrete and remove formwork', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'STR-009-S10', 'Survey as-built and close inspection', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check formation level and bearing condition', true, 1),
    (v_template_id, 'Verify rebar size, spacing, cover, laps, chairs', true, 2),
    (v_template_id, 'Check embedded items and sleeves', true, 3),
    (v_template_id, 'Concrete slump/cube test', true, 4),
    (v_template_id, 'Curing record completed', true, 5);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-010 — Foundation Slab Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-010', 'STR', 'Construction', 'STR-010', 'Foundation Slab Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-010-S01', 'Review approved foundation drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-010-S02', 'Survey setting out and excavation limit', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-010-S03', 'Prepare formation level and blinding', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-010-S04', 'Install formwork or edge shutter', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-010-S05', 'Fix reinforcement and embedded items', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-010-S06', 'MEP/earthing/sleeve coordination check', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-010-S07', 'Request rebar/formwork inspection', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'STR-010-S08', 'Cast concrete', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'STR-010-S09', 'Cure concrete and remove formwork', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'STR-010-S10', 'Survey as-built and close inspection', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check formation level and bearing condition', true, 1),
    (v_template_id, 'Verify rebar size, spacing, cover, laps, chairs', true, 2),
    (v_template_id, 'Check embedded items and sleeves', true, 3),
    (v_template_id, 'Concrete slump/cube test', true, 4),
    (v_template_id, 'Curing record completed', true, 5);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-011 — Retaining Wall Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-011', 'STR', 'Construction', 'STR-011', 'Retaining Wall Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-011-S01', 'Review approved structural drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-011-S02', 'Survey setting out and control line', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-011-S03', 'Install formwork/support system', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-011-S04', 'Fix reinforcement and couplers/anchors', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-011-S05', 'Coordinate openings, sleeves, embeds', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-011-S06', 'Request pre-pour inspection', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-011-S07', 'Cast concrete', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'STR-011-S08', 'Cure concrete', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'STR-011-S09', 'Strip formwork after approval', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'STR-011-S10', 'Repair defects and close inspection', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check dimensions, line, level and verticality', true, 1),
    (v_template_id, 'Verify rebar size, spacing, lap, anchorage and cover', true, 2),
    (v_template_id, 'Check formwork stability and cleanliness', true, 3),
    (v_template_id, 'Concrete slump/cube test', true, 4),
    (v_template_id, 'Surface defect inspection after stripping', true, 5);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-012 — Diaphragm Wall Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-012', 'STR', 'Construction', 'STR-012', 'Diaphragm Wall Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-012-S01', 'Review approved structural drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-012-S02', 'Survey setting out and control line', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-012-S03', 'Install formwork/support system', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-012-S04', 'Fix reinforcement and couplers/anchors', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-012-S05', 'Coordinate openings, sleeves, embeds', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-012-S06', 'Request pre-pour inspection', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-012-S07', 'Cast concrete', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'STR-012-S08', 'Cure concrete', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'STR-012-S09', 'Strip formwork after approval', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'STR-012-S10', 'Repair defects and close inspection', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check dimensions, line, level and verticality', true, 1),
    (v_template_id, 'Verify rebar size, spacing, lap, anchorage and cover', true, 2),
    (v_template_id, 'Check formwork stability and cleanliness', true, 3),
    (v_template_id, 'Concrete slump/cube test', true, 4),
    (v_template_id, 'Surface defect inspection after stripping', true, 5);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-013 — Soldier Pile Wall Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-013', 'STR', 'Construction', 'STR-013', 'Soldier Pile Wall Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-013-S01', 'Review approved structural drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-013-S02', 'Survey setting out and control line', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-013-S03', 'Install formwork/support system', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-013-S04', 'Fix reinforcement and couplers/anchors', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-013-S05', 'Coordinate openings, sleeves, embeds', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-013-S06', 'Request pre-pour inspection', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-013-S07', 'Cast concrete', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'STR-013-S08', 'Cure concrete', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'STR-013-S09', 'Strip formwork after approval', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'STR-013-S10', 'Repair defects and close inspection', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check dimensions, line, level and verticality', true, 1),
    (v_template_id, 'Verify rebar size, spacing, lap, anchorage and cover', true, 2),
    (v_template_id, 'Check formwork stability and cleanliness', true, 3),
    (v_template_id, 'Concrete slump/cube test', true, 4),
    (v_template_id, 'Surface defect inspection after stripping', true, 5);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-014 — Column Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-014', 'STR', 'Construction', 'STR-014', 'Column Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-014-S01', 'Review approved structural drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-014-S02', 'Survey setting out and control line', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-014-S03', 'Install formwork/support system', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-014-S04', 'Fix reinforcement and couplers/anchors', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-014-S05', 'Coordinate openings, sleeves, embeds', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-014-S06', 'Request pre-pour inspection', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-014-S07', 'Cast concrete', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'STR-014-S08', 'Cure concrete', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'STR-014-S09', 'Strip formwork after approval', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'STR-014-S10', 'Repair defects and close inspection', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check dimensions, line, level and verticality', true, 1),
    (v_template_id, 'Verify rebar size, spacing, lap, anchorage and cover', true, 2),
    (v_template_id, 'Check formwork stability and cleanliness', true, 3),
    (v_template_id, 'Concrete slump/cube test', true, 4),
    (v_template_id, 'Surface defect inspection after stripping', true, 5);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-015 — Shear Wall Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-015', 'STR', 'Construction', 'STR-015', 'Shear Wall Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-015-S01', 'Review approved structural drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-015-S02', 'Survey setting out and control line', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-015-S03', 'Install formwork/support system', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-015-S04', 'Fix reinforcement and couplers/anchors', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-015-S05', 'Coordinate openings, sleeves, embeds', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-015-S06', 'Request pre-pour inspection', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-015-S07', 'Cast concrete', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'STR-015-S08', 'Cure concrete', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'STR-015-S09', 'Strip formwork after approval', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'STR-015-S10', 'Repair defects and close inspection', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check dimensions, line, level and verticality', true, 1),
    (v_template_id, 'Verify rebar size, spacing, lap, anchorage and cover', true, 2),
    (v_template_id, 'Check formwork stability and cleanliness', true, 3),
    (v_template_id, 'Concrete slump/cube test', true, 4),
    (v_template_id, 'Surface defect inspection after stripping', true, 5);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-016 — Core Wall Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-016', 'STR', 'Construction', 'STR-016', 'Core Wall Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-016-S01', 'Review approved structural drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-016-S02', 'Survey setting out and control line', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-016-S03', 'Install formwork/support system', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-016-S04', 'Fix reinforcement and couplers/anchors', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-016-S05', 'Coordinate openings, sleeves, embeds', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-016-S06', 'Request pre-pour inspection', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-016-S07', 'Cast concrete', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'STR-016-S08', 'Cure concrete', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'STR-016-S09', 'Strip formwork after approval', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'STR-016-S10', 'Repair defects and close inspection', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check dimensions, line, level and verticality', true, 1),
    (v_template_id, 'Verify rebar size, spacing, lap, anchorage and cover', true, 2),
    (v_template_id, 'Check formwork stability and cleanliness', true, 3),
    (v_template_id, 'Concrete slump/cube test', true, 4),
    (v_template_id, 'Surface defect inspection after stripping', true, 5);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-017 — Beam Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-017', 'STR', 'Construction', 'STR-017', 'Beam Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-017-S01', 'Review approved structural drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-017-S02', 'Survey setting out and control line', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-017-S03', 'Install formwork/support system', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-017-S04', 'Fix reinforcement and couplers/anchors', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-017-S05', 'Coordinate openings, sleeves, embeds', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-017-S06', 'Request pre-pour inspection', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-017-S07', 'Cast concrete', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'STR-017-S08', 'Cure concrete', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'STR-017-S09', 'Strip formwork after approval', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'STR-017-S10', 'Repair defects and close inspection', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check dimensions, line, level and verticality', true, 1),
    (v_template_id, 'Verify rebar size, spacing, lap, anchorage and cover', true, 2),
    (v_template_id, 'Check formwork stability and cleanliness', true, 3),
    (v_template_id, 'Concrete slump/cube test', true, 4),
    (v_template_id, 'Surface defect inspection after stripping', true, 5);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-018 — Transfer Beam Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-018', 'STR', 'Construction', 'STR-018', 'Transfer Beam Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-018-S01', 'Review approved structural drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-018-S02', 'Survey setting out and control line', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-018-S03', 'Install formwork/support system', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-018-S04', 'Fix reinforcement and couplers/anchors', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-018-S05', 'Coordinate openings, sleeves, embeds', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-018-S06', 'Request pre-pour inspection', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-018-S07', 'Cast concrete', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'STR-018-S08', 'Cure concrete', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'STR-018-S09', 'Strip formwork after approval', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'STR-018-S10', 'Repair defects and close inspection', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check dimensions, line, level and verticality', true, 1),
    (v_template_id, 'Verify rebar size, spacing, lap, anchorage and cover', true, 2),
    (v_template_id, 'Check formwork stability and cleanliness', true, 3),
    (v_template_id, 'Concrete slump/cube test', true, 4),
    (v_template_id, 'Surface defect inspection after stripping', true, 5);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-019 — Slab Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-019', 'STR', 'Construction', 'STR-019', 'Slab Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-019-S01', 'Review approved structural drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-019-S02', 'Survey setting out and control line', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-019-S03', 'Install formwork/support system', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-019-S04', 'Fix reinforcement and couplers/anchors', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-019-S05', 'Coordinate openings, sleeves, embeds', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-019-S06', 'Request pre-pour inspection', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-019-S07', 'Cast concrete', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'STR-019-S08', 'Cure concrete', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'STR-019-S09', 'Strip formwork after approval', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'STR-019-S10', 'Repair defects and close inspection', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check dimensions, line, level and verticality', true, 1),
    (v_template_id, 'Verify rebar size, spacing, lap, anchorage and cover', true, 2),
    (v_template_id, 'Check formwork stability and cleanliness', true, 3),
    (v_template_id, 'Concrete slump/cube test', true, 4),
    (v_template_id, 'Surface defect inspection after stripping', true, 5);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-020 — Flat Slab Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-020', 'STR', 'Construction', 'STR-020', 'Flat Slab Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-020-S01', 'Review approved structural drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-020-S02', 'Survey setting out and control line', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-020-S03', 'Install formwork/support system', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-020-S04', 'Fix reinforcement and couplers/anchors', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-020-S05', 'Coordinate openings, sleeves, embeds', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-020-S06', 'Request pre-pour inspection', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-020-S07', 'Cast concrete', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'STR-020-S08', 'Cure concrete', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'STR-020-S09', 'Strip formwork after approval', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'STR-020-S10', 'Repair defects and close inspection', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check dimensions, line, level and verticality', true, 1),
    (v_template_id, 'Verify rebar size, spacing, lap, anchorage and cover', true, 2),
    (v_template_id, 'Check formwork stability and cleanliness', true, 3),
    (v_template_id, 'Concrete slump/cube test', true, 4),
    (v_template_id, 'Surface defect inspection after stripping', true, 5);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-021 — Post-Tension Slab Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-021', 'STR', 'Construction', 'STR-021', 'Post-Tension Slab Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-021-S01', 'Review approved structural drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-021-S02', 'Survey setting out and control line', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-021-S03', 'Install formwork/support system', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-021-S04', 'Fix reinforcement and couplers/anchors', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-021-S05', 'Coordinate openings, sleeves, embeds', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-021-S06', 'Request pre-pour inspection', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-021-S07', 'Cast concrete', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'STR-021-S08', 'Cure concrete', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'STR-021-S09', 'Strip formwork after approval', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'STR-021-S10', 'Repair defects and close inspection', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check dimensions, line, level and verticality', true, 1),
    (v_template_id, 'Verify rebar size, spacing, lap, anchorage and cover', true, 2),
    (v_template_id, 'Check formwork stability and cleanliness', true, 3),
    (v_template_id, 'Concrete slump/cube test', true, 4),
    (v_template_id, 'Surface defect inspection after stripping', true, 5);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-022 — Precast Slab Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-022', 'STR', 'Construction', 'STR-022', 'Precast Slab Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-022-S01', 'Review approved structural drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-022-S02', 'Survey setting out and control line', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-022-S03', 'Install formwork/support system', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-022-S04', 'Fix reinforcement and couplers/anchors', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-022-S05', 'Coordinate openings, sleeves, embeds', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-022-S06', 'Request pre-pour inspection', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-022-S07', 'Cast concrete', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'STR-022-S08', 'Cure concrete', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'STR-022-S09', 'Strip formwork after approval', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'STR-022-S10', 'Repair defects and close inspection', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check dimensions, line, level and verticality', true, 1),
    (v_template_id, 'Verify rebar size, spacing, lap, anchorage and cover', true, 2),
    (v_template_id, 'Check formwork stability and cleanliness', true, 3),
    (v_template_id, 'Concrete slump/cube test', true, 4),
    (v_template_id, 'Surface defect inspection after stripping', true, 5);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-023 — Staircase Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-023', 'STR', 'Construction', 'STR-023', 'Staircase Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-023-S01', 'Review approved structural drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-023-S02', 'Survey setting out and control line', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-023-S03', 'Install formwork/support system', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-023-S04', 'Fix reinforcement and couplers/anchors', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-023-S05', 'Coordinate openings, sleeves, embeds', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-023-S06', 'Request pre-pour inspection', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-023-S07', 'Cast concrete', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'STR-023-S08', 'Cure concrete', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'STR-023-S09', 'Strip formwork after approval', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'STR-023-S10', 'Repair defects and close inspection', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check dimensions, line, level and verticality', true, 1),
    (v_template_id, 'Verify rebar size, spacing, lap, anchorage and cover', true, 2),
    (v_template_id, 'Check formwork stability and cleanliness', true, 3),
    (v_template_id, 'Concrete slump/cube test', true, 4),
    (v_template_id, 'Surface defect inspection after stripping', true, 5);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-024 — Ramp Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-024', 'STR', 'Construction', 'STR-024', 'Ramp Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-024-S01', 'Review approved structural drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-024-S02', 'Survey setting out and control line', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-024-S03', 'Install formwork/support system', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-024-S04', 'Fix reinforcement and couplers/anchors', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-024-S05', 'Coordinate openings, sleeves, embeds', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-024-S06', 'Request pre-pour inspection', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-024-S07', 'Cast concrete', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'STR-024-S08', 'Cure concrete', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'STR-024-S09', 'Strip formwork after approval', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'STR-024-S10', 'Repair defects and close inspection', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check dimensions, line, level and verticality', true, 1),
    (v_template_id, 'Verify rebar size, spacing, lap, anchorage and cover', true, 2),
    (v_template_id, 'Check formwork stability and cleanliness', true, 3),
    (v_template_id, 'Concrete slump/cube test', true, 4),
    (v_template_id, 'Surface defect inspection after stripping', true, 5);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-025 — Roof Slab Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-025', 'STR', 'Construction', 'STR-025', 'Roof Slab Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-025-S01', 'Review approved structural drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-025-S02', 'Survey setting out and control line', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-025-S03', 'Install formwork/support system', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-025-S04', 'Fix reinforcement and couplers/anchors', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-025-S05', 'Coordinate openings, sleeves, embeds', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-025-S06', 'Request pre-pour inspection', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-025-S07', 'Cast concrete', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'STR-025-S08', 'Cure concrete', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'STR-025-S09', 'Strip formwork after approval', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'STR-025-S10', 'Repair defects and close inspection', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check dimensions, line, level and verticality', true, 1),
    (v_template_id, 'Verify rebar size, spacing, lap, anchorage and cover', true, 2),
    (v_template_id, 'Check formwork stability and cleanliness', true, 3),
    (v_template_id, 'Concrete slump/cube test', true, 4),
    (v_template_id, 'Surface defect inspection after stripping', true, 5);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-026 — Structural Steel Column Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-026', 'STR', 'Construction', 'STR-026', 'Structural Steel Column Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-026-S01', 'Review approved structural drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-026-S02', 'Survey setting out and control line', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-026-S03', 'Install formwork/support system', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-026-S04', 'Fix reinforcement and couplers/anchors', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-026-S05', 'Coordinate openings, sleeves, embeds', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-026-S06', 'Request pre-pour inspection', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-026-S07', 'Cast concrete', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'STR-026-S08', 'Cure concrete', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'STR-026-S09', 'Strip formwork after approval', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'STR-026-S10', 'Repair defects and close inspection', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check dimensions, line, level and verticality', true, 1),
    (v_template_id, 'Verify rebar size, spacing, lap, anchorage and cover', true, 2),
    (v_template_id, 'Check formwork stability and cleanliness', true, 3),
    (v_template_id, 'Concrete slump/cube test', true, 4),
    (v_template_id, 'Surface defect inspection after stripping', true, 5);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-027 — Structural Steel Beam Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-027', 'STR', 'Construction', 'STR-027', 'Structural Steel Beam Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-027-S01', 'Review approved structural drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-027-S02', 'Survey setting out and control line', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-027-S03', 'Install formwork/support system', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-027-S04', 'Fix reinforcement and couplers/anchors', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-027-S05', 'Coordinate openings, sleeves, embeds', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-027-S06', 'Request pre-pour inspection', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-027-S07', 'Cast concrete', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'STR-027-S08', 'Cure concrete', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'STR-027-S09', 'Strip formwork after approval', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'STR-027-S10', 'Repair defects and close inspection', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check dimensions, line, level and verticality', true, 1),
    (v_template_id, 'Verify rebar size, spacing, lap, anchorage and cover', true, 2),
    (v_template_id, 'Check formwork stability and cleanliness', true, 3),
    (v_template_id, 'Concrete slump/cube test', true, 4),
    (v_template_id, 'Surface defect inspection after stripping', true, 5);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-028 — Truss Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-028', 'STR', 'Construction', 'STR-028', 'Truss Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-028-S01', 'Review approved shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-028-S02', 'Check material certificate and delivery', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-028-S03', 'Survey setting out and anchor positions', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-028-S04', 'Fabricate/prepare steel member or plate', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-028-S05', 'Install/lift member into position', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-028-S06', 'Align, level, plumb and temporarily brace', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-028-S07', 'Bolt/weld/fix connection', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'STR-028-S08', 'Inspect connection and coating', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'STR-028-S09', 'Final torque/weld/NDT check where required', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'STR-028-S10', 'Submit installation record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check steel grade and certificates', true, 1),
    (v_template_id, 'Verify bolt grade, torque, and washer arrangement', true, 2),
    (v_template_id, 'Check weld visual/NDT if required', true, 3),
    (v_template_id, 'Check alignment and plumbness', true, 4),
    (v_template_id, 'Coating/galvanizing damage touch-up', true, 5);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-029 — Bracing Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-029', 'STR', 'Construction', 'STR-029', 'Bracing Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-029-S01', 'Review approved shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-029-S02', 'Check material certificate and delivery', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-029-S03', 'Survey setting out and anchor positions', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-029-S04', 'Fabricate/prepare steel member or plate', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-029-S05', 'Install/lift member into position', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-029-S06', 'Align, level, plumb and temporarily brace', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-029-S07', 'Bolt/weld/fix connection', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'STR-029-S08', 'Inspect connection and coating', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'STR-029-S09', 'Final torque/weld/NDT check where required', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'STR-029-S10', 'Submit installation record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check steel grade and certificates', true, 1),
    (v_template_id, 'Verify bolt grade, torque, and washer arrangement', true, 2),
    (v_template_id, 'Check weld visual/NDT if required', true, 3),
    (v_template_id, 'Check alignment and plumbness', true, 4),
    (v_template_id, 'Coating/galvanizing damage touch-up', true, 5);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-030 — Anchor Bolt Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-030', 'STR', 'Construction', 'STR-030', 'Anchor Bolt Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-030-S01', 'Review approved shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-030-S02', 'Check material certificate and delivery', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-030-S03', 'Survey setting out and anchor positions', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-030-S04', 'Fabricate/prepare steel member or plate', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-030-S05', 'Install/lift member into position', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-030-S06', 'Align, level, plumb and temporarily brace', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-030-S07', 'Bolt/weld/fix connection', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'STR-030-S08', 'Inspect connection and coating', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'STR-030-S09', 'Final torque/weld/NDT check where required', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'STR-030-S10', 'Submit installation record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check steel grade and certificates', true, 1),
    (v_template_id, 'Verify bolt grade, torque, and washer arrangement', true, 2),
    (v_template_id, 'Check weld visual/NDT if required', true, 3),
    (v_template_id, 'Check alignment and plumbness', true, 4),
    (v_template_id, 'Coating/galvanizing damage touch-up', true, 5);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-031 — Base Plate Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-031', 'STR', 'Construction', 'STR-031', 'Base Plate Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-031-S01', 'Review approved shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-031-S02', 'Check material certificate and delivery', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-031-S03', 'Survey setting out and anchor positions', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-031-S04', 'Fabricate/prepare steel member or plate', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-031-S05', 'Install/lift member into position', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-031-S06', 'Align, level, plumb and temporarily brace', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-031-S07', 'Bolt/weld/fix connection', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'STR-031-S08', 'Inspect connection and coating', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'STR-031-S09', 'Final torque/weld/NDT check where required', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'STR-031-S10', 'Submit installation record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check steel grade and certificates', true, 1),
    (v_template_id, 'Verify bolt grade, torque, and washer arrangement', true, 2),
    (v_template_id, 'Check weld visual/NDT if required', true, 3),
    (v_template_id, 'Check alignment and plumbness', true, 4),
    (v_template_id, 'Coating/galvanizing damage touch-up', true, 5);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-032 — Rebar Reinforcement Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-032', 'STR', 'Construction', 'STR-032', 'Rebar Reinforcement Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-032-S01', 'Review bar bending schedule', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-032-S02', 'Receive and inspect rebar material', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-032-S03', 'Cut and bend bars', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-032-S04', 'Fix rebar according to drawing', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-032-S05', 'Install spacer/chair and coupler if required', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-032-S06', 'Check lap/anchorage/cover', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-032-S07', 'Request rebar inspection', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'STR-032-S08', 'Rectify comments', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'STR-032-S09', 'Release for concrete casting', '1 day', 'Engineer', true, 9);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Verify setting out and dimensions', true, 1),
    (v_template_id, 'Check line, level, plumb, and tolerance', true, 2),
    (v_template_id, 'Confirm approved materials before installation', true, 3),
    (v_template_id, 'Record inspection result before closing task', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-033 — Formwork Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-033', 'STR', 'Construction', 'STR-033', 'Formwork Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-033-S01', 'Review formwork drawing and method', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-033-S02', 'Prepare formwork material', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-033-S03', 'Install formwork and supports', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-033-S04', 'Apply release agent', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-033-S05', 'Check line, level, plumb and dimensions', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-033-S06', 'Provide access and safety protection', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-033-S07', 'Request inspection', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'STR-033-S08', 'Maintain during concreting', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'STR-033-S09', 'Strip after approval and clean for reuse', '1 day', 'Engineer', true, 9);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Verify setting out and dimensions', true, 1),
    (v_template_id, 'Check line, level, plumb, and tolerance', true, 2),
    (v_template_id, 'Confirm approved materials before installation', true, 3),
    (v_template_id, 'Record inspection result before closing task', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-034 — Embedded Plate Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-034', 'STR', 'Construction', 'STR-034', 'Embedded Plate Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-034-S01', 'Review approved shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-034-S02', 'Check material certificate and delivery', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-034-S03', 'Survey setting out and anchor positions', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-034-S04', 'Fabricate/prepare steel member or plate', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-034-S05', 'Install/lift member into position', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-034-S06', 'Align, level, plumb and temporarily brace', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-034-S07', 'Bolt/weld/fix connection', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'STR-034-S08', 'Inspect connection and coating', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'STR-034-S09', 'Final torque/weld/NDT check where required', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'STR-034-S10', 'Submit installation record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check steel grade and certificates', true, 1),
    (v_template_id, 'Verify bolt grade, torque, and washer arrangement', true, 2),
    (v_template_id, 'Check weld visual/NDT if required', true, 3),
    (v_template_id, 'Check alignment and plumbness', true, 4),
    (v_template_id, 'Coating/galvanizing damage touch-up', true, 5);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-035 — Expansion Joint Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-035', 'STR', 'Construction', 'STR-035', 'Expansion Joint Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-035-S01', 'Review approved joint detail', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-035-S02', 'Set out joint location', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-035-S03', 'Prepare substrate/former', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-035-S04', 'Install waterstop/dowel/sealant system', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-035-S05', 'Protect joint during adjacent works', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-035-S06', 'Inspect joint before covering', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-035-S07', 'Record as-built and close', '1 day', 'Engineer', true, 7);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Verify setting out and dimensions', true, 1),
    (v_template_id, 'Check line, level, plumb, and tolerance', true, 2),
    (v_template_id, 'Confirm approved materials before installation', true, 3),
    (v_template_id, 'Record inspection result before closing task', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-036 — Construction Joint Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-036', 'STR', 'Construction', 'STR-036', 'Construction Joint Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-036-S01', 'Review approved joint detail', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-036-S02', 'Set out joint location', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-036-S03', 'Prepare substrate/former', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-036-S04', 'Install waterstop/dowel/sealant system', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-036-S05', 'Protect joint during adjacent works', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-036-S06', 'Inspect joint before covering', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-036-S07', 'Record as-built and close', '1 day', 'Engineer', true, 7);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Verify setting out and dimensions', true, 1),
    (v_template_id, 'Check line, level, plumb, and tolerance', true, 2),
    (v_template_id, 'Confirm approved materials before installation', true, 3),
    (v_template_id, 'Record inspection result before closing task', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-037 — Parapet Structure Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-037', 'STR', 'Construction', 'STR-037', 'Parapet Structure Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-037-S01', 'Review approved structural drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-037-S02', 'Survey setting out and control line', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-037-S03', 'Install formwork/support system', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-037-S04', 'Fix reinforcement and couplers/anchors', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-037-S05', 'Coordinate openings, sleeves, embeds', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-037-S06', 'Request pre-pour inspection', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-037-S07', 'Cast concrete', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'STR-037-S08', 'Cure concrete', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'STR-037-S09', 'Strip formwork after approval', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'STR-037-S10', 'Repair defects and close inspection', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check dimensions, line, level and verticality', true, 1),
    (v_template_id, 'Verify rebar size, spacing, lap, anchorage and cover', true, 2),
    (v_template_id, 'Check formwork stability and cleanliness', true, 3),
    (v_template_id, 'Concrete slump/cube test', true, 4),
    (v_template_id, 'Surface defect inspection after stripping', true, 5);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-038 — Water Tank Structure Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-038', 'STR', 'Construction', 'STR-038', 'Water Tank Structure Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-038-S01', 'Review approved structural drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-038-S02', 'Survey setting out and control line', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-038-S03', 'Install formwork/support system', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-038-S04', 'Fix reinforcement and couplers/anchors', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-038-S05', 'Coordinate openings, sleeves, embeds', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-038-S06', 'Request pre-pour inspection', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-038-S07', 'Cast concrete', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'STR-038-S08', 'Cure concrete', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'STR-038-S09', 'Strip formwork after approval', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'STR-038-S10', 'Repair defects and close inspection', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check dimensions, line, level and verticality', true, 1),
    (v_template_id, 'Verify rebar size, spacing, lap, anchorage and cover', true, 2),
    (v_template_id, 'Check formwork stability and cleanliness', true, 3),
    (v_template_id, 'Concrete slump/cube test', true, 4),
    (v_template_id, 'Surface defect inspection after stripping', true, 5);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-039 — Lift Pit Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-039', 'STR', 'Construction', 'STR-039', 'Lift Pit Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-039-S01', 'Review approved structural drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-039-S02', 'Survey setting out and control line', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-039-S03', 'Install formwork/support system', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-039-S04', 'Fix reinforcement and couplers/anchors', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-039-S05', 'Coordinate openings, sleeves, embeds', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-039-S06', 'Request pre-pour inspection', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-039-S07', 'Cast concrete', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'STR-039-S08', 'Cure concrete', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'STR-039-S09', 'Strip formwork after approval', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'STR-039-S10', 'Repair defects and close inspection', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check dimensions, line, level and verticality', true, 1),
    (v_template_id, 'Verify rebar size, spacing, lap, anchorage and cover', true, 2),
    (v_template_id, 'Check formwork stability and cleanliness', true, 3),
    (v_template_id, 'Concrete slump/cube test', true, 4),
    (v_template_id, 'Surface defect inspection after stripping', true, 5);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- STR-040 — Sump Pit Work Package
-- Discipline: STR | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('STR-040', 'STR', 'Construction', 'STR-040', 'Sump Pit Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'STR-040-S01', 'Review approved structural drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'STR-040-S02', 'Survey setting out and control line', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'STR-040-S03', 'Install formwork/support system', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'STR-040-S04', 'Fix reinforcement and couplers/anchors', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'STR-040-S05', 'Coordinate openings, sleeves, embeds', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'STR-040-S06', 'Request pre-pour inspection', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'STR-040-S07', 'Cast concrete', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'STR-040-S08', 'Cure concrete', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'STR-040-S09', 'Strip formwork after approval', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'STR-040-S10', 'Repair defects and close inspection', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check dimensions, line, level and verticality', true, 1),
    (v_template_id, 'Verify rebar size, spacing, lap, anchorage and cover', true, 2),
    (v_template_id, 'Check formwork stability and cleanliness', true, 3),
    (v_template_id, 'Concrete slump/cube test', true, 4),
    (v_template_id, 'Surface defect inspection after stripping', true, 5);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved structural drawing', true, 1),
    (v_template_id, 'Method statement', true, 2),
    (v_template_id, 'Inspection and Test Plan (ITP)', true, 3),
    (v_template_id, 'Material approval / test certificates', true, 4),
    (v_template_id, 'QA/QC checklist', true, 5);

END $$;


-- ============================================================
-- ARC-001 — Brick Wall Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-001', 'ARC', 'Construction', 'ARC-001', 'Brick Wall Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-001-S01', 'Review approved layout drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-001-S02', 'Confirm material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-001-S03', 'Set out wall line/openings', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-001-S04', 'Prepare substrate/base', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-001-S05', 'Install wall/block/partition system', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-001-S06', 'Install lintel/support/accessories if required', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-001-S07', 'Check alignment and level', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-001-S08', 'Cure or allow fixing to set', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-001-S09', 'Prepare for finish/inspection', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-001-S10', 'Close work area record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Wall line and thickness checked', true, 1),
    (v_template_id, 'Opening size and location checked', true, 2),
    (v_template_id, 'Verticality/plumb tolerance checked', true, 3),
    (v_template_id, 'Joint quality checked', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-002 — Block Wall Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-002', 'ARC', 'Construction', 'ARC-002', 'Block Wall Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-002-S01', 'Review approved layout drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-002-S02', 'Confirm material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-002-S03', 'Set out wall line/openings', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-002-S04', 'Prepare substrate/base', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-002-S05', 'Install wall/block/partition system', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-002-S06', 'Install lintel/support/accessories if required', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-002-S07', 'Check alignment and level', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-002-S08', 'Cure or allow fixing to set', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-002-S09', 'Prepare for finish/inspection', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-002-S10', 'Close work area record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Wall line and thickness checked', true, 1),
    (v_template_id, 'Opening size and location checked', true, 2),
    (v_template_id, 'Verticality/plumb tolerance checked', true, 3),
    (v_template_id, 'Joint quality checked', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-003 — Partition Wall Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-003', 'ARC', 'Construction', 'ARC-003', 'Partition Wall Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-003-S01', 'Review approved layout drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-003-S02', 'Confirm material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-003-S03', 'Set out wall line/openings', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-003-S04', 'Prepare substrate/base', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-003-S05', 'Install wall/block/partition system', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-003-S06', 'Install lintel/support/accessories if required', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-003-S07', 'Check alignment and level', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-003-S08', 'Cure or allow fixing to set', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-003-S09', 'Prepare for finish/inspection', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-003-S10', 'Close work area record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Wall line and thickness checked', true, 1),
    (v_template_id, 'Opening size and location checked', true, 2),
    (v_template_id, 'Verticality/plumb tolerance checked', true, 3),
    (v_template_id, 'Joint quality checked', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-004 — Curtain Wall Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-004', 'ARC', 'Construction', 'ARC-004', 'Curtain Wall Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-004-S01', 'Review approved layout drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-004-S02', 'Confirm material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-004-S03', 'Set out wall line/openings', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-004-S04', 'Prepare substrate/base', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-004-S05', 'Install wall/block/partition system', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-004-S06', 'Install lintel/support/accessories if required', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-004-S07', 'Check alignment and level', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-004-S08', 'Cure or allow fixing to set', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-004-S09', 'Prepare for finish/inspection', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-004-S10', 'Close work area record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Wall line and thickness checked', true, 1),
    (v_template_id, 'Opening size and location checked', true, 2),
    (v_template_id, 'Verticality/plumb tolerance checked', true, 3),
    (v_template_id, 'Joint quality checked', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-005 — Glass Wall Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-005', 'ARC', 'Construction', 'ARC-005', 'Glass Wall Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-005-S01', 'Review approved layout drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-005-S02', 'Confirm material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-005-S03', 'Set out wall line/openings', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-005-S04', 'Prepare substrate/base', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-005-S05', 'Install wall/block/partition system', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-005-S06', 'Install lintel/support/accessories if required', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-005-S07', 'Check alignment and level', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-005-S08', 'Cure or allow fixing to set', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-005-S09', 'Prepare for finish/inspection', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-005-S10', 'Close work area record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Wall line and thickness checked', true, 1),
    (v_template_id, 'Opening size and location checked', true, 2),
    (v_template_id, 'Verticality/plumb tolerance checked', true, 3),
    (v_template_id, 'Joint quality checked', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-006 — Cladding Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-006', 'ARC', 'Construction', 'ARC-006', 'Cladding Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-006-S01', 'Review approved façade/shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-006-S02', 'Check material/sample approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-006-S03', 'Survey opening/support structure', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-006-S04', 'Install brackets/anchors', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-006-S05', 'Install frame/subframe', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-006-S06', 'Install panels/glass/louvers', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-006-S07', 'Apply sealant/gasket/flashing', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-006-S08', 'Waterproofing/interface check', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-006-S09', 'Final alignment and water test if required', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-006-S10', 'Submit inspection record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Anchor pull-out/test record if required', true, 1),
    (v_template_id, 'Alignment and joint width checked', true, 2),
    (v_template_id, 'Sealant/gasket continuity checked', true, 3),
    (v_template_id, 'Water test passed where applicable', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-007 — Plaster Finish Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-007', 'ARC', 'Construction', 'ARC-007', 'Plaster Finish Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-007-S01', 'Review approved finish schedule', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-007-S02', 'Confirm approved sample/mock-up', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-007-S03', 'Prepare substrate', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-007-S04', 'Check level/moisture/cleanliness', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-007-S05', 'Apply finish system', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-007-S06', 'Control joint/edge/detail treatment', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-007-S07', 'Protect completed finish', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-007-S08', 'Inspect surface quality', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-007-S09', 'Rectify defects', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-007-S10', 'Handover area', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Substrate approved before finish', true, 1),
    (v_template_id, 'Sample/mock-up matched', true, 2),
    (v_template_id, 'Flatness/levelness checked', true, 3),
    (v_template_id, 'Color, texture and joint quality checked', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-008 — Paint Finish Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-008', 'ARC', 'Construction', 'ARC-008', 'Paint Finish Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-008-S01', 'Review approved finish schedule', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-008-S02', 'Confirm approved sample/mock-up', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-008-S03', 'Prepare substrate', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-008-S04', 'Check level/moisture/cleanliness', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-008-S05', 'Apply finish system', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-008-S06', 'Control joint/edge/detail treatment', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-008-S07', 'Protect completed finish', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-008-S08', 'Inspect surface quality', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-008-S09', 'Rectify defects', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-008-S10', 'Handover area', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Substrate approved before finish', true, 1),
    (v_template_id, 'Sample/mock-up matched', true, 2),
    (v_template_id, 'Flatness/levelness checked', true, 3),
    (v_template_id, 'Color, texture and joint quality checked', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-009 — Tile Finish Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-009', 'ARC', 'Construction', 'ARC-009', 'Tile Finish Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-009-S01', 'Review approved finish schedule', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-009-S02', 'Confirm approved sample/mock-up', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-009-S03', 'Prepare substrate', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-009-S04', 'Check level/moisture/cleanliness', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-009-S05', 'Apply finish system', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-009-S06', 'Control joint/edge/detail treatment', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-009-S07', 'Protect completed finish', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-009-S08', 'Inspect surface quality', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-009-S09', 'Rectify defects', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-009-S10', 'Handover area', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Substrate approved before finish', true, 1),
    (v_template_id, 'Sample/mock-up matched', true, 2),
    (v_template_id, 'Flatness/levelness checked', true, 3),
    (v_template_id, 'Color, texture and joint quality checked', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-010 — Stone Finish Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-010', 'ARC', 'Construction', 'ARC-010', 'Stone Finish Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-010-S01', 'Review approved finish schedule', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-010-S02', 'Confirm approved sample/mock-up', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-010-S03', 'Prepare substrate', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-010-S04', 'Check level/moisture/cleanliness', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-010-S05', 'Apply finish system', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-010-S06', 'Control joint/edge/detail treatment', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-010-S07', 'Protect completed finish', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-010-S08', 'Inspect surface quality', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-010-S09', 'Rectify defects', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-010-S10', 'Handover area', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Substrate approved before finish', true, 1),
    (v_template_id, 'Sample/mock-up matched', true, 2),
    (v_template_id, 'Flatness/levelness checked', true, 3),
    (v_template_id, 'Color, texture and joint quality checked', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-011 — Floor Finish Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-011', 'ARC', 'Construction', 'ARC-011', 'Floor Finish Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-011-S01', 'Review approved finish schedule', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-011-S02', 'Confirm approved sample/mock-up', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-011-S03', 'Prepare substrate', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-011-S04', 'Check level/moisture/cleanliness', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-011-S05', 'Apply finish system', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-011-S06', 'Control joint/edge/detail treatment', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-011-S07', 'Protect completed finish', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-011-S08', 'Inspect surface quality', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-011-S09', 'Rectify defects', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-011-S10', 'Handover area', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Substrate approved before finish', true, 1),
    (v_template_id, 'Sample/mock-up matched', true, 2),
    (v_template_id, 'Flatness/levelness checked', true, 3),
    (v_template_id, 'Color, texture and joint quality checked', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-012 — Raised Floor Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-012', 'ARC', 'Construction', 'ARC-012', 'Raised Floor Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-012-S01', 'Review approved finish schedule', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-012-S02', 'Confirm approved sample/mock-up', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-012-S03', 'Prepare substrate', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-012-S04', 'Check level/moisture/cleanliness', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-012-S05', 'Apply finish system', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-012-S06', 'Control joint/edge/detail treatment', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-012-S07', 'Protect completed finish', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-012-S08', 'Inspect surface quality', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-012-S09', 'Rectify defects', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-012-S10', 'Handover area', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Substrate approved before finish', true, 1),
    (v_template_id, 'Sample/mock-up matched', true, 2),
    (v_template_id, 'Flatness/levelness checked', true, 3),
    (v_template_id, 'Color, texture and joint quality checked', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-013 — Ceiling Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-013', 'ARC', 'Construction', 'ARC-013', 'Ceiling Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-013-S01', 'Review reflected ceiling plan', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-013-S02', 'Confirm material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-013-S03', 'Set out ceiling level and grid', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-013-S04', 'Install hangers/supports', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-013-S05', 'Coordinate MEP services/openings', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-013-S06', 'Install framing/grid', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-013-S07', 'Install ceiling boards/panels', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-013-S08', 'Jointing/access panel installation', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-013-S09', 'Final alignment inspection', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-013-S10', 'Close ceiling after MEP clearance', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Ceiling level checked', true, 1),
    (v_template_id, 'Hanger spacing checked', true, 2),
    (v_template_id, 'MEP clearance accepted', true, 3),
    (v_template_id, 'Panel alignment and joint quality checked', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-014 — Suspended Ceiling Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-014', 'ARC', 'Construction', 'ARC-014', 'Suspended Ceiling Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-014-S01', 'Review reflected ceiling plan', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-014-S02', 'Confirm material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-014-S03', 'Set out ceiling level and grid', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-014-S04', 'Install hangers/supports', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-014-S05', 'Coordinate MEP services/openings', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-014-S06', 'Install framing/grid', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-014-S07', 'Install ceiling boards/panels', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-014-S08', 'Jointing/access panel installation', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-014-S09', 'Final alignment inspection', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-014-S10', 'Close ceiling after MEP clearance', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Ceiling level checked', true, 1),
    (v_template_id, 'Hanger spacing checked', true, 2),
    (v_template_id, 'MEP clearance accepted', true, 3),
    (v_template_id, 'Panel alignment and joint quality checked', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-015 — Gypsum Ceiling Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-015', 'ARC', 'Construction', 'ARC-015', 'Gypsum Ceiling Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-015-S01', 'Review reflected ceiling plan', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-015-S02', 'Confirm material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-015-S03', 'Set out ceiling level and grid', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-015-S04', 'Install hangers/supports', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-015-S05', 'Coordinate MEP services/openings', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-015-S06', 'Install framing/grid', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-015-S07', 'Install ceiling boards/panels', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-015-S08', 'Jointing/access panel installation', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-015-S09', 'Final alignment inspection', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-015-S10', 'Close ceiling after MEP clearance', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Ceiling level checked', true, 1),
    (v_template_id, 'Hanger spacing checked', true, 2),
    (v_template_id, 'MEP clearance accepted', true, 3),
    (v_template_id, 'Panel alignment and joint quality checked', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-016 — Acoustic Ceiling Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-016', 'ARC', 'Construction', 'ARC-016', 'Acoustic Ceiling Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-016-S01', 'Review reflected ceiling plan', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-016-S02', 'Confirm material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-016-S03', 'Set out ceiling level and grid', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-016-S04', 'Install hangers/supports', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-016-S05', 'Coordinate MEP services/openings', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-016-S06', 'Install framing/grid', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-016-S07', 'Install ceiling boards/panels', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-016-S08', 'Jointing/access panel installation', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-016-S09', 'Final alignment inspection', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-016-S10', 'Close ceiling after MEP clearance', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Ceiling level checked', true, 1),
    (v_template_id, 'Hanger spacing checked', true, 2),
    (v_template_id, 'MEP clearance accepted', true, 3),
    (v_template_id, 'Panel alignment and joint quality checked', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-017 — Door Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-017', 'ARC', 'Construction', 'ARC-017', 'Door Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-017-S01', 'Review approved schedule/shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-017-S02', 'Check delivered frame/leaf/glass/hardware', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-017-S03', 'Verify opening size and readiness', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-017-S04', 'Install frame', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-017-S05', 'Align, plumb and fix anchors', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-017-S06', 'Install leaf/glass/accessories', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-017-S07', 'Apply sealant/grout', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-017-S08', 'Install hardware/ironmongery', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-017-S09', 'Functional test', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-017-S10', 'Final inspection and protection', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Opening dimension checked', true, 1),
    (v_template_id, 'Frame plumb and level checked', true, 2),
    (v_template_id, 'Gap and swing/sliding operation checked', true, 3),
    (v_template_id, 'Fire rating/accessory compliance if applicable', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-018 — Fire Rated Door Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-018', 'ARC', 'Construction', 'ARC-018', 'Fire Rated Door Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-018-S01', 'Review approved schedule/shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-018-S02', 'Check delivered frame/leaf/glass/hardware', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-018-S03', 'Verify opening size and readiness', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-018-S04', 'Install frame', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-018-S05', 'Align, plumb and fix anchors', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-018-S06', 'Install leaf/glass/accessories', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-018-S07', 'Apply sealant/grout', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-018-S08', 'Install hardware/ironmongery', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-018-S09', 'Functional test', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-018-S10', 'Final inspection and protection', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Opening dimension checked', true, 1),
    (v_template_id, 'Frame plumb and level checked', true, 2),
    (v_template_id, 'Gap and swing/sliding operation checked', true, 3),
    (v_template_id, 'Fire rating/accessory compliance if applicable', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-019 — Window Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-019', 'ARC', 'Construction', 'ARC-019', 'Window Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-019-S01', 'Review approved schedule/shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-019-S02', 'Check delivered frame/leaf/glass/hardware', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-019-S03', 'Verify opening size and readiness', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-019-S04', 'Install frame', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-019-S05', 'Align, plumb and fix anchors', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-019-S06', 'Install leaf/glass/accessories', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-019-S07', 'Apply sealant/grout', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-019-S08', 'Install hardware/ironmongery', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-019-S09', 'Functional test', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-019-S10', 'Final inspection and protection', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Opening dimension checked', true, 1),
    (v_template_id, 'Frame plumb and level checked', true, 2),
    (v_template_id, 'Gap and swing/sliding operation checked', true, 3),
    (v_template_id, 'Fire rating/accessory compliance if applicable', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-020 — Louvers Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-020', 'ARC', 'Construction', 'ARC-020', 'Louvers Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-020-S01', 'Review approved façade/shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-020-S02', 'Check material/sample approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-020-S03', 'Survey opening/support structure', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-020-S04', 'Install brackets/anchors', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-020-S05', 'Install frame/subframe', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-020-S06', 'Install panels/glass/louvers', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-020-S07', 'Apply sealant/gasket/flashing', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-020-S08', 'Waterproofing/interface check', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-020-S09', 'Final alignment and water test if required', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-020-S10', 'Submit inspection record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Anchor pull-out/test record if required', true, 1),
    (v_template_id, 'Alignment and joint width checked', true, 2),
    (v_template_id, 'Sealant/gasket continuity checked', true, 3),
    (v_template_id, 'Water test passed where applicable', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-021 — Handrail Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-021', 'ARC', 'Construction', 'ARC-021', 'Handrail Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-021-S01', 'Review approved detail', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-021-S02', 'Survey fixing location', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-021-S03', 'Check material/finish approval', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-021-S04', 'Install brackets/posts', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-021-S05', 'Install rail panels/member', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-021-S06', 'Check height, spacing and alignment', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-021-S07', 'Tighten/fix anchors', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-021-S08', 'Touch up finish', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-021-S09', 'Load/stability check if required', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-021-S10', 'Final inspection', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Height and spacing checked', true, 1),
    (v_template_id, 'Anchor fixing checked', true, 2),
    (v_template_id, 'Alignment and finish checked', true, 3);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-022 — Guardrail Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-022', 'ARC', 'Construction', 'ARC-022', 'Guardrail Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-022-S01', 'Review approved detail', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-022-S02', 'Survey fixing location', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-022-S03', 'Check material/finish approval', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-022-S04', 'Install brackets/posts', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-022-S05', 'Install rail panels/member', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-022-S06', 'Check height, spacing and alignment', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-022-S07', 'Tighten/fix anchors', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-022-S08', 'Touch up finish', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-022-S09', 'Load/stability check if required', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-022-S10', 'Final inspection', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Height and spacing checked', true, 1),
    (v_template_id, 'Anchor fixing checked', true, 2),
    (v_template_id, 'Alignment and finish checked', true, 3);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-023 — Stair Finishing Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-023', 'ARC', 'Construction', 'ARC-023', 'Stair Finishing Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-023-S01', 'Review approved finish schedule', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-023-S02', 'Confirm approved sample/mock-up', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-023-S03', 'Prepare substrate', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-023-S04', 'Check level/moisture/cleanliness', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-023-S05', 'Apply finish system', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-023-S06', 'Control joint/edge/detail treatment', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-023-S07', 'Protect completed finish', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-023-S08', 'Inspect surface quality', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-023-S09', 'Rectify defects', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-023-S10', 'Handover area', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Substrate approved before finish', true, 1),
    (v_template_id, 'Sample/mock-up matched', true, 2),
    (v_template_id, 'Flatness/levelness checked', true, 3),
    (v_template_id, 'Color, texture and joint quality checked', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-024 — Skirting Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-024', 'ARC', 'Construction', 'ARC-024', 'Skirting Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-024-S01', 'Review approved finish schedule', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-024-S02', 'Confirm approved sample/mock-up', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-024-S03', 'Prepare substrate', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-024-S04', 'Check level/moisture/cleanliness', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-024-S05', 'Apply finish system', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-024-S06', 'Control joint/edge/detail treatment', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-024-S07', 'Protect completed finish', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-024-S08', 'Inspect surface quality', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-024-S09', 'Rectify defects', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-024-S10', 'Handover area', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Substrate approved before finish', true, 1),
    (v_template_id, 'Sample/mock-up matched', true, 2),
    (v_template_id, 'Flatness/levelness checked', true, 3),
    (v_template_id, 'Color, texture and joint quality checked', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-025 — Waterproofing Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-025', 'ARC', 'Construction', 'ARC-025', 'Waterproofing Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-025-S01', 'Review approved detail and material', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-025-S02', 'Prepare substrate', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-025-S03', 'Check dryness/cleanliness', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-025-S04', 'Apply primer if required', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-025-S05', 'Install membrane/sealant/insulation/joint cover', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-025-S06', 'Treat corners/penetrations/laps', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-025-S07', 'Protect installed work', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-025-S08', 'Carry out test if required', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-025-S09', 'Rectify leaks/defects', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-025-S10', 'Submit warranty/test record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Substrate accepted', true, 1),
    (v_template_id, 'Lap/joint/penetration treatment checked', true, 2),
    (v_template_id, 'Flood/water test passed where required', true, 3),
    (v_template_id, 'Protection layer completed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-026 — Roof Waterproofing Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-026', 'ARC', 'Construction', 'ARC-026', 'Roof Waterproofing Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-026-S01', 'Review approved detail and material', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-026-S02', 'Prepare substrate', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-026-S03', 'Check dryness/cleanliness', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-026-S04', 'Apply primer if required', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-026-S05', 'Install membrane/sealant/insulation/joint cover', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-026-S06', 'Treat corners/penetrations/laps', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-026-S07', 'Protect installed work', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-026-S08', 'Carry out test if required', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-026-S09', 'Rectify leaks/defects', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-026-S10', 'Submit warranty/test record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Substrate accepted', true, 1),
    (v_template_id, 'Lap/joint/penetration treatment checked', true, 2),
    (v_template_id, 'Flood/water test passed where required', true, 3),
    (v_template_id, 'Protection layer completed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-027 — Insulation Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-027', 'ARC', 'Construction', 'ARC-027', 'Insulation Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-027-S01', 'Review approved detail and material', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-027-S02', 'Prepare substrate', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-027-S03', 'Check dryness/cleanliness', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-027-S04', 'Apply primer if required', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-027-S05', 'Install membrane/sealant/insulation/joint cover', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-027-S06', 'Treat corners/penetrations/laps', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-027-S07', 'Protect installed work', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-027-S08', 'Carry out test if required', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-027-S09', 'Rectify leaks/defects', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-027-S10', 'Submit warranty/test record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Substrate accepted', true, 1),
    (v_template_id, 'Lap/joint/penetration treatment checked', true, 2),
    (v_template_id, 'Flood/water test passed where required', true, 3),
    (v_template_id, 'Protection layer completed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-028 — Thermal Insulation Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-028', 'ARC', 'Construction', 'ARC-028', 'Thermal Insulation Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-028-S01', 'Review approved detail and material', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-028-S02', 'Prepare substrate', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-028-S03', 'Check dryness/cleanliness', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-028-S04', 'Apply primer if required', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-028-S05', 'Install membrane/sealant/insulation/joint cover', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-028-S06', 'Treat corners/penetrations/laps', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-028-S07', 'Protect installed work', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-028-S08', 'Carry out test if required', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-028-S09', 'Rectify leaks/defects', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-028-S10', 'Submit warranty/test record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Substrate accepted', true, 1),
    (v_template_id, 'Lap/joint/penetration treatment checked', true, 2),
    (v_template_id, 'Flood/water test passed where required', true, 3),
    (v_template_id, 'Protection layer completed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-029 — Acoustic Insulation Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-029', 'ARC', 'Construction', 'ARC-029', 'Acoustic Insulation Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-029-S01', 'Review approved detail and material', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-029-S02', 'Prepare substrate', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-029-S03', 'Check dryness/cleanliness', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-029-S04', 'Apply primer if required', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-029-S05', 'Install membrane/sealant/insulation/joint cover', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-029-S06', 'Treat corners/penetrations/laps', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-029-S07', 'Protect installed work', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-029-S08', 'Carry out test if required', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-029-S09', 'Rectify leaks/defects', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-029-S10', 'Submit warranty/test record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Substrate accepted', true, 1),
    (v_template_id, 'Lap/joint/penetration treatment checked', true, 2),
    (v_template_id, 'Flood/water test passed where required', true, 3),
    (v_template_id, 'Protection layer completed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-030 — Expansion Joint Cover Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-030', 'ARC', 'Construction', 'ARC-030', 'Expansion Joint Cover Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-030-S01', 'Review approved detail and material', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-030-S02', 'Prepare substrate', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-030-S03', 'Check dryness/cleanliness', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-030-S04', 'Apply primer if required', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-030-S05', 'Install membrane/sealant/insulation/joint cover', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-030-S06', 'Treat corners/penetrations/laps', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-030-S07', 'Protect installed work', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-030-S08', 'Carry out test if required', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-030-S09', 'Rectify leaks/defects', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-030-S10', 'Submit warranty/test record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Substrate accepted', true, 1),
    (v_template_id, 'Lap/joint/penetration treatment checked', true, 2),
    (v_template_id, 'Flood/water test passed where required', true, 3),
    (v_template_id, 'Protection layer completed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-031 — Sealant Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-031', 'ARC', 'Construction', 'ARC-031', 'Sealant Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-031-S01', 'Review approved detail and material', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-031-S02', 'Prepare substrate', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-031-S03', 'Check dryness/cleanliness', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-031-S04', 'Apply primer if required', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-031-S05', 'Install membrane/sealant/insulation/joint cover', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-031-S06', 'Treat corners/penetrations/laps', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-031-S07', 'Protect installed work', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-031-S08', 'Carry out test if required', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-031-S09', 'Rectify leaks/defects', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-031-S10', 'Submit warranty/test record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Substrate accepted', true, 1),
    (v_template_id, 'Lap/joint/penetration treatment checked', true, 2),
    (v_template_id, 'Flood/water test passed where required', true, 3),
    (v_template_id, 'Protection layer completed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-032 — Façade System Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-032', 'ARC', 'Construction', 'ARC-032', 'Façade System Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-032-S01', 'Review approved façade/shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-032-S02', 'Check material/sample approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-032-S03', 'Survey opening/support structure', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-032-S04', 'Install brackets/anchors', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-032-S05', 'Install frame/subframe', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-032-S06', 'Install panels/glass/louvers', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-032-S07', 'Apply sealant/gasket/flashing', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-032-S08', 'Waterproofing/interface check', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-032-S09', 'Final alignment and water test if required', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-032-S10', 'Submit inspection record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Anchor pull-out/test record if required', true, 1),
    (v_template_id, 'Alignment and joint width checked', true, 2),
    (v_template_id, 'Sealant/gasket continuity checked', true, 3),
    (v_template_id, 'Water test passed where applicable', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-033 — Canopy Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-033', 'ARC', 'Construction', 'ARC-033', 'Canopy Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-033-S01', 'Review approved façade/shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-033-S02', 'Check material/sample approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-033-S03', 'Survey opening/support structure', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-033-S04', 'Install brackets/anchors', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-033-S05', 'Install frame/subframe', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-033-S06', 'Install panels/glass/louvers', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-033-S07', 'Apply sealant/gasket/flashing', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-033-S08', 'Waterproofing/interface check', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-033-S09', 'Final alignment and water test if required', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-033-S10', 'Submit inspection record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Anchor pull-out/test record if required', true, 1),
    (v_template_id, 'Alignment and joint width checked', true, 2),
    (v_template_id, 'Sealant/gasket continuity checked', true, 3),
    (v_template_id, 'Water test passed where applicable', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-034 — Roof Tile Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-034', 'ARC', 'Construction', 'ARC-034', 'Roof Tile Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-034-S01', 'Review approved finish schedule', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-034-S02', 'Confirm approved sample/mock-up', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-034-S03', 'Prepare substrate', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-034-S04', 'Check level/moisture/cleanliness', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-034-S05', 'Apply finish system', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-034-S06', 'Control joint/edge/detail treatment', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-034-S07', 'Protect completed finish', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-034-S08', 'Inspect surface quality', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-034-S09', 'Rectify defects', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-034-S10', 'Handover area', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Substrate approved before finish', true, 1),
    (v_template_id, 'Sample/mock-up matched', true, 2),
    (v_template_id, 'Flatness/levelness checked', true, 3),
    (v_template_id, 'Color, texture and joint quality checked', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-035 — False Ceiling Panel Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-035', 'ARC', 'Construction', 'ARC-035', 'False Ceiling Panel Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-035-S01', 'Review reflected ceiling plan', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-035-S02', 'Confirm material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-035-S03', 'Set out ceiling level and grid', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-035-S04', 'Install hangers/supports', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-035-S05', 'Coordinate MEP services/openings', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-035-S06', 'Install framing/grid', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-035-S07', 'Install ceiling boards/panels', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-035-S08', 'Jointing/access panel installation', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-035-S09', 'Final alignment inspection', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-035-S10', 'Close ceiling after MEP clearance', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Ceiling level checked', true, 1),
    (v_template_id, 'Hanger spacing checked', true, 2),
    (v_template_id, 'MEP clearance accepted', true, 3),
    (v_template_id, 'Panel alignment and joint quality checked', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-036 — Built-in Furniture Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-036', 'ARC', 'Construction', 'ARC-036', 'Built-in Furniture Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-036-S01', 'Review approved layout/shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-036-S02', 'Confirm material/sample approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-036-S03', 'Check site readiness', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-036-S04', 'Set out installation location', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-036-S05', 'Install item/system', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-036-S06', 'Coordinate interface with finishes/MEP', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-036-S07', 'Clean and protect work', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-036-S08', 'Functional/visual inspection', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-036-S09', 'Rectify comments', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-036-S10', 'Handover', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check approved sample/material', true, 1),
    (v_template_id, 'Check line, level, plumb, alignment and finish', true, 2),
    (v_template_id, 'Verify dimensions/openings/interfaces', true, 3),
    (v_template_id, 'Final visual inspection before handover', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-037 — Sanitary Partition Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-037', 'ARC', 'Construction', 'ARC-037', 'Sanitary Partition Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-037-S01', 'Review approved layout/shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-037-S02', 'Confirm material/sample approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-037-S03', 'Check site readiness', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-037-S04', 'Set out installation location', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-037-S05', 'Install item/system', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-037-S06', 'Coordinate interface with finishes/MEP', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-037-S07', 'Clean and protect work', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-037-S08', 'Functional/visual inspection', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-037-S09', 'Rectify comments', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-037-S10', 'Handover', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check approved sample/material', true, 1),
    (v_template_id, 'Check line, level, plumb, alignment and finish', true, 2),
    (v_template_id, 'Verify dimensions/openings/interfaces', true, 3),
    (v_template_id, 'Final visual inspection before handover', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-038 — Signage Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-038', 'ARC', 'Construction', 'ARC-038', 'Signage Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-038-S01', 'Review approved layout/shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-038-S02', 'Confirm material/sample approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-038-S03', 'Check site readiness', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-038-S04', 'Set out installation location', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-038-S05', 'Install item/system', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-038-S06', 'Coordinate interface with finishes/MEP', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-038-S07', 'Clean and protect work', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-038-S08', 'Functional/visual inspection', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-038-S09', 'Rectify comments', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-038-S10', 'Handover', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check approved sample/material', true, 1),
    (v_template_id, 'Check line, level, plumb, alignment and finish', true, 2),
    (v_template_id, 'Verify dimensions/openings/interfaces', true, 3),
    (v_template_id, 'Final visual inspection before handover', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-039 — External Works Finishes Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-039', 'ARC', 'Construction', 'ARC-039', 'External Works Finishes Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-039-S01', 'Review approved finish schedule', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-039-S02', 'Confirm approved sample/mock-up', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-039-S03', 'Prepare substrate', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-039-S04', 'Check level/moisture/cleanliness', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-039-S05', 'Apply finish system', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-039-S06', 'Control joint/edge/detail treatment', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-039-S07', 'Protect completed finish', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-039-S08', 'Inspect surface quality', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-039-S09', 'Rectify defects', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-039-S10', 'Handover area', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Substrate approved before finish', true, 1),
    (v_template_id, 'Sample/mock-up matched', true, 2),
    (v_template_id, 'Flatness/levelness checked', true, 3),
    (v_template_id, 'Color, texture and joint quality checked', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- ARC-040 — Landscape Elements Work Package
-- Discipline: ARC | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('ARC-040', 'ARC', 'Construction', 'ARC-040', 'Landscape Elements Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'ARC-040-S01', 'Review approved layout/shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'ARC-040-S02', 'Confirm material/sample approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'ARC-040-S03', 'Check site readiness', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'ARC-040-S04', 'Set out installation location', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'ARC-040-S05', 'Install item/system', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'ARC-040-S06', 'Coordinate interface with finishes/MEP', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'ARC-040-S07', 'Clean and protect work', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'ARC-040-S08', 'Functional/visual inspection', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'ARC-040-S09', 'Rectify comments', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'ARC-040-S10', 'Handover', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check approved sample/material', true, 1),
    (v_template_id, 'Check line, level, plumb, alignment and finish', true, 2),
    (v_template_id, 'Verify dimensions/openings/interfaces', true, 3),
    (v_template_id, 'Final visual inspection before handover', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved architectural drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP/checklist', true, 4),
    (v_template_id, 'Manufacturer data sheet where applicable', true, 5);

END $$;


-- ============================================================
-- MEP-001 — Transformer Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-001', 'MEP', 'Construction', 'MEP-001', 'Transformer Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-001-S01', 'Review approved shop drawing and load schedule', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-001-S02', 'Confirm equipment/material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-001-S03', 'Prepare room/plinth/support and access clearance', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-001-S04', 'Deliver and inspect equipment', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-001-S05', 'Install equipment in position', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-001-S06', 'Connect power/control/earthing', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-001-S07', 'Label circuits/equipment', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-001-S08', 'Pre-commissioning inspection', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-001-S09', 'Testing and commissioning', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-001-S10', 'Submit test certificate and O&M data', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Equipment rating/nameplate checked', true, 1),
    (v_template_id, 'Clearance and ventilation checked', true, 2),
    (v_template_id, 'Earthing/termination checked', true, 3),
    (v_template_id, 'Functional test passed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-002 — Generator Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-002', 'MEP', 'Construction', 'MEP-002', 'Generator Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-002-S01', 'Review approved shop drawing and load schedule', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-002-S02', 'Confirm equipment/material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-002-S03', 'Prepare room/plinth/support and access clearance', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-002-S04', 'Deliver and inspect equipment', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-002-S05', 'Install equipment in position', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-002-S06', 'Connect power/control/earthing', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-002-S07', 'Label circuits/equipment', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-002-S08', 'Pre-commissioning inspection', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-002-S09', 'Testing and commissioning', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-002-S10', 'Submit test certificate and O&M data', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Equipment rating/nameplate checked', true, 1),
    (v_template_id, 'Clearance and ventilation checked', true, 2),
    (v_template_id, 'Earthing/termination checked', true, 3),
    (v_template_id, 'Functional test passed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-003 — Main Distribution Board Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-003', 'MEP', 'Construction', 'MEP-003', 'Main Distribution Board Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-003-S01', 'Review approved shop drawing and load schedule', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-003-S02', 'Confirm equipment/material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-003-S03', 'Prepare room/plinth/support and access clearance', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-003-S04', 'Deliver and inspect equipment', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-003-S05', 'Install equipment in position', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-003-S06', 'Connect power/control/earthing', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-003-S07', 'Label circuits/equipment', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-003-S08', 'Pre-commissioning inspection', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-003-S09', 'Testing and commissioning', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-003-S10', 'Submit test certificate and O&M data', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Equipment rating/nameplate checked', true, 1),
    (v_template_id, 'Clearance and ventilation checked', true, 2),
    (v_template_id, 'Earthing/termination checked', true, 3),
    (v_template_id, 'Functional test passed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-004 — Sub Distribution Board Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-004', 'MEP', 'Construction', 'MEP-004', 'Sub Distribution Board Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-004-S01', 'Review approved shop drawing and load schedule', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-004-S02', 'Confirm equipment/material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-004-S03', 'Prepare room/plinth/support and access clearance', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-004-S04', 'Deliver and inspect equipment', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-004-S05', 'Install equipment in position', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-004-S06', 'Connect power/control/earthing', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-004-S07', 'Label circuits/equipment', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-004-S08', 'Pre-commissioning inspection', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-004-S09', 'Testing and commissioning', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-004-S10', 'Submit test certificate and O&M data', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Equipment rating/nameplate checked', true, 1),
    (v_template_id, 'Clearance and ventilation checked', true, 2),
    (v_template_id, 'Earthing/termination checked', true, 3),
    (v_template_id, 'Functional test passed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-005 — Cable Tray Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-005', 'MEP', 'Construction', 'MEP-005', 'Cable Tray Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-005-S01', 'Review approved routing/shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-005-S02', 'Confirm material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-005-S03', 'Set out route and support spacing', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-005-S04', 'Install supports/brackets', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-005-S05', 'Install tray/ladder or conduit path', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-005-S06', 'Pull/install cable', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-005-S07', 'Dress and secure cable', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-005-S08', 'Terminate cable ends', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-005-S09', 'Label cable and circuit', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-005-S10', 'Test continuity/IR/fiber test and submit record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Support spacing and fixing checked', true, 1),
    (v_template_id, 'Cable bend radius checked', true, 2),
    (v_template_id, 'Cable identification checked', true, 3),
    (v_template_id, 'Continuity/insulation/fiber test passed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-006 — Cable Ladder Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-006', 'MEP', 'Construction', 'MEP-006', 'Cable Ladder Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-006-S01', 'Review approved routing/shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-006-S02', 'Confirm material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-006-S03', 'Set out route and support spacing', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-006-S04', 'Install supports/brackets', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-006-S05', 'Install tray/ladder or conduit path', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-006-S06', 'Pull/install cable', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-006-S07', 'Dress and secure cable', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-006-S08', 'Terminate cable ends', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-006-S09', 'Label cable and circuit', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-006-S10', 'Test continuity/IR/fiber test and submit record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Support spacing and fixing checked', true, 1),
    (v_template_id, 'Cable bend radius checked', true, 2),
    (v_template_id, 'Cable identification checked', true, 3),
    (v_template_id, 'Continuity/insulation/fiber test passed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-007 — Power Cable Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-007', 'MEP', 'Construction', 'MEP-007', 'Power Cable Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-007-S01', 'Review approved routing/shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-007-S02', 'Confirm material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-007-S03', 'Set out route and support spacing', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-007-S04', 'Install supports/brackets', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-007-S05', 'Install tray/ladder or conduit path', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-007-S06', 'Pull/install cable', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-007-S07', 'Dress and secure cable', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-007-S08', 'Terminate cable ends', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-007-S09', 'Label cable and circuit', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-007-S10', 'Test continuity/IR/fiber test and submit record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Support spacing and fixing checked', true, 1),
    (v_template_id, 'Cable bend radius checked', true, 2),
    (v_template_id, 'Cable identification checked', true, 3),
    (v_template_id, 'Continuity/insulation/fiber test passed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-008 — Lighting Fixture Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-008', 'MEP', 'Construction', 'MEP-008', 'Lighting Fixture Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-008-S01', 'Review approved layout and circuit drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-008-S02', 'Confirm material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-008-S03', 'Set out device/equipment location', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-008-S04', 'Install containment/conduit/support', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-008-S05', 'Install device/equipment', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-008-S06', 'Connect wiring/earthing', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-008-S07', 'Label circuit/device', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-008-S08', 'Test operation/continuity', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-008-S09', 'Rectify comments', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-008-S10', 'Submit inspection and test record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Device location/height checked', true, 1),
    (v_template_id, 'Wiring polarity/continuity checked', true, 2),
    (v_template_id, 'Earthing checked', true, 3),
    (v_template_id, 'Functional test passed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-009 — Emergency Lighting Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-009', 'MEP', 'Construction', 'MEP-009', 'Emergency Lighting Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-009-S01', 'Review approved layout and circuit drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-009-S02', 'Confirm material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-009-S03', 'Set out device/equipment location', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-009-S04', 'Install containment/conduit/support', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-009-S05', 'Install device/equipment', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-009-S06', 'Connect wiring/earthing', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-009-S07', 'Label circuit/device', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-009-S08', 'Test operation/continuity', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-009-S09', 'Rectify comments', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-009-S10', 'Submit inspection and test record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Device location/height checked', true, 1),
    (v_template_id, 'Wiring polarity/continuity checked', true, 2),
    (v_template_id, 'Earthing checked', true, 3),
    (v_template_id, 'Functional test passed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-010 — Socket Outlet Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-010', 'MEP', 'Construction', 'MEP-010', 'Socket Outlet Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-010-S01', 'Review approved layout and circuit drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-010-S02', 'Confirm material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-010-S03', 'Set out device/equipment location', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-010-S04', 'Install containment/conduit/support', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-010-S05', 'Install device/equipment', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-010-S06', 'Connect wiring/earthing', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-010-S07', 'Label circuit/device', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-010-S08', 'Test operation/continuity', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-010-S09', 'Rectify comments', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-010-S10', 'Submit inspection and test record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Device location/height checked', true, 1),
    (v_template_id, 'Wiring polarity/continuity checked', true, 2),
    (v_template_id, 'Earthing checked', true, 3),
    (v_template_id, 'Functional test passed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-011 — Switch Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-011', 'MEP', 'Construction', 'MEP-011', 'Switch Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-011-S01', 'Review approved layout and circuit drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-011-S02', 'Confirm material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-011-S03', 'Set out device/equipment location', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-011-S04', 'Install containment/conduit/support', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-011-S05', 'Install device/equipment', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-011-S06', 'Connect wiring/earthing', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-011-S07', 'Label circuit/device', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-011-S08', 'Test operation/continuity', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-011-S09', 'Rectify comments', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-011-S10', 'Submit inspection and test record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Device location/height checked', true, 1),
    (v_template_id, 'Wiring polarity/continuity checked', true, 2),
    (v_template_id, 'Earthing checked', true, 3),
    (v_template_id, 'Functional test passed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-012 — Earthing System Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-012', 'MEP', 'Construction', 'MEP-012', 'Earthing System Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-012-S01', 'Review approved layout and circuit drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-012-S02', 'Confirm material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-012-S03', 'Set out device/equipment location', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-012-S04', 'Install containment/conduit/support', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-012-S05', 'Install device/equipment', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-012-S06', 'Connect wiring/earthing', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-012-S07', 'Label circuit/device', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-012-S08', 'Test operation/continuity', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-012-S09', 'Rectify comments', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-012-S10', 'Submit inspection and test record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Device location/height checked', true, 1),
    (v_template_id, 'Wiring polarity/continuity checked', true, 2),
    (v_template_id, 'Earthing checked', true, 3),
    (v_template_id, 'Functional test passed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-013 — Lightning Protection Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-013', 'MEP', 'Construction', 'MEP-013', 'Lightning Protection Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-013-S01', 'Review approved layout and circuit drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-013-S02', 'Confirm material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-013-S03', 'Set out device/equipment location', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-013-S04', 'Install containment/conduit/support', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-013-S05', 'Install device/equipment', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-013-S06', 'Connect wiring/earthing', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-013-S07', 'Label circuit/device', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-013-S08', 'Test operation/continuity', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-013-S09', 'Rectify comments', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-013-S10', 'Submit inspection and test record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Device location/height checked', true, 1),
    (v_template_id, 'Wiring polarity/continuity checked', true, 2),
    (v_template_id, 'Earthing checked', true, 3),
    (v_template_id, 'Functional test passed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-014 — UPS System Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-014', 'MEP', 'Construction', 'MEP-014', 'UPS System Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-014-S01', 'Review approved shop drawing and load schedule', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-014-S02', 'Confirm equipment/material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-014-S03', 'Prepare room/plinth/support and access clearance', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-014-S04', 'Deliver and inspect equipment', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-014-S05', 'Install equipment in position', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-014-S06', 'Connect power/control/earthing', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-014-S07', 'Label circuits/equipment', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-014-S08', 'Pre-commissioning inspection', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-014-S09', 'Testing and commissioning', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-014-S10', 'Submit test certificate and O&M data', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Equipment rating/nameplate checked', true, 1),
    (v_template_id, 'Clearance and ventilation checked', true, 2),
    (v_template_id, 'Earthing/termination checked', true, 3),
    (v_template_id, 'Functional test passed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-015 — Solar Panel System Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-015', 'MEP', 'Construction', 'MEP-015', 'Solar Panel System Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-015-S01', 'Review approved shop drawing and load schedule', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-015-S02', 'Confirm equipment/material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-015-S03', 'Prepare room/plinth/support and access clearance', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-015-S04', 'Deliver and inspect equipment', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-015-S05', 'Install equipment in position', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-015-S06', 'Connect power/control/earthing', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-015-S07', 'Label circuits/equipment', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-015-S08', 'Pre-commissioning inspection', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-015-S09', 'Testing and commissioning', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-015-S10', 'Submit test certificate and O&M data', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Equipment rating/nameplate checked', true, 1),
    (v_template_id, 'Clearance and ventilation checked', true, 2),
    (v_template_id, 'Earthing/termination checked', true, 3),
    (v_template_id, 'Functional test passed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-020 — Chiller Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-020', 'MEP', 'Construction', 'MEP-020', 'Chiller Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-020-S01', 'Review approved equipment schedule/shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-020-S02', 'Confirm equipment approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-020-S03', 'Prepare plinth/support/base and access clearance', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-020-S04', 'Deliver and inspect equipment', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-020-S05', 'Install and align equipment', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-020-S06', 'Connect pipe/duct/cable/control', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-020-S07', 'Check vibration isolation and drainage', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-020-S08', 'Pre-commissioning inspection', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-020-S09', 'Testing and commissioning', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-020-S10', 'Submit test certificate/O&M data', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Equipment rating checked', true, 1),
    (v_template_id, 'Alignment and support checked', true, 2),
    (v_template_id, 'Flexible connection/vibration isolation checked', true, 3),
    (v_template_id, 'Functional performance test passed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-021 — Cooling Tower Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-021', 'MEP', 'Construction', 'MEP-021', 'Cooling Tower Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-021-S01', 'Review approved equipment schedule/shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-021-S02', 'Confirm equipment approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-021-S03', 'Prepare plinth/support/base and access clearance', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-021-S04', 'Deliver and inspect equipment', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-021-S05', 'Install and align equipment', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-021-S06', 'Connect pipe/duct/cable/control', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-021-S07', 'Check vibration isolation and drainage', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-021-S08', 'Pre-commissioning inspection', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-021-S09', 'Testing and commissioning', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-021-S10', 'Submit test certificate/O&M data', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Equipment rating checked', true, 1),
    (v_template_id, 'Alignment and support checked', true, 2),
    (v_template_id, 'Flexible connection/vibration isolation checked', true, 3),
    (v_template_id, 'Functional performance test passed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-022 — AHU (Air Handling Unit) Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-022', 'MEP', 'Construction', 'MEP-022', 'AHU (Air Handling Unit) Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-022-S01', 'Review approved equipment schedule/shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-022-S02', 'Confirm equipment approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-022-S03', 'Prepare plinth/support/base and access clearance', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-022-S04', 'Deliver and inspect equipment', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-022-S05', 'Install and align equipment', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-022-S06', 'Connect pipe/duct/cable/control', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-022-S07', 'Check vibration isolation and drainage', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-022-S08', 'Pre-commissioning inspection', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-022-S09', 'Testing and commissioning', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-022-S10', 'Submit test certificate/O&M data', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Equipment rating checked', true, 1),
    (v_template_id, 'Alignment and support checked', true, 2),
    (v_template_id, 'Flexible connection/vibration isolation checked', true, 3),
    (v_template_id, 'Functional performance test passed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-023 — FCU (Fan Coil Unit) Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-023', 'MEP', 'Construction', 'MEP-023', 'FCU (Fan Coil Unit) Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-023-S01', 'Review approved equipment schedule/shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-023-S02', 'Confirm equipment approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-023-S03', 'Prepare plinth/support/base and access clearance', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-023-S04', 'Deliver and inspect equipment', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-023-S05', 'Install and align equipment', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-023-S06', 'Connect pipe/duct/cable/control', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-023-S07', 'Check vibration isolation and drainage', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-023-S08', 'Pre-commissioning inspection', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-023-S09', 'Testing and commissioning', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-023-S10', 'Submit test certificate/O&M data', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Equipment rating checked', true, 1),
    (v_template_id, 'Alignment and support checked', true, 2),
    (v_template_id, 'Flexible connection/vibration isolation checked', true, 3),
    (v_template_id, 'Functional performance test passed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-024 — Duct Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-024', 'MEP', 'Construction', 'MEP-024', 'Duct Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-024-S01', 'Review approved HVAC shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-024-S02', 'Confirm duct/accessory material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-024-S03', 'Set out duct route and levels', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-024-S04', 'Install supports/hangers', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-024-S05', 'Fabricate/install ductwork', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-024-S06', 'Install damper/diffuser/flexible duct', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-024-S07', 'Seal joints and insulate if required', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-024-S08', 'Coordinate ceiling/opening closure', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-024-S09', 'Air leakage/Balancing test if required', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-024-S10', 'Submit inspection record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Duct size/route checked', true, 1),
    (v_template_id, 'Support spacing checked', true, 2),
    (v_template_id, 'Joint seal quality checked', true, 3),
    (v_template_id, 'Airflow/balancing result accepted', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-025 — Flexible Duct Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-025', 'MEP', 'Construction', 'MEP-025', 'Flexible Duct Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-025-S01', 'Review approved HVAC shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-025-S02', 'Confirm duct/accessory material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-025-S03', 'Set out duct route and levels', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-025-S04', 'Install supports/hangers', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-025-S05', 'Fabricate/install ductwork', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-025-S06', 'Install damper/diffuser/flexible duct', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-025-S07', 'Seal joints and insulate if required', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-025-S08', 'Coordinate ceiling/opening closure', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-025-S09', 'Air leakage/Balancing test if required', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-025-S10', 'Submit inspection record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Duct size/route checked', true, 1),
    (v_template_id, 'Support spacing checked', true, 2),
    (v_template_id, 'Joint seal quality checked', true, 3),
    (v_template_id, 'Airflow/balancing result accepted', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-026 — Damper Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-026', 'MEP', 'Construction', 'MEP-026', 'Damper Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-026-S01', 'Review approved HVAC shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-026-S02', 'Confirm duct/accessory material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-026-S03', 'Set out duct route and levels', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-026-S04', 'Install supports/hangers', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-026-S05', 'Fabricate/install ductwork', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-026-S06', 'Install damper/diffuser/flexible duct', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-026-S07', 'Seal joints and insulate if required', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-026-S08', 'Coordinate ceiling/opening closure', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-026-S09', 'Air leakage/Balancing test if required', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-026-S10', 'Submit inspection record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Duct size/route checked', true, 1),
    (v_template_id, 'Support spacing checked', true, 2),
    (v_template_id, 'Joint seal quality checked', true, 3),
    (v_template_id, 'Airflow/balancing result accepted', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-027 — Diffuser Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-027', 'MEP', 'Construction', 'MEP-027', 'Diffuser Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-027-S01', 'Review approved HVAC shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-027-S02', 'Confirm duct/accessory material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-027-S03', 'Set out duct route and levels', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-027-S04', 'Install supports/hangers', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-027-S05', 'Fabricate/install ductwork', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-027-S06', 'Install damper/diffuser/flexible duct', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-027-S07', 'Seal joints and insulate if required', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-027-S08', 'Coordinate ceiling/opening closure', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-027-S09', 'Air leakage/Balancing test if required', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-027-S10', 'Submit inspection record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Duct size/route checked', true, 1),
    (v_template_id, 'Support spacing checked', true, 2),
    (v_template_id, 'Joint seal quality checked', true, 3),
    (v_template_id, 'Airflow/balancing result accepted', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-028 — Exhaust Fan Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-028', 'MEP', 'Construction', 'MEP-028', 'Exhaust Fan Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-028-S01', 'Review approved equipment schedule/shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-028-S02', 'Confirm equipment approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-028-S03', 'Prepare plinth/support/base and access clearance', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-028-S04', 'Deliver and inspect equipment', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-028-S05', 'Install and align equipment', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-028-S06', 'Connect pipe/duct/cable/control', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-028-S07', 'Check vibration isolation and drainage', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-028-S08', 'Pre-commissioning inspection', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-028-S09', 'Testing and commissioning', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-028-S10', 'Submit test certificate/O&M data', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Equipment rating checked', true, 1),
    (v_template_id, 'Alignment and support checked', true, 2),
    (v_template_id, 'Flexible connection/vibration isolation checked', true, 3),
    (v_template_id, 'Functional performance test passed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-029 — Ventilation Fan Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-029', 'MEP', 'Construction', 'MEP-029', 'Ventilation Fan Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-029-S01', 'Review approved equipment schedule/shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-029-S02', 'Confirm equipment approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-029-S03', 'Prepare plinth/support/base and access clearance', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-029-S04', 'Deliver and inspect equipment', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-029-S05', 'Install and align equipment', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-029-S06', 'Connect pipe/duct/cable/control', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-029-S07', 'Check vibration isolation and drainage', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-029-S08', 'Pre-commissioning inspection', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-029-S09', 'Testing and commissioning', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-029-S10', 'Submit test certificate/O&M data', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Equipment rating checked', true, 1),
    (v_template_id, 'Alignment and support checked', true, 2),
    (v_template_id, 'Flexible connection/vibration isolation checked', true, 3),
    (v_template_id, 'Functional performance test passed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-030 — Refrigerant Pipe Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-030', 'MEP', 'Construction', 'MEP-030', 'Refrigerant Pipe Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-030-S01', 'Review approved piping/shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-030-S02', 'Confirm pipe/fitting/equipment approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-030-S03', 'Set out route/invert/location', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-030-S04', 'Install supports/sleeves', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-030-S05', 'Install pipe/fitting/equipment', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-030-S06', 'Connect to equipment/system', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-030-S07', 'Pressure/leakage/flow test', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-030-S08', 'Flush/clean system', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-030-S09', 'Label and identify system', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-030-S10', 'Submit test record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Pipe size/slope/invert checked', true, 1),
    (v_template_id, 'Support spacing checked', true, 2),
    (v_template_id, 'Pressure/leakage test passed', true, 3),
    (v_template_id, 'Access for maintenance confirmed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-040 — Water Tank Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-040', 'MEP', 'Construction', 'MEP-040', 'Water Tank Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-040-S01', 'Review approved equipment schedule/shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-040-S02', 'Confirm equipment approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-040-S03', 'Prepare plinth/support/base and access clearance', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-040-S04', 'Deliver and inspect equipment', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-040-S05', 'Install and align equipment', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-040-S06', 'Connect pipe/duct/cable/control', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-040-S07', 'Check vibration isolation and drainage', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-040-S08', 'Pre-commissioning inspection', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-040-S09', 'Testing and commissioning', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-040-S10', 'Submit test certificate/O&M data', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Equipment rating checked', true, 1),
    (v_template_id, 'Alignment and support checked', true, 2),
    (v_template_id, 'Flexible connection/vibration isolation checked', true, 3),
    (v_template_id, 'Functional performance test passed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-041 — Booster Pump Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-041', 'MEP', 'Construction', 'MEP-041', 'Booster Pump Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-041-S01', 'Review approved equipment schedule/shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-041-S02', 'Confirm equipment approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-041-S03', 'Prepare plinth/support/base and access clearance', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-041-S04', 'Deliver and inspect equipment', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-041-S05', 'Install and align equipment', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-041-S06', 'Connect pipe/duct/cable/control', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-041-S07', 'Check vibration isolation and drainage', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-041-S08', 'Pre-commissioning inspection', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-041-S09', 'Testing and commissioning', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-041-S10', 'Submit test certificate/O&M data', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Equipment rating checked', true, 1),
    (v_template_id, 'Alignment and support checked', true, 2),
    (v_template_id, 'Flexible connection/vibration isolation checked', true, 3),
    (v_template_id, 'Functional performance test passed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-042 — Water Supply Pipe Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-042', 'MEP', 'Construction', 'MEP-042', 'Water Supply Pipe Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-042-S01', 'Review approved piping/shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-042-S02', 'Confirm pipe/fitting/equipment approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-042-S03', 'Set out route/invert/location', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-042-S04', 'Install supports/sleeves', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-042-S05', 'Install pipe/fitting/equipment', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-042-S06', 'Connect to equipment/system', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-042-S07', 'Pressure/leakage/flow test', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-042-S08', 'Flush/clean system', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-042-S09', 'Label and identify system', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-042-S10', 'Submit test record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Pipe size/slope/invert checked', true, 1),
    (v_template_id, 'Support spacing checked', true, 2),
    (v_template_id, 'Pressure/leakage test passed', true, 3),
    (v_template_id, 'Access for maintenance confirmed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-043 — Drainage Pipe Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-043', 'MEP', 'Construction', 'MEP-043', 'Drainage Pipe Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-043-S01', 'Review approved piping/shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-043-S02', 'Confirm pipe/fitting/equipment approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-043-S03', 'Set out route/invert/location', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-043-S04', 'Install supports/sleeves', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-043-S05', 'Install pipe/fitting/equipment', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-043-S06', 'Connect to equipment/system', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-043-S07', 'Pressure/leakage/flow test', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-043-S08', 'Flush/clean system', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-043-S09', 'Label and identify system', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-043-S10', 'Submit test record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Pipe size/slope/invert checked', true, 1),
    (v_template_id, 'Support spacing checked', true, 2),
    (v_template_id, 'Pressure/leakage test passed', true, 3),
    (v_template_id, 'Access for maintenance confirmed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-044 — Soil Pipe Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-044', 'MEP', 'Construction', 'MEP-044', 'Soil Pipe Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-044-S01', 'Review approved piping/shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-044-S02', 'Confirm pipe/fitting/equipment approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-044-S03', 'Set out route/invert/location', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-044-S04', 'Install supports/sleeves', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-044-S05', 'Install pipe/fitting/equipment', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-044-S06', 'Connect to equipment/system', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-044-S07', 'Pressure/leakage/flow test', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-044-S08', 'Flush/clean system', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-044-S09', 'Label and identify system', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-044-S10', 'Submit test record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Pipe size/slope/invert checked', true, 1),
    (v_template_id, 'Support spacing checked', true, 2),
    (v_template_id, 'Pressure/leakage test passed', true, 3),
    (v_template_id, 'Access for maintenance confirmed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-045 — Vent Pipe Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-045', 'MEP', 'Construction', 'MEP-045', 'Vent Pipe Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-045-S01', 'Review approved piping/shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-045-S02', 'Confirm pipe/fitting/equipment approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-045-S03', 'Set out route/invert/location', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-045-S04', 'Install supports/sleeves', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-045-S05', 'Install pipe/fitting/equipment', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-045-S06', 'Connect to equipment/system', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-045-S07', 'Pressure/leakage/flow test', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-045-S08', 'Flush/clean system', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-045-S09', 'Label and identify system', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-045-S10', 'Submit test record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Pipe size/slope/invert checked', true, 1),
    (v_template_id, 'Support spacing checked', true, 2),
    (v_template_id, 'Pressure/leakage test passed', true, 3),
    (v_template_id, 'Access for maintenance confirmed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-046 — Floor Trap Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-046', 'MEP', 'Construction', 'MEP-046', 'Floor Trap Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-046-S01', 'Review approved piping/shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-046-S02', 'Confirm pipe/fitting/equipment approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-046-S03', 'Set out route/invert/location', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-046-S04', 'Install supports/sleeves', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-046-S05', 'Install pipe/fitting/equipment', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-046-S06', 'Connect to equipment/system', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-046-S07', 'Pressure/leakage/flow test', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-046-S08', 'Flush/clean system', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-046-S09', 'Label and identify system', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-046-S10', 'Submit test record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Pipe size/slope/invert checked', true, 1),
    (v_template_id, 'Support spacing checked', true, 2),
    (v_template_id, 'Pressure/leakage test passed', true, 3),
    (v_template_id, 'Access for maintenance confirmed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-047 — Cleanout Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-047', 'MEP', 'Construction', 'MEP-047', 'Cleanout Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-047-S01', 'Review approved piping/shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-047-S02', 'Confirm pipe/fitting/equipment approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-047-S03', 'Set out route/invert/location', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-047-S04', 'Install supports/sleeves', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-047-S05', 'Install pipe/fitting/equipment', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-047-S06', 'Connect to equipment/system', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-047-S07', 'Pressure/leakage/flow test', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-047-S08', 'Flush/clean system', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-047-S09', 'Label and identify system', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-047-S10', 'Submit test record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Pipe size/slope/invert checked', true, 1),
    (v_template_id, 'Support spacing checked', true, 2),
    (v_template_id, 'Pressure/leakage test passed', true, 3),
    (v_template_id, 'Access for maintenance confirmed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-048 — Manhole Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-048', 'MEP', 'Construction', 'MEP-048', 'Manhole Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-048-S01', 'Review approved piping/shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-048-S02', 'Confirm pipe/fitting/equipment approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-048-S03', 'Set out route/invert/location', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-048-S04', 'Install supports/sleeves', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-048-S05', 'Install pipe/fitting/equipment', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-048-S06', 'Connect to equipment/system', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-048-S07', 'Pressure/leakage/flow test', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-048-S08', 'Flush/clean system', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-048-S09', 'Label and identify system', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-048-S10', 'Submit test record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Pipe size/slope/invert checked', true, 1),
    (v_template_id, 'Support spacing checked', true, 2),
    (v_template_id, 'Pressure/leakage test passed', true, 3),
    (v_template_id, 'Access for maintenance confirmed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-049 — Grease Trap Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-049', 'MEP', 'Construction', 'MEP-049', 'Grease Trap Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-049-S01', 'Review approved piping/shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-049-S02', 'Confirm pipe/fitting/equipment approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-049-S03', 'Set out route/invert/location', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-049-S04', 'Install supports/sleeves', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-049-S05', 'Install pipe/fitting/equipment', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-049-S06', 'Connect to equipment/system', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-049-S07', 'Pressure/leakage/flow test', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-049-S08', 'Flush/clean system', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-049-S09', 'Label and identify system', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-049-S10', 'Submit test record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Pipe size/slope/invert checked', true, 1),
    (v_template_id, 'Support spacing checked', true, 2),
    (v_template_id, 'Pressure/leakage test passed', true, 3),
    (v_template_id, 'Access for maintenance confirmed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-050 — Sewage Treatment Plant Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-050', 'MEP', 'Construction', 'MEP-050', 'Sewage Treatment Plant Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-050-S01', 'Review approved equipment schedule/shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-050-S02', 'Confirm equipment approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-050-S03', 'Prepare plinth/support/base and access clearance', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-050-S04', 'Deliver and inspect equipment', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-050-S05', 'Install and align equipment', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-050-S06', 'Connect pipe/duct/cable/control', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-050-S07', 'Check vibration isolation and drainage', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-050-S08', 'Pre-commissioning inspection', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-050-S09', 'Testing and commissioning', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-050-S10', 'Submit test certificate/O&M data', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Equipment rating checked', true, 1),
    (v_template_id, 'Alignment and support checked', true, 2),
    (v_template_id, 'Flexible connection/vibration isolation checked', true, 3),
    (v_template_id, 'Functional performance test passed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-060 — Fire Pump Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-060', 'MEP', 'Construction', 'MEP-060', 'Fire Pump Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-060-S01', 'Review approved equipment schedule/shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-060-S02', 'Confirm equipment approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-060-S03', 'Prepare plinth/support/base and access clearance', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-060-S04', 'Deliver and inspect equipment', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-060-S05', 'Install and align equipment', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-060-S06', 'Connect pipe/duct/cable/control', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-060-S07', 'Check vibration isolation and drainage', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-060-S08', 'Pre-commissioning inspection', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-060-S09', 'Testing and commissioning', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-060-S10', 'Submit test certificate/O&M data', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Equipment rating checked', true, 1),
    (v_template_id, 'Alignment and support checked', true, 2),
    (v_template_id, 'Flexible connection/vibration isolation checked', true, 3),
    (v_template_id, 'Functional performance test passed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-061 — Fire Tank Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-061', 'MEP', 'Construction', 'MEP-061', 'Fire Tank Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-061-S01', 'Review approved equipment schedule/shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-061-S02', 'Confirm equipment approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-061-S03', 'Prepare plinth/support/base and access clearance', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-061-S04', 'Deliver and inspect equipment', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-061-S05', 'Install and align equipment', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-061-S06', 'Connect pipe/duct/cable/control', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-061-S07', 'Check vibration isolation and drainage', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-061-S08', 'Pre-commissioning inspection', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-061-S09', 'Testing and commissioning', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-061-S10', 'Submit test certificate/O&M data', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Equipment rating checked', true, 1),
    (v_template_id, 'Alignment and support checked', true, 2),
    (v_template_id, 'Flexible connection/vibration isolation checked', true, 3),
    (v_template_id, 'Functional performance test passed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-062 — Sprinkler Head Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-062', 'MEP', 'Construction', 'MEP-062', 'Sprinkler Head Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-062-S01', 'Review approved piping/shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-062-S02', 'Confirm pipe/fitting/equipment approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-062-S03', 'Set out route/invert/location', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-062-S04', 'Install supports/sleeves', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-062-S05', 'Install pipe/fitting/equipment', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-062-S06', 'Connect to equipment/system', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-062-S07', 'Pressure/leakage/flow test', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-062-S08', 'Flush/clean system', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-062-S09', 'Label and identify system', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-062-S10', 'Submit test record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Pipe size/slope/invert checked', true, 1),
    (v_template_id, 'Support spacing checked', true, 2),
    (v_template_id, 'Pressure/leakage test passed', true, 3),
    (v_template_id, 'Access for maintenance confirmed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-063 — Fire Hose Reel Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-063', 'MEP', 'Construction', 'MEP-063', 'Fire Hose Reel Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-063-S01', 'Review approved piping/shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-063-S02', 'Confirm pipe/fitting/equipment approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-063-S03', 'Set out route/invert/location', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-063-S04', 'Install supports/sleeves', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-063-S05', 'Install pipe/fitting/equipment', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-063-S06', 'Connect to equipment/system', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-063-S07', 'Pressure/leakage/flow test', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-063-S08', 'Flush/clean system', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-063-S09', 'Label and identify system', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-063-S10', 'Submit test record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Pipe size/slope/invert checked', true, 1),
    (v_template_id, 'Support spacing checked', true, 2),
    (v_template_id, 'Pressure/leakage test passed', true, 3),
    (v_template_id, 'Access for maintenance confirmed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-064 — Hydrant Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-064', 'MEP', 'Construction', 'MEP-064', 'Hydrant Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-064-S01', 'Review approved piping/shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-064-S02', 'Confirm pipe/fitting/equipment approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-064-S03', 'Set out route/invert/location', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-064-S04', 'Install supports/sleeves', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-064-S05', 'Install pipe/fitting/equipment', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-064-S06', 'Connect to equipment/system', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-064-S07', 'Pressure/leakage/flow test', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-064-S08', 'Flush/clean system', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-064-S09', 'Label and identify system', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-064-S10', 'Submit test record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Pipe size/slope/invert checked', true, 1),
    (v_template_id, 'Support spacing checked', true, 2),
    (v_template_id, 'Pressure/leakage test passed', true, 3),
    (v_template_id, 'Access for maintenance confirmed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-065 — Fire Extinguisher Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-065', 'MEP', 'Construction', 'MEP-065', 'Fire Extinguisher Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-065-S01', 'Review approved MEP drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-065-S02', 'Confirm material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-065-S03', 'Prepare work area', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-065-S04', 'Install MEP element', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-065-S05', 'Test and commission', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-065-S06', 'Submit inspection record', '1 day', 'Engineer', true, 6);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Check approved material and rating', true, 1),
    (v_template_id, 'Check installation location/supports/clearance', true, 2),
    (v_template_id, 'Verify labeling and identification', true, 3),
    (v_template_id, 'Complete testing before handover', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-066 — Fire Alarm Panel Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-066', 'MEP', 'Construction', 'MEP-066', 'Fire Alarm Panel Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-066-S01', 'Review approved shop drawing and load schedule', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-066-S02', 'Confirm equipment/material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-066-S03', 'Prepare room/plinth/support and access clearance', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-066-S04', 'Deliver and inspect equipment', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-066-S05', 'Install equipment in position', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-066-S06', 'Connect power/control/earthing', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-066-S07', 'Label circuits/equipment', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-066-S08', 'Pre-commissioning inspection', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-066-S09', 'Testing and commissioning', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-066-S10', 'Submit test certificate and O&M data', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Equipment rating/nameplate checked', true, 1),
    (v_template_id, 'Clearance and ventilation checked', true, 2),
    (v_template_id, 'Earthing/termination checked', true, 3),
    (v_template_id, 'Functional test passed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-067 — Smoke Detector Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-067', 'MEP', 'Construction', 'MEP-067', 'Smoke Detector Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-067-S01', 'Review approved ELV/fire alarm layout', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-067-S02', 'Confirm device/material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-067-S03', 'Set out device location', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-067-S04', 'Install containment/cabling', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-067-S05', 'Install device/panel/interface', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-067-S06', 'Terminate and label cables', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-067-S07', 'Configure/address device', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-067-S08', 'Functional test', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-067-S09', 'Integrated system test if required', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-067-S10', 'Submit test and commissioning record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Device location and height checked', true, 1),
    (v_template_id, 'Cable labeling checked', true, 2),
    (v_template_id, 'Functional test passed', true, 3),
    (v_template_id, 'Interface/integration accepted', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-068 — Heat Detector Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-068', 'MEP', 'Construction', 'MEP-068', 'Heat Detector Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-068-S01', 'Review approved ELV/fire alarm layout', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-068-S02', 'Confirm device/material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-068-S03', 'Set out device location', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-068-S04', 'Install containment/cabling', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-068-S05', 'Install device/panel/interface', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-068-S06', 'Terminate and label cables', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-068-S07', 'Configure/address device', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-068-S08', 'Functional test', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-068-S09', 'Integrated system test if required', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-068-S10', 'Submit test and commissioning record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Device location and height checked', true, 1),
    (v_template_id, 'Cable labeling checked', true, 2),
    (v_template_id, 'Functional test passed', true, 3),
    (v_template_id, 'Interface/integration accepted', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-080 — CCTV Camera Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-080', 'MEP', 'Construction', 'MEP-080', 'CCTV Camera Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-080-S01', 'Review approved ELV/fire alarm layout', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-080-S02', 'Confirm device/material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-080-S03', 'Set out device location', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-080-S04', 'Install containment/cabling', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-080-S05', 'Install device/panel/interface', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-080-S06', 'Terminate and label cables', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-080-S07', 'Configure/address device', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-080-S08', 'Functional test', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-080-S09', 'Integrated system test if required', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-080-S10', 'Submit test and commissioning record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Device location and height checked', true, 1),
    (v_template_id, 'Cable labeling checked', true, 2),
    (v_template_id, 'Functional test passed', true, 3),
    (v_template_id, 'Interface/integration accepted', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-081 — Access Control Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-081', 'MEP', 'Construction', 'MEP-081', 'Access Control Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-081-S01', 'Review approved ELV/fire alarm layout', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-081-S02', 'Confirm device/material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-081-S03', 'Set out device location', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-081-S04', 'Install containment/cabling', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-081-S05', 'Install device/panel/interface', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-081-S06', 'Terminate and label cables', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-081-S07', 'Configure/address device', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-081-S08', 'Functional test', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-081-S09', 'Integrated system test if required', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-081-S10', 'Submit test and commissioning record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Device location and height checked', true, 1),
    (v_template_id, 'Cable labeling checked', true, 2),
    (v_template_id, 'Functional test passed', true, 3),
    (v_template_id, 'Interface/integration accepted', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-082 — PA System Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-082', 'MEP', 'Construction', 'MEP-082', 'PA System Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-082-S01', 'Review approved ELV/fire alarm layout', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-082-S02', 'Confirm device/material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-082-S03', 'Set out device location', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-082-S04', 'Install containment/cabling', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-082-S05', 'Install device/panel/interface', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-082-S06', 'Terminate and label cables', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-082-S07', 'Configure/address device', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-082-S08', 'Functional test', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-082-S09', 'Integrated system test if required', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-082-S10', 'Submit test and commissioning record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Device location and height checked', true, 1),
    (v_template_id, 'Cable labeling checked', true, 2),
    (v_template_id, 'Functional test passed', true, 3),
    (v_template_id, 'Interface/integration accepted', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-083 — Data Network Rack Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-083', 'MEP', 'Construction', 'MEP-083', 'Data Network Rack Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-083-S01', 'Review approved shop drawing and load schedule', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-083-S02', 'Confirm equipment/material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-083-S03', 'Prepare room/plinth/support and access clearance', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-083-S04', 'Deliver and inspect equipment', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-083-S05', 'Install equipment in position', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-083-S06', 'Connect power/control/earthing', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-083-S07', 'Label circuits/equipment', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-083-S08', 'Pre-commissioning inspection', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-083-S09', 'Testing and commissioning', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-083-S10', 'Submit test certificate and O&M data', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Equipment rating/nameplate checked', true, 1),
    (v_template_id, 'Clearance and ventilation checked', true, 2),
    (v_template_id, 'Earthing/termination checked', true, 3),
    (v_template_id, 'Functional test passed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-084 — Telephone System Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-084', 'MEP', 'Construction', 'MEP-084', 'Telephone System Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-084-S01', 'Review approved ELV/fire alarm layout', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-084-S02', 'Confirm device/material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-084-S03', 'Set out device location', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-084-S04', 'Install containment/cabling', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-084-S05', 'Install device/panel/interface', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-084-S06', 'Terminate and label cables', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-084-S07', 'Configure/address device', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-084-S08', 'Functional test', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-084-S09', 'Integrated system test if required', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-084-S10', 'Submit test and commissioning record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Device location and height checked', true, 1),
    (v_template_id, 'Cable labeling checked', true, 2),
    (v_template_id, 'Functional test passed', true, 3),
    (v_template_id, 'Interface/integration accepted', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-085 — Fiber Optic Cable Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-085', 'MEP', 'Construction', 'MEP-085', 'Fiber Optic Cable Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-085-S01', 'Review approved routing/shop drawing', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-085-S02', 'Confirm material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-085-S03', 'Set out route and support spacing', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-085-S04', 'Install supports/brackets', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-085-S05', 'Install tray/ladder or conduit path', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-085-S06', 'Pull/install cable', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-085-S07', 'Dress and secure cable', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-085-S08', 'Terminate cable ends', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-085-S09', 'Label cable and circuit', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-085-S10', 'Test continuity/IR/fiber test and submit record', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Support spacing and fixing checked', true, 1),
    (v_template_id, 'Cable bend radius checked', true, 2),
    (v_template_id, 'Cable identification checked', true, 3),
    (v_template_id, 'Continuity/insulation/fiber test passed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


-- ============================================================
-- MEP-086 — Server Room Equipment Work Package
-- Discipline: MEP | Phase: Construction
-- ============================================================
DO $$
DECLARE
  v_template_id uuid;
BEGIN
  -- Insert template
  INSERT INTO public.master_task_templates (template_code, discipline, phase, element_code, template_name, description, grouping_method, default_quantity_unit, default_task_status)
  VALUES ('MEP-086', 'MEP', 'Construction', 'MEP-086', 'Server Room Equipment Work Package', '', 'Generate by Quantity', 'Each', 'Open')
  RETURNING id INTO v_template_id;

  -- Insert steps
  INSERT INTO public.master_task_template_steps (template_id, step_no, step_code, step_name, duration, default_role, required, sort_order) VALUES
    (v_template_id, '1', 'MEP-086-S01', 'Review approved shop drawing and load schedule', '1 day', 'Engineer', true, 1),
    (v_template_id, '2', 'MEP-086-S02', 'Confirm equipment/material approval', '1 day', 'Engineer', true, 2),
    (v_template_id, '3', 'MEP-086-S03', 'Prepare room/plinth/support and access clearance', '1 day', 'Engineer', true, 3),
    (v_template_id, '4', 'MEP-086-S04', 'Deliver and inspect equipment', '1 day', 'Engineer', true, 4),
    (v_template_id, '5', 'MEP-086-S05', 'Install equipment in position', '1 day', 'Engineer', true, 5),
    (v_template_id, '6', 'MEP-086-S06', 'Connect power/control/earthing', '1 day', 'Engineer', true, 6),
    (v_template_id, '7', 'MEP-086-S07', 'Label circuits/equipment', '1 day', 'Engineer', true, 7),
    (v_template_id, '8', 'MEP-086-S08', 'Pre-commissioning inspection', '1 day', 'Engineer', true, 8),
    (v_template_id, '9', 'MEP-086-S09', 'Testing and commissioning', '1 day', 'Engineer', true, 9),
    (v_template_id, '10', 'MEP-086-S10', 'Submit test certificate and O&M data', '1 day', 'Engineer', true, 10);

  -- Insert dependencies
  INSERT INTO public.master_task_template_dependencies (template_id, predecessor, dependency_type, successor, lag, sort_order) VALUES
    (v_template_id, 'Step 1', 'FS', 'Step 2', '0 day', 1),
    (v_template_id, 'Step 2', 'FS', 'Step 3', '0 day', 2),
    (v_template_id, 'Step 3', 'FS', 'Step 4', '0 day', 3),
    (v_template_id, 'Step 4', 'FS', 'Step 5', '0 day', 4),
    (v_template_id, 'Step 5', 'FS', 'Step 6', '0 day', 5);

  -- Insert QA/QC checklist
  INSERT INTO public.master_task_template_checklist (template_id, item, is_checked, sort_order) VALUES
    (v_template_id, 'Equipment rating/nameplate checked', true, 1),
    (v_template_id, 'Clearance and ventilation checked', true, 2),
    (v_template_id, 'Earthing/termination checked', true, 3),
    (v_template_id, 'Functional test passed', true, 4);

  -- Insert required documents
  INSERT INTO public.master_task_template_documents (template_id, document_name, is_required, sort_order) VALUES
    (v_template_id, 'Approved MEP drawing/shop drawing', true, 1),
    (v_template_id, 'Material approval', true, 2),
    (v_template_id, 'Method statement', true, 3),
    (v_template_id, 'ITP / testing checklist', true, 4),
    (v_template_id, 'Testing and commissioning form', true, 5);

END $$;


COMMIT;
