import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// GET tasks (optional ?audit_id=...)
router.get('/', (req, res) => {
  try {
    const { audit_id } = req.query;
    let query = 'SELECT * FROM audit_tasks';
    let params = [];

    if (audit_id) {
      query += ' WHERE audit_id = ?';
      params.push(audit_id);
    }
    query += ' ORDER BY due_date ASC';

    const tasks = db.prepare(query).all(...params);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create task
router.post('/', (req, res) => {
  try {
    const {
      audit_id,
      title,
      description = '',
      assignee_id,
      creator_id = 'u-1',
      due_date,
      priority = 'Medium',
      status = 'Not Started',
      check_id = null,
      finding_id = null,
      user_name = 'User',
    } = req.body;

    const id = `tsk-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO audit_tasks (
        id, audit_id, title, description, assignee_id, creator_id,
        due_date, priority, status, check_id, finding_id,
        attachments_count, comments_count, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?)
    `).run(
      id, audit_id, title, description, assignee_id, creator_id,
      due_date, priority, status, check_id, finding_id, now
    );

    // Log Activity
    const assigneeRow = db.prepare('SELECT name FROM users WHERE id = ?').get(assignee_id);
    db.prepare(`
      INSERT INTO activity_logs (
        id, audit_id, user_id, user_name, user_avatar, action,
        entity_type, entity_id, details, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `act-${Date.now()}`, audit_id, creator_id, user_name, '',
      'Created Task', 'Task', id,
      `Assigned task "${title}" to ${assigneeRow?.name || 'User'}.`, now
    );

    const task = db.prepare('SELECT * FROM audit_tasks WHERE id = ?').get(id);
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update task
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM audit_tasks WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const {
      title = existing.title,
      description = existing.description,
      assignee_id = existing.assignee_id,
      due_date = existing.due_date,
      priority = existing.priority,
      status = existing.status,
      user_id = 'u-1',
      user_name = 'User',
    } = req.body;

    db.prepare(`
      UPDATE audit_tasks SET
        title = ?, description = ?, assignee_id = ?,
        due_date = ?, priority = ?, status = ?
      WHERE id = ?
    `).run(title, description, assignee_id, due_date, priority, status, id);

    if (existing.status !== status) {
      db.prepare(`
        INSERT INTO activity_logs (
          id, audit_id, user_id, user_name, user_avatar, action,
          entity_type, entity_id, details, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        `act-${Date.now()}`, existing.audit_id, user_id, user_name, '',
        'Updated Task Status', 'Task', id,
        `Task "${title}" updated status to "${status}".`, new Date().toISOString()
      );
    }

    const updated = db.prepare('SELECT * FROM audit_tasks WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE task
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM audit_tasks WHERE id = ?').run(id);
    res.json({ message: 'Task deleted successfully', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
