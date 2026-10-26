import React from 'react';
import { useAudit } from '../../context/AuditContext';
import {
  LayoutDashboard,
  ClipboardList,
  CheckSquare,
  FileCheck,
  FolderLock,
  AlertTriangle,
  FileText,
  History,
  BookTemplate,
  PlusCircle,
  Crown,
  Users,
} from 'lucide-react';

interface SidebarProps {
  onOpenCreateAuditModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenCreateAuditModal }) => {
  const {
    activeView,
    setActiveView,
    setSelectedAuditId,
    audits,
    tasks,
    documents,
    findings,
    currentUser,
    openAuthModal,
  } = useAudit();

  const activeAuditsCount = audits.filter((a) => a.status === 'In Progress' || a.status === 'Under Review').length;
  const overdueTasksCount = tasks.filter((t) => t.status === 'Overdue').length;
  const openFindingsCount = findings.filter((f) => f.status === 'Open' || f.status === 'Assigned').length;
  const pendingDocsCount = documents.filter((d) => d.review_status === 'Under Review' || d.review_status === 'Pending').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'audits', label: 'Audits Directory', icon: ClipboardList, badge: activeAuditsCount, badgeColor: 'bg-[#D2DCE4]/60 text-[#2D3139] border-[#D2DCE4]' },
    { id: 'tasks', label: 'Audit Tasks', icon: CheckSquare, badge: overdueTasksCount > 0 ? overdueTasksCount : undefined, badgeColor: 'bg-[#E5D6CE] text-[#8C7567] border-[#DEC3B3]' },
    { id: 'checks', label: 'Compliance Checks', icon: FileCheck },
    { id: 'documents', label: 'Evidence Vault', icon: FolderLock, badge: pendingDocsCount > 0 ? pendingDocsCount : undefined, badgeColor: 'bg-[#E7EBEE] text-[#6C737E] border-[#D2DCE4]' },
    { id: 'findings', label: 'Findings & Actions', icon: AlertTriangle, badge: openFindingsCount > 0 ? openFindingsCount : undefined, badgeColor: 'bg-[#E5D6CE] text-[#8C7567] border-[#DEC3B3]' },
    { id: 'templates', label: 'Audit Templates', icon: BookTemplate },
    { id: 'reports', label: 'Reports Hub', icon: FileText },
    { id: 'activity', label: 'Activity Log', icon: History },
  ];

  const isAdmin = currentUser.role === 'Admin' || currentUser.name.toLowerCase() === 'ankit';

  return (
    <aside className="w-68 border-r border-[#E5D6CE] bg-[#F8F2EF]/80 p-5 flex flex-col justify-between min-h-[calc(100vh-4rem)]">
      <div>
        {/* Quick Action Button */}
        <button
          onClick={onOpenCreateAuditModal}
          className="mb-6 flex w-full items-center justify-center space-x-2.5 rounded-2xl bg-[#DEC3B3] px-4 py-3 text-sm font-bold text-[#2D3139] shadow-sm transition-all hover:bg-[#d5b5a3] hover:shadow-md active:scale-98 border border-[#CDB1A1] cursor-pointer"
        >
          <PlusCircle className="h-4 w-4 text-[#2D3139]" />
          <span>New Audit Workspace</span>
        </button>

        {/* Navigation Section */}
        <div className="space-y-1.5">
          <div className="px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#6C737E]">
            Platform Modules
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  if (item.id === 'audits') setSelectedAuditId(null);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#2D3139] border border-[#DEC3B3] shadow-xs'
                    : 'text-[#5D6470] hover:bg-[#E7EBEE] hover:text-[#2D3139]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-[#8C7567]' : 'text-[#6C737E]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold border ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info & Admin Portal status */}
      <div className="border-t border-[#E5D6CE] pt-4 space-y-3">
        <div
          onClick={openAuthModal}
          className="rounded-2xl border border-[#E5D6CE] bg-white p-3.5 shadow-xs cursor-pointer hover:border-[#DEC3B3] transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isAdmin ? (
                <Crown className="h-4 w-4 text-amber-600" />
              ) : (
                <Users className="h-4 w-4 text-[#8C7567]" />
              )}
              <span className="text-xs font-bold text-[#2D3139]">
                {isAdmin ? 'Admin Portal: Ankit' : 'Active User Session'}
              </span>
            </div>
            <span className="text-[11px] text-[#8C7567] font-semibold hover:underline">Switch</span>
          </div>
          <p className="text-xs text-[#5D6470] mt-1.5 font-medium">
            Signed in as <strong className="text-[#2D3139]">{currentUser.name}</strong> ({currentUser.role})
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-[#6C737E] px-2">
          <span>AuditPulse Enterprise</span>
          <span className="flex items-center space-x-1 text-emerald-700 font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Connected</span>
          </span>
        </div>
      </div>
    </aside>
  );
};
