import express from 'express';
import db from '../db/database.js';

const router = express.Router();

function formatTemplate(t) {
  if (!t) return null;
  return {
    ...t,
    default_checks: t.default_checks ? JSON.parse(t.default_checks) : [],
    default_tasks: t.default_tasks ? JSON.parse(t.default_tasks) : [],
  };
}

// GET all templates
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM audit_templates ORDER BY id ASC').all();
    res.json(rows.map(formatTemplate));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create template
router.post('/', (req, res) => {
  try {
    const { name, description = '', type, category = '', default_checks = [], default_tasks = [] } = req.body;
    const id = `tmpl-${Date.now().toString().slice(-4)}`;

    db.prepare(`
      INSERT INTO audit_templates (id, name, description, type, category, default_checks, default_tasks)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, description, type, category, JSON.stringify(default_checks), JSON.stringify(default_tasks));

    const created = formatTemplate(db.prepare('SELECT * FROM audit_templates WHERE id = ?').get(id));
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
