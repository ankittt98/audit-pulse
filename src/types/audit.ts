export type Role = 'Admin' | 'Audit Manager' | 'Auditor' | 'Contributor' | 'Viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  department: string;
}

export interface Organization {
  id: string;
  name: string;
  code: string;
  logo?: string;
  created_at: string;
}

export type AuditStatus = 'Draft' | 'Planned' | 'In Progress' | 'Under Review' | 'Completed' | 'Archived';
export type AuditPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Audit {
  id: string;
  title: string;
  description: string;
  type: 'Internal' | 'Regulatory' | 'Security & IT' | 'Financial' | 'Quality & Operational';
  scope: string;
  owner_id: string;
  auditor_ids: string[];
  start_date: string;
  target_completion_date: string;
  status: AuditStatus;
  priority: AuditPriority;
  tags: string[];
  unit: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type TaskStatus = 'Not Started' | 'In Progress' | 'Submitted' | 'Under Review' | 'Completed' | 'Blocked' | 'Overdue';

export interface AuditTask {
  id: string;
  audit_id: string;
  title: string;
  description: string;
  assignee_id: string;
  creator_id: string;
  due_date: string;
  priority: AuditPriority;
  status: TaskStatus;
  check_id?: string;
  finding_id?: string;
  attachments_count: number;
  comments_count: number;
  created_at: string;
}

export type CheckWorkflowStatus = 'Not Started' | 'In Progress' | 'Under Review' | 'Completed' | 'Blocked';
export type CheckResult = 'Pending' | 'Pass' | 'Fail' | 'Partially Met' | 'Not Applicable';

export interface ComplianceCheck {
  id: string;
  audit_id: string;
  code: string;
  name: string;
  requirement: string;
  category: string;
  owner_id: string;
  reviewer_id?: string;
  due_date: string;
  evidence_required: boolean;
  status: CheckWorkflowStatus;
  result: CheckResult;
  notes?: string;
  updated_at: string;
}

export type DocumentReviewStatus = 'Pending' | 'Under Review' | 'Verified' | 'Rejected' | 'Requires Revision';

export interface EvidenceDocument {
  id: string;
  audit_id: string;
  title: string;
  filename: string;
  file_type: string;
  file_size: string;
  uploaded_by: string;
  uploaded_at: string;
  version: string;
  description?: string;
  review_status: DocumentReviewStatus;
  reviewer_id?: string;
  reviewer_notes?: string;
  reviewed_at?: string;
  related_entity_type?: 'Check' | 'Task' | 'Finding' | 'Action';
  related_entity_id?: string;
  download_url?: string;
  preview_url?: string;
  file_hash?: string;
  stored_path?: string;
}

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
export type FindingStatus = 'Open' | 'Assigned' | 'In Progress' | 'Pending Review' | 'Resolved' | 'Closed' | 'Accepted';

export interface CorrectiveAction {
  id: string;
  finding_id: string;
  description: string;
  owner_id: string;
  due_date: string;
  priority: AuditPriority;
  status: 'Not Started' | 'In Progress' | 'Submitted' | 'Under Review' | 'Completed';
  completion_notes?: string;
  reviewer_id?: string;
  reviewed_at?: string;
}

export interface Finding {
  id: string;
  audit_id: string;
  check_id?: string;
  title: string;
  description: string;
  severity: Severity;
  category: string;
  owner_id: string;
  due_date: string;
  status: FindingStatus;
  recommendation: string;
  resolution_notes?: string;
  created_at: string;
  corrective_actions: CorrectiveAction[];
}

export interface ActivityRecord {
  id: string;
  audit_id?: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  action: string;
  entity_type: 'Audit' | 'Task' | 'Check' | 'Document' | 'Finding' | 'Action';
  entity_id: string;
  details: string;
  timestamp: string;
}

export interface AuditTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  default_checks: { code: string; name: string; requirement: string; category: string; evidence_required: boolean }[];
  default_tasks: { title: string; description: string; priority: AuditPriority }[];
}
