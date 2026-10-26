import React, { useState } from 'react';
import { useAudit } from '../../context/AuditContext';
import { ShieldCheck, UserPlus, LogIn, Crown, Sparkles, X } from 'lucide-react';
import type { Role } from '../../types/audit';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    isAuthenticated,
    users,
    login,
    register,
  } = useAudit();

  const [activeTab, setActiveTab] = useState<'personas' | 'register'>('personas');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('Contributor');
  const [department, setDepartment] = useState('IT & Security Audit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMsg('Please enter both your name and email address.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        role,
        department: department.trim() || 'Internal Compliance',
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to register account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D3139]/60 p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-[#E5D6CE] bg-white p-6 sm:p-8 shadow-2xl transition-all">
        {/* Close button if already authenticated */}
        {isAuthenticated && (
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 rounded-full p-2 text-[#6C737E] hover:bg-[#E7EBEE] hover:text-[#2D3139] transition-colors"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DEC3B3] text-[#2D3139] shadow-sm">
            <ShieldCheck className="h-8 w-8 text-[#2D3139]" />
          </div>
          <div className="mt-3 flex items-center justify-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#2D3139]">
              Audit<span className="text-[#8C7567]">Pulse</span>
            </h1>
            <span className="rounded-full bg-[#E5D6CE] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-[#8C7567] border border-[#DEC3B3]">
              Admin Portal • Ankit
            </span>
          </div>
          <p className="mt-2 text-sm text-[#4A515E] max-w-md mx-auto">
            Enterprise Digital Audit & Compliance Workspace. Select your persona or register a unique account to proceed.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="mt-6 flex rounded-2xl bg-[#F8F2EF] p-1.5 border border-[#E5D6CE]">
          <button
            onClick={() => setActiveTab('personas')}
            className={`flex flex-1 items-center justify-center space-x-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${
              activeTab === 'personas'
                ? 'bg-white text-[#2D3139] shadow-sm border border-[#DEC3B3]'
                : 'text-[#6C737E] hover:text-[#2D3139]'
            }`}
          >
            <LogIn className="h-4 w-4 text-[#8C7567]" />
            <span>Select Team Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex flex-1 items-center justify-center space-x-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${
              activeTab === 'register'
                ? 'bg-white text-[#2D3139] shadow-sm border border-[#DEC3B3]'
                : 'text-[#6C737E] hover:text-[#2D3139]'
            }`}
          >
            <UserPlus className="h-4 w-4 text-[#8C7567]" />
            <span>Register as New User</span>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'personas' ? (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between text-xs text-[#6C737E] px-1">
              <span>Choose your profile to log in straight away:</span>
              <span className="font-semibold text-[#8C7567]">1-Click Instant Access</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-h-[340px] overflow-y-auto pr-1">
              {users.map((user) => {
                const isAdmin = user.role === 'Admin' || user.name.toLowerCase() === 'ankit';
                return (
                  <button
                    key={user.id}
                    onClick={() => login(user)}
                    className={`group flex items-start space-x-3.5 rounded-2xl border p-3.5 text-left transition-all hover:scale-[1.01] hover:shadow-md cursor-pointer ${
                      isAdmin
                        ? 'border-[#DEC3B3] bg-[#F8F2EF]/90 ring-1 ring-[#DEC3B3]'
                        : 'border-[#E5D6CE] bg-white hover:border-[#DEC3B3]'
                    }`}
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-11 w-11 rounded-full object-cover border border-[#D2DCE4] group-hover:scale-105 transition-transform"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-sm text-[#2D3139] truncate">{user.name}</span>
                        {isAdmin && (
                          <span className="flex items-center space-x-1 rounded bg-[#DEC3B3] px-1.5 py-0.5 text-[10px] font-bold text-[#2D3139]">
                            <Crown className="h-3 w-3 text-amber-700" />
                            <span>Admin Portal</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#8C7567] font-semibold mt-0.5">{user.role}</p>
                      <p className="text-[11px] text-[#6C737E] truncate">{user.department}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="mt-6 space-y-4">
            {errorMsg && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-[#2D3139] mb-1.5">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ankit / Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-[#E5D6CE] bg-[#F8F2EF]/40 px-3.5 py-2.5 text-sm text-[#2D3139] focus:border-[#DEC3B3] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D3139] mb-1.5">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. user@auditpulse.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#E5D6CE] bg-[#F8F2EF]/40 px-3.5 py-2.5 text-sm text-[#2D3139] focus:border-[#DEC3B3] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-[#2D3139] mb-1.5">Platform Role *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full rounded-xl border border-[#E5D6CE] bg-[#F8F2EF]/40 px-3.5 py-2.5 text-sm text-[#2D3139] focus:border-[#DEC3B3] focus:outline-none"
                >
                  <option value="Admin">Admin (Full Administrative & Governance Access)</option>
                  <option value="Audit Manager">Audit Manager (Planning, Review & Approval)</option>
                  <option value="Auditor">Auditor (Check Evaluation & Verification)</option>
                  <option value="Contributor">Contributor (Task Execution & Evidence Upload)</option>
                  <option value="Viewer">Viewer (Read-only Oversight & Reports)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D3139] mb-1.5">Department / Team</label>
                <input
                  type="text"
                  placeholder="e.g. Executive Governance / IT Security"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full rounded-xl border border-[#E5D6CE] bg-[#F8F2EF]/40 px-3.5 py-2.5 text-sm text-[#2D3139] focus:border-[#DEC3B3] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center space-x-2 rounded-xl bg-[#DEC3B3] py-3 text-sm font-bold text-[#2D3139] hover:bg-[#d5b5a3] transition-all border border-[#DEC3B3] shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>{isSubmitting ? 'Setting up Workspace...' : 'Create Profile & Enter Workspace'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Footer info */}
        <div className="mt-6 border-t border-[#E7EBEE] pt-4 text-center text-xs text-[#6C737E]">
          <p>
            AuditPulse Multi-Tenant Governance • Session persisted uniquely for your device.
          </p>
        </div>
      </div>
    </div>
  );
};
