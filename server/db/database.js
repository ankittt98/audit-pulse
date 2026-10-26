import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'audit_pulse.sqlite');
const db = new DatabaseSync(dbPath);

// Enable WAL mode for high performance concurrency
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      logo TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL,
      avatar TEXT,
      department TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audits (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      scope TEXT,
      owner_id TEXT,
      auditor_ids TEXT, -- JSON array of user IDs
      start_date TEXT,
      target_completion_date TEXT,
      status TEXT NOT NULL,
      priority TEXT NOT NULL,
      tags TEXT, -- JSON array
      unit TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_tasks (
      id TEXT PRIMARY KEY,
      audit_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      assignee_id TEXT,
      creator_id TEXT,
      due_date TEXT,
      priority TEXT NOT NULL,
      status TEXT NOT NULL,
      check_id TEXT,
      finding_id TEXT,
      attachments_count INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (audit_id) REFERENCES audits(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS compliance_checks (
      id TEXT PRIMARY KEY,
      audit_id TEXT NOT NULL,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      requirement TEXT NOT NULL,
      category TEXT,
      owner_id TEXT,
      reviewer_id TEXT,
      due_date TEXT,
      evidence_required INTEGER DEFAULT 1,
      status TEXT NOT NULL,
      result TEXT NOT NULL,
      notes TEXT,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (audit_id) REFERENCES audits(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS evidence_documents (
      id TEXT PRIMARY KEY,
      audit_id TEXT NOT NULL,
      title TEXT NOT NULL,
      filename TEXT NOT NULL,
      file_type TEXT,
      file_size TEXT,
      stored_path TEXT,
      file_hash TEXT, -- SHA-256 digital fingerprint
      uploaded_by TEXT NOT NULL,
      uploaded_at TEXT NOT NULL,
      version TEXT DEFAULT '1.0',
      description TEXT,
      review_status TEXT NOT NULL DEFAULT 'Under Review',
      reviewer_id TEXT,
      reviewer_notes TEXT,
      reviewed_at TEXT,
      related_entity_type TEXT,
      related_entity_id TEXT,
      download_url TEXT,
      FOREIGN KEY (audit_id) REFERENCES audits(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS findings (
      id TEXT PRIMARY KEY,
      audit_id TEXT NOT NULL,
      check_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      severity TEXT NOT NULL,
      category TEXT,
      owner_id TEXT,
      due_date TEXT,
      status TEXT NOT NULL,
      recommendation TEXT,
      resolution_notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (audit_id) REFERENCES audits(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS corrective_actions (
      id TEXT PRIMARY KEY,
      finding_id TEXT NOT NULL,
      description TEXT NOT NULL,
      owner_id TEXT,
      due_date TEXT,
      priority TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Not Started',
      completion_notes TEXT,
      reviewer_id TEXT,
      reviewed_at TEXT,
      FOREIGN KEY (finding_id) REFERENCES findings(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      audit_id TEXT,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      user_avatar TEXT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      details TEXT,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      category TEXT,
      default_checks TEXT, -- JSON array
      default_tasks TEXT   -- JSON array
    );
  `);

  seedIfEmpty();
}

function seedIfEmpty() {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM audits').get();
  if (countRow.count > 0) {
    return; // Already seeded
  }

  console.log('[DB] Seeding database with initial audit management records...');

  // 1. Organization
  db.prepare(`
    INSERT INTO organizations (id, name, code, logo, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run('org-01', 'Apex Global Enterprises', 'APEX-ENT', null, '2026-01-10T08:00:00Z');

  // 2. Users (Admin Portal by Ankit, Indian enterprise team members)
  const users = [
    ['u-1', 'Ankit', 'ankit@auditpulse.io', 'Admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'Executive Governance', '2026-01-10T08:00:00Z'],
    ['u-2', 'Priya Sharma', 'priya.sharma@auditpulse.io', 'Audit Manager', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', 'Internal Audit', '2026-01-10T08:00:00Z'],
    ['u-3', 'Rohan Verma', 'rohan.verma@auditpulse.io', 'Auditor', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'Compliance & Legal', '2026-01-10T08:00:00Z'],
    ['u-4', 'Sneha Patel', 'sneha.patel@auditpulse.io', 'Contributor', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', 'Engineering & SecOps', '2026-01-10T08:00:00Z'],
    ['u-5', 'Rajesh Gupta', 'rajesh.gupta@auditpulse.io', 'Viewer', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', 'Risk Committee', '2026-01-10T08:00:00Z'],
  ];

  const userStmt = db.prepare(`
    INSERT INTO users (id, name, email, role, avatar, department, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const u of users) {
    userStmt.run(...u);
  }

  // 3. Audits
  const audits = [
    {
      id: 'aud-101',
      title: 'ISO 27001 Security Management Audit Q3',
      description: 'Comprehensive evaluation of information security controls, access policies, data backup routines, and incident response procedures across corporate systems.',
      type: 'Security & IT',
      scope: 'Cloud Infrastructure, Identity Management, Employee Onboarding/Offboarding, Encryption Standards.',
      owner_id: 'u-2',
      auditor_ids: JSON.stringify(['u-3', 'u-2']),
      start_date: '2026-07-01',
      target_completion_date: '2026-08-30',
      status: 'In Progress',
      priority: 'Critical',
      tags: JSON.stringify(['ISO-27001', 'SOC2', 'Cybersecurity', 'Annual']),
      unit: 'IT Security & DevOps',
      notes: 'Prioritize production AWS database access reviews.',
      created_at: '2026-06-15T09:00:00Z',
      updated_at: '2026-08-12T14:30:00Z',
    },
    {
      id: 'aud-102',
      title: 'Q3 Financial Controls & Internal Revenue Audit',
      description: 'Review of general ledger postings, expense approval matrices, vendor payment reconciliation, and anti-fraud operational controls.',
      type: 'Financial',
      scope: 'Accounts Payable, General Ledger, Payroll Discrepancy Verification, Treasury Approvals.',
      owner_id: 'u-2',
      auditor_ids: JSON.stringify(['u-3']),
      start_date: '2026-08-01',
      target_completion_date: '2026-09-15',
      status: 'Planned',
      priority: 'High',
      tags: JSON.stringify(['SOX', 'Financial-Controls', 'Treasury']),
      unit: 'Finance & Accounting',
      notes: 'Sampling rate set to 15% for invoices > $10,000.',
      created_at: '2026-07-20T10:15:00Z',
      updated_at: '2026-08-10T11:00:00Z',
    },
    {
      id: 'aud-103',
      title: 'Operational Safety & Environmental Compliance Review',
      description: 'Site inspection and documentation audit for facility safety, chemical handling, emergency readiness, and environmental waste disposal.',
      type: 'Quality & Operational',
      scope: 'Facilities A & B, Waste Management Logs, Equipment Maintenance Records, OSHA Training Compliance.',
      owner_id: 'u-3',
      auditor_ids: JSON.stringify(['u-3']),
      start_date: '2026-05-10',
      target_completion_date: '2026-06-30',
      status: 'Completed',
      priority: 'Medium',
      tags: JSON.stringify(['EHS', 'OSHA', 'Facilities', 'Quarterly']),
      unit: 'Operations & EHS',
      notes: 'Final audit report published and submitted to Risk Committee.',
      created_at: '2026-05-01T08:00:00Z',
      updated_at: '2026-07-02T16:20:00Z',
    },
    {
      id: 'aud-104',
      title: 'GDPR & Consumer Privacy Data Flow Audit',
      description: 'Audit of customer data collection points, consent mechanisms, data retention schedules, and vendor data processing agreements.',
      type: 'Regulatory',
      scope: 'Customer Portal, Mobile Applications, Third-Party Analytics, Data Subject Access Requests.',
      owner_id: 'u-2',
      auditor_ids: JSON.stringify(['u-3']),
      start_date: '2026-08-10',
      target_completion_date: '2026-10-01',
      status: 'Under Review',
      priority: 'High',
      tags: JSON.stringify(['GDPR', 'Privacy', 'DPA', 'Legal']),
      unit: 'Legal & Product Compliance',
      notes: 'Data mapping inventory undergoing final auditor sign-off.',
      created_at: '2026-07-28T13:45:00Z',
      updated_at: '2026-08-13T09:10:00Z',
    },
  ];

  const auditStmt = db.prepare(`
    INSERT INTO audits (
      id, title, description, type, scope, owner_id, auditor_ids,
      start_date, target_completion_date, status, priority, tags,
      unit, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const a of audits) {
    auditStmt.run(
      a.id, a.title, a.description, a.type, a.scope, a.owner_id, a.auditor_ids,
      a.start_date, a.target_completion_date, a.status, a.priority, a.tags,
      a.unit, a.notes, a.created_at, a.updated_at
    );
  }

  // 4. Tasks
  const tasks = [
    {
      id: 'tsk-001',
      audit_id: 'aud-101',
      title: 'Export AWS IAM Administrator Access Logs',
      description: 'Extract and attach the quarterly IAM access report for all active AWS production accounts for auditor verification.',
      assignee_id: 'u-4',
      creator_id: 'u-2',
      due_date: '2026-08-18',
      priority: 'High',
      status: 'In Progress',
      check_id: 'chk-101',
      attachments_count: 2,
      comments_count: 3,
      created_at: '2026-08-01T10:00:00Z',
    },
    {
      id: 'tsk-002',
      audit_id: 'aud-101',
      title: 'Verify Offboarded Employee System Revocation',
      description: 'Cross-reference HR termination records from Q2 with Active Directory and GitHub organization membership lists.',
      assignee_id: 'u-3',
      creator_id: 'u-2',
      due_date: '2026-08-15',
      priority: 'Critical',
      status: 'Overdue',
      check_id: 'chk-102',
      attachments_count: 1,
      comments_count: 5,
      created_at: '2026-07-25T09:30:00Z',
    },
    {
      id: 'tsk-003',
      audit_id: 'aud-101',
      title: 'Provide Annual Disaster Recovery Test Log',
      description: 'Upload execution logs and restore time objective (RTO) reports for the July secondary region failover test.',
      assignee_id: 'u-4',
      creator_id: 'u-3',
      due_date: '2026-08-22',
      priority: 'Medium',
      status: 'Not Started',
      check_id: 'chk-103',
      attachments_count: 0,
      comments_count: 1,
      created_at: '2026-08-05T14:15:00Z',
    },
    {
      id: 'tsk-004',
      audit_id: 'aud-102',
      title: 'Gather Vendor Wire Transfer Approval Forms',
      description: 'Provide dual-authorization forms for all disbursement transactions exceeding $50,000 processed during June-July.',
      assignee_id: 'u-4',
      creator_id: 'u-2',
      due_date: '2026-08-28',
      priority: 'High',
      status: 'Not Started',
      check_id: null,
      attachments_count: 0,
      comments_count: 0,
      created_at: '2026-08-10T11:20:00Z',
    },
  ];

  const taskStmt = db.prepare(`
    INSERT INTO audit_tasks (
      id, audit_id, title, description, assignee_id, creator_id,
      due_date, priority, status, check_id, finding_id,
      attachments_count, comments_count, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const t of tasks) {
    taskStmt.run(
      t.id, t.audit_id, t.title, t.description, t.assignee_id, t.creator_id,
      t.due_date, t.priority, t.status, t.check_id, null,
      t.attachments_count, t.comments_count, t.created_at
    );
  }

  // 5. Compliance Checks
  const checks = [
    {
      id: 'chk-101',
      audit_id: 'aud-101',
      code: 'SEC-ACC-01',
      name: 'Privileged Access Review',
      requirement: 'Administrative access to production environments must be reviewed quarterly and restricted to authorized personnel using Multi-Factor Authentication (MFA).',
      category: 'Access Control',
      owner_id: 'u-4',
      reviewer_id: 'u-3',
      due_date: '2026-08-18',
      evidence_required: 1,
      status: 'Under Review',
      result: 'Pending',
      notes: 'IAM log submitted by Sneha Patel. Pending final review by Rohan Verma.',
      updated_at: '2026-08-12T16:00:00Z',
    },
    {
      id: 'chk-102',
      audit_id: 'aud-101',
      code: 'SEC-HR-04',
      name: 'Timely Account Deprovisioning',
      requirement: 'System access for terminated employees must be revoked within 24 hours of official employment end date.',
      category: 'Human Resource Security',
      owner_id: 'u-3',
      reviewer_id: 'u-2',
      due_date: '2026-08-15',
      evidence_required: 1,
      status: 'In Progress',
      result: 'Fail',
      notes: 'Audit revealed 2 terminated accounts remained active for 72 hours post-offboarding.',
      updated_at: '2026-08-13T10:15:00Z',
    },
    {
      id: 'chk-103',
      audit_id: 'aud-101',
      code: 'SEC-OPS-08',
      name: 'Data Backup & Restore Validation',
      requirement: 'Production database backups must be executed daily, encrypted at rest, and subjected to annual failover test validation.',
      category: 'Operations Security',
      owner_id: 'u-4',
      reviewer_id: 'u-3',
      due_date: '2026-08-22',
      evidence_required: 1,
      status: 'Not Started',
      result: 'Pending',
      notes: 'Awaiting disaster recovery drill results.',
      updated_at: '2026-08-05T14:15:00Z',
    },
    {
      id: 'chk-104',
      audit_id: 'aud-101',
      code: 'SEC-CRY-02',
      name: 'Data Encryption in Transit and Rest',
      requirement: 'All sensitive customer telemetry and database payloads must utilize TLS 1.3 in transit and AES-256 at rest.',
      category: 'Cryptography',
      owner_id: 'u-4',
      reviewer_id: 'u-3',
      due_date: '2026-08-10',
      evidence_required: 1,
      status: 'Completed',
      result: 'Pass',
      notes: 'Cipher suite configurations and AWS KMS encryption policies verified.',
      updated_at: '2026-08-11T11:45:00Z',
    },
  ];

  const checkStmt = db.prepare(`
    INSERT INTO compliance_checks (
      id, audit_id, code, name, requirement, category,
      owner_id, reviewer_id, due_date, evidence_required,
      status, result, notes, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const c of checks) {
    checkStmt.run(
      c.id, c.audit_id, c.code, c.name, c.requirement, c.category,
      c.owner_id, c.reviewer_id, c.due_date, c.evidence_required,
      c.status, c.result, c.notes, c.updated_at
    );
  }

  // 6. Evidence Documents with SHA-256 fingerprints
  const documents = [
    {
      id: 'doc-501',
      audit_id: 'aud-101',
      title: 'AWS Production IAM Access Audit Log Q2-Q3',
      filename: 'aws_iam_audit_export_2026_q3.csv',
      file_type: 'application/csv',
      file_size: '2.4 MB',
      file_hash: 'a6c8e31a9807bfda4e7724bc2f1c8e10bf49d216bc91d84877395fa3379201de',
      uploaded_by: 'Sneha Patel',
      uploaded_at: '2026-08-12T15:20:00Z',
      version: '1.0',
      description: 'Export of all root and IAM user permissions, role assignments, and last login timestamps.',
      review_status: 'Under Review',
      reviewer_id: 'u-3',
      reviewer_notes: null,
      reviewed_at: null,
      related_entity_type: 'Check',
      related_entity_id: 'chk-101',
      download_url: '/api/documents/doc-501/download',
    },
    {
      id: 'doc-502',
      audit_id: 'aud-101',
      title: 'HR Termination Records vs Active Directory Sampling',
      filename: 'offboarding_discrepancy_report.pdf',
      file_type: 'application/pdf',
      file_size: '1.1 MB',
      file_hash: '3f7b2c0199e8d47bfa8813bc01b44ec7830aa267bf0992389ab410d10c59800e',
      uploaded_by: 'Rohan Verma',
      uploaded_at: '2026-08-13T09:40:00Z',
      version: '1.1',
      description: 'Sample audit of 30 offboarded contractors showing delay in 2 account revocations.',
      review_status: 'Verified',
      reviewer_id: 'u-2',
      reviewer_notes: 'Evidence verifies finding SEC-HR-04 failure condition.',
      reviewed_at: '2026-08-13T10:00:00Z',
      related_entity_type: 'Check',
      related_entity_id: 'chk-102',
      download_url: '/api/documents/doc-502/download',
    },
    {
      id: 'doc-503',
      audit_id: 'aud-101',
      title: 'TLS 1.3 & KMS Key Architecture Diagram',
      filename: 'encryption_architecture_v2.png',
      file_type: 'image/png',
      file_size: '840 KB',
      file_hash: '90b1dc22871f301dcc7766a20bcfa77138091dd10fbf5326447814b726ef31c4',
      uploaded_by: 'Sneha Patel',
      uploaded_at: '2026-08-10T14:10:00Z',
      version: '2.0',
      description: 'Network topology and KMS master key auto-rotation schedule.',
      review_status: 'Verified',
      reviewer_id: 'u-3',
      reviewer_notes: 'Complies with SEC-CRY-02 standards.',
      reviewed_at: '2026-08-11T11:40:00Z',
      related_entity_type: 'Check',
      related_entity_id: 'chk-104',
      download_url: '/api/documents/doc-503/download',
    },
  ];

  const docStmt = db.prepare(`
    INSERT INTO evidence_documents (
      id, audit_id, title, filename, file_type, file_size,
      stored_path, file_hash, uploaded_by, uploaded_at, version,
      description, review_status, reviewer_id, reviewer_notes,
      reviewed_at, related_entity_type, related_entity_id, download_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const d of documents) {
    docStmt.run(
      d.id, d.audit_id, d.title, d.filename, d.file_type, d.file_size,
      null, d.file_hash, d.uploaded_by, d.uploaded_at, d.version,
      d.description, d.review_status, d.reviewer_id, d.reviewer_notes,
      d.reviewed_at, d.related_entity_type, d.related_entity_id, d.download_url
    );
  }

  // 7. Findings & Corrective Actions
  const findingStmt = db.prepare(`
    INSERT INTO findings (
      id, audit_id, check_id, title, description, severity,
      category, owner_id, due_date, status, recommendation,
      resolution_notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  findingStmt.run(
    'fnd-201', 'aud-101', 'chk-102',
    'Delayed Access Revocation for Terminated Personnel',
    'During offboarding sampling, access privileges for 2 departured contractor accounts were not revoked within the mandated 24-hour window, remaining active for up to 72 hours.',
    'High', 'Access Control / HR', 'u-4', '2026-08-25', 'Assigned',
    'Implement automated SCIM provisioning hook between Workday HR portal and Okta/Active Directory.',
    null, '2026-08-13T10:15:00Z'
  );

  findingStmt.run(
    'fnd-202', 'aud-104', null,
    'Missing Cookie Consent Banner on Marketing Subdomain',
    'Marketing campaign page promo.apexglobal.com lacks explicit opt-in banners for non-essential tracking scripts.',
    'Medium', 'Privacy / GDPR', 'u-4', '2026-09-01', 'In Progress',
    'Deploy global consent manager script across all web subdomains.',
    null, '2026-08-11T16:20:00Z'
  );

  const actionStmt = db.prepare(`
    INSERT INTO corrective_actions (
      id, finding_id, description, owner_id, due_date, priority,
      status, completion_notes, reviewer_id, reviewed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  actionStmt.run(
    'act-301', 'fnd-201', 'Immediately revoke active sessions and keys for flagged contractor accounts.',
    'u-4', '2026-08-14', 'Critical', 'Completed', 'Sessions manually killed on 2026-08-13 11:00 UTC.', 'u-3', '2026-08-13T11:05:00Z'
  );
  actionStmt.run(
    'act-302', 'fnd-201', 'Configure automated Webhook trigger from HR system for instantaneous account deactivation.',
    'u-4', '2026-08-25', 'High', 'In Progress', null, null, null
  );
  actionStmt.run(
    'act-303', 'fnd-202', 'Install OneTrust consent SDK on marketing templates.',
    'u-4', '2026-08-29', 'Medium', 'In Progress', null, null, null
  );

  // 8. Activity Logs
  const activities = [
    ['act-log-01', 'aud-101', 'u-3', 'Rohan Verma', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'Created Finding', 'Finding', 'fnd-201', 'Flagged High Severity finding "Delayed Access Revocation for Terminated Personnel" under check SEC-HR-04.', '2026-08-13T10:15:00Z'],
    ['act-log-02', 'aud-101', 'u-4', 'Sneha Patel', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', 'Uploaded Document', 'Document', 'doc-501', 'Uploaded evidence file "aws_iam_audit_export_2026_q3.csv" for compliance check SEC-ACC-01.', '2026-08-12T15:20:00Z'],
    ['act-log-03', 'aud-101', 'u-3', 'Rohan Verma', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'Verified Compliance Check', 'Check', 'chk-104', 'Marked compliance check SEC-CRY-02 as Pass.', '2026-08-11T11:45:00Z'],
    ['act-log-04', 'aud-102', 'u-2', 'Priya Sharma', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', 'Created Audit', 'Audit', 'aud-102', 'Initialized new audit "Q3 Financial Controls & Internal Revenue Audit" in Planned status.', '2026-07-20T10:15:00Z'],
  ];

  const actStmt = db.prepare(`
    INSERT INTO activity_logs (
      id, audit_id, user_id, user_name, user_avatar, action,
      entity_type, entity_id, details, timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const act of activities) {
    actStmt.run(...act);
  }

  // 9. Templates
  const templates = [
    {
      id: 'tmpl-01',
      name: 'ISO 27001 Security Management Audit',
      description: 'Standard framework covering information security governance, physical security, access controls, incident response, and business continuity.',
      type: 'Security & IT',
      category: 'International Standards',
      default_checks: JSON.stringify([
        { code: 'ISO-27001-A5', name: 'Information Security Policies', requirement: 'Policies for information security shall be defined, approved by management, and published.', category: 'Governance', evidence_required: true },
        { code: 'ISO-27001-A9', name: 'User Access Management', requirement: 'A formal user registration and de-registration process shall be implemented.', category: 'Access Control', evidence_required: true },
        { code: 'ISO-27001-A10', name: 'Cryptographic Controls', requirement: 'Policy on the use of cryptographic controls for protection of information shall be developed.', category: 'Cryptography', evidence_required: true },
        { code: 'ISO-27001-A12', name: 'Backup & Recovery Testing', requirement: 'Backup copies of information, software and system images shall be taken and tested regularly.', category: 'Operations', evidence_required: true },
      ]),
      default_tasks: JSON.stringify([
        { title: 'Gather Access Policy Documents', description: 'Collect signed security policies and MFA enforcement logs.', priority: 'High' },
        { title: 'Run Vulnerability Assessment Scan', description: 'Perform infrastructure network scan and present remediation logs.', priority: 'High' },
      ]),
    },
    {
      id: 'tmpl-02',
      name: 'SOC 2 Type II Compliance Framework',
      description: 'Audits trust service criteria for Security, Availability, Processing Integrity, Confidentiality, and Privacy over a multi-month period.',
      type: 'Security & IT',
      category: 'Trust & Compliance',
      default_checks: JSON.stringify([
        { code: 'SOC2-CC1.1', name: 'COSO Control Environment', requirement: 'The entity demonstrates a commitment to integrity and ethical values.', category: 'Control Environment', evidence_required: false },
        { code: 'SOC2-CC6.1', name: 'Logical & Physical Access Controls', requirement: 'The entity implements logical access security software and infrastructure boundaries.', category: 'Logical Access', evidence_required: true },
        { code: 'SOC2-CC7.1', name: 'Change Management & Vulnerability Mitigation', requirement: 'Infrastructure changes are evaluated, authorized, and tested prior to deployment.', category: 'Change Management', evidence_required: true },
      ]),
      default_tasks: JSON.stringify([
        { title: 'Export PR Merge & Code Review Logs', description: 'Collect GitHub pull request approval logs for production branches.', priority: 'Medium' },
      ]),
    },
    {
      id: 'tmpl-03',
      name: 'Internal Operational & Risk Controls',
      description: 'General audit framework for assessing organizational operational procedures, departmental compliance, and resource usage.',
      type: 'Quality & Operational',
      category: 'Internal Governance',
      default_checks: JSON.stringify([
        { code: 'OPS-CTRL-01', name: 'Standard Operating Procedures Review', requirement: 'SOPs must be updated annually and acknowledged by all active department staff.', category: 'SOP & Training', evidence_required: true },
        { code: 'OPS-CTRL-02', name: 'Inventory & Asset Physical Count', requirement: 'Physical verification of capital assets performed against register.', category: 'Asset Management', evidence_required: true },
      ]),
      default_tasks: JSON.stringify([
        { title: 'Sample SOP Sign-off Logs', description: 'Sample 20% of department personnel for annual policy sign-offs.', priority: 'Low' },
      ]),
    },
  ];

  const tmplStmt = db.prepare(`
    INSERT INTO audit_templates (
      id, name, description, type, category, default_checks, default_tasks
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const t of templates) {
    tmplStmt.run(t.id, t.name, t.description, t.type, t.category, t.default_checks, t.default_tasks);
  }

  console.log('[DB] Seeding completed successfully.');
}

export default db;
