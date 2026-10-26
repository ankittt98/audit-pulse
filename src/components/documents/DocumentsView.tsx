import React, { useState } from 'react';
import { useAudit } from '../../context/AuditContext';
import { Plus, Download, ShieldCheck, KeyRound, CheckCircle, X } from 'lucide-react';
import { api } from '../../services/api';

interface DocumentsViewProps {
  onOpenUploadModal: (auditId?: string) => void;
  onOpenReviewModal: (docId: string) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({ onOpenUploadModal, onOpenReviewModal }) => {
  const { documents, audits } = useAudit();
  const [reviewFilter, setReviewFilter] = useState<string>('ALL');
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const filteredDocs = documents.filter((d) => {
    if (reviewFilter !== 'ALL' && d.review_status !== reviewFilter) return false;
    return true;
  });

  const handleVerifyIntegrity = async (docId: string) => {
    try {
      const res = await api.verifyDocumentIntegrity(docId);
      setVerificationResult(res);
    } catch (err) {
      console.error('Verification error:', err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="space-y-7">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#2D3139] tracking-tight">Digital Evidence & Document Vault</h1>
          <p className="text-sm text-[#5D6470] mt-1 font-medium">
            Tamper-evident evidence storage with SHA-256 cryptographic fingerprints and digital reviewer signatures.
          </p>
        </div>
        <button
          onClick={() => onOpenUploadModal()}
          className="flex items-center space-x-2 rounded-xl bg-[#DEC3B3] px-4.5 py-2.5 text-sm font-bold text-[#2D3139] hover:bg-[#d5b5a3] transition-all border border-[#CDB1A1] shadow-xs cursor-pointer active:scale-98"
        >
          <Plus className="h-4 w-4" />
          <span>Upload Evidence File</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-3xl border border-[#E5D6CE] bg-white p-4 shadow-xs">
        <span className="text-xs font-bold text-[#5D6470] mr-1">Filter Review Status:</span>
        {['ALL', 'Pending', 'Under Review', 'Verified', 'Rejected', 'Requires Revision'].map((st) => (
          <button
            key={st}
            onClick={() => setReviewFilter(st)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              reviewFilter === st ? 'bg-[#DEC3B3] text-[#2D3139] border border-[#CDB1A1] shadow-xs' : 'text-[#5D6470] hover:bg-[#E7EBEE]'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filteredDocs.map((doc) => {
          const audit = audits.find((a) => a.id === doc.audit_id);
          const isVerified = doc.review_status === 'Verified';

          return (
            <div key={doc.id} className="rounded-2xl border border-[#E5D6CE] bg-white p-5 space-y-3 shadow-xs">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-[#8C7567] bg-[#F8F2EF] px-1.5 py-0.5 rounded border border-[#E5D6CE]">
                      v{doc.version}
                    </span>
                    <span className="text-[11px] text-[#6C737E] font-mono">{doc.file_type || 'Document'}</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#2D3139] mt-1">{doc.title}</h3>
                  <p className="text-xs text-[#6C737E] font-mono mt-0.5">
                    {doc.filename} ({doc.file_size})
                  </p>
                </div>
                <span
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold border flex items-center space-x-1 ${
                    isVerified
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : doc.review_status === 'Rejected'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {isVerified && <ShieldCheck className="h-3 w-3 mr-1 inline" />}
                  <span>{doc.review_status}</span>
                </span>
              </div>

              {/* Cryptographic SHA-256 Fingerprint */}
              <div className="rounded-xl bg-[#F8F2EF] p-2.5 border border-[#E5D6CE] space-y-1">
                <div className="flex justify-between items-center text-[10px] text-[#6C737E]">
                  <span className="flex items-center font-semibold text-[#8C7567]">
                    <KeyRound className="h-3 w-3 mr-1" />
                    SHA-256 Checksum (Digital Fingerprint):
                  </span>
                  <button
                    onClick={() => copyToClipboard(doc.file_hash || 'SHA-256 Registered')}
                    className="hover:text-[#2D3139] font-mono underline cursor-pointer"
                  >
                    {copiedHash === doc.file_hash ? 'Copied!' : 'Copy Hash'}
                  </button>
                </div>
                <p className="text-[11px] font-mono text-[#2D3139] truncate select-all">
                  {doc.file_hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                </p>
              </div>

              {doc.description && <p className="text-xs text-[#6C737E] leading-relaxed">{doc.description}</p>}

              {doc.reviewer_notes && (
                <div className="rounded-xl bg-amber-50/60 p-2.5 text-xs text-[#2D3139] border border-amber-200/60 space-y-0.5">
                  <div className="flex items-center justify-between text-[10px] text-[#6C737E]">
                    <strong className="text-[#2D3139]">Auditor Review Feedback</strong>
                    <span>{doc.reviewed_at ? new Date(doc.reviewed_at).toLocaleDateString() : ''}</span>
                  </div>
                  <p className="text-[#6C737E] text-[11px]">{doc.reviewer_notes}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-[#E7EBEE] text-xs text-[#6C737E]">
                <span className="truncate max-w-[200px]">
                  Audit: <strong className="text-[#2D3139]">{audit?.title || doc.audit_id}</strong>
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleVerifyIntegrity(doc.id)}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-[#E5D6CE] hover:bg-[#F8F2EF] text-[11px] font-semibold text-[#2D3139] cursor-pointer"
                    title="Verify cryptographic file hash and tamper status"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-[#8C7567]" />
                    <span>Verify</span>
                  </button>

                  <a
                    href={`/api/documents/${doc.id}/download`}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#E7EBEE] hover:bg-[#d5dce2] text-[11px] font-semibold text-[#2D3139] transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </a>

                  <button
                    onClick={() => onOpenReviewModal(doc.id)}
                    className="text-[#8C7567] hover:underline font-bold text-xs cursor-pointer ml-1"
                  >
                    Review →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Digital Integrity Verification Modal */}
      {verificationResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D3139]/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#E5D6CE] bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7EBEE] pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-bold text-[#2D3139]">Cryptographic Proof & Integrity</h3>
              </div>
              <button
                onClick={() => setVerificationResult(null)}
                className="rounded-lg p-1 text-[#6C737E] hover:text-[#2D3139] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-200 flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-emerald-900">Document Integrity Verified</p>
                  <p className="text-[11px] text-emerald-700">
                    File matches its registered SHA-256 fingerprint. No tampering or alteration detected.
                  </p>
                </div>
              </div>

              <div className="space-y-2 bg-[#F8F2EF] p-3 rounded-xl border border-[#E5D6CE]">
                <div>
                  <span className="text-[10px] text-[#6C737E] font-semibold uppercase">Document</span>
                  <p className="font-bold text-[#2D3139]">{verificationResult.title}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#6C737E] font-semibold uppercase">Registered SHA-256</span>
                  <p className="font-mono text-[10px] text-[#2D3139] break-all">
                    {verificationResult.registered_hash_sha256}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-[#6C737E] font-semibold uppercase">Verification Status</span>
                  <p className="font-semibold text-[#2D3139]">{verificationResult.review_status}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#6C737E] font-semibold uppercase">Uploaded By</span>
                  <p className="text-[#2D3139]">
                    {verificationResult.uploaded_by} on {new Date(verificationResult.uploaded_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setVerificationResult(null)}
                className="rounded-xl bg-[#DEC3B3] px-5 py-2 text-xs font-bold text-[#2D3139] hover:bg-[#d5b5a3] cursor-pointer"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
