import React, { useState } from 'react';
import { useAudit } from '../../context/AuditContext';
import { Search, ExternalLink, Filter } from 'lucide-react';

export const ActivityView: React.FC = () => {
  const { activities, setSelectedAuditId, setActiveView } = useAudit();
  const [filterType, setFilterType] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const entityTypes = ['ALL', 'Audit', 'Check', 'Document', 'Finding', 'Action', 'User'];

  const filteredActivities = activities.filter((act) => {
    if (filterType !== 'ALL' && act.entity_type !== filterType) return false;
    if (
      search &&
      !act.details.toLowerCase().includes(search.toLowerCase()) &&
      !act.user_name.toLowerCase().includes(search.toLowerCase()) &&
      !act.action.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleEntityClick = (act: any) => {
    if (act.audit_id) {
      setSelectedAuditId(act.audit_id);
      setActiveView('audit-detail');
      return;
    }

    if (act.entity_type === 'Audit') {
      setSelectedAuditId(act.entity_id);
      setActiveView('audit-detail');
    } else if (act.entity_type === 'Check') {
      setActiveView('checks');
    } else if (act.entity_type === 'Document') {
      setActiveView('documents');
    } else if (act.entity_type === 'Finding' || act.entity_type === 'Action') {
      setActiveView('findings');
    }
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-[#2D3139] tracking-tight">System Audit Trail & History</h1>
            <span className="rounded-full bg-[#E5D6CE] px-2.5 py-0.5 text-xs font-bold text-[#8C7567] border border-[#DEC3B3]">
              Immutable
            </span>
          </div>
          <p className="text-sm text-[#5D6470] mt-1 font-medium">
            Chronological ledger of user interactions, compliance verifications, and cryptographic evidence events.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center gap-3.5 rounded-3xl border border-[#E5D6CE] bg-white p-4 shadow-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6C737E]" />
          <input
            type="text"
            placeholder="Search activity by user, action, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[#E5D6CE] bg-[#F8F2EF]/50 py-2 pl-10 pr-4 text-xs sm:text-sm text-[#2D3139] placeholder-[#6C737E] focus:border-[#DEC3B3] focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto">
          <Filter className="h-4 w-4 text-[#8C7567] mr-1 hidden sm:block" />
          {entityTypes.map((et) => (
            <button
              key={et}
              onClick={() => setFilterType(et)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                filterType === et
                  ? 'bg-[#DEC3B3] text-[#2D3139] border border-[#CDB1A1]'
                  : 'text-[#5D6470] hover:bg-[#E7EBEE]'
              }`}
            >
              {et}
            </button>
          ))}
        </div>
      </div>

      {/* Activity List */}
      <div className="rounded-3xl border border-[#E5D6CE] bg-white p-6 sm:p-7 space-y-4 shadow-xs">
        {filteredActivities.length === 0 ? (
          <div className="py-8 text-center text-sm text-[#5D6470]">No activity logs match your filter criteria.</div>
        ) : (
          filteredActivities.map((act) => (
            <div
              key={act.id}
              onClick={() => handleEntityClick(act)}
              className="group flex items-start space-x-4 border-b border-[#E7EBEE] pb-4 last:border-none cursor-pointer p-2.5 rounded-2xl hover:bg-[#F8F2EF]/60 transition-all"
            >
              <img
                src={act.user_avatar}
                alt={act.user_name}
                className="h-10 w-10 rounded-full object-cover mt-0.5 border border-[#D2DCE4] group-hover:scale-105 transition-transform"
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <p className="text-sm text-[#2D3139]">
                    <strong className="text-[#2D3139] font-bold">{act.user_name}</strong>{' '}
                    <span className="rounded-lg bg-[#E7EBEE] px-2.5 py-0.5 font-bold text-xs text-[#8C7567] border border-[#D2DCE4]">
                      {act.action}
                    </span>
                  </p>
                  <span className="text-xs text-[#5D6470] font-mono">
                    {new Date(act.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-[#5D6470] mt-1 leading-relaxed">{act.details}</p>
                <div className="mt-2.5 flex items-center space-x-2 text-xs">
                  <span className="rounded-lg bg-[#F8F2EF] px-2.5 py-1 font-mono text-[#5D6470] border border-[#E5D6CE]">
                    Entity: {act.entity_type} ({act.entity_id})
                  </span>
                  <span className="text-xs font-bold text-[#8C7567] group-hover:underline flex items-center space-x-1">
                    <span>Navigate to target</span>
                    <ExternalLink className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
