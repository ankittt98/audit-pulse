import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// GET all users
router.get('/users', (req, res) => {
  try {
    const users = db.prepare('SELECT * FROM users ORDER BY created_at ASC').all();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST register new user
router.post('/users/register', (req, res) => {
  try {
    const { name, email, role, department } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    // Check if user already exists
    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.json(existing);
    }

    const userId = `u-${Date.now()}`;
    const userRole = role || 'Contributor';
    const userDept = department || 'General Audit';
    const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=dec3b3,d2dce4,e5d6ce`;
    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, name, email, role, avatar, department, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId, name, email, userRole, avatar, userDept, createdAt);

    // Log registration activity
    const actId = `act-log-${Date.now()}`;
    db.prepare(`
      INSERT INTO activity_logs (id, audit_id, user_id, user_name, user_avatar, action, entity_type, entity_id, details, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(actId, null, userId, name, avatar, 'User Registered', 'User', userId, `${name} joined AuditPulse as ${userRole} (${userDept}).`, createdAt);

    const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST login user by email or ID
router.post('/users/login', (req, res) => {
  try {
    const { email, id } = req.body;
    let user = null;
    if (id) {
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    } else if (email) {
      user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found. Please register.' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET organization info
router.get('/organization', (req, res) => {
  try {
    const org = db.prepare('SELECT * FROM organizations LIMIT 1').get();
    res.json(org || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
