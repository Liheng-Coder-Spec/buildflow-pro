# Construction Task & Timesheet Management Platform

A **desktop-first web application** for a single construction company managing multiple projects, covering all 14 modules from the workflow document. Built for office and site-office computer use (1280px+), with **basic tablet support** down to 768px for supervisors reviewing on iPads. No mobile app — below 768px users see a "please use a computer or tablet" message.

---

## 🎨 Design System

**Aesthetic:** Professional construction — trustworthy, dense-but-clean, optimized for data-heavy desktop workflows.

- **Primary (Navy):** `#1E3C4C` — headers, primary actions, navigation
- **Accent (Amber):** `#D97706` — CTAs, status highlights, warnings
- **Neutrals:** Slate grays for surfaces, borders, and text hierarchy
- **Status colors:** Green (approved), Amber (pending), Red (rejected/blocked), Blue (in-progress)
- **Typography:** Inter for UI, tabular numerals for tables and timesheets
- **Layout:** Persistent left sidebar navigation + top header with project switcher and user menu. Wide content area with data tables, Kanban boards, and Gantt-style timelines.

---

## 👥 User Roles (7)

Stored in a dedicated `user_roles` table with a `has_role()` security-definer function (never on profiles, to prevent privilege escalation):

1. **Admin** — full system access, user management, audit logs
2. **Project Manager (PM)** — project creation, task oversight, approvals, reporting
3. **Engineer** — task planning, technical specs, document upload
4. **Supervisor** — task assignment, on-site approval, timesheet review
5. **Worker** — task execution, daily updates, timesheet submission
6. **QA/QC Inspector** — quality checks, sign-off on completed tasks
7. **Accountant** — timesheet final approval, payroll export

---

## 📋 Phase 1 — Foundation & Core Setup

**Goal:** Authentication, projects, role hierarchy, and the status state machine that powers every workflow.

### Module 1 — Authentication & User Management
- Email/password login via Lovable Cloud
- User profiles (name, role, employee ID, contact, photo)
- Admin panel for inviting users and assigning roles
- Password reset flow with dedicated `/reset-password` page
- Session persistence and protected routes

### Project Management (foundation for all modules)
- Create/edit projects with code, name, location, client, start/end dates, budget
- Project switcher in the top header (all data scopes to active project)
- Project members list with role assignments per project
- Project dashboard with high-level KPIs

### Module 13 — Status State Machine
- Centralized state definitions: `Open → Assigned → In Progress → Pending Approval → Approved/Rejected → Completed → Closed`
- Transition validation enforced in the database (no invalid jumps)
- Visual status pills consistent across the entire app
- Color-coded status legend in every list view

---

## 📋 Phase 2 — Task Lifecycle & Workload

**Goal:** End-to-end task management from creation to closure, with intelligent workload distribution.

### Module 2 — Task Creation & Planning
- Rich task editor: title, description, type (concrete/steel/MEP/finishing/etc.), priority, planned start/end, estimated hours, location/zone, predecessors
- Attach drawings and specs (PDF, images, CAD references)
- Bulk import from CSV/Excel for large project plans
- Templates for recurring task types

### Module 3 — Task Assignment
- Assign to individuals or crews
- Skill-based suggestions (system recommends workers matching the task type)
- Notification on assignment (in-app + email)
- Reassignment with reason logging

### Module 4 — Task Execution & Updates
- Worker view: today's assigned tasks, with start/pause/complete actions
- Daily progress updates (% complete, hours worked, notes, photos)
- Issue/blocker reporting (escalates to supervisor)
- Multiple task views: List, Kanban board, and Gantt-style timeline

### Module 5 — Supervisor Approval
- Inbox of "Pending Approval" tasks for supervisors
- Side-by-side review: planned vs. actual, photos, worker notes
- Approve, reject (with reason), or request changes
- Bulk approval for routine tasks

### Module 8 — Workload Balancing
- Capacity dashboard showing each worker's assigned hours/week
- Visual heatmap of over/under-allocated team members
- Drag-and-drop reassignment between workers
- Weighted capacity scoring (priority × estimated hours)
- Alerts when a worker exceeds capacity threshold

---

## 📋 Phase 3 — Timesheets & Payroll

**Goal:** Daily time capture, multi-stage approval, fraud detection, and Excel payroll export.

