import express from 'express';
import db from '../db/database.js';

const router = express.Router();

function formatCheck(c) {
  if (!c) return null;
  return {
    ...c,
    evidence_required: Boolean(c.evidence_required),
  };
}

// GET checks
router.get('/', (req, res) => {
  try {
    const { audit_id } = req.query;
    let query = 'SELECT * FROM compliance_checks';
    let params = [];

    if (audit_id) {
      query += ' WHERE audit_id = ?';
      params.push(audit_id);
    }
    query += ' ORDER BY code ASC';

    const checks = db.prepare(query).all(...params).map(formatCheck);
    res.json(checks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create check
router.post('/', (req, res) => {
  try {
    const {
      audit_id,
      code,
      name,
      requirement,
      category = 'General',
      owner_id,
      reviewer_id = null,
      due_date,
      evidence_required = true,
      status = 'Not Started',
      result = 'Pending',
      notes = '',
    } = req.body;

    const id = `chk-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO compliance_checks (
        id, audit_id, code, name, requirement, category,
        owner_id, reviewer_id, due_date, evidence_required,
        status, result, notes, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, audit_id, code, name, requirement, category,
      owner_id, reviewer_id, due_date, evidence_required ? 1 : 0,
      status, result, notes, now
    );

    const check = formatCheck(db.prepare('SELECT * FROM compliance_checks WHERE id = ?').get(id));
    res.status(201).json(check);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT evaluate check
router.put('/:id/evaluate', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM compliance_checks WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Compliance check not found' });
    }

    const {
      status = existing.status,
      result = existing.result,
      notes = existing.notes,
      reviewer_id = 'u-3',
      user_name = 'Auditor',
    } = req.body;

    const now = new Date().toISOString();

    db.prepare(`
      UPDATE compliance_checks SET
        status = ?, result = ?, notes = ?, reviewer_id = ?, updated_at = ?
      WHERE id = ?
    `).run(status, result, notes, reviewer_id, now, id);

    // Activity log
    db.prepare(`
      INSERT INTO activity_logs (
        id, audit_id, user_id, user_name, user_avatar, action,
        entity_type, entity_id, details, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `act-${Date.now()}`, existing.audit_id, reviewer_id, user_name, '',
      'Evaluated Compliance Check', 'Check', id,
      `Evaluated check "${existing.code}" - Status: "${status}", Result: "${result}".`, now
    );

    const updated = formatCheck(db.prepare('SELECT * FROM compliance_checks WHERE id = ?').get(id));
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE check
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM compliance_checks WHERE id = ?').run(id);
    res.json({ message: 'Compliance check deleted successfully', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
