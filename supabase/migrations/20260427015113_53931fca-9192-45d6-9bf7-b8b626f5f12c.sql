-- New enum: workflow type (separate from the existing discipline-flavored task_type)
CREATE TYPE public.task_workflow_type AS ENUM (
  'design',
  'coordination',
  'procurement',
  'execution',
  'approval'
);

-- New enum: granular deliverable category
CREATE TYPE public.task_category AS ENUM (
  -- Design
  'design_log_report',
  'design_summary_report',
  'calculation_note',
  'technical_evaluation',
  'technical_comparison',
  'cut_sheet',
  -- Coordination
  'design_coordination_circulation',
  'material_coordination_circulation',
  'budget_coordination_circulation',
  -- Procurement
  'eoi',
  'tender_evaluation',
  'tender_interview',
  'po_award',
  'kick_off',
  -- Execution
  'daily_report',
  'weekly_report',
  'ncr',
  'instruction',
  'delay_notice',
  'claim_notice',
  -- Approval / QA
  'as_built_drawing_rfa',
  'test_report_rfa',
  'material_rfa',
  'method_statement_rfa'
);

ALTER TABLE public.tasks
  ADD COLUMN workflow_type public.task_workflow_type,
  ADD COLUMN category public.task_category;

CREATE INDEX idx_tasks_workflow_type ON public.tasks(workflow_type);
CREATE INDEX idx_tasks_category ON public.tasks(category);