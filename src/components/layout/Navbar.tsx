import React, { useState, useRef, useEffect } from 'react';
import { useAudit } from '../../context/AuditContext';
import {
  ShieldCheck,
  Search,
  Sun,
  Moon,
  Bell,
  Building2,
  UserCheck,
  ChevronDown,
  LogOut,
  Users,
  ExternalLink,
  X,
} from 'lucide-react';
import type { Role } from '../../types/audit';

export const Navbar: React.FC = () => {
  const {
    organization,
    currentUser,
    setCurrentUserRole,
    searchQuery,
    setSearchQuery,
    theme,
    toggleTheme,
    activities,
    openAuthModal,
    logout,
    setSelectedAuditId,
    setActiveView,
  } = useAudit();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns automatically when clicking anywhere outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setShowRoleDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const roles: Role[] = ['Admin', 'Audit Manager', 'Auditor', 'Contributor', 'Viewer'];
  const isAdmin = currentUser.role === 'Admin' || currentUser.name.toLowerCase() === 'ankit';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#E5D6CE] bg-[#F8F2EF]/95 px-6 backdrop-blur-md transition-colors">
      {/* Brand & Organization */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveView('dashboard')}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DEC3B3] shadow-sm text-[#2D3139]">
            <ShieldCheck className="h-6 w-6 text-[#2D3139]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-[#2D3139]">
                Audit<span className="text-[#8C7567]">Pulse</span>
              </span>
              <span className="rounded-full bg-[#DEC3B3] px-2.5 py-0.5 text-xs font-bold text-[#2D3139] border border-[#CDB1A1] shadow-xs">
                Admin Portal • Ankit
              </span>
            </div>
            <p className="text-xs text-[#5D6470] font-medium">Digital Audit & Compliance Platform</p>
          </div>
        </div>

        <div className="hidden h-6 w-[1px] bg-[#E5D6CE] md:block" />

        {/* Organization Tag */}
        <div className="hidden items-center space-x-2 rounded-xl border border-[#E5D6CE] bg-white px-3.5 py-1.5 text-xs text-[#2D3139] md:flex shadow-xs">
          <Building2 className="h-4 w-4 text-[#8C7567]" />
          <span className="font-semibold text-sm">{organization.name}</span>
          <span className="rounded bg-[#E7EBEE] px-1.5 py-0.5 text-xs text-[#5D6470] font-mono font-medium">
            {organization.code}
          </span>
        </div>
      </div>

      {/* Global Search */}
      <div className="flex flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6C737E]" />
          <input
            type="text"
            placeholder="Search audits, tasks, checks, documents, findings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[#E5D6CE] bg-white py-2 pl-10 pr-4 text-sm text-[#2D3139] placeholder-[#6C737E] transition-colors focus:border-[#DEC3B3] focus:outline-none shadow-xs"
          />
        </div>
      </div>

      {/* Actions & Role Switcher */}
      <div className="flex items-center space-x-3">
        {/* Role Switcher Button */}
        <div className="relative" ref={roleDropdownRef}>
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center space-x-2 rounded-xl border border-[#D2DCE4] bg-[#E7EBEE]/90 px-3.5 py-2 text-xs font-semibold text-[#2D3139] transition-colors hover:bg-[#D2DCE4]/60 cursor-pointer shadow-xs"
            title="Switch User Role for Live Demo"
          >
            <UserCheck className="h-4 w-4 text-[#8C7567]" />
            <span className="hidden sm:inline">Role: {currentUser.role}</span>
            <ChevronDown className="h-3.5 w-3.5 text-[#6C737E]" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-[#E5D6CE] bg-white p-2 shadow-xl z-50">
              <div className="px-3 py-1.5 text-xs font-bold text-[#6C737E] uppercase tracking-wider">
                Simulate User Role
              </div>
              <div className="mt-1 space-y-1">
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setCurrentUserRole(r);
                      setShowRoleDropdown(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                      currentUser.role === r
                        ? 'bg-[#DEC3B3] text-[#2D3139]'
                        : 'text-[#2D3139] hover:bg-[#E7EBEE]'
                    }`}
                  >
                    <span>{r}</span>
                    {currentUser.role === r && <span className="h-2 w-2 rounded-full bg-[#8C7567]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-xl border border-[#E5D6CE] bg-white p-2.5 text-[#6C737E] hover:text-[#2D3139] transition-colors shadow-xs cursor-pointer"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#DEC3B3] ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-84 rounded-2xl border border-[#E5D6CE] bg-white p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7EBEE]">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-[#2D3139]">System Feed & Logs</span>
                  <span className="text-xs text-[#8C7567] font-bold">Real-Time</span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="rounded-lg p-1 text-[#6C737E] hover:text-[#2D3139] hover:bg-[#E7EBEE] transition-colors cursor-pointer"
                  title="Close Notifications"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 max-h-64 overflow-y-auto space-y-2.5">
                {activities.slice(0, 5).map((act) => (
                  <div
                    key={act.id}
                    onClick={() => {
                      setShowNotifications(false);
                      if (act.audit_id) {
                        setSelectedAuditId(act.audit_id);
                        setActiveView('audit-detail');
                      } else {
                        setActiveView('activity');
                      }
                    }}
                    className="rounded-xl bg-[#F8F2EF] p-2.5 text-xs border border-[#E5D6CE] hover:border-[#DEC3B3] transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-[#2D3139]">{act.action}</p>
                      <ExternalLink className="h-3 w-3 text-[#8C7567]" />
                    </div>
                    <p className="text-xs text-[#5D6470] mt-1 line-clamp-2">{act.details}</p>
                    <span className="text-[11px] text-[#6C737E] mt-1.5 block font-mono">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {act.user_name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-xl border border-[#E5D6CE] bg-white p-2.5 text-[#6C737E] hover:text-[#2D3139] transition-colors shadow-xs cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-[#6C737E]" />}
        </button>

        {/* User Profile Info & Dropdown */}
        <div className="relative pl-2 border-l border-[#E5D6CE]" ref={userDropdownRef}>
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center space-x-2.5 rounded-xl border border-transparent p-1.5 hover:border-[#E5D6CE] hover:bg-white transition-all cursor-pointer text-left"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-9 w-9 rounded-full border border-[#D2DCE4] object-cover"
            />
            <div className="hidden lg:block">
              <div className="flex items-center space-x-1">
                <p className="text-sm font-bold text-[#2D3139] leading-tight">{currentUser.name}</p>
                {isAdmin && <span className="h-2 w-2 rounded-full bg-emerald-500" title="Active Admin" />}
              </div>
              <p className="text-xs text-[#5D6470] font-medium">{currentUser.department}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-[#6C737E]" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-[#E5D6CE] bg-white p-3 shadow-2xl z-50">
              <div className="p-2 border-b border-[#E7EBEE]">
                <div className="flex items-center space-x-3">
                  <img src={currentUser.avatar} alt={currentUser.name} className="h-10 w-10 rounded-full border border-[#D2DCE4] object-cover" />
                  <div>
                    <p className="text-sm font-bold text-[#2D3139]">{currentUser.name}</p>
                    <p className="text-xs text-[#5D6470]">{currentUser.email}</p>
                    <span className="inline-block mt-1 rounded bg-[#E5D6CE] px-2 py-0.5 text-[11px] font-bold text-[#8C7567]">
                      {currentUser.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-2 space-y-1">
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    openAuthModal();
                  }}
                  className="flex w-full items-center space-x-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#2D3139] hover:bg-[#E7EBEE] transition-colors cursor-pointer"
                >
                  <Users className="h-4 w-4 text-[#8C7567]" />
                  <span>Switch User / Register Colleague</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    logout();
                  }}
                  className="flex w-full items-center space-x-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4 text-rose-600" />
                  <span>Sign Out of Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
