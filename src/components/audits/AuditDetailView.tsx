import React, { useState } from 'react';
import { useAudit } from '../../context/AuditContext';
import {
  ArrowLeft,
  ShieldCheck,
  CheckSquare,
  FileCheck,
  FolderLock,
  AlertTriangle,
  History,
  FileText,
  Plus,
  CheckCircle2,
  Printer,
} from 'lucide-react';
import type { AuditStatus } from '../../types/audit';

interface AuditDetailViewProps {
  onOpenCreateTaskModal: (auditId: string) => void;
  onOpenUploadEvidenceModal: (auditId: string) => void;
  onOpenCreateFindingModal: (auditId: string) => void;
  onOpenEvaluateCheckModal: (checkId: string) => void;
  onOpenReviewDocModal: (docId: string) => void;
}

export const AuditDetailView: React.FC<AuditDetailViewProps> = ({
  onOpenCreateTaskModal,
  onOpenUploadEvidenceModal,
  onOpenCreateFindingModal,
  onOpenEvaluateCheckModal,
  onOpenReviewDocModal,
}) => {
  const {
    audits,
    selectedAuditId,
    setSelectedAuditId,
    setActiveView,
    users,
    tasks,
    checks,
    documents,
    findings,
    activities,
    updateAuditStatus,
    updateTaskStatus,
    updateActionStatus,
  } = useAudit();

  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'checks' | 'evidence' | 'findings' | 'activity' | 'report'>('overview');

  const audit = audits.find((a) => a.id === selectedAuditId);

  if (!audit) {
    return (
      <div className="py-12 text-center text-[#6C737E]">
        <p>Audit record not found.</p>
        <button
          onClick={() => setActiveView('audits')}
          className="mt-4 text-xs font-semibold text-[#8C7567] hover:underline"
        >
          Return to Audit Directory
        </button>
      </div>
    );
  }

  const auditTasks = tasks.filter((t) => t.audit_id === audit.id);
  const auditChecks = checks.filter((c) => c.audit_id === audit.id);
  const auditDocs = documents.filter((d) => d.audit_id === audit.id);
  const auditFindings = findings.filter((f) => f.audit_id === audit.id);
  const auditActivities = activities.filter((act) => act.audit_id === audit.id);

  const owner = users.find((u) => u.id === audit.owner_id);
  const auditorNames = audit.auditor_ids
    .map((id) => users.find((u) => u.id === id)?.name)
    .filter(Boolean)
    .join(', ');

  const completedChecksCount = auditChecks.filter((c) => c.status === 'Completed').length;
  const passedChecksCount = auditChecks.filter((c) => c.result === 'Pass').length;
  const failedChecksCount = auditChecks.filter((c) => c.result === 'Fail').length;
  const partialChecksCount = auditChecks.filter((c) => c.result === 'Partially Met').length;
  const progressPct = auditChecks.length > 0 ? Math.round((completedChecksCount / auditChecks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            setSelectedAuditId(null);
            setActiveView('audits');
          }}
          className="flex items-center space-x-2 text-xs font-semibold text-[#6C737E] hover:text-[#8C7567] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Audit Directory</span>
        </button>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-[#5D6470] font-semibold">Change Status:</span>
          <select
            value={audit.status}
            onChange={(e) => updateAuditStatus(audit.id, e.target.value as AuditStatus)}
            className="rounded-xl border border-[#E5D6CE] bg-white px-3.5 py-1.5 text-xs sm:text-sm font-bold text-[#2D3139] focus:border-[#DEC3B3] focus:outline-none cursor-pointer shadow-xs"
          >
            <option value="Draft">Draft</option>
            <option value="Planned">Planned</option>
            <option value="In Progress">In Progress</option>
            <option value="Under Review">Under Review</option>
            <option value="Completed">Completed</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Header Info Block */}
      <div className="rounded-3xl border border-[#E5D6CE] bg-white p-7 shadow-xs">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <div className="flex items-center space-x-2">
              <span className="rounded-lg bg-[#D2DCE4]/60 px-2.5 py-1 text-xs font-bold text-[#2D3139] border border-[#D2DCE4]">
                {audit.type}
              </span>
              <span className="rounded-lg bg-[#F8F2EF] px-2.5 py-1 text-xs font-bold text-[#2D3139] border border-[#E5D6CE]">
                {audit.status}
              </span>
              <span
                className={`rounded-lg px-2.5 py-1 text-xs font-bold border ${
                  audit.priority === 'Critical'
                    ? 'bg-[#E5D6CE] text-[#8C7567] border-[#DEC3B3]'
                    : 'bg-[#E7EBEE] text-[#5D6470] border-[#D2DCE4]'
                }`}
              >
                {audit.priority} Priority
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-bold text-[#2D3139] tracking-tight">{audit.title}</h1>
            <p className="mt-1.5 text-sm text-[#5D6470] leading-relaxed max-w-3xl font-medium">{audit.description}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onOpenCreateTaskModal(audit.id)}
              className="flex items-center space-x-1.5 rounded-xl border border-[#D2DCE4] bg-[#E7EBEE] px-3 py-1.5 text-xs font-medium text-[#2D3139] hover:bg-[#D2DCE4]/60 transition-colors"
            >
              <Plus className="h-3.5 w-3.5 text-[#8C7567]" />
              <span>Add Task</span>
            </button>
            <button
              onClick={() => onOpenUploadEvidenceModal(audit.id)}
              className="flex items-center space-x-1.5 rounded-xl border border-[#DEC3B3] bg-[#E5D6CE]/40 px-3 py-1.5 text-xs font-medium text-[#2D3139] hover:bg-[#E5D6CE] transition-colors"
            >
              <Plus className="h-3.5 w-3.5 text-[#8C7567]" />
              <span>Upload Evidence</span>
            </button>
            <button
              onClick={() => onOpenCreateFindingModal(audit.id)}
              className="flex items-center space-x-1.5 rounded-xl border border-[#DEC3B3] bg-[#DEC3B3] px-3 py-1.5 text-xs font-bold text-[#2D3139] hover:bg-[#d5b5a3] transition-colors shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Record Finding</span>
            </button>
          </div>
        </div>

        {/* Audit Meta Stats Row */}
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[#E7EBEE] pt-4 sm:grid-cols-4">
          <div>
            <span className="text-[10px] font-semibold text-[#6C737E] uppercase tracking-wider">Audit Lead</span>
            <p className="text-xs font-semibold text-[#2D3139] mt-0.5">{owner?.name || 'Unassigned'}</p>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-[#6C737E] uppercase tracking-wider">Auditor Team</span>
            <p className="text-xs font-semibold text-[#2D3139] mt-0.5">{auditorNames || 'Unassigned'}</p>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-[#6C737E] uppercase tracking-wider">Audit Period</span>
            <p className="text-xs font-semibold text-[#2D3139] mt-0.5">
              {audit.start_date} → {audit.target_completion_date}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-[#6C737E] uppercase tracking-wider">Progress</span>
            <div className="mt-1 flex items-center space-x-2">
              <div className="h-2 flex-1 rounded-full bg-[#E7EBEE] overflow-hidden">
                <div className="h-full bg-[#DEC3B3] rounded-full" style={{ width: `${progressPct}%` }} />
              </div>
              <span className="text-xs font-bold text-[#8C7567]">{progressPct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-[#E5D6CE] overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: ShieldCheck },
          { id: 'tasks', label: 'Tasks', icon: CheckSquare, count: auditTasks.length },
          { id: 'checks', label: 'Compliance Checks', icon: FileCheck, count: auditChecks.length },
          { id: 'evidence', label: 'Evidence Vault', icon: FolderLock, count: auditDocs.length },
          { id: 'findings', label: 'Findings & Actions', icon: AlertTriangle, count: auditFindings.length },
          { id: 'activity', label: 'Activity Trail', icon: History },
          { id: 'report', label: 'Audit Summary Report', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 border-b-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-[#8C7567] text-[#2D3139] bg-white'
                  : 'border-transparent text-[#6C737E] hover:text-[#2D3139]'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="rounded-full bg-[#E7EBEE] px-2 py-0.5 text-[10px] font-bold text-[#2D3139]">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-[#E5D6CE] bg-white p-5 shadow-xs">
              <h3 className="text-sm font-bold text-[#2D3139] mb-3">Defined Scope & Objectives</h3>
              <p className="text-xs text-[#2D3139] leading-relaxed">{audit.scope}</p>

              {audit.notes && (
                <div className="mt-4 rounded-xl border border-[#E5D6CE] bg-[#F8F2EF]/60 p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C737E]">Auditor Notes</span>
                  <p className="text-xs text-[#6C737E] mt-1">{audit.notes}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-[#E5D6CE] bg-white p-4 shadow-xs">
                <span className="text-xs font-medium text-[#6C737E]">Total Checks</span>
                <p className="text-xl font-bold text-[#2D3139] mt-1">{auditChecks.length}</p>
              </div>
              <div className="rounded-xl border border-[#E5D6CE] bg-white p-4 shadow-xs">
                <span className="text-xs font-medium text-[#6C737E]">Passed Checks</span>
                <p className="text-xl font-bold text-[#2D3139] mt-1">{passedChecksCount}</p>
              </div>
              <div className="rounded-xl border border-[#E5D6CE] bg-white p-4 shadow-xs">
                <span className="text-xs font-medium text-[#8C7567]">Failed / Findings</span>
                <p className="text-xl font-bold text-[#8C7567] mt-1">{failedChecksCount}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-[#E5D6CE] bg-white p-5 shadow-xs">
              <h3 className="text-sm font-bold text-[#2D3139] mb-3">Audit Metadata</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-[#E7EBEE]">
                  <span className="text-[#6C737E]">Department Unit:</span>
                  <span className="font-semibold text-[#2D3139]">{audit.unit}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E7EBEE]">
                  <span className="text-[#6C737E]">Created Date:</span>
                  <span className="font-mono text-[#2D3139]">{new Date(audit.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E7EBEE]">
                  <span className="text-[#6C737E]">Last Modified:</span>
                  <span className="font-mono text-[#2D3139]">{new Date(audit.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Tasks */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-[#2D3139]">Assigned Audit Tasks</h3>
            <button
              onClick={() => onOpenCreateTaskModal(audit.id)}
              className="flex items-center space-x-1.5 rounded-xl bg-[#DEC3B3] px-3 py-1.5 text-xs font-bold text-[#2D3139] hover:bg-[#d5b5a3] transition-colors border border-[#DEC3B3]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Task</span>
            </button>
          </div>

          <div className="space-y-2">
            {auditTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#6C737E] border border-dashed border-[#E5D6CE] rounded-xl bg-white">
                No tasks created for this audit yet.
              </div>
            ) : (
              auditTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-xl border border-[#E5D6CE] bg-white p-4 text-xs shadow-xs"
                >
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateTaskStatus(t.id, t.status === 'Completed' ? 'In Progress' : 'Completed')}
                      className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                        t.status === 'Completed'
                          ? 'border-[#8C7567] bg-[#DEC3B3] text-[#2D3139]'
                          : 'border-[#D2DCE4] hover:border-[#DEC3B3]'
                      }`}
                    >
                      {t.status === 'Completed' && <CheckCircle2 className="h-3 w-3" />}
                    </button>
                    <div>
                      <p className={`font-semibold ${t.status === 'Completed' ? 'line-through text-[#6C737E]' : 'text-[#2D3139]'}`}>
                        {t.title}
                      </p>
                      <p className="text-[10px] text-[#6C737E] mt-0.5">{t.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-[10px] text-[#6C737E]">Due: {t.due_date}</span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-semibold border ${
                        t.status === 'Overdue'
                          ? 'bg-[#E5D6CE] text-[#8C7567] border-[#DEC3B3]'
                          : t.status === 'Completed'
                          ? 'bg-[#E7EBEE] text-[#2D3139] border-[#D2DCE4]'
                          : 'bg-[#F8F2EF] text-[#6C737E] border-[#E5D6CE]'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Compliance Checks */}
      {activeTab === 'checks' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-[#2D3139]">Configurable Compliance Checks</h3>
              <p className="text-xs text-[#6C737E]">
                Separation between <strong className="text-[#8C7567]">Workflow Status</strong> and <strong className="text-[#2D3139]">Evaluation Result</strong>.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {auditChecks.map((chk) => (
              <div
                key={chk.id}
                className="rounded-xl border border-[#E5D6CE] bg-white p-4 transition-all hover:border-[#DEC3B3] shadow-xs"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="rounded bg-[#F8F2EF] px-2 py-0.5 text-[10px] font-mono text-[#2D3139] border border-[#E5D6CE]">
                        {chk.code}
                      </span>
                      <span className="rounded bg-[#E7EBEE] px-2 py-0.5 text-[10px] font-semibold text-[#6C737E]">
                        {chk.category}
                      </span>
                      {chk.evidence_required && (
                        <span className="rounded bg-[#E5D6CE]/50 px-2 py-0.5 text-[10px] text-[#8C7567] border border-[#DEC3B3]">
                          Evidence Required
                        </span>
                      )}
                    </div>
                    <h4 className="mt-2 text-xs font-bold text-[#2D3139]">{chk.name}</h4>
                    <p className="mt-1 text-xs text-[#6C737E]">{chk.requirement}</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Workflow Status */}
                    <div className="text-right">
                      <span className="block text-[9px] text-[#6C737E] uppercase tracking-wider">Workflow</span>
                      <span className="rounded bg-[#E7EBEE] px-2 py-0.5 text-[10px] font-semibold text-[#2D3139]">
                        {chk.status}
                      </span>
                    </div>

                    {/* Result */}
                    <div className="text-right">
                      <span className="block text-[9px] text-[#6C737E] uppercase tracking-wider">Result</span>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-semibold border ${
                          chk.result === 'Pass'
                            ? 'bg-[#E7EBEE] text-[#2D3139] border-[#D2DCE4]'
                            : chk.result === 'Fail'
                            ? 'bg-[#E5D6CE] text-[#8C7567] border-[#DEC3B3]'
                            : 'bg-[#F8F2EF] text-[#6C737E] border-[#E5D6CE]'
                        }`}
                      >
                        {chk.result}
                      </span>
                    </div>

                    <button
                      onClick={() => onOpenEvaluateCheckModal(chk.id)}
                      className="rounded-xl border border-[#D2DCE4] bg-[#E7EBEE] px-3 py-1.5 text-xs font-semibold text-[#2D3139] hover:bg-[#D2DCE4]/60 transition-colors"
                    >
                      Evaluate Check
                    </button>
                  </div>
                </div>

                {chk.notes && (
                  <p className="mt-3 text-[11px] text-[#6C737E] bg-[#F8F2EF] p-2 rounded-lg border border-[#E5D6CE]">
                    <strong className="text-[#2D3139]">Notes:</strong> {chk.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Evidence Vault */}
      {activeTab === 'evidence' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-[#2D3139]">Associated Supporting Documents & Evidence</h3>
            <button
              onClick={() => onOpenUploadEvidenceModal(audit.id)}
              className="flex items-center space-x-1.5 rounded-xl bg-[#DEC3B3] px-3 py-1.5 text-xs font-bold text-[#2D3139] hover:bg-[#d5b5a3] transition-colors border border-[#DEC3B3]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Upload Document</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {auditDocs.map((doc) => (
              <div key={doc.id} className="rounded-xl border border-[#E5D6CE] bg-white p-4 space-y-3 shadow-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-[#8C7567]">v{doc.version}</span>
                    <h4 className="text-xs font-bold text-[#2D3139] mt-0.5">{doc.title}</h4>
                    <p className="text-[10px] text-[#6C737E] font-mono">{doc.filename} ({doc.file_size})</p>
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-semibold border ${
                      doc.review_status === 'Verified'
                        ? 'bg-[#E7EBEE] text-[#2D3139] border-[#D2DCE4]'
                        : doc.review_status === 'Rejected'
                        ? 'bg-[#E5D6CE] text-[#8C7567] border-[#DEC3B3]'
                        : 'bg-[#F8F2EF] text-[#6C737E] border-[#E5D6CE]'
                    }`}
                  >
                    {doc.review_status}
                  </span>
                </div>

                {doc.description && <p className="text-xs text-[#6C737E] leading-relaxed">{doc.description}</p>}

                {doc.reviewer_notes && (
                  <div className="rounded bg-[#F8F2EF] p-2 text-[10px] text-[#6C737E] border border-[#E5D6CE]">
                    <strong className="text-[#2D3139]">Auditor Feedback:</strong> {doc.reviewer_notes}
                  </div>
                )}

                {doc.file_hash && (
                  <div className="rounded bg-[#F8F2EF] p-1.5 text-[9px] font-mono text-[#6C737E] truncate border border-[#E5D6CE]">
                    <span className="font-semibold text-[#8C7567]">SHA-256: </span>{doc.file_hash}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-[#E7EBEE] text-[10px] text-[#6C737E]">
                  <span>Uploaded by {doc.uploaded_by}</span>
                  <div className="flex items-center space-x-2">
                    <a
                      href={`/api/documents/${doc.id}/download`}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-0.5 rounded bg-[#E7EBEE] hover:bg-[#d5dce2] font-semibold text-[#2D3139]"
                    >
                      Download
                    </a>
                    <button
                      onClick={() => onOpenReviewDocModal(doc.id)}
                      className="text-[#8C7567] hover:underline font-semibold"
                    >
                      Review →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Findings */}
      {activeTab === 'findings' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-[#2D3139]">Identified Audit Findings & Corrective Actions</h3>
            <button
              onClick={() => onOpenCreateFindingModal(audit.id)}
              className="flex items-center space-x-1.5 rounded-xl bg-[#DEC3B3] px-3 py-1.5 text-xs font-bold text-[#2D3139] hover:bg-[#d5b5a3] transition-colors border border-[#DEC3B3]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Record Finding</span>
            </button>
          </div>

          <div className="space-y-4">
            {auditFindings.map((fnd) => (
              <div key={fnd.id} className="rounded-xl border border-[#E5D6CE] bg-white p-5 space-y-4 shadow-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-semibold border ${
                          fnd.severity === 'Critical'
                            ? 'bg-[#E5D6CE] text-[#8C7567] border-[#DEC3B3]'
                            : 'bg-[#F8F2EF] text-[#6C737E] border-[#E5D6CE]'
                        }`}
                      >
                        {fnd.severity} Severity
                      </span>
                      <span className="rounded bg-[#E7EBEE] px-2 py-0.5 text-[10px] text-[#2D3139]">
                        {fnd.category}
                      </span>
                    </div>
                    <h4 className="mt-2 text-sm font-bold text-[#2D3139]">{fnd.title}</h4>
                    <p className="mt-1 text-xs text-[#6C737E] leading-relaxed">{fnd.description}</p>
                  </div>
                  <span className="rounded-full bg-[#E7EBEE] px-3 py-1 text-xs font-semibold text-[#2D3139] border border-[#D2DCE4]">
                    {fnd.status}
                  </span>
                </div>

                <div className="rounded-lg bg-[#F8F2EF] p-3 border border-[#E5D6CE] text-xs">
                  <strong className="text-[#8C7567]">Auditor Recommendation:</strong>
                  <p className="text-[#2D3139] mt-0.5">{fnd.recommendation}</p>
                </div>

                {/* Corrective Actions Section */}
                <div className="pt-3 border-t border-[#E7EBEE]">
                  <span className="text-xs font-bold text-[#2D3139] mb-2 block">
                    Required Corrective Actions ({fnd.corrective_actions.length})
                  </span>
                  <div className="space-y-2">
                    {fnd.corrective_actions.map((act) => (
                      <div
                        key={act.id}
                        className="flex items-center justify-between rounded-lg bg-[#F8F2EF] p-2.5 text-xs border border-[#E5D6CE]"
                      >
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() =>
                              updateActionStatus(
                                fnd.id,
                                act.id,
                                act.status === 'Completed' ? 'In Progress' : 'Completed'
                              )
                            }
                            className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                              act.status === 'Completed'
                                ? 'border-[#8C7567] bg-[#DEC3B3] text-[#2D3139]'
                                : 'border-[#D2DCE4] hover:border-[#DEC3B3]'
                            }`}
                          >
                            {act.status === 'Completed' && <CheckCircle2 className="h-3 w-3" />}
                          </button>
                          <span className={act.status === 'Completed' ? 'line-through text-[#6C737E]' : 'text-[#2D3139]'}>
                            {act.description}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#6C737E] font-medium">Status: {act.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Activity */}
      {activeTab === 'activity' && (
        <div className="rounded-2xl border border-[#E5D6CE] bg-white p-5 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-[#2D3139]">Audit Chronological Activity Log</h3>
          <div className="space-y-4">
            {auditActivities.map((act) => (
              <div key={act.id} className="flex items-start space-x-3 text-xs border-b border-[#E7EBEE] pb-3">
                <img src={act.user_avatar} alt={act.user_name} className="h-7 w-7 rounded-full object-cover mt-0.5 border border-[#D2DCE4]" />
                <div>
                  <p className="text-[#2D3139]">
                    <strong className="text-[#2D3139]">{act.user_name}</strong> •{' '}
                    <span className="text-[#8C7567] font-semibold">{act.action}</span>
                  </p>
                  <p className="text-[#6C737E] mt-1">{act.details}</p>
                  <span className="text-[10px] text-[#6C737E] mt-1 block">
                    {new Date(act.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Report Summary */}
      {activeTab === 'report' && (
        <div className="rounded-2xl border border-[#E5D6CE] bg-white p-8 space-y-6 shadow-xs">
          <div className="flex justify-between items-center border-b border-[#E7EBEE] pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7567]">Formal Executive Summary</span>
              <h2 className="text-xl font-bold text-[#2D3139] mt-0.5">Audit Summary & Findings Report</h2>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-2 rounded-xl border border-[#D2DCE4] bg-[#E7EBEE] px-4 py-2 text-xs font-semibold text-[#2D3139] hover:bg-[#D2DCE4]/60 transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Save PDF</span>
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4 bg-[#F8F2EF] p-4 rounded-xl border border-[#E5D6CE] text-center">
            <div>
              <span className="text-[10px] text-[#6C737E] uppercase">Total Checks</span>
              <p className="text-2xl font-bold text-[#2D3139] mt-1">{auditChecks.length}</p>
            </div>
            <div>
              <span className="text-[10px] text-[#2D3139] uppercase">Passed</span>
              <p className="text-2xl font-bold text-[#2D3139] mt-1">{passedChecksCount}</p>
            </div>
            <div>
              <span className="text-[10px] text-[#6C737E] uppercase">Partially Met</span>
              <p className="text-2xl font-bold text-[#6C737E] mt-1">{partialChecksCount}</p>
            </div>
            <div>
              <span className="text-[10px] text-[#8C7567] uppercase">Failed / Open Findings</span>
              <p className="text-2xl font-bold text-[#8C7567] mt-1">{failedChecksCount + auditFindings.length}</p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-[#2D3139] leading-relaxed">
            <h3 className="text-sm font-bold text-[#2D3139]">Executive Statement</h3>
            <p>
              This report provides a formal record of audit activities conducted for <strong>{audit.title}</strong> across {audit.unit}. The evaluation verified organizational adherence against defined requirements.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
