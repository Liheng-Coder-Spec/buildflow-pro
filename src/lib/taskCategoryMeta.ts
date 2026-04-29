export type TaskWorkflowType =
  | "design"
  | "coordination"
  | "procurement"
  | "execution"
  | "approval";

export type TaskCategory =
  // Design
  | "design_log_report"
  | "design_summary_report"
  | "calculation_note"
  | "technical_evaluation"
  | "technical_comparison"
  | "cut_sheet"
  // Coordination
  | "design_coordination_circulation"
  | "material_coordination_circulation"
  | "budget_coordination_circulation"
  // Procurement
  | "eoi"
  | "tender_evaluation"
  | "tender_interview"
  | "po_award"
  | "kick_off"
  // Execution
  | "daily_report"
  | "weekly_report"
  | "ncr"
  | "instruction"
  | "delay_notice"
  | "claim_notice"
  // Approval / QA
  | "as_built_drawing_rfa"
  | "test_report_rfa"
  | "material_rfa"
  | "method_statement_rfa";

export const TASK_WORKFLOW_LABELS: Record<TaskWorkflowType, string> = {
  design: "Design",
  coordination: "Coordination",
  procurement: "Procurement",
  execution: "Execution",
  approval: "Approval",
};

export const TASK_CATEGORY_LABELS: Record<TaskCategory, string> = {
  design_log_report: "Design Log Report",
  design_summary_report: "Design Summary Report",
  calculation_note: "Calculation Note",
  technical_evaluation: "Technical Evaluation",
  technical_comparison: "Technical Comparison",
  cut_sheet: "Cut Sheet",
  design_coordination_circulation: "Design Coordination Circulation",
  material_coordination_circulation: "Material Coordination Circulation",
  budget_coordination_circulation: "Budget Coordination Circulation",
  eoi: "EOI",
  tender_evaluation: "Tender Evaluation",
  tender_interview: "Tender Interview",
  po_award: "PO / Award",
  kick_off: "Kick-off",
  daily_report: "Daily Report",
  weekly_report: "Weekly Report",
  ncr: "NCR",
  instruction: "Instruction",
  delay_notice: "Delay Notice",
  claim_notice: "Claim Notice",
  as_built_drawing_rfa: "As-built Drawing RFA",
  test_report_rfa: "Test Report RFA",
  material_rfa: "Material RFA",
  method_statement_rfa: "Method Statement RFA",
};

/** Categories grouped by their parent workflow type. */
export const CATEGORIES_BY_WORKFLOW: Record<TaskWorkflowType, TaskCategory[]> = {
  design: [
    "design_log_report",
    "design_summary_report",
    "calculation_note",
    "technical_evaluation",
    "technical_comparison",
    "cut_sheet",
  ],
  coordination: [
    "design_coordination_circulation",
    "material_coordination_circulation",
    "budget_coordination_circulation",
  ],
  procurement: ["eoi", "tender_evaluation", "tender_interview", "po_award", "kick_off"],
  execution: [
    "daily_report",
    "weekly_report",
    "ncr",
    "instruction",
    "delay_notice",
    "claim_notice",
  ],
  approval: [
    "as_built_drawing_rfa",
    "test_report_rfa",
    "material_rfa",
    "method_statement_rfa",
  ],
};
