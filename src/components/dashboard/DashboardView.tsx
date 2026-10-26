import React from 'react';
import { useAudit } from '../../context/AuditContext';
import {
  ClipboardList,
  CheckSquare,
  AlertTriangle,
  FolderLock,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenCreateAudit: () => void;
  onOpenUploadEvidence: () => void;
  onOpenReviewDoc?: (docId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenCreateAudit,
  onOpenUploadEvidence,
  onOpenReviewDoc,
}) => {
  const {
    audits,
    tasks,
    checks,
    documents,
    findings,
    activities,
    setActiveView,
    setSelectedAuditId,
    updateTaskStatus,
  } = useAudit();

  const totalAudits = audits.length;
  const activeAudits = audits.filter((a) => a.status === 'In Progress' || a.status === 'Under Review');
  const completedAudits = audits.filter((a) => a.status === 'Completed').length;
  const overdueTasks = tasks.filter((t) => t.status === 'Overdue');
  const pendingTasks = tasks.filter((t) => t.status === 'Not Started' || t.status === 'In Progress');
  const pendingDocReviews = documents.filter((d) => d.review_status === 'Under Review' || d.review_status === 'Pending');
  const openFindings = findings.filter((f) => f.status === 'Open' || f.status === 'Assigned' || f.status === 'In Progress');
  const criticalFindings = findings.filter((f) => f.severity === 'Critical' || f.severity === 'High');

  const totalChecks = checks.length;
  const passedChecks = checks.filter((c) => c.result === 'Pass').length;
  const passRate = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

  return (
    <div className="space-y-7">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-[#E5D6CE] bg-white p-7 md:flex-row md:items-center shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-[#2D3139] tracking-tight">Audit Operations Dashboard</h1>
            <span className="rounded-full bg-[#E7EBEE] px-2.5 py-0.5 text-xs font-bold text-[#8C7567] border border-[#D2DCE4]">
              Live Governance
            </span>
          </div>
          <p className="mt-1 text-sm text-[#5D6470] font-medium leading-relaxed">
            Real-time tracking for active audits, verifiable compliance checks, SHA-256 evidence vaults, and findings.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenUploadEvidence}
            className="flex items-center space-x-2 rounded-xl border border-[#D2DCE4] bg-[#E7EBEE] px-4.5 py-2.5 text-sm font-bold text-[#2D3139] hover:bg-[#D2DCE4]/70 transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <FolderLock className="h-4 w-4 text-[#8C7567]" />
            <span>Upload Evidence</span>
          </button>
          <button
            onClick={onOpenCreateAudit}
            className="flex items-center space-x-2 rounded-xl bg-[#DEC3B3] px-5 py-2.5 text-sm font-bold text-[#2D3139] hover:bg-[#d5b5a3] transition-all border border-[#CDB1A1] shadow-xs cursor-pointer active:scale-98"
          >
            <ClipboardList className="h-4 w-4" />
            <span>New Audit</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Audits */}
        <div
          onClick={() => setActiveView('audits')}
          className="group cursor-pointer rounded-3xl border border-[#E5D6CE] bg-white p-6 transition-all hover:border-[#DEC3B3] hover:shadow-lg shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[#5D6470]">Active Audits</span>
            <div className="rounded-2xl bg-[#E7EBEE] p-2.5 text-[#2D3139] group-hover:scale-110 transition-transform">
              <ClipboardList className="h-5 w-5 text-[#8C7567]" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-[#2D3139]">{activeAudits.length}</span>
            <span className="text-xs text-[#5D6470] font-semibold">/ {totalAudits} Total</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-[#8C7567] font-bold">
            <span>{completedAudits} Completed</span>
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>

        {/* Overdue / Pending Tasks */}
        <div
          onClick={() => setActiveView('tasks')}
          className="group cursor-pointer rounded-3xl border border-[#E5D6CE] bg-white p-6 transition-all hover:border-[#DEC3B3] hover:shadow-lg shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[#5D6470]">Overdue Tasks</span>
            <div className="rounded-2xl bg-[#E5D6CE]/60 p-2.5 text-[#8C7567] group-hover:scale-110 transition-transform">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-[#8C7567]">{overdueTasks.length}</span>
            <span className="text-xs text-[#5D6470] font-semibold">/ {pendingTasks.length} Pending</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-[#8C7567] font-bold">
            <span>Requires Action</span>
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>

        {/* Pending Evidence Reviews */}
        <div
          onClick={() => setActiveView('documents')}
          className="group cursor-pointer rounded-3xl border border-[#E5D6CE] bg-white p-6 transition-all hover:border-[#DEC3B3] hover:shadow-lg shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[#5D6470]">Document Reviews</span>
            <div className="rounded-2xl bg-[#E7EBEE] p-2.5 text-[#5D6470] group-hover:scale-110 transition-transform">
              <FolderLock className="h-5 w-5 text-[#8C7567]" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-[#2D3139]">{pendingDocReviews.length}</span>
            <span className="text-xs text-[#5D6470] font-semibold">Awaiting Verification</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-[#5D6470] font-bold">
            <span>Evidence Vault Queue</span>
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>

        {/* Open Findings & Pass Rate */}
        <div
          onClick={() => setActiveView('findings')}
          className="group cursor-pointer rounded-3xl border border-[#E5D6CE] bg-white p-6 transition-all hover:border-[#DEC3B3] hover:shadow-lg shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[#5D6470]">Open Findings</span>
            <div className="rounded-2xl bg-[#E5D6CE]/60 p-2.5 text-[#8C7567] group-hover:scale-110 transition-transform">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-[#2D3139]">{openFindings.length}</span>
            <span className="text-xs text-[#8C7567] font-bold">{criticalFindings.length} High/Critical</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-[#5D6470] font-bold">
            <span>Pass Rate: {passRate}%</span>
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Main Grid: Active Audits & Urgent Action Center */}
      <div className="grid grid-cols-1 gap-7 lg:grid-cols-3">
        {/* Left Column (2 cols): Active Audits & Overdue Tasks */}
        <div className="lg:col-span-2 space-y-7">
          {/* Active Audits Section */}
          <div className="rounded-3xl border border-[#E5D6CE] bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#E7EBEE]">
              <div className="flex items-center space-x-2.5">
                <ClipboardList className="h-5 w-5 text-[#8C7567]" />
                <h2 className="text-base font-bold text-[#2D3139]">Active Audits Overview</h2>
              </div>
              <button
                onClick={() => setActiveView('audits')}
                className="text-xs text-[#8C7567] hover:underline flex items-center space-x-1 font-bold cursor-pointer"
              >
                <span>View All ({audits.length})</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-3.5">
              {activeAudits.length === 0 ? (
                <div className="py-8 text-center text-sm text-[#5D6470]">No active audits running currently.</div>
              ) : (
                activeAudits.map((audit) => {
                  const auditChecks = checks.filter((c) => c.audit_id === audit.id);
                  const completedChecksCount = auditChecks.filter((c) => c.status === 'Completed').length;
                  const progressPct = auditChecks.length > 0 ? Math.round((completedChecksCount / auditChecks.length) * 100) : 0;

                  return (
                    <div
                      key={audit.id}
                      onClick={() => {
                        setSelectedAuditId(audit.id);
                        setActiveView('audit-detail');
                      }}
                      className="cursor-pointer rounded-2xl border border-[#E5D6CE] bg-[#F8F2EF]/60 p-4.5 transition-all hover:border-[#DEC3B3] hover:bg-white hover:shadow-md shadow-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="rounded-lg bg-[#D2DCE4]/60 px-2.5 py-1 text-xs font-bold text-[#2D3139] border border-[#D2DCE4]">
                              {audit.type}
                            </span>
                            <span className="rounded-lg bg-[#E5D6CE] px-2.5 py-1 text-xs font-bold text-[#8C7567] border border-[#DEC3B3]">
                              {audit.priority} Priority
                            </span>
                          </div>
                          <h3 className="mt-2.5 text-sm font-bold text-[#2D3139] hover:text-[#8C7567] transition-colors">
                            {audit.title}
                          </h3>
                        </div>
                        <span className="rounded-full bg-[#E7EBEE] border border-[#D2DCE4] px-3 py-1 text-xs font-bold text-[#2D3139]">
                          {audit.status}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-[#5D6470] mb-1.5 font-medium">
                          <span>Check Progress: {completedChecksCount}/{auditChecks.length} ({progressPct}%)</span>
                          <span>Target: {audit.target_completion_date}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-[#E7EBEE] overflow-hidden">
                          <div
                            className="h-full bg-[#DEC3B3] rounded-full transition-all duration-500"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Actionable Overdue & Urgent Tasks */}
          <div className="rounded-3xl border border-[#E5D6CE] bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#E7EBEE]">
              <div className="flex items-center space-x-2.5">
                <CheckSquare className="h-5 w-5 text-[#8C7567]" />
                <h2 className="text-base font-bold text-[#2D3139]">Actionable Tasks & Deadlines</h2>
              </div>
              <button
                onClick={() => setActiveView('tasks')}
                className="text-xs text-[#8C7567] hover:underline flex items-center space-x-1 font-bold cursor-pointer"
              >
                <span>Task Board</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {tasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-2xl border border-[#E5D6CE] bg-[#F8F2EF]/40 p-3.5 text-sm hover:border-[#DEC3B3] transition-all"
                >
                  <div className="flex items-center space-x-3.5">
                    <button
                      onClick={() => updateTaskStatus(task.id, task.status === 'Completed' ? 'In Progress' : 'Completed')}
                      className={`h-5 w-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                        task.status === 'Completed'
                          ? 'border-[#8C7567] bg-[#DEC3B3] text-[#2D3139]'
                          : 'border-[#D2DCE4] bg-white hover:border-[#DEC3B3]'
                      }`}
                      title={task.status === 'Completed' ? 'Mark In Progress' : 'Mark Completed'}
                    >
                      {task.status === 'Completed' && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </button>
                    <div>
                      <p className={`font-semibold cursor-pointer hover:text-[#8C7567] ${task.status === 'Completed' ? 'line-through text-[#6C737E]' : 'text-[#2D3139]'}`}
                        onClick={() => {
                          setSelectedAuditId(task.audit_id);
                          setActiveView('audit-detail');
                        }}
                      >
                        {task.title}
                      </p>
                      <p className="text-xs text-[#5D6470] mt-0.5 font-medium">Due: {task.due_date}</p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold border ${
                      task.status === 'Overdue'
                        ? 'bg-[#E5D6CE] text-[#8C7567] border-[#DEC3B3]'
                        : task.status === 'Completed'
                        ? 'bg-[#E7EBEE] text-[#2D3139] border-[#D2DCE4]'
                        : 'bg-white text-[#5D6470] border-[#E5D6CE]'
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Document Queue & Live Activity Stream */}
        <div className="space-y-7">
          {/* Document Review Queue */}
          <div className="rounded-3xl border border-[#E5D6CE] bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#E7EBEE]">
              <div className="flex items-center space-x-2.5">
                <FolderLock className="h-5 w-5 text-[#8C7567]" />
                <h2 className="text-base font-bold text-[#2D3139]">Pending Evidence Vault</h2>
              </div>
              <span className="rounded-full bg-[#E5D6CE] px-2.5 py-0.5 text-xs font-bold text-[#8C7567] border border-[#DEC3B3]">
                {pendingDocReviews.length}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {pendingDocReviews.length === 0 ? (
                <div className="py-4 text-center text-xs text-[#5D6470]">All evidence documents verified!</div>
              ) : (
                pendingDocReviews.slice(0, 3).map((doc) => (
                  <div key={doc.id} className="rounded-2xl border border-[#E5D6CE] bg-[#F8F2EF]/60 p-3.5 text-xs hover:border-[#DEC3B3] transition-all">
                    <p className="font-bold text-[#2D3139] text-sm">{doc.title}</p>
                    <p className="text-xs text-[#5D6470] font-mono mt-1">{doc.filename} • {doc.file_size}</p>
                    <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-[#E7EBEE]">
                      <span className="text-xs text-[#5D6470] font-medium">By {doc.uploaded_by}</span>
                      <button
                        onClick={() => {
                          if (onOpenReviewDoc) {
                            onOpenReviewDoc(doc.id);
                          } else {
                            setActiveView('documents');
                          }
                        }}
                        className="text-xs text-[#8C7567] hover:underline font-bold cursor-pointer flex items-center space-x-1"
                      >
                        <span>Review File</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Live Activity Stream */}
          <div className="rounded-3xl border border-[#E5D6CE] bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#E7EBEE]">
              <div className="flex items-center space-x-2.5">
                <TrendingUp className="h-5 w-5 text-[#8C7567]" />
                <h2 className="text-base font-bold text-[#2D3139]">Audit Trail Ledger</h2>
              </div>
              <button
                onClick={() => setActiveView('activity')}
                className="text-xs text-[#8C7567] hover:underline font-bold cursor-pointer"
              >
                Full Trail
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {activities.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  onClick={() => {
                    if (log.audit_id) {
                      setSelectedAuditId(log.audit_id);
                      setActiveView('audit-detail');
                    } else {
                      setActiveView('activity');
                    }
                  }}
                  className="flex items-start space-x-3.5 text-xs border-b border-[#E7EBEE] pb-3 last:border-none cursor-pointer hover:bg-[#F8F2EF]/80 p-1.5 rounded-xl transition-colors"
                >
                  <img src={log.user_avatar} alt={log.user_name} className="h-7 w-7 rounded-full object-cover mt-0.5 border border-[#D2DCE4]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[#2D3139]">
                      <strong className="text-sm font-bold">{log.user_name}</strong>{' '}
                      <span className="text-[#8C7567] font-semibold">{log.action}</span>
                    </p>
                    <p className="text-xs text-[#5D6470] mt-0.5 line-clamp-2 leading-relaxed">{log.details}</p>
                    <span className="text-[11px] text-[#6C737E] mt-1 block font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
