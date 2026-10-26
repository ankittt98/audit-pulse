import React, { useState } from 'react';
import { useAudit } from '../../context/AuditContext';
import { X, FileCheck } from 'lucide-react';
import type { CheckWorkflowStatus, CheckResult } from '../../types/audit';

interface EvaluateCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkId?: string;
}

export const EvaluateCheckModal: React.FC<EvaluateCheckModalProps> = ({
  isOpen,
  onClose,
  checkId,
}) => {
  const { checks, evaluateComplianceCheck } = useAudit();
  const chk = checks.find((c) => c.id === checkId);

  const [status, setStatus] = useState<CheckWorkflowStatus>(chk?.status || 'Completed');
  const [result, setResult] = useState<CheckResult>(chk?.result || 'Pass');
  const [notes, setNotes] = useState(chk?.notes || '');

  if (!isOpen || !chk) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    evaluateComplianceCheck(chk.id, status, result, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D3139]/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-[#E5D6CE] bg-white p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#E7EBEE] pb-3">
          <div className="flex items-center space-x-2">
            <FileCheck className="h-5 w-5 text-[#8C7567]" />
            <h2 className="text-base font-bold text-[#2D3139]">Evaluate Compliance Check</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-[#6C737E] hover:text-[#2D3139]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-xl bg-[#F8F2EF] p-4 border border-[#E5D6CE] space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-[#8C7567] font-bold">{chk.code}</span>
            <span className="text-[#6C737E]">• {chk.category}</span>
          </div>
          <p className="font-bold text-[#2D3139] mt-1">{chk.name}</p>
          <p className="text-[#6C737E] mt-1">{chk.requirement}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#6C737E] font-semibold mb-1">Workflow Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CheckWorkflowStatus)}
                className="w-full rounded-xl border border-[#E5D6CE] bg-[#F8F2EF]/40 p-2.5 text-[#2D3139] focus:border-[#DEC3B3] focus:outline-none"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Under Review">Under Review</option>
                <option value="Completed">Completed</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>

            <div>
              <label className="block text-[#6C737E] font-semibold mb-1">Evaluation Result *</label>
              <select
                value={result}
                onChange={(e) => setResult(e.target.value as CheckResult)}
                className="w-full rounded-xl border border-[#E5D6CE] bg-[#F8F2EF]/40 p-2.5 text-[#2D3139] focus:border-[#DEC3B3] focus:outline-none font-bold"
              >
                <option value="Pending">Pending</option>
                <option value="Pass">Pass</option>
                <option value="Fail">Fail</option>
                <option value="Partially Met">Partially Met</option>
                <option value="Not Applicable">Not Applicable</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#6C737E] font-semibold mb-1">Auditor Evaluation Notes</label>
            <textarea
              rows={3}
              placeholder="Record exact evidence reviewed, compliance findings, or rationale for outcome..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              Save Evaluation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
