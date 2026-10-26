import express from 'express';
import db from '../db/database.js';

const router = express.Router();

function getFullFinding(f) {
  const actions = db.prepare('SELECT * FROM corrective_actions WHERE finding_id = ?').all(f.id);
  return {
    ...f,
    corrective_actions: actions,
  };
}

// GET all findings (optional ?audit_id=...)
router.get('/', (req, res) => {
  try {
    const { audit_id } = req.query;
    let query = 'SELECT * FROM findings';
    let params = [];

    if (audit_id) {
      query += ' WHERE audit_id = ?';
      params.push(audit_id);
    }
    query += ' ORDER BY created_at DESC';

    const findings = db.prepare(query).all(...params).map(getFullFinding);
    res.json(findings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create finding with optional initial corrective actions
router.post('/', (req, res) => {
  try {
    const {
      audit_id,
      check_id = null,
      title,
      description,
      severity = 'Medium',
      category = 'Compliance',
      owner_id,
      due_date,
      status = 'Assigned',
      recommendation = '',
      initial_actions = [],
      user_id = 'u-1',
      user_name = 'Ankit',
    } = req.body;

    const id = `fnd-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO findings (
        id, audit_id, check_id, title, description, severity,
        category, owner_id, due_date, status, recommendation,
        resolution_notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, null, ?)
    `).run(
      id, audit_id, check_id, title, description, severity,
      category, owner_id, due_date, status, recommendation, now
    );

    const actionStmt = db.prepare(`
      INSERT INTO corrective_actions (
        id, finding_id, description, owner_id, due_date, priority,
        status, completion_notes, reviewer_id, reviewed_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'Not Started', null, null, null)
    `);

    initial_actions.forEach((act, idx) => {
      const actId = `act-${id}-${idx + 1}`;
      actionStmt.run(actId, id, act.description, act.owner_id || owner_id, act.due_date || due_date, act.priority || 'Medium');
    });

    // Log Activity
    db.prepare(`
      INSERT INTO activity_logs (
        id, audit_id, user_id, user_name, user_avatar, action,
        entity_type, entity_id, details, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `act-${Date.now()}`, audit_id, user_id, user_name, '',
      'Created Finding', 'Finding', id,
      `Flagged ${severity} severity finding "${title}".`, now
    );

    const created = getFullFinding(db.prepare('SELECT * FROM findings WHERE id = ?').get(id));
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update finding
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM findings WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Finding not found' });
    }

    const {
      status = existing.status,
      resolution_notes = existing.resolution_notes,
      severity = existing.severity,
      recommendation = existing.recommendation,
      user_id = 'u-1',
      user_name = 'Ankit',
    } = req.body;

    db.prepare(`
      UPDATE findings SET
        status = ?, resolution_notes = ?, severity = ?, recommendation = ?
      WHERE id = ?
    `).run(status, resolution_notes, severity, recommendation, id);

    if (existing.status !== status) {
      db.prepare(`
        INSERT INTO activity_logs (
          id, audit_id, user_id, user_name, user_avatar, action,
          entity_type, entity_id, details, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        `act-${Date.now()}`, existing.audit_id, user_id, user_name, '',
        'Updated Finding Status', 'Finding', id,
        `Finding "${existing.title}" status updated to "${status}".`, new Date().toISOString()
      );
    }

    const updated = getFullFinding(db.prepare('SELECT * FROM findings WHERE id = ?').get(id));
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add corrective action to finding
router.post('/:id/actions', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM findings WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Finding not found' });
    }

    const {
      description,
      owner_id,
      due_date,
      priority = 'Medium',
      user_id = 'u-1',
      user_name = 'Ankit',
    } = req.body;

    const actionId = `act-${Date.now().toString().slice(-4)}`;

    db.prepare(`
      INSERT INTO corrective_actions (
        id, finding_id, description, owner_id, due_date, priority,
        status, completion_notes, reviewer_id, reviewed_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'Not Started', null, null, null)
    `).run(actionId, id, description, owner_id, due_date, priority);

    db.prepare(`
      INSERT INTO activity_logs (
        id, audit_id, user_id, user_name, user_avatar, action,
        entity_type, entity_id, details, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `act-${Date.now()}`, existing.audit_id, user_id, user_name, '',
      'Added Corrective Action', 'Action', actionId,
      `Added corrective action plan to finding "${existing.title}".`, new Date().toISOString()
    );

    const updatedFinding = getFullFinding(existing);
    res.status(201).json(updatedFinding);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update corrective action status
router.put('/:id/actions/:actionId', (req, res) => {
  try {
    const { id, actionId } = req.params;
    const existingAction = db.prepare('SELECT * FROM corrective_actions WHERE id = ? AND finding_id = ?').get(actionId, id);
    if (!existingAction) {
      return res.status(404).json({ error: 'Corrective action not found' });
    }

    const {
      status = existingAction.status,
      completion_notes = existingAction.completion_notes,
      reviewer_id = 'u-1',
      user_name = 'Ankit',
    } = req.body;

    const now = new Date().toISOString();
    const isCompleted = status === 'Completed';

    db.prepare(`
      UPDATE corrective_actions SET
        status = ?, completion_notes = ?, reviewer_id = ?,
        reviewed_at = ?
      WHERE id = ?
    `).run(
      status, completion_notes,
      isCompleted ? reviewer_id : existingAction.reviewer_id,
      isCompleted ? now : existingAction.reviewed_at,
      actionId
    );

    const finding = db.prepare('SELECT audit_id FROM findings WHERE id = ?').get(id);
    db.prepare(`
      INSERT INTO activity_logs (
        id, audit_id, user_id, user_name, user_avatar, action,
        entity_type, entity_id, details, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `act-${Date.now()}`, finding ? finding.audit_id : null, reviewer_id, user_name, '',
      'Updated Corrective Action', 'Action', actionId,
      `Corrective action status updated to "${status}".`, now
    );

    const updatedFinding = getFullFinding(db.prepare('SELECT * FROM findings WHERE id = ?').get(id));
    res.json(updatedFinding);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
