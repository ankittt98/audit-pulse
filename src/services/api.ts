import type {
  User,
  Organization,
  Audit,
  AuditTask,
  ComplianceCheck,
  EvidenceDocument,
  Finding,
  ActivityRecord,
  AuditTemplate,
  CheckWorkflowStatus,
  CheckResult,
  DocumentReviewStatus,
} from '../types/audit';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errMsg = `API error ${res.status}: ${res.statusText}`;
    try {
      const json = await res.json();
      if (json && json.error) errMsg = json.error;
    } catch {
      // fallback
    }
    throw new Error(errMsg);
  }
  return res.json();
}

export const api = {
  // Users & Org
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/users`);
    return handleResponse<User[]>(res);
  },

  async registerUser(userData: { name: string; email: string; role?: string; department?: string }): Promise<User> {
    const res = await fetch(`${API_BASE}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse<User>(res);
  },

  async loginUser(credentials: { email?: string; id?: string }): Promise<User> {
    const res = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse<User>(res);
  },

  async getOrganization(): Promise<Organization> {
    const res = await fetch(`${API_BASE}/organization`);
    return handleResponse<Organization>(res);
  },

  // Audits
  async getAudits(): Promise<Audit[]> {
    const res = await fetch(`${API_BASE}/audits`);
    return handleResponse<Audit[]>(res);
  },

  async getAudit(id: string): Promise<Audit & { tasks: AuditTask[]; checks: ComplianceCheck[]; documents: EvidenceDocument[]; findings: Finding[]; activities: ActivityRecord[] }> {
    const res = await fetch(`${API_BASE}/audits/${id}`);
    return handleResponse<any>(res);
  },

  async createAudit(data: any): Promise<Audit> {
    const res = await fetch(`${API_BASE}/audits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Audit>(res);
  },

  async updateAudit(id: string, data: Partial<Audit> & { user_id?: string; user_name?: string }): Promise<Audit> {
    const res = await fetch(`${API_BASE}/audits/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Audit>(res);
  },

  async deleteAudit(id: string): Promise<{ message: string; id: string }> {
    const res = await fetch(`${API_BASE}/audits/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<any>(res);
  },

  // Tasks
  async getTasks(auditId?: string): Promise<AuditTask[]> {
    const url = auditId ? `${API_BASE}/tasks?audit_id=${auditId}` : `${API_BASE}/tasks`;
    const res = await fetch(url);
    return handleResponse<AuditTask[]>(res);
  },

  async createTask(data: any): Promise<AuditTask> {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<AuditTask>(res);
  },

  async updateTask(id: string, data: Partial<AuditTask> & { user_id?: string; user_name?: string }): Promise<AuditTask> {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<AuditTask>(res);
  },

  async deleteTask(id: string): Promise<{ message: string; id: string }> {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<any>(res);
  },

  // Compliance Checks
  async getChecks(auditId?: string): Promise<ComplianceCheck[]> {
    const url = auditId ? `${API_BASE}/checks?audit_id=${auditId}` : `${API_BASE}/checks`;
    const res = await fetch(url);
    return handleResponse<ComplianceCheck[]>(res);
  },

  async createCheck(data: any): Promise<ComplianceCheck> {
    const res = await fetch(`${API_BASE}/checks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<ComplianceCheck>(res);
  },

  async evaluateCheck(id: string, data: { status: CheckWorkflowStatus; result: CheckResult; notes?: string; reviewer_id?: string; user_name?: string }): Promise<ComplianceCheck> {
    const res = await fetch(`${API_BASE}/checks/${id}/evaluate`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<ComplianceCheck>(res);
  },

  // Documents & Verification
  async getDocuments(auditId?: string, reviewStatus?: string): Promise<EvidenceDocument[]> {
    const params = new URLSearchParams();
    if (auditId) params.append('audit_id', auditId);
    if (reviewStatus && reviewStatus !== 'ALL') params.append('review_status', reviewStatus);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/documents${qs}`);
    return handleResponse<EvidenceDocument[]>(res);
  },

  async uploadDocument(formData: FormData): Promise<EvidenceDocument> {
    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse<EvidenceDocument>(res);
  },

  async reviewDocument(id: string, data: { review_status: DocumentReviewStatus; reviewer_notes?: string; reviewer_id?: string; reviewer_name?: string }): Promise<EvidenceDocument> {
    const res = await fetch(`${API_BASE}/documents/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<EvidenceDocument>(res);
  },

  async verifyDocumentIntegrity(id: string): Promise<{
    document_id: string;
    title: string;
    filename: string;
    registered_hash_sha256: string;
    current_disk_hash: string;
    is_authentic: boolean;
    tamper_detected: boolean;
    review_status: string;
    reviewed_at?: string;
  }> {
    const res = await fetch(`${API_BASE}/documents/${id}/verify`);
    return handleResponse<any>(res);
  },

  // Findings & CAPA
  async getFindings(auditId?: string): Promise<Finding[]> {
    const url = auditId ? `${API_BASE}/findings?audit_id=${auditId}` : `${API_BASE}/findings`;
    const res = await fetch(url);
    return handleResponse<Finding[]>(res);
  },

  async createFinding(data: any): Promise<Finding> {
    const res = await fetch(`${API_BASE}/findings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Finding>(res);
  },

  async updateFinding(id: string, data: Partial<Finding> & { user_id?: string; user_name?: string }): Promise<Finding> {
    const res = await fetch(`${API_BASE}/findings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Finding>(res);
  },

  async addCorrectiveAction(findingId: string, data: { description: string; owner_id: string; due_date: string; priority: any; user_id?: string; user_name?: string }): Promise<Finding> {
    const res = await fetch(`${API_BASE}/findings/${findingId}/actions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Finding>(res);
  },

  async updateActionStatus(findingId: string, actionId: string, data: { status: string; completion_notes?: string; reviewer_id?: string; user_name?: string }): Promise<Finding> {
    const res = await fetch(`${API_BASE}/findings/${findingId}/actions/${actionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Finding>(res);
  },

  // Activities & Templates & Stats
  async getActivities(auditId?: string, limit: number = 50): Promise<ActivityRecord[]> {
    const url = auditId ? `${API_BASE}/activities?audit_id=${auditId}&limit=${limit}` : `${API_BASE}/activities?limit=${limit}`;
    const res = await fetch(url);
    return handleResponse<ActivityRecord[]>(res);
  },

  async getTemplates(): Promise<AuditTemplate[]> {
    const res = await fetch(`${API_BASE}/templates`);
    return handleResponse<AuditTemplate[]>(res);
  },

  async getStats(): Promise<any> {
    const res = await fetch(`${API_BASE}/stats`);
    return handleResponse<any>(res);
  },
};
