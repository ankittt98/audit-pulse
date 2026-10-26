import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// GET comprehensive live system statistics & transparency metrics
router.get('/', (req, res) => {
  try {
    const totalAudits = db.prepare('SELECT COUNT(*) as count FROM audits').get().count;
    const activeAudits = db.prepare("SELECT COUNT(*) as count FROM audits WHERE status IN ('In Progress', 'Under Review')").get().count;
    const completedAudits = db.prepare("SELECT COUNT(*) as count FROM audits WHERE status = 'Completed'").get().count;

    const totalTasks = db.prepare('SELECT COUNT(*) as count FROM audit_tasks').get().count;
    const completedTasks = db.prepare("SELECT COUNT(*) as count FROM audit_tasks WHERE status = 'Completed'").get().count;
    const overdueTasks = db.prepare("SELECT COUNT(*) as count FROM audit_tasks WHERE status = 'Overdue'").get().count;

    const totalChecks = db.prepare('SELECT COUNT(*) as count FROM compliance_checks').get().count;
    const passedChecks = db.prepare("SELECT COUNT(*) as count FROM compliance_checks WHERE result = 'Pass'").get().count;
    const failedChecks = db.prepare("SELECT COUNT(*) as count FROM compliance_checks WHERE result = 'Fail'").get().count;
    const pendingChecks = db.prepare("SELECT COUNT(*) as count FROM compliance_checks WHERE result = 'Pending'").get().count;

    const totalDocs = db.prepare('SELECT COUNT(*) as count FROM evidence_documents').get().count;
    const verifiedDocs = db.prepare("SELECT COUNT(*) as count FROM evidence_documents WHERE review_status = 'Verified'").get().count;
    const pendingDocs = db.prepare("SELECT COUNT(*) as count FROM evidence_documents WHERE review_status IN ('Pending', 'Under Review')").get().count;

    const totalFindings = db.prepare('SELECT COUNT(*) as count FROM findings').get().count;
    const openFindings = db.prepare("SELECT COUNT(*) as count FROM findings WHERE status IN ('Open', 'Assigned', 'In Progress')").get().count;
    const highCriticalFindings = db.prepare("SELECT COUNT(*) as count FROM findings WHERE severity IN ('Critical', 'High') AND status NOT IN ('Resolved', 'Closed')").get().count;

    const compliancePercentage = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;
    const taskCompletionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const documentVerificationPercentage = totalDocs > 0 ? Math.round((verifiedDocs / totalDocs) * 100) : 0;

    res.json({
      audits: {
        total: totalAudits,
        active: activeAudits,
        completed: completedAudits,
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        overdue: overdueTasks,
        completion_rate: taskCompletionPercentage,
      },
      checks: {
        total: totalChecks,
        passed: passedChecks,
        failed: failedChecks,
        pending: pendingChecks,
        compliance_rate: compliancePercentage,
      },
      documents: {
        total: totalDocs,
        verified: verifiedDocs,
        pending: pendingDocs,
        verification_rate: documentVerificationPercentage,
      },
      findings: {
        total: totalFindings,
        open: openFindings,
        high_critical: highCriticalFindings,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
