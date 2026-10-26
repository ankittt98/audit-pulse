import React, { useState } from 'react';
import { useAudit } from '../../context/AuditContext';
import {
  Plus,
  Search,
  Calendar,
  User,
} from 'lucide-react';

interface AuditListViewProps {
  onOpenCreateModal: () => void;
}

export const AuditListView: React.FC<AuditListViewProps> = ({ onOpenCreateModal }) => {
  const { audits, users, setSelectedAuditId, setActiveView, checks } = useAudit();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [localSearch, setLocalSearch] = useState<string>('');

  const filteredAudits = audits.filter((audit) => {
    if (statusFilter !== 'ALL' && audit.status !== statusFilter) return false;
    if (typeFilter !== 'ALL' && audit.type !== typeFilter) return false;
    if (priorityFilter !== 'ALL' && audit.priority !== priorityFilter) return false;
    if (
      localSearch &&
      !audit.title.toLowerCase().includes(localSearch.toLowerCase()) &&
      !audit.description.toLowerCase().includes(localSearch.toLowerCase()) &&
      !audit.unit.toLowerCase().includes(localSearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const getOwnerName = (ownerId: string) => {
    return users.find((u) => u.id === ownerId)?.name || 'Unassigned';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#2D3139] tracking-tight">Audit Workspaces</h1>
          <p className="mt-1 text-sm text-[#5D6470] font-medium">
            Manage complete enterprise audit lifecycle from Planning to Verification and Archival.
          </p>
        </div>
        <button
          onClick={onOpenCreateModal}
          className="flex items-center space-x-2 rounded-xl bg-[#DEC3B3] px-4.5 py-2.5 text-sm font-bold text-[#2D3139] hover:bg-[#d5b5a3] transition-all border border-[#CDB1A1] shadow-xs cursor-pointer active:scale-98"
        >
          <Plus className="h-4 w-4 text-[#2D3139]" />
          <span>Initialize Audit</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-[#E5D6CE] bg-white p-4 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6C737E]" />
          <input
            type="text"
            placeholder="Search by title, scope, or department unit..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full rounded-xl border border-[#E5D6CE] bg-[#F8F2EF]/50 py-2 pl-10 pr-3 text-xs sm:text-sm text-[#2D3139] placeholder-[#6C737E] focus:border-[#DEC3B3] focus:outline-none"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-[#E5D6CE] bg-[#F8F2EF]/50 px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#2D3139] focus:border-[#DEC3B3] focus:outline-none cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Planned">Planned</option>
          <option value="In Progress">In Progress</option>
          <option value="Under Review">Under Review</option>
          <option value="Completed">Completed</option>
          <option value="Archived">Archived</option>
        </select>

        {/* Audit Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-xl border border-[#E5D6CE] bg-[#F8F2EF]/40 px-3 py-1.5 text-xs text-[#2D3139] focus:border-[#DEC3B3] focus:outline-none"
        >
          <option value="ALL">All Audit Types</option>
          <option value="Security & IT">Security & IT</option>
          <option value="Financial">Financial</option>
          <option value="Regulatory">Regulatory</option>
          <option value="Quality & Operational">Quality & Operational</option>
          <option value="Internal">Internal</option>
        </select>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-xl border border-[#E5D6CE] bg-[#F8F2EF]/40 px-3 py-1.5 text-xs text-[#2D3139] focus:border-[#DEC3B3] focus:outline-none"
        >
          <option value="ALL">All Priorities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Audit Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {filteredAudits.map((audit) => {
          const auditChecks = checks.filter((c) => c.audit_id === audit.id);
          const completedChecks = auditChecks.filter((c) => c.status === 'Completed').length;
          const progressPct = auditChecks.length > 0 ? Math.round((completedChecks / auditChecks.length) * 100) : 0;

          return (
            <div
              key={audit.id}
              onClick={() => {
                setSelectedAuditId(audit.id);
                setActiveView('audit-detail');
              }}
              className="group cursor-pointer rounded-2xl border border-[#E5D6CE] bg-white p-5 transition-all hover:border-[#DEC3B3] hover:shadow-md shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="rounded bg-[#D2DCE4]/50 px-2 py-0.5 text-[10px] font-semibold text-[#2D3139] border border-[#D2DCE4]">
                      {audit.type}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-semibold border ${
                        audit.priority === 'Critical'
                          ? 'bg-[#E5D6CE] text-[#8C7567] border-[#DEC3B3]'
                          : 'bg-[#E7EBEE] text-[#6C737E] border-[#D2DCE4]'
                      }`}
                    >
                      {audit.priority}
                    </span>
                  </div>
                  <span className="rounded-full bg-[#F8F2EF] px-2.5 py-0.5 text-[10px] font-semibold text-[#2D3139] border border-[#E5D6CE]">
                    {audit.status}
                  </span>
                </div>

                {/* Audit Title & Description */}
                <h3 className="mt-3 text-sm font-bold text-[#2D3139] group-hover:text-[#8C7567] transition-colors">
                  {audit.title}
                </h3>
                <p className="mt-1 text-xs text-[#6C737E] line-clamp-2 leading-relaxed">
                  {audit.description}
                </p>

                {/* Department & Owner */}
                <div className="mt-4 flex items-center justify-between text-[11px] text-[#6C737E] pt-3 border-t border-[#E7EBEE]">
                  <div className="flex items-center space-x-1.5">
                    <User className="h-3.5 w-3.5 text-[#8C7567]" />
                    <span>Owner: {getOwnerName(audit.owner_id)}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="h-3.5 w-3.5 text-[#6C737E]" />
                    <span>Due: {audit.target_completion_date}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {audit.tags.map((tag) => (
                    <span key={tag} className="rounded bg-[#F8F2EF] px-2 py-0.5 text-[9px] font-mono text-[#6C737E] border border-[#E5D6CE]">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Progress Footer */}
              <div className="mt-5 pt-3 border-t border-[#E7EBEE]">
                <div className="flex justify-between text-[10px] text-[#6C737E] mb-1">
                  <span>Compliance Check Progress ({completedChecks}/{auditChecks.length})</span>
                  <span className="font-bold text-[#8C7567]">{progressPct}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#E7EBEE] overflow-hidden">
                  <div
                    className="h-full bg-[#DEC3B3] rounded-full"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
