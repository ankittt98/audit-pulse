import React, { useState } from 'react';
import { useAudit } from '../../context/AuditContext';
import { FileText, Download, CheckCircle2, ShieldAlert, BarChart3, Printer } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { audits, checks, findings, tasks, setSelectedAuditId, setActiveView, organization } = useAudit();
  const [filterType, setFilterType] = useState<string>('ALL');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const filteredAudits = audits.filter((a) => {
    if (filterType !== 'ALL' && a.type !== filterType) return false;
    return true;
  });

  const exportCSVReport = (auditId: string) => {
    const audit = audits.find((a) => a.id === auditId);
    if (!audit) return;

    const auditChecks = checks.filter((c) => c.audit_id === audit.id);
    const auditFindings = findings.filter((f) => f.audit_id === audit.id);
    const auditTasks = tasks.filter((t) => t.audit_id === audit.id);

    let csv = `Audit Report - ${audit.title}\n`;
    csv += `Organization,${organization.name}\n`;
    csv += `Type,${audit.type}\n`;
    csv += `Status,${audit.status}\n`;
    csv += `Target Date,${audit.target_completion_date}\n\n`;

    csv += `COMPLIANCE CHECKS\n`;
    csv += `Code,Name,Category,Status,Result\n`;
    auditChecks.forEach((c) => {
      csv += `"${c.code}","${c.name}","${c.category}","${c.status}","${c.result}"\n`;
    });

    csv += `\nFINDINGS & CORRECTIVE ACTIONS\n`;
    csv += `Title,Severity,Status,Recommendation\n`;
    auditFindings.forEach((f) => {
      csv += `"${f.title}","${f.severity}","${f.status}","${f.recommendation}"\n`;
    });

    csv += `\nAUDIT TASKS\n`;
    csv += `Title,Priority,Status,Due Date\n`;
    auditTasks.forEach((t) => {
      csv += `"${t.title}","${t.priority}","${t.status}","${t.due_date}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AuditReport_${audit.id}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(audit.id);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const exportGlobalExecutiveReport = () => {
    const reportData = {
      organization: organization.name,
      generatedAt: new Date().toISOString(),
      auditsTotal: audits.length,
      auditsSummary: audits.map((a) => ({
        id: a.id,
        title: a.title,
        status: a.status,
        type: a.type,
        checks: checks.filter((c) => c.audit_id === a.id).length,
        findings: findings.filter((f) => f.audit_id === a.id).length,
      })),
      passRateOverall: `${Math.round((checks.filter((c) => c.result === 'Pass').length / (checks.length || 1)) * 100)}%`,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Executive_AuditPulse_Report_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess('global');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#2D3139] tracking-tight">Audit & Compliance Reports Hub</h1>
          <p className="text-sm text-[#5D6470] mt-1 font-medium">
            Generate executive summaries, regulatory check metrics, and instant auditable exports.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-2 rounded-xl border border-[#D2DCE4] bg-white px-4 py-2.5 text-xs font-bold text-[#2D3139] hover:bg-[#E7EBEE] transition-all cursor-pointer shadow-xs"
          >
            <Printer className="h-4 w-4 text-[#8C7567]" />
            <span>Print Overview</span>
          </button>
          <button
            onClick={exportGlobalExecutiveReport}
            className="flex items-center space-x-2 rounded-xl bg-[#DEC3B3] px-4.5 py-2.5 text-xs font-bold text-[#2D3139] hover:bg-[#d5b5a3] transition-all border border-[#CDB1A1] shadow-xs cursor-pointer active:scale-98"
          >
            <Download className="h-4 w-4" />
            <span>{downloadSuccess === 'global' ? 'Downloaded JSON!' : 'Export Global Executive JSON'}</span>
          </button>
        </div>
      </div>

      {/* Filter row */}
      <div className="flex items-center space-x-3 rounded-2xl border border-[#E5D6CE] bg-white p-4 shadow-xs">
        <span className="text-xs text-[#5D6470] font-bold">Filter By Domain:</span>
        {['ALL', 'Security & IT', 'Financial', 'Regulatory', 'Quality & Operational'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              filterType === t
                ? 'bg-[#DEC3B3] text-[#2D3139] border border-[#CDB1A1] shadow-xs'
                : 'text-[#5D6470] hover:bg-[#E7EBEE]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-4.5">
        {filteredAudits.map((audit) => {
          const auditChecks = checks.filter((c) => c.audit_id === audit.id);
          const passedCount = auditChecks.filter((c) => c.result === 'Pass').length;
          const failedCount = auditChecks.filter((c) => c.result === 'Fail').length;
          const auditFindings = findings.filter((f) => f.audit_id === audit.id);

          return (
            <div key={audit.id} className="rounded-3xl border border-[#E5D6CE] bg-white p-6 space-y-5 shadow-xs hover:border-[#DEC3B3] transition-all">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="rounded-lg bg-[#D2DCE4]/60 px-2.5 py-1 text-xs font-bold text-[#2D3139] border border-[#D2DCE4]">
                      {audit.type}
                    </span>
                    <span className="rounded-lg bg-[#E7EBEE] px-2.5 py-1 text-xs font-bold text-[#5D6470]">
                      {audit.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#2D3139] mt-2">{audit.title}</h3>
                  <p className="text-xs text-[#5D6470] mt-1 font-medium">{audit.unit} • Target Completion: {audit.target_completion_date}</p>
                </div>

                <div className="flex items-center space-x-2.5">
                  <button
                    onClick={() => exportCSVReport(audit.id)}
                    className="flex items-center space-x-2 rounded-xl border border-[#D2DCE4] bg-[#E7EBEE] px-4 py-2.5 text-xs font-bold text-[#2D3139] hover:bg-[#D2DCE4]/80 transition-all cursor-pointer shadow-xs"
                  >
                    <Download className="h-4 w-4 text-[#8C7567]" />
                    <span>{downloadSuccess === audit.id ? 'Exported CSV!' : 'Export CSV'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedAuditId(audit.id);
                      setActiveView('audit-detail');
                    }}
                    className="flex items-center space-x-2 rounded-xl bg-[#DEC3B3] px-4 py-2.5 text-xs font-bold text-[#2D3139] hover:bg-[#d5b5a3] transition-all border border-[#CDB1A1] shadow-xs cursor-pointer active:scale-98"
                  >
                    <FileText className="h-4 w-4" />
                    <span>View Full Workspace</span>
                  </button>
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 bg-[#F8F2EF] p-4 rounded-2xl border border-[#E5D6CE] text-center text-sm">
                <div>
                  <span className="text-[#5D6470] text-xs font-bold uppercase tracking-wider">Total Checks</span>
                  <p className="font-extrabold text-[#2D3139] text-base mt-1">{auditChecks.length}</p>
                </div>
                <div>
                  <span className="text-emerald-700 text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Passed</span>
                  </span>
                  <p className="font-extrabold text-emerald-800 text-base mt-1">{passedCount}</p>
                </div>
                <div>
                  <span className="text-[#8C7567] text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span>Failed / At Risk</span>
                  </span>
                  <p className="font-extrabold text-[#8C7567] text-base mt-1">{failedCount}</p>
                </div>
                <div>
                  <span className="text-[#5D6470] text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1">
                    <BarChart3 className="h-3.5 w-3.5" />
                    <span>Open Findings</span>
                  </span>
                  <p className="font-extrabold text-[#2D3139] text-base mt-1">{auditFindings.length}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
