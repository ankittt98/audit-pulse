import React, { useState } from 'react';
import { AuditProvider, useAudit } from './context/AuditContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';

import { DashboardView } from './components/dashboard/DashboardView';
import { AuditListView } from './components/audits/AuditListView';
import { AuditDetailView } from './components/audits/AuditDetailView';
import { TasksView } from './components/tasks/TasksView';
import { ChecksView } from './components/checks/ChecksView';
import { DocumentsView } from './components/documents/DocumentsView';
import { FindingsView } from './components/findings/FindingsView';
import { TemplatesView } from './components/templates/TemplatesView';
import { ReportsView } from './components/reports/ReportsView';
import { ActivityView } from './components/activity/ActivityView';

import { CreateAuditModal } from './components/modals/CreateAuditModal';
import { CreateTaskModal } from './components/modals/CreateTaskModal';
import { CreateFindingModal } from './components/modals/CreateFindingModal';
import { UploadEvidenceModal } from './components/modals/UploadEvidenceModal';
import { ReviewDocumentModal } from './components/modals/ReviewDocumentModal';
import { EvaluateCheckModal } from './components/modals/EvaluateCheckModal';
import { AuthModal } from './components/modals/AuthModal';

const AppContent: React.FC = () => {
  const { activeView } = useAudit();

  // Modal States
  const [isCreateAuditOpen, setIsCreateAuditOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>();

  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [taskAuditId, setTaskAuditId] = useState<string | undefined>();

  const [isCreateFindingOpen, setIsCreateFindingOpen] = useState(false);
  const [findingAuditId, setFindingAuditId] = useState<string | undefined>();

  const [isUploadEvidenceOpen, setIsUploadEvidenceOpen] = useState(false);
  const [evidenceAuditId, setEvidenceAuditId] = useState<string | undefined>();

  const [isReviewDocOpen, setIsReviewDocOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | undefined>();

  const [isEvaluateCheckOpen, setIsEvaluateCheckOpen] = useState(false);
  const [selectedCheckId, setSelectedCheckId] = useState<string | undefined>();

  const handleOpenCreateTask = (auditId?: string) => {
    setTaskAuditId(auditId);
    setIsCreateTaskOpen(true);
  };

  const handleOpenCreateFinding = (auditId?: string) => {
    setFindingAuditId(auditId);
    setIsCreateFindingOpen(true);
  };

  const handleOpenUploadEvidence = (auditId?: string) => {
    setEvidenceAuditId(auditId);
    setIsUploadEvidenceOpen(true);
  };

  const handleOpenReviewDoc = (docId: string) => {
    setSelectedDocId(docId);
    setIsReviewDocOpen(true);
  };

  const handleOpenEvaluateCheck = (checkId: string) => {
    setSelectedCheckId(checkId);
    setIsEvaluateCheckOpen(true);
  };

  const handleUseTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setIsCreateAuditOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F2EF] text-[#2D3139] font-sans antialiased selection:bg-[#DEC3B3] selection:text-[#2D3139]">
      <Navbar />

      <div className="flex">
        <Sidebar onOpenCreateAuditModal={() => { setSelectedTemplateId(undefined); setIsCreateAuditOpen(true); }} />

        <main className="flex-1 p-6 max-w-7xl mx-auto overflow-y-auto">
          {activeView === 'dashboard' && (
            <DashboardView
              onOpenCreateAudit={() => { setSelectedTemplateId(undefined); setIsCreateAuditOpen(true); }}
              onOpenUploadEvidence={() => handleOpenUploadEvidence()}
              onOpenReviewDoc={handleOpenReviewDoc}
            />
          )}

          {activeView === 'audits' && (
            <AuditListView
              onOpenCreateModal={() => { setSelectedTemplateId(undefined); setIsCreateAuditOpen(true); }}
            />
          )}

          {activeView === 'audit-detail' && (
            <AuditDetailView
              onOpenCreateTaskModal={handleOpenCreateTask}
              onOpenUploadEvidenceModal={handleOpenUploadEvidence}
              onOpenCreateFindingModal={handleOpenCreateFinding}
              onOpenEvaluateCheckModal={handleOpenEvaluateCheck}
              onOpenReviewDocModal={handleOpenReviewDoc}
            />
          )}

          {activeView === 'tasks' && <TasksView onOpenCreateTaskModal={handleOpenCreateTask} />}

          {activeView === 'checks' && <ChecksView onOpenEvaluateCheckModal={handleOpenEvaluateCheck} />}

          {activeView === 'documents' && (
            <DocumentsView
              onOpenUploadModal={handleOpenUploadEvidence}
              onOpenReviewModal={handleOpenReviewDoc}
            />
          )}

          {activeView === 'findings' && <FindingsView onOpenCreateFindingModal={handleOpenCreateFinding} />}

          {activeView === 'templates' && <TemplatesView onUseTemplate={handleUseTemplate} />}

          {activeView === 'reports' && <ReportsView />}

          {activeView === 'activity' && <ActivityView />}
        </main>
      </div>

      {/* Modals */}
      <CreateAuditModal
        isOpen={isCreateAuditOpen}
        onClose={() => setIsCreateAuditOpen(false)}
        selectedTemplateId={selectedTemplateId}
      />

      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        defaultAuditId={taskAuditId}
      />

      <CreateFindingModal
        isOpen={isCreateFindingOpen}
        onClose={() => setIsCreateFindingOpen(false)}
        defaultAuditId={findingAuditId}
      />

      <UploadEvidenceModal
        isOpen={isUploadEvidenceOpen}
        onClose={() => setIsUploadEvidenceOpen(false)}
        defaultAuditId={evidenceAuditId}
      />

      <ReviewDocumentModal
        isOpen={isReviewDocOpen}
        onClose={() => setIsReviewDocOpen(false)}
        documentId={selectedDocId}
      />

      <EvaluateCheckModal
        isOpen={isEvaluateCheckOpen}
        onClose={() => setIsEvaluateCheckOpen(false)}
        checkId={selectedCheckId}
      />

      <AuthModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuditProvider>
      <AppContent />
    </AuditProvider>
  );
};

export default App;
