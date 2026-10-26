import React, { useState } from 'react';
import { useAudit } from '../../context/AuditContext';
import { X, CheckSquare } from 'lucide-react';
import type { AuditPriority } from '../../types/audit';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAuditId?: string;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  defaultAuditId,
}) => {
  const { createTask, audits, users } = useAudit();

  const [auditId, setAuditId] = useState(defaultAuditId || (audits[0]?.id || ''));
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState(users[0]?.id || '');
  const [dueDate, setDueDate] = useState('2026-08-25');
  const [priority, setPriority] = useState<AuditPriority>('High');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !auditId) return;

    createTask({
      audit_id: auditId,
      title,
      description,
      assignee_id: assigneeId,
      due_date: dueDate,
      priority,
      status: 'In Progress',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D3139]/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-[#E5D6CE] bg-white p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#E7EBEE] pb-3">
          <div className="flex items-center space-x-2">
            <CheckSquare className="h-5 w-5 text-[#8C7567]" />
            <h2 className="text-base font-bold text-[#2D3139]">Create New Audit Task</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-[#6C737E] hover:text-[#2D3139]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#6C737E] font-semibold mb-1">Target Audit Workspace *</label>
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
            <label className="block text-[#6C737E] font-semibold mb-1">Task Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Export IAM User Group Access Matrix"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-[#E5D6CE] bg-[#F8F2EF]/40 p-2.5 text-[#2D3139] focus:border-[#DEC3B3] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#6C737E] font-semibold mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Detailed instructions for the assigned contributor..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-[#E5D6CE] bg-[#F8F2EF]/40 p-2.5 text-[#2D3139] focus:border-[#DEC3B3] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#6C737E] font-semibold mb-1">Assignee</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
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
            <label className="block text-[#6C737E] font-semibold mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
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
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
