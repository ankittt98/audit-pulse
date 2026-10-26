import React, { useState, useRef } from 'react';
import { useAudit } from '../../context/AuditContext';
import { X, Upload, FolderLock, FileCheck, CheckCircle2 } from 'lucide-react';

interface UploadEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAuditId?: string;
}

export const UploadEvidenceModal: React.FC<UploadEvidenceModalProps> = ({
  isOpen,
  onClose,
  defaultAuditId,
}) => {
  const { uploadDocument, audits, checks } = useAudit();

  const [auditId, setAuditId] = useState(defaultAuditId || (audits[0]?.id || ''));
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filename, setFilename] = useState('');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('1.0');
  const [relatedEntityType, setRelatedEntityType] = useState<'Check' | 'Task'>('Check');
  const [relatedEntityId, setRelatedEntityId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const relevantChecks = checks.filter((c) => c.audit_id === auditId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFilename(file.name);
      if (!title) {
        // Auto-generate title from filename
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setFilename(file.name);
      if (!title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !auditId) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('audit_id', auditId);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('version', version);
      formData.append('related_entity_type', relatedEntityType);
      if (relatedEntityId) formData.append('related_entity_id', relatedEntityId);

      if (selectedFile) {
        formData.append('file', selectedFile);
      } else {
        formData.append('filename', filename || `${title.toLowerCase().replace(/\s+/g, '_')}.pdf`);
      }

      await uploadDocument(formData);
      onClose();
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D3139]/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-[#E5D6CE] bg-white p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#E7EBEE] pb-3">
          <div className="flex items-center space-x-2">
            <FolderLock className="h-5 w-5 text-[#8C7567]" />
            <h2 className="text-base font-bold text-[#2D3139]">Upload Supporting Evidence Document</h2>
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
            <label className="block text-[#6C737E] font-semibold mb-1">Evidence Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Q3 SOC 2 MFA Configuration Policy Export"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-[#E5D6CE] bg-[#F8F2EF]/40 p-2.5 text-[#2D3139] focus:border-[#DEC3B3] focus:outline-none"
            />
          </div>

          {/* Real File Upload Dropzone */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.csv,.png,.jpg,.jpeg,.docx,.xlsx,.txt"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
              selectedFile ? 'border-[#8C7567] bg-[#F8F2EF]' : 'border-[#E5D6CE] hover:border-[#DEC3B3] bg-[#F8F2EF]/60'
            }`}
          >
            {selectedFile ? (
              <div className="space-y-2">
                <CheckCircle2 className="h-8 w-8 text-[#8C7567] mx-auto" />
                <p className="font-bold text-[#2D3139]">{selectedFile.name}</p>
                <p className="text-[11px] text-[#6C737E]">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Automatic SHA-256 Checksum on Submit
                </p>
                <span className="inline-block text-[10px] text-[#8C7567] font-semibold underline">Click to change file</span>
              </div>
            ) : (
              <div>
                <Upload className="h-8 w-8 text-[#8C7567] mx-auto mb-2" />
                <p className="font-semibold text-[#2D3139]">Click to choose file or drag and drop</p>
                <p className="text-[10px] text-[#6C737E] mt-1">Supports PDF, CSV, PNG, DOCX, XLSX (Up to 50MB)</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#6C737E] font-semibold mb-1">Associate with Check (Optional)</label>
              <select
                value={relatedEntityId}
                onChange={(e) => {
                  setRelatedEntityId(e.target.value);
                  setRelatedEntityType('Check');
                }}
                className="w-full rounded-xl border border-[#E5D6CE] bg-[#F8F2EF]/40 p-2.5 text-[#2D3139] focus:border-[#DEC3B3] focus:outline-none"
              >
                <option value="">-- No Direct Link --</option>
                {relevantChecks.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.code}] {c.name.slice(0, 30)}...
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[#6C737E] font-semibold mb-1">Document Version</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full rounded-xl border border-[#E5D6CE] bg-[#F8F2EF]/40 p-2.5 text-[#2D3139] focus:border-[#DEC3B3] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#6C737E] font-semibold mb-1">Description / Verification Context</label>
            <textarea
              rows={2}
              placeholder="Explain how this document satisfies the compliance requirement or audit task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-[#E5D6CE] bg-[#F8F2EF]/40 p-2.5 text-[#2D3139] focus:border-[#DEC3B3] focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-[#E7EBEE]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-[#E5D6CE] bg-[#F8F2EF] px-4 py-2 text-xs font-semibold text-[#6C737E] hover:text-[#2D3139]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-[#DEC3B3] px-5 py-2 text-xs font-bold text-[#2D3139] hover:bg-[#d5b5a3] transition-colors border border-[#DEC3B3] shadow-xs flex items-center space-x-2"
            >
              {isSubmitting ? (
                <span>Fingerprinting & Uploading...</span>
              ) : (
                <>
                  <FileCheck className="h-4 w-4" />
                  <span>Upload & Register Hash</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
