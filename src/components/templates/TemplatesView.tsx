import React from 'react';
import { useAudit } from '../../context/AuditContext';
import { ArrowRight } from 'lucide-react';

interface TemplatesViewProps {
  onUseTemplate: (templateId: string) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({ onUseTemplate }) => {
  const { templates } = useAudit();

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-bold text-[#2D3139] tracking-tight">Audit Template Library</h1>
        <p className="text-sm text-[#5D6470] mt-1 font-medium">Standardized frameworks for fast audit workspace setup and consistent compliance criteria.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {templates.map((tmpl) => (
          <div key={tmpl.id} className="flex flex-col justify-between rounded-2xl border border-[#E5D6CE] bg-white p-6 space-y-4 shadow-xs">
            <div>
              <div className="flex items-center space-x-2">
                <span className="rounded bg-[#D2DCE4]/50 px-2 py-0.5 text-[10px] font-semibold text-[#2D3139] border border-[#D2DCE4]">
                  {tmpl.type}
                </span>
                <span className="rounded bg-[#E7EBEE] px-2 py-0.5 text-[10px] text-[#6C737E]">
                  {tmpl.category}
                </span>
              </div>
              <h3 className="text-base font-bold text-[#2D3139] mt-2">{tmpl.name}</h3>
              <p className="text-xs text-[#6C737E] mt-1 leading-relaxed">{tmpl.description}</p>

              <div className="mt-4 pt-3 border-t border-[#E7EBEE] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C737E]">Included Default Checks ({tmpl.default_checks.length})</span>
                <div className="space-y-1">
                  {tmpl.default_checks.map((chk) => (
                    <div key={chk.code} className="flex items-center justify-between text-xs text-[#2D3139] bg-[#F8F2EF] p-2 rounded-lg border border-[#E5D6CE]">
                      <span className="font-mono text-[#8C7567] text-[10px]">{chk.code}</span>
                      <span className="truncate max-w-[200px]">{chk.name}</span>
                      <span className="text-[9px] text-[#6C737E]">{chk.category}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => onUseTemplate(tmpl.id)}
              className="flex items-center justify-center space-x-2 w-full rounded-xl bg-[#DEC3B3] px-4 py-2.5 text-xs font-bold text-[#2D3139] shadow-xs hover:bg-[#d5b5a3] transition-all border border-[#DEC3B3]"
            >
              <span>Initialize Audit from Template</span>
              <ArrowRight className="h-4 w-4 text-[#2D3139]" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