### Module 6 — Timesheet Entry
- Daily timesheet grid: worker × project × task × hours
- Quick-entry mode for repetitive entries
- Link hours to specific tasks (auto-suggests worker's active tasks)
- Overtime, regular, and break hour categories
- Save as draft → Submit for approval

### Module 7 — Timesheet Approval & Fraud Detection
- Two-stage approval: Supervisor → Accountant
- Batch approval grouped by crew or project
- **Fraud/anomaly checks:**
  - Hours logged without an active assigned task
  - Overlapping hours across projects
  - Hours exceeding shift length
  - Identical entries across multiple days (copy-paste detection)
  - Sudden hour spikes vs. historical average
- Flagged entries highlighted with explanation; reviewer must resolve before approval
- **Excel (.xlsx) payroll export** with formatting:
  - Employee grouping with subtotals
  - Project/task breakdown columns
  - Regular vs. overtime split
  - Styled headers, totals row, and currency formatting
  - Date-range and project filters before export

---

## 📋 Phase 4 — Documents, Reporting & Compliance

**Goal:** Document control, executive insight, and full audit trail.

### Module 9 — Document Management
- Upload drawings, specifications, RFIs, change orders, certificates
- **Versioning** — every replacement keeps history; users can view/download any version
- Tag documents to projects, tasks, or zones
- Permission control by role
- Search by name, tag, or content type

### Module 10 — Notifications & Activity Feed
- In-app notification center (bell icon with unread count)
- Email notifications for: task assignment, approval requests, timesheet flags, document updates
- Per-user notification preferences (which events trigger email vs. in-app only)
- Activity feed per project showing recent events

### Module 11 — Reporting & KPI Dashboards
- **Executive dashboard:** project progress %, budget burn, labor hours, open issues, on-time completion rate
- **Project dashboards:** task status breakdown, schedule variance, top blockers, crew productivity
- **Labor reports:** hours by worker / project / task type, overtime trends
- **Quality reports:** rejection rates, rework hours, QA/QC pass rate
- Date-range filters and export to Excel/PDF
- Visual charts (bar, line, donut, heatmap)

### Module 12 — Audit Trail
- **Append-only log** of every meaningful action: status changes, approvals, edits, deletions, role changes, login events
- Captures: who, what, when, before/after values, IP address
- Searchable by user, entity, date range, action type
- Admin-only access
- Tamper-evident (cannot be edited or deleted from the UI)

### Module 14 — System Settings
- Company profile (name, logo, address)
- Working hours / shift definitions
- Overtime rules and thresholds
- Task type taxonomy
- Approval workflow customization
- Notification templates

---

## 🔐 Security & Architecture

- **Lovable Cloud (Postgres + Auth)** with Row-Level Security on every table
- **Roles in `user_roles` table** with `has_role()` security-definer function — prevents privilege escalation
- All approvals enforced server-side, not in UI
- Audit log writes triggered by database functions (cannot be bypassed)
- File uploads stored in Lovable Cloud storage with signed URLs
- Session-based auth with auto-refresh

---

## 📱 Responsive Strategy (Desktop-First)

- **Primary target:** 1440px desktop (optimized layouts, dense tables, multi-column dashboards)
- **Scales up:** to 1920px+ widescreen monitors
- **Tablet (768–1279px):** Sidebar collapses to icon rail, tables become horizontally scrollable, dashboards reflow to single column. Approvals and timesheet review remain fully usable.
- **Below 768px:** Friendly "Please use a tablet or computer" message — this is not a field-worker mobile app.

---

## 🚀 Build Order Summary

| Phase | Modules | Outcome |
|-------|---------|---------|
| **1** | Auth, Projects, Module 13 | Login, project setup, status engine working |
| **2** | Modules 2, 3, 4, 5, 8 | Full task lifecycle + workload management |
| **3** | Modules 6, 7 | Timesheets with fraud checks and Excel export |
| **4** | Modules 9, 10, 11, 12, 14 | Documents, notifications, reporting, audit, settings |

After approval, I'll start with **Phase 1** and pause for your review before moving to Phase 2.

---

## ❓ Optional follow-ups (can decide later)
- **Multi-language UI** — English only for V1, or add another language?
- **Email service** — Lovable Cloud's built-in transactional email is fine to start; we can integrate Resend or SendGrid later for branded templates.
- **Photo storage limits** — set per-project storage caps?

These don't block the build — we can revisit during Phase 4.