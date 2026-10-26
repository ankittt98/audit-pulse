import React, { useState } from 'react';
import { useAudit } from '../../context/AuditContext';
import { X, FileCheck } from 'lucide-react';
import type { DocumentReviewStatus } from '../../types/audit';

interface ReviewDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId?: string;
}

export const ReviewDocumentModal: React.FC<ReviewDocumentModalProps> = ({
  isOpen,
  onClose,
  documentId,
}) => {
  const { documents, reviewDocument } = useAudit();
  const doc = documents.find((d) => d.id === documentId);

  const [reviewStatus, setReviewStatus] = useState<DocumentReviewStatus>('Verified');
  const [notes, setNotes] = useState('');

  if (!isOpen || !doc) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reviewDocument(doc.id, reviewStatus, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D3139]/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-[#E5D6CE] bg-white p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#E7EBEE] pb-3">
          <div className="flex items-center space-x-2">
            <FileCheck className="h-5 w-5 text-[#8C7567]" />
            <h2 className="text-base font-bold text-[#2D3139]">Auditor Document Verification</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-[#6C737E] hover:text-[#2D3139]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-xl bg-[#F8F2EF] p-4 border border-[#E5D6CE] space-y-2 text-xs">
          <p className="font-bold text-[#2D3139]">{doc.title}</p>
          <p className="text-[11px] text-[#6C737E] font-mono">{doc.filename} • {doc.file_size} • Uploaded by {doc.uploaded_by}</p>
          {doc.description && <p className="text-[#6C737E] mt-2">{doc.description}</p>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#6C737E] font-semibold mb-1">Set Verification Decision *</label>
            <select
              value={reviewStatus}
              onChange={(e) => setReviewStatus(e.target.value as DocumentReviewStatus)}
              className="w-full rounded-xl border border-[#E5D6CE] bg-[#F8F2EF]/40 p-2.5 text-[#2D3139] focus:border-[#DEC3B3] focus:outline-none"
            >
              <option value="Verified">Verified (Satisfies Audit Requirement)</option>
              <option value="Rejected">Rejected (Non-compliant / Unrelated File)</option>
              <option value="Requires Revision">Requires Revision (Incomplete / Needs Update)</option>
              <option value="Under Review">Under Review</option>
            </select>
          </div>

          <div>
            <label className="block text-[#6C737E] font-semibold mb-1">Auditor Review Feedback / Reason</label>
            <textarea
              rows={3}
              placeholder="Detailed feedback regarding why document was verified, rejected, or flagged for revision..."
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
              Submit Verification
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
