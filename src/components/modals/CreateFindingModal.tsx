import React, { useState } from 'react';
import { useAudit } from '../../context/AuditContext';
import { X, AlertTriangle } from 'lucide-react';
import type { Severity } from '../../types/audit';

interface CreateFindingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAuditId?: string;
}

export const CreateFindingModal: React.FC<CreateFindingModalProps> = ({
  isOpen,
  onClose,
  defaultAuditId,
}) => {
  const { createFinding, audits, users } = useAudit();

  const [auditId, setAuditId] = useState(defaultAuditId || (audits[0]?.id || ''));
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Severity>('High');
  const [category, setCategory] = useState('Access Control / Governance');
  const [ownerId, setOwnerId] = useState(users[0]?.id || '');
  const [dueDate, setDueDate] = useState('2026-08-30');
  const [recommendation, setRecommendation] = useState('');
  const [actionDesc, setActionDesc] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !auditId) return;

    createFinding(
      {
        audit_id: auditId,
        title,
        description,
        severity,
        category,
        owner_id: ownerId,
        due_date: dueDate,
        status: 'Assigned',
        recommendation,
      },
      actionDesc ? [{ description: actionDesc, owner_id: ownerId, due_date: dueDate, priority: 'High' }] : []
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D3139]/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-[#E5D6CE] bg-white p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#E7EBEE] pb-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-[#8C7567]" />
            <h2 className="text-base font-bold text-[#2D3139]">Record Audit Finding / Deficiency</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-[#6C737E] hover:text-[#2D3139]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#6C737E] font-semibold mb-1">Audit Workspace *</label>
            <select
              value={auditId}
              onChange={(e) => setAuditId(e.target.value)}
              className="w-full rounded-xl border border-[#E5D6CE] bg-[#F8F2EF]/40 p-2.5 text-[#2D3139] focus:border-[#DEC3B3] focus:outline-none"
            >
              {audits.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#6C737E] font-semibold mb-1">Finding Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Missing MFA Enforcement on Secondary Staging Bastion Host"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-[#E5D6CE] bg-[#F8F2EF]/40 p-2.5 text-[#2D3139] focus:border-[#DEC3B3] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#6C737E] font-semibold mb-1">Severity Rating</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as Severity)}
                className="w-full rounded-xl border border-[#E5D6CE] bg-[#F8F2EF]/40 p-2.5 text-[#2D3139] focus:border-[#DEC3B3] focus:outline-none"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
                <option value="Informational">Informational</option>
              </select>
            </div>
            <div>
              <label className="block text-[#6C737E] font-semibold mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-[#E5D6CE] bg-[#F8F2EF]/40 p-2.5 text-[#2D3139] focus:border-[#DEC3B3] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#6C737E] font-semibold mb-1">Remediation Owner</label>
              <select
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                className="w-full rounded-xl border border-[#E5D6CE] bg-[#F8F2EF]/40 p-2.5 text-[#2D3139] focus:border-[#DEC3B3] focus:outline-none"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[#6C737E] font-semibold mb-1">Remediation Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-[#E5D6CE] bg-[#F8F2EF]/40 p-2.5 text-[#2D3139] focus:border-[#DEC3B3] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#6C737E] font-semibold mb-1">Deficiency Description *</label>
            <textarea
              required
              rows={2}
              placeholder="Detailed explanation of the condition, evidence, and risk impact..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-[#E5D6CE] bg-[#F8F2EF]/40 p-2.5 text-[#2D3139] focus:border-[#DEC3B3] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#6C737E] font-semibold mb-1">Auditor Recommendation</label>
            <textarea
              rows={2}
              placeholder="Recommended corrective steps..."
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              className="w-full rounded-xl border border-[#E5D6CE] bg-[#F8F2EF]/40 p-2.5 text-[#2D3139] focus:border-[#DEC3B3] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#6C737E] font-semibold mb-1">Initial Corrective Action Step</label>
            <input
              type="text"
              placeholder="e.g. Enforce WebAuthn MFA policy in AWS IAM console"
              value={actionDesc}
              onChange={(e) => setActionDesc(e.target.value)}
              className="w-full rounded-xl border border-[#E5D6CE] bg-[#F8F2EF]/40 p-2.5 text-[#2D3139] focus:border-[#DEC3B3] focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-[#E7EBEE]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#E5D6CE] bg-[#F8F2EF] px-4 py-2 text-xs font-semibold text-[#6C737E] hover:text-[#2D3139]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#DEC3B3] px-5 py-2 text-xs font-bold text-[#2D3139] hover:bg-[#d5b5a3] transition-colors border border-[#DEC3B3] shadow-xs"
            >
              Record Finding
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
