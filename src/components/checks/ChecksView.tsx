import React, { useState } from 'react';
import { useAudit } from '../../context/AuditContext';

interface ChecksViewProps {
  onOpenEvaluateCheckModal: (checkId: string) => void;
}

export const ChecksView: React.FC<ChecksViewProps> = ({ onOpenEvaluateCheckModal }) => {
  const { checks, audits } = useAudit();
  const [resultFilter, setResultFilter] = useState<string>('ALL');

  const filteredChecks = checks.filter((c) => {
    if (resultFilter !== 'ALL' && c.result !== resultFilter) return false;
    return true;
  });

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-bold text-[#2D3139] tracking-tight">Compliance Checks Registry</h1>
        <p className="text-sm text-[#5D6470] mt-1 font-medium">Configurable requirements and verification results across all audits.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-3xl border border-[#E5D6CE] bg-white p-4 shadow-xs">
        <span className="text-xs font-bold text-[#5D6470] mr-1">Filter Evaluation Result:</span>
        {['ALL', 'Pass', 'Fail', 'Partially Met', 'Pending', 'Not Applicable'].map((res) => (
          <button
            key={res}
            onClick={() => setResultFilter(res)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              resultFilter === res ? 'bg-[#DEC3B3] text-[#2D3139] border border-[#CDB1A1] shadow-xs' : 'text-[#5D6470] hover:bg-[#E7EBEE]'
            }`}
          >
            {res}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredChecks.map((chk) => {
          const audit = audits.find((a) => a.id === chk.audit_id);

          return (
            <div key={chk.id} className="rounded-2xl border border-[#E5D6CE] bg-white p-5 space-y-3 shadow-xs">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="rounded bg-[#F8F2EF] px-2 py-0.5 text-[10px] font-mono text-[#2D3139] border border-[#E5D6CE]">{chk.code}</span>
                    <span className="rounded bg-[#E7EBEE] px-2 py-0.5 text-[10px] text-[#6C737E]">{chk.category}</span>
                    <span className="text-xs text-[#6C737E]">Audit: <strong className="text-[#2D3139]">{audit?.title}</strong></span>
                  </div>
                  <h3 className="text-sm font-bold text-[#2D3139] mt-2">{chk.name}</h3>
                  <p className="text-xs text-[#6C737E] mt-1">{chk.requirement}</p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="block text-[9px] text-[#6C737E] uppercase">Workflow</span>
                    <span className="rounded bg-[#E7EBEE] px-2 py-0.5 text-[10px] text-[#2D3139] font-semibold">{chk.status}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[9px] text-[#6C737E] uppercase">Result</span>
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold border ${
                      chk.result === 'Pass' ? 'bg-[#E7EBEE] text-[#2D3139] border-[#D2DCE4]' :
                      chk.result === 'Fail' ? 'bg-[#E5D6CE] text-[#8C7567] border-[#DEC3B3]' :
                      'bg-[#F8F2EF] text-[#6C737E] border-[#E5D6CE]'
                    }`}>
                      {chk.result}
                    </span>
                  </div>
                  <button
                    onClick={() => onOpenEvaluateCheckModal(chk.id)}
                    className="rounded-xl border border-[#D2DCE4] bg-[#E7EBEE] px-3 py-1.5 text-xs font-semibold text-[#2D3139] hover:bg-[#D2DCE4]/60 transition-colors"
                  >
                    Evaluate
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
