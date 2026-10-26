import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// Helper to format audit record
function formatAudit(row) {
  if (!row) return null;
  return {
    ...row,
    auditor_ids: row.auditor_ids ? JSON.parse(row.auditor_ids) : [],
    tags: row.tags ? JSON.parse(row.tags) : [],
  };
}

// GET all audits
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM audits ORDER BY created_at DESC').all();
    const audits = rows.map(formatAudit);
    res.json(audits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single audit with details
router.get('/:id', (req, res) => {
  try {
    const auditRow = db.prepare('SELECT * FROM audits WHERE id = ?').get(req.params.id);
    if (!auditRow) {
      return res.status(404).json({ error: 'Audit not found' });
    }

    const audit = formatAudit(auditRow);
    const tasks = db.prepare('SELECT * FROM audit_tasks WHERE audit_id = ? ORDER BY due_date ASC').all(req.params.id);
    const checks = db.prepare('SELECT * FROM compliance_checks WHERE audit_id = ? ORDER BY code ASC').all(req.params.id)
      .map(c => ({ ...c, evidence_required: Boolean(c.evidence_required) }));
    const documents = db.prepare('SELECT * FROM evidence_documents WHERE audit_id = ? ORDER BY uploaded_at DESC').all(req.params.id);
    
    const findingRows = db.prepare('SELECT * FROM findings WHERE audit_id = ? ORDER BY created_at DESC').all(req.params.id);
    const findings = findingRows.map(f => {
      const actions = db.prepare('SELECT * FROM corrective_actions WHERE finding_id = ?').all(f.id);
      return { ...f, corrective_actions: actions };
    });

    const activities = db.prepare('SELECT * FROM activity_logs WHERE audit_id = ? ORDER BY timestamp DESC LIMIT 20').all(req.params.id);

    res.json({
      ...audit,
      tasks,
      checks,
      documents,
      findings,
      activities,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create audit
router.post('/', (req, res) => {
  try {
    const {
      title,
      description = '',
      type,
      scope = '',
      owner_id,
      auditor_ids = [],
      start_date,
      target_completion_date,
      status = 'Planned',
      priority = 'Medium',
      tags = [],
      unit = '',
      notes = '',
      templateId,
      user_id = 'u-1',
      user_name = 'Current User',
    } = req.body;

    const id = `aud-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO audits (
        id, title, description, type, scope, owner_id, auditor_ids,
        start_date, target_completion_date, status, priority, tags,
        unit, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, title, description, type, scope, owner_id, JSON.stringify(auditor_ids),
      start_date, target_completion_date, status, priority, JSON.stringify(tags),
      unit, notes, now, now
    );

    // Apply template checks & tasks if specified
    if (templateId) {
      const tmpl = db.prepare('SELECT * FROM audit_templates WHERE id = ?').get(templateId);
      if (tmpl) {
        const defaultChecks = JSON.parse(tmpl.default_checks || '[]');
        const defaultTasks = JSON.parse(tmpl.default_tasks || '[]');

        const checkInsert = db.prepare(`
          INSERT INTO compliance_checks (
            id, audit_id, code, name, requirement, category,
            owner_id, reviewer_id, due_date, evidence_required,
            status, result, notes, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        defaultChecks.forEach((c, idx) => {
          checkInsert.run(
            `chk-${id}-${idx + 1}`, id, c.code, c.name, c.requirement, c.category,
            owner_id, owner_id, target_completion_date, c.evidence_required ? 1 : 0,
            'Not Started', 'Pending', '', now
          );
        });

        const taskInsert = db.prepare(`
          INSERT INTO audit_tasks (
            id, audit_id, title, description, assignee_id, creator_id,
            due_date, priority, status, attachments_count, comments_count, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        defaultTasks.forEach((t, idx) => {
          taskInsert.run(
            `tsk-${id}-${idx + 1}`, id, t.title, t.description, owner_id, owner_id,
            target_completion_date, t.priority, 'Not Started', 0, 0, now
          );
        });
      }
    }

    // Log Activity
    db.prepare(`
      INSERT INTO activity_logs (
        id, audit_id, user_id, user_name, user_avatar, action,
        entity_type, entity_id, details, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `act-${Date.now()}`, id, user_id, user_name, '',
      'Created Audit', 'Audit', id,
      `Initialized audit "${title}" (${type}) in ${status} status.`, now
    );

    const createdAudit = formatAudit(db.prepare('SELECT * FROM audits WHERE id = ?').get(id));
    res.status(201).json(createdAudit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update audit
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM audits WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Audit not found' });
    }

    const {
      title = existing.title,
      description = existing.description,
      type = existing.type,
      scope = existing.scope,
      owner_id = existing.owner_id,
      auditor_ids = existing.auditor_ids ? JSON.parse(existing.auditor_ids) : [],
      start_date = existing.start_date,
      target_completion_date = existing.target_completion_date,
      status = existing.status,
      priority = existing.priority,
      tags = existing.tags ? JSON.parse(existing.tags) : [],
      unit = existing.unit,
      notes = existing.notes,
      user_id = 'u-1',
      user_name = 'Current User',
    } = req.body;

    const now = new Date().toISOString();

    db.prepare(`
      UPDATE audits SET
        title = ?, description = ?, type = ?, scope = ?, owner_id = ?,
        auditor_ids = ?, start_date = ?, target_completion_date = ?,
        status = ?, priority = ?, tags = ?, unit = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `).run(
      title, description, type, scope, owner_id, JSON.stringify(auditor_ids),
      start_date, target_completion_date, status, priority, JSON.stringify(tags),
      unit, notes, now, id
    );

    if (existing.status !== status) {
      db.prepare(`
        INSERT INTO activity_logs (
          id, audit_id, user_id, user_name, user_avatar, action,
          entity_type, entity_id, details, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        `act-${Date.now()}`, id, user_id, user_name, '',
        'Updated Audit Status', 'Audit', id,
        `Status changed from "${existing.status}" to "${status}".`, now
      );
    }

    const updated = formatAudit(db.prepare('SELECT * FROM audits WHERE id = ?').get(id));
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE audit
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM audits WHERE id = ?').run(id);
    res.json({ message: 'Audit deleted successfully', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
