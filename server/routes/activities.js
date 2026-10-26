import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// GET activity logs
router.get('/', (req, res) => {
  try {
    const { audit_id, limit = 50 } = req.query;
    let query = 'SELECT * FROM activity_logs';
    let params = [];

    if (audit_id) {
      query += ' WHERE audit_id = ?';
      params.push(audit_id);
    }
    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(Number(limit));

    const logs = db.prepare(query).all(...params);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST manually append activity record
router.post('/', (req, res) => {
  try {
    const {
      audit_id = null,
      user_id = 'u-1',
      user_name = 'User',
      user_avatar = '',
      action,
      entity_type,
      entity_id,
      details,
    } = req.body;

    const id = `act-log-${Date.now()}`;
    const timestamp = new Date().toISOString();

    db.prepare(`
      INSERT INTO activity_logs (
        id, audit_id, user_id, user_name, user_avatar, action,
        entity_type, entity_id, details, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, audit_id, user_id, user_name, user_avatar, action,
      entity_type, entity_id, details, timestamp
    );

    const log = db.prepare('SELECT * FROM activity_logs WHERE id = ?').get(id);
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
