import React, { useState } from 'react';
import { useAudit } from '../../context/AuditContext';
import { Plus, CheckCircle2 } from 'lucide-react';

interface FindingsViewProps {
  onOpenCreateFindingModal: (auditId?: string) => void;
}

export const FindingsView: React.FC<FindingsViewProps> = ({ onOpenCreateFindingModal }) => {
  const { findings, audits, updateActionStatus } = useAudit();
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  const filteredFindings = findings.filter((f) => {
    if (severityFilter !== 'ALL' && f.severity !== severityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-7">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#2D3139] tracking-tight">Findings & Corrective Actions Matrix</h1>
          <p className="text-sm text-[#5D6470] mt-1 font-medium">Deficiencies, severity levels, and linked corrective action resolution loops.</p>
        </div>
        <button
          onClick={() => onOpenCreateFindingModal()}
          className="flex items-center space-x-2 rounded-xl bg-[#DEC3B3] px-4.5 py-2.5 text-sm font-bold text-[#2D3139] hover:bg-[#d5b5a3] transition-all border border-[#CDB1A1] shadow-xs cursor-pointer active:scale-98"
        >
          <Plus className="h-4 w-4" />
          <span>Record New Finding</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-3xl border border-[#E5D6CE] bg-white p-4 shadow-xs">
        <span className="text-xs font-bold text-[#5D6470] mr-1">Filter Severity:</span>
        {['ALL', 'Critical', 'High', 'Medium', 'Low', 'Informational'].map((sev) => (
          <button
            key={sev}
            onClick={() => setSeverityFilter(sev)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              severityFilter === sev ? 'bg-[#DEC3B3] text-[#2D3139] border border-[#CDB1A1] shadow-xs' : 'text-[#5D6470] hover:bg-[#E7EBEE]'
            }`}
          >
            {sev}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredFindings.map((fnd) => {
          const audit = audits.find((a) => a.id === fnd.audit_id);

          return (
            <div key={fnd.id} className="rounded-2xl border border-[#E5D6CE] bg-white p-5 space-y-4 shadow-xs">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`rounded px-2.5 py-0.5 text-[10px] font-bold border ${
                      fnd.severity === 'Critical' ? 'bg-[#E5D6CE] text-[#8C7567] border-[#DEC3B3]' : 'bg-[#F8F2EF] text-[#6C737E] border-[#E5D6CE]'
                    }`}>
                      {fnd.severity} Severity
                    </span>
                    <span className="rounded bg-[#E7EBEE] px-2 py-0.5 text-[10px] text-[#2D3139]">{fnd.category}</span>
                    <span className="text-xs text-[#6C737E]">Audit: <strong className="text-[#2D3139]">{audit?.title}</strong></span>
                  </div>
                  <h3 className="text-sm font-bold text-[#2D3139] mt-2">{fnd.title}</h3>
                  <p className="text-xs text-[#6C737E] mt-1 leading-relaxed">{fnd.description}</p>
                </div>
                <span className="rounded-full bg-[#E7EBEE] px-3 py-1 text-xs font-semibold text-[#2D3139] border border-[#D2DCE4]">
                  {fnd.status}
                </span>
              </div>

              <div className="rounded-xl bg-[#F8F2EF] p-3 text-xs border border-[#E5D6CE]">
                <strong className="text-[#8C7567]">Auditor Recommendation:</strong>
                <p className="text-[#2D3139] mt-0.5">{fnd.recommendation}</p>
              </div>

              <div className="pt-3 border-t border-[#E7EBEE] space-y-2">
                <span className="text-xs font-bold text-[#2D3139]">Corrective Action Plan ({fnd.corrective_actions.length})</span>
                {fnd.corrective_actions.map((act) => (
                  <div key={act.id} className="flex items-center justify-between rounded-lg bg-[#F8F2EF] p-2.5 text-xs border border-[#E5D6CE]">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateActionStatus(fnd.id, act.id, act.status === 'Completed' ? 'In Progress' : 'Completed')}
                        className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                          act.status === 'Completed' ? 'border-[#8C7567] bg-[#DEC3B3] text-[#2D3139]' : 'border-[#D2DCE4] hover:border-[#DEC3B3]'
                        }`}
                      >
                        {act.status === 'Completed' && <CheckCircle2 className="h-3 w-3" />}
                      </button>
                      <span className={act.status === 'Completed' ? 'line-through text-[#6C737E]' : 'text-[#2D3139]'}>{act.description}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-[#6C737E]">{act.status}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
