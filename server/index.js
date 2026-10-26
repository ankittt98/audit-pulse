import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initDatabase } from './db/database.js';

import auditsRouter from './routes/audits.js';
import tasksRouter from './routes/tasks.js';
import checksRouter from './routes/checks.js';
import documentsRouter from './routes/documents.js';
import findingsRouter from './routes/findings.js';
import activitiesRouter from './routes/activities.js';
import templatesRouter from './routes/templates.js';
import usersRouter from './routes/users.js';
import statsRouter from './routes/stats.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize DB and Seed
initDatabase();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/audits', auditsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/checks', checksRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/findings', findingsRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/templates', templatesRouter);
app.use('/api', usersRouter);
app.use('/api/stats', statsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'AuditPulse Management Platform',
    timestamp: new Date().toISOString(),
  });
});

// Serve frontend dist if in production mode
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));
// Fallback SPA handler for production build
app.use((req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Not Found');
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`========================================================`);
  console.log(`🚀 AuditPulse Enterprise Server running on http://localhost:${PORT}`);
  console.log(`📡 API Endpoints live at http://localhost:${PORT}/api`);
  console.log(`📁 Uploads storage initialized at server/uploads`);
  console.log(`========================================================`);
});
