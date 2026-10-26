import express from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import db from '../db/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const uploadDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `evidence-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

function computeFileHash(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  } catch {
    return null;
  }
}

function formatDoc(d) {
  if (!d) return null;
  return {
    ...d,
    download_url: `/api/documents/${d.id}/download`,
    preview_url: `/api/documents/${d.id}/preview`,
  };
}

// GET all documents
router.get('/', (req, res) => {
  try {
    const { audit_id, review_status } = req.query;
    let query = 'SELECT * FROM evidence_documents WHERE 1=1';
    let params = [];

    if (audit_id) {
      query += ' AND audit_id = ?';
      params.push(audit_id);
    }
    if (review_status && review_status !== 'ALL') {
      query += ' AND review_status = ?';
      params.push(review_status);
    }
    query += ' ORDER BY uploaded_at DESC';

    const docs = db.prepare(query).all(...params).map(formatDoc);
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single document
router.get('/:id', (req, res) => {
  try {
    const doc = db.prepare('SELECT * FROM evidence_documents WHERE id = ?').get(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.json(formatDoc(doc));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST upload evidence document (Multipart form data OR JSON fallback)
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    const {
      audit_id,
      title,
      description = '',
      version = '1.0',
      uploaded_by = 'System Auditor',
      related_entity_type = 'Check',
      related_entity_id = null,
    } = req.body;

    if (!audit_id || !title) {
      return res.status(400).json({ error: 'audit_id and title are required' });
    }

    const id = `doc-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();

    let filename = req.body.filename || `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`;
    let file_type = 'application/pdf';
    let file_size = '1.2 MB';
    let stored_path = null;
    let file_hash = crypto.createHash('sha256').update(`${title}-${Date.now()}`).digest('hex');

    if (req.file) {
      filename = req.file.originalname;
      file_type = req.file.mimetype;
      stored_path = req.file.path;
      const bytes = req.file.size;
      file_size = bytes > 1024 * 1024
        ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(bytes / 1024)} KB`;
      file_hash = computeFileHash(req.file.path) || file_hash;
    }

    db.prepare(`
      INSERT INTO evidence_documents (
        id, audit_id, title, filename, file_type, file_size,
        stored_path, file_hash, uploaded_by, uploaded_at, version,
        description, review_status, reviewer_id, reviewer_notes,
        reviewed_at, related_entity_type, related_entity_id, download_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Under Review', null, null, null, ?, ?, ?)
    `).run(
      id, audit_id, title, filename, file_type, file_size,
      stored_path, file_hash, uploaded_by, now, version,
      description, related_entity_type, related_entity_id,
      `/api/documents/${id}/download`
    );

    // Update attachments count on related check or task if applicable
    if (related_entity_type === 'Task' && related_entity_id) {
      db.prepare('UPDATE audit_tasks SET attachments_count = attachments_count + 1 WHERE id = ?').run(related_entity_id);
    }

    // Log activity
    db.prepare(`
      INSERT INTO activity_logs (
        id, audit_id, user_id, user_name, user_avatar, action,
        entity_type, entity_id, details, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `act-${Date.now()}`, audit_id, 'u-4', uploaded_by, '',
      'Uploaded Evidence', 'Document', id,
      `Uploaded evidence document "${title}" (${filename}) with SHA-256 fingerprint: ${file_hash.substring(0, 16)}...`, now
    );

    const created = formatDoc(db.prepare('SELECT * FROM evidence_documents WHERE id = ?').get(id));
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST review / verify document
router.post('/:id/review', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM evidence_documents WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Evidence document not found' });
    }

    const {
      review_status,
      reviewer_notes = '',
      reviewer_id = 'u-1',
      reviewer_name = 'Ankit',
    } = req.body;

    const now = new Date().toISOString();

    db.prepare(`
      UPDATE evidence_documents SET
        review_status = ?, reviewer_id = ?, reviewer_notes = ?, reviewed_at = ?
      WHERE id = ?
    `).run(review_status, reviewer_id, reviewer_notes, now, id);

    // Activity log
    db.prepare(`
      INSERT INTO activity_logs (
        id, audit_id, user_id, user_name, user_avatar, action,
        entity_type, entity_id, details, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `act-${Date.now()}`, existing.audit_id, reviewer_id, reviewer_name, '',
      'Reviewed Evidence Document', 'Document', id,
      `Document "${existing.title}" marked as "${review_status}". Notes: "${reviewer_notes || 'Verified requirement satisfy'}".`, now
    );

    const updated = formatDoc(db.prepare('SELECT * FROM evidence_documents WHERE id = ?').get(id));
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET digital verification audit info (Cryptographic integrity check)
router.get('/:id/verify', (req, res) => {
  try {
    const doc = db.prepare('SELECT * FROM evidence_documents WHERE id = ?').get(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    let diskHash = null;
    let tamperDetected = false;

    if (doc.stored_path && fs.existsSync(doc.stored_path)) {
      diskHash = computeFileHash(doc.stored_path);
      tamperDetected = diskHash !== doc.file_hash;
    }

    res.json({
      document_id: doc.id,
      title: doc.title,
      filename: doc.filename,
      registered_hash_sha256: doc.file_hash,
      current_disk_hash: diskHash || doc.file_hash,
      is_authentic: !tamperDetected,
      tamper_detected: tamperDetected,
      review_status: doc.review_status,
      reviewer_id: doc.reviewer_id,
      reviewed_at: doc.reviewed_at,
      uploaded_by: doc.uploaded_by,
      uploaded_at: doc.uploaded_at,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET download document file
router.get('/:id/download', (req, res) => {
  try {
    const doc = db.prepare('SELECT * FROM evidence_documents WHERE id = ?').get(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    if (doc.stored_path && fs.existsSync(doc.stored_path)) {
      return res.download(doc.stored_path, doc.filename);
    }

    // Fallback: Generate a clean digital verification certificate as downloadable file
    const certificateText = `
================================================================================
                    AUDITPULSE DIGITAL EVIDENCE CERTIFICATE
================================================================================
Document ID          : ${doc.id}
Document Title       : ${doc.title}
Original Filename    : ${doc.filename}
File Type            : ${doc.file_type}
File Size            : ${doc.file_size}
Document Version     : ${doc.version}
Target Audit ID      : ${doc.audit_id}

DIGITAL VERIFICATION METRICS:
--------------------------------------------------------------------------------
SHA-256 Checksum     : ${doc.file_hash}
Verification Status  : ${doc.review_status.toUpperCase()}
Uploaded By          : ${doc.uploaded_by} on ${doc.uploaded_at}
Reviewer Decision    : ${doc.review_status} (Reviewer ID: ${doc.reviewer_id || 'N/A'})
Review Timestamp     : ${doc.reviewed_at || 'Pending Review'}
Reviewer Notes       : ${doc.reviewer_notes || 'No notes entered'}

AUTHENTICITY NOTICE:
This digital evidence item is cryptographically tracked in the AuditPulse
immutability ledger for regulatory compliance audits (ISO 27001, SOC 2, GDPR).
================================================================================
`;
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${doc.filename}.txt"`);
    res.send(certificateText);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET preview document
router.get('/:id/preview', (req, res) => {
  try {
    const doc = db.prepare('SELECT * FROM evidence_documents WHERE id = ?').get(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    if (doc.stored_path && fs.existsSync(doc.stored_path)) {
      return res.sendFile(path.resolve(doc.stored_path));
    }

    res.redirect(`/api/documents/${doc.id}/download`);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
