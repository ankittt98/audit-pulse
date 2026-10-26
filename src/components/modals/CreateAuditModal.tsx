import React, { useState } from 'react';
import { useAudit } from '../../context/AuditContext';
import { X, ClipboardList } from 'lucide-react';
import type { AuditPriority } from '../../types/audit';

interface CreateAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTemplateId?: string;
}

export const CreateAuditModal: React.FC<CreateAuditModalProps> = ({
  isOpen,
  onClose,
  selectedTemplateId,
}) => {
  const { createAudit, currentUser, templates } = useAudit();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<any>('Security & IT');
  const [scope, setScope] = useState('');
  const [targetDate, setTargetDate] = useState('2026-09-30');
  const [priority, setPriority] = useState<AuditPriority>('High');
  const [unit, setUnit] = useState('IT Operations');
  const [tags, setTags] = useState('Security, ISO27001');
  const [templateId, setTemplateId] = useState<string>(selectedTemplateId || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !scope) return;

    createAudit(
      {
        title,
        description,
        type,
        scope,
        owner_id: currentUser.id,
        auditor_ids: [currentUser.id],
        start_date: new Date().toISOString().split('T')[0],
        target_completion_date: targetDate,
        status: 'In Progress',
        priority,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        unit,
      },
      templateId || undefined
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D3139]/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-[#E5D6CE] bg-white p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-[#E7EBEE] pb-3">
          <div className="flex items-center space-x-2">
            <ClipboardList className="h-5 w-5 text-[#8C7567]" />
            <h2 className="text-base font-bold text-[#2D3139]">Initialize New Audit Workspace</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-[#6C737E] hover:text-[#2D3139]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#6C737E] font-semibold mb-1">Use Template (Optional)</label>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="w-full rounded-xl border border-[#E5D6CE] bg-[#F8F2EF]/40 p-2.5 text-[#2D3139] focus:border-[#DEC3B3] focus:outline-none"
            >
              <option value="">Start from Scratch (No Template)</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.default_checks.length} pre-configured checks)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#6C737E] font-semibold mb-1">Audit Workspace Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Q3 SOC 2 Type II Security & Access Control Review"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-[#E5D6CE] bg-[#F8F2EF]/40 p-2.5 text-[#2D3139] placeholder-[#6C737E]/60 focus:border-[#DEC3B3] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#6C737E] font-semibold mb-1">Audit Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-xl border border-[#E5D6CE] bg-[#F8F2EF]/40 p-2.5 text-[#2D3139] focus:border-[#DEC3B3] focus:outline-none"
              >
                <option value="Security & IT">Security & IT</option>
                <option value="Financial">Financial</option>
                <option value="Regulatory">Regulatory</option>
                <option value="Quality & Operational">Quality & Operational</option>
                <option value="Internal">Internal</option>
              </select>
            </div>
            <div>
              <label className="block text-[#6C737E] font-semibold mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as AuditPriority)}
                className="w-full rounded-xl border border-[#E5D6CE] bg-[#F8F2EF]/40 p-2.5 text-[#2D3139] focus:border-[#DEC3B3] focus:outline-none"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#6C737E] font-semibold mb-1">Audit Description</label>
            <input
              type="text"
              placeholder="Brief summary of audit objective..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-[#E5D6CE] bg-[#F8F2EF]/40 p-2.5 text-[#2D3139] focus:border-[#DEC3B3] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#6C737E] font-semibold mb-1">Defined Scope *</label>
            <textarea
              required
              rows={2}
              placeholder="Define exact systems, policies, teams, or procedures under audit..."
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="w-full rounded-xl border border-[#E5D6CE] bg-[#F8F2EF]/40 p-2.5 text-[#2D3139] placeholder-[#6C737E]/60 focus:border-[#DEC3B3] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#6C737E] font-semibold mb-1">Target Completion Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full rounded-xl border border-[#E5D6CE] bg-[#F8F2EF]/40 p-2.5 text-[#2D3139] focus:border-[#DEC3B3] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#6C737E] font-semibold mb-1">Department Unit</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full rounded-xl border border-[#E5D6CE] bg-[#F8F2EF]/40 p-2.5 text-[#2D3139] focus:border-[#DEC3B3] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#6C737E] font-semibold mb-1">Tags (Comma Separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
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
              Initialize Audit Workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
