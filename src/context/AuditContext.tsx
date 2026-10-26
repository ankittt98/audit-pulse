import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  User,
  Organization,
  Audit,
  AuditTask,
  ComplianceCheck,
  EvidenceDocument,
  Finding,
  ActivityRecord,
  AuditTemplate,
  AuditStatus,
  CheckWorkflowStatus,
  CheckResult,
  DocumentReviewStatus,
  FindingStatus,
  TaskStatus,
  Role,
} from '../types/audit';
import {
  initialOrganization,
  initialUsers,
  initialAudits,
  initialTasks,
  initialComplianceChecks,
  initialDocuments,
  initialFindings,
  initialActivities,
  initialTemplates,
} from '../mockData/initialData';
import { api } from '../services/api';

interface AuditContextType {
  currentUser: User;
  isAuthenticated: boolean;
  login: (user: User) => void;
  register: (userData: { name: string; email: string; role?: Role; department?: string }) => Promise<User>;
  logout: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  setCurrentUserRole: (role: Role) => void;
  organization: Organization;
  users: User[];
  audits: Audit[];
  tasks: AuditTask[];
  checks: ComplianceCheck[];
  documents: EvidenceDocument[];
  findings: Finding[];
  activities: ActivityRecord[];
  templates: AuditTemplate[];
  activeView: string;
  setActiveView: (view: string) => void;
  selectedAuditId: string | null;
  setSelectedAuditId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  isLoading: boolean;
  refreshData: () => Promise<void>;

  // Actions
  createAudit: (audit: Omit<Audit, 'id' | 'created_at' | 'updated_at'>, templateId?: string) => Promise<void>;
  updateAuditStatus: (auditId: string, status: AuditStatus) => Promise<void>;
  createTask: (task: Omit<AuditTask, 'id' | 'created_at' | 'creator_id' | 'attachments_count' | 'comments_count'>) => Promise<void>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  evaluateComplianceCheck: (checkId: string, status: CheckWorkflowStatus, result: CheckResult, notes?: string) => Promise<void>;
  uploadDocument: (docData: Omit<EvidenceDocument, 'id' | 'uploaded_at' | 'uploaded_by' | 'review_status'> | FormData) => Promise<void>;
  reviewDocument: (docId: string, reviewStatus: DocumentReviewStatus, notes?: string) => Promise<void>;
  createFinding: (finding: Omit<Finding, 'id' | 'created_at' | 'corrective_actions'>, initialActions?: { description: string; owner_id: string; due_date: string; priority: any }[]) => Promise<void>;
  updateFindingStatus: (findingId: string, status: FindingStatus) => Promise<void>;
  addCorrectiveAction: (findingId: string, action: { description: string; owner_id: string; due_date: string; priority: any }) => Promise<void>;
  updateActionStatus: (findingId: string, actionId: string, status: 'Not Started' | 'In Progress' | 'Submitted' | 'Under Review' | 'Completed', completion_notes?: string) => Promise<void>;
  addActivityLog: (auditId: string | undefined, action: string, entityType: any, entityId: string, details: string) => Promise<void>;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

export const AuditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem('auditpulse_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return initialUsers[0];
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('auditpulse_user'));
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(() => {
    return !localStorage.getItem('auditpulse_user');
  });
  const [organization, setOrganization] = useState<Organization>(initialOrganization);

  const [audits, setAudits] = useState<Audit[]>(initialAudits);
  const [tasks, setTasks] = useState<AuditTask[]>(initialTasks);
  const [checks, setChecks] = useState<ComplianceCheck[]>(initialComplianceChecks);
  const [documents, setDocuments] = useState<EvidenceDocument[]>(initialDocuments);
  const [findings, setFindings] = useState<Finding[]>(initialFindings);
  const [activities, setActivities] = useState<ActivityRecord[]>(initialActivities);
  const [templates, setTemplates] = useState<AuditTemplate[]>(initialTemplates);

  const [activeView, setActiveView] = useState<string>('dashboard');
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('auditpulse_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {}
    return 'light';
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync data with backend API
  const refreshData = useCallback(async () => {
    try {
      const [
        fetchedUsers,
        fetchedOrg,
        fetchedAudits,
        fetchedTasks,
        fetchedChecks,
        fetchedDocs,
        fetchedFindings,
        fetchedActivities,
        fetchedTemplates,
      ] = await Promise.allSettled([
        api.getUsers(),
        api.getOrganization(),
        api.getAudits(),
        api.getTasks(),
        api.getChecks(),
        api.getDocuments(),
        api.getFindings(),
        api.getActivities(),
        api.getTemplates(),
      ]);

      if (fetchedUsers.status === 'fulfilled' && fetchedUsers.value.length > 0) {
        setUsers(fetchedUsers.value);
        // keep current user or update
        setCurrentUser((prev) => fetchedUsers.value.find((u) => u.id === prev.id) || fetchedUsers.value[0]);
      }
      if (fetchedOrg.status === 'fulfilled' && fetchedOrg.value?.id) {
        setOrganization(fetchedOrg.value);
      }
      if (fetchedAudits.status === 'fulfilled') {
        setAudits(fetchedAudits.value);
      }
      if (fetchedTasks.status === 'fulfilled') {
        setTasks(fetchedTasks.value);
      }
      if (fetchedChecks.status === 'fulfilled') {
        setChecks(fetchedChecks.value);
      }
      if (fetchedDocs.status === 'fulfilled') {
        setDocuments(fetchedDocs.value);
      }
      if (fetchedFindings.status === 'fulfilled') {
        setFindings(fetchedFindings.value);
      }
      if (fetchedActivities.status === 'fulfilled') {
        setActivities(fetchedActivities.value);
      }
      if (fetchedTemplates.status === 'fulfilled') {
        setTemplates(fetchedTemplates.value);
      }
    } catch (err) {
      console.warn('API sync warning (falling back to cached/initial state):', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    try {
      localStorage.setItem('auditpulse_theme', theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const login = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
    try {
      localStorage.setItem('auditpulse_user', JSON.stringify(user));
    } catch {}
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsAuthModalOpen(true);
    try {
      localStorage.removeItem('auditpulse_user');
    } catch {}
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => {
    // Only close if authenticated
    if (isAuthenticated) {
      setIsAuthModalOpen(false);
    }
  };

  const register = async (userData: { name: string; email: string; role?: Role; department?: string }) => {
    try {
      const newUser = await api.registerUser(userData);
      setUsers((prev) => [...prev.filter((u) => u.id !== newUser.id), newUser]);
      login(newUser);
      return newUser;
    } catch {
      const localUser: User = {
        id: `u-${Date.now()}`,
        name: userData.name,
        email: userData.email,
        role: userData.role || 'Contributor',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name)}&backgroundColor=dec3b3,d2dce4,e5d6ce`,
        department: userData.department || 'General Audit',
      };
      setUsers((prev) => [...prev, localUser]);
      login(localUser);
      return localUser;
    }
  };

  const setCurrentUserRole = (role: Role) => {
    const found = users.find((u) => u.role === role);
    if (found) {
      setCurrentUser(found);
      try {
        localStorage.setItem('auditpulse_user', JSON.stringify(found));
      } catch {}
    } else {
      const updated = { ...currentUser, role };
      setCurrentUser(updated);
      try {
        localStorage.setItem('auditpulse_user', JSON.stringify(updated));
      } catch {}
    }
  };

  const addActivityLog = async (
    auditId: string | undefined,
    action: string,
    entityType: any,
    entityId: string,
    details: string
  ) => {
    try {
      await api.getActivities(auditId, 1);
      await refreshData();
    } catch {
      const fallbackLog: ActivityRecord = {
        id: `act-log-${Date.now()}`,
        audit_id: auditId,
        user_id: currentUser.id,
        user_name: currentUser.name,
        user_avatar: currentUser.avatar,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details,
        timestamp: new Date().toISOString(),
      };
      setActivities((prev) => [fallbackLog, ...prev]);
    }
  };

  const createAudit = async (auditData: Omit<Audit, 'id' | 'created_at' | 'updated_at'>, templateId?: string) => {
    try {
      await api.createAudit({
        ...auditData,
        templateId,
        user_id: currentUser.id,
        user_name: currentUser.name,
      });
      await refreshData();
    } catch (err) {
      console.error('Failed to create audit via API:', err);
      // local fallback
      const newAuditId = `aud-${Date.now().toString().slice(-4)}`;
      const now = new Date().toISOString();
      const newAudit: Audit = { ...auditData, id: newAuditId, created_at: now, updated_at: now };
      setAudits((prev) => [newAudit, ...prev]);
    }
  };

  const updateAuditStatus = async (auditId: string, status: AuditStatus) => {
    try {
      await api.updateAudit(auditId, {
        status,
        user_id: currentUser.id,
        user_name: currentUser.name,
      });
      await refreshData();
    } catch (err) {
      console.error('Failed to update audit status via API:', err);
      setAudits((prev) =>
        prev.map((a) => (a.id === auditId ? { ...a, status, updated_at: new Date().toISOString() } : a))
      );
    }
  };

  const createTask = async (
    taskData: Omit<AuditTask, 'id' | 'created_at' | 'creator_id' | 'attachments_count' | 'comments_count'>
  ) => {
    try {
      await api.createTask({
        ...taskData,
        creator_id: currentUser.id,
        user_name: currentUser.name,
      });
      await refreshData();
    } catch (err) {
      console.error('Failed to create task via API:', err);
      const newTaskId = `tsk-${Date.now().toString().slice(-4)}`;
      const newTask: AuditTask = {
        ...taskData,
        id: newTaskId,
        creator_id: currentUser.id,
        attachments_count: 0,
        comments_count: 0,
        created_at: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
    }
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    try {
      await api.updateTask(taskId, {
        status,
        user_id: currentUser.id,
        user_name: currentUser.name,
      });
      await refreshData();
    } catch (err) {
      console.error('Failed to update task via API:', err);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
    }
  };

  const evaluateComplianceCheck = async (
    checkId: string,
    status: CheckWorkflowStatus,
    result: CheckResult,
    notes?: string
  ) => {
    try {
      await api.evaluateCheck(checkId, {
        status,
        result,
        notes,
        reviewer_id: currentUser.id,
        user_name: currentUser.name,
      });
      await refreshData();
    } catch (err) {
      console.error('Failed to evaluate check via API:', err);
      setChecks((prev) =>
        prev.map((c) =>
          c.id === checkId
            ? { ...c, status, result, notes: notes !== undefined ? notes : c.notes, reviewer_id: currentUser.id, updated_at: new Date().toISOString() }
            : c
        )
      );
    }
  };

  const uploadDocument = async (docData: Omit<EvidenceDocument, 'id' | 'uploaded_at' | 'uploaded_by' | 'review_status'> | FormData) => {
    try {
      let formData: FormData;
      if (docData instanceof FormData) {
        formData = docData;
        if (!formData.get('uploaded_by')) {
          formData.append('uploaded_by', currentUser.name);
        }
      } else {
        formData = new FormData();
        formData.append('audit_id', docData.audit_id);
        formData.append('title', docData.title);
        formData.append('filename', docData.filename);
        formData.append('description', docData.description || '');
        formData.append('version', docData.version);
        formData.append('uploaded_by', currentUser.name);
        if (docData.related_entity_type) formData.append('related_entity_type', docData.related_entity_type);
        if (docData.related_entity_id) formData.append('related_entity_id', docData.related_entity_id);
      }

      await api.uploadDocument(formData);
      await refreshData();
    } catch (err) {
      console.error('Failed to upload document via API:', err);
      if (!(docData instanceof FormData)) {
        const newDocId = `doc-${Date.now().toString().slice(-4)}`;
        const newDoc: EvidenceDocument = {
          ...docData,
          id: newDocId,
          uploaded_by: currentUser.name,
          uploaded_at: new Date().toISOString(),
          review_status: 'Under Review',
        };
        setDocuments((prev) => [newDoc, ...prev]);
      }
    }
  };

  const reviewDocument = async (docId: string, reviewStatus: DocumentReviewStatus, notes?: string) => {
    try {
      await api.reviewDocument(docId, {
        review_status: reviewStatus,
        reviewer_notes: notes,
        reviewer_id: currentUser.id,
        reviewer_name: currentUser.name,
      });
      await refreshData();
    } catch (err) {
      console.error('Failed to review document via API:', err);
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === docId
            ? { ...d, review_status: reviewStatus, reviewer_id: currentUser.id, reviewer_notes: notes, reviewed_at: new Date().toISOString() }
            : d
        )
      );
    }
  };

  const createFinding = async (
    findingData: Omit<Finding, 'id' | 'created_at' | 'corrective_actions'>,
    initialActions: { description: string; owner_id: string; due_date: string; priority: any }[] = []
  ) => {
    try {
      await api.createFinding({
        ...findingData,
        initial_actions: initialActions,
        user_id: currentUser.id,
        user_name: currentUser.name,
      });
      await refreshData();
    } catch (err) {
      console.error('Failed to create finding via API:', err);
      const newFindingId = `fnd-${Date.now().toString().slice(-4)}`;
      const actions = initialActions.map((act, idx) => ({
        id: `act-${newFindingId}-${idx + 1}`,
        finding_id: newFindingId,
        description: act.description,
        owner_id: act.owner_id,
        due_date: act.due_date,
        priority: act.priority,
        status: 'Not Started' as const,
      }));
      const newFinding: Finding = {
        ...findingData,
        id: newFindingId,
        created_at: new Date().toISOString(),
        corrective_actions: actions,
      };
      setFindings((prev) => [newFinding, ...prev]);
    }
  };

  const updateFindingStatus = async (findingId: string, status: FindingStatus) => {
    try {
      await api.updateFinding(findingId, {
        status,
        user_id: currentUser.id,
        user_name: currentUser.name,
      });
      await refreshData();
    } catch (err) {
      console.error('Failed to update finding status via API:', err);
      setFindings((prev) => prev.map((f) => (f.id === findingId ? { ...f, status } : f)));
    }
  };

  const addCorrectiveAction = async (
    findingId: string,
    action: { description: string; owner_id: string; due_date: string; priority: any }
  ) => {
    try {
      await api.addCorrectiveAction(findingId, {
        ...action,
        user_id: currentUser.id,
        user_name: currentUser.name,
      });
      await refreshData();
    } catch (err) {
      console.error('Failed to add corrective action via API:', err);
      const newActionId = `act-${Date.now().toString().slice(-4)}`;
      const newAction = {
        id: newActionId,
        finding_id: findingId,
        description: action.description,
        owner_id: action.owner_id,
        due_date: action.due_date,
        priority: action.priority,
        status: 'Not Started' as const,
      };
      setFindings((prev) =>
        prev.map((f) => (f.id === findingId ? { ...f, corrective_actions: [...f.corrective_actions, newAction] } : f))
      );
    }
  };

  const updateActionStatus = async (
    findingId: string,
    actionId: string,
    status: 'Not Started' | 'In Progress' | 'Submitted' | 'Under Review' | 'Completed',
    completion_notes?: string
  ) => {
    try {
      await api.updateActionStatus(findingId, actionId, {
        status,
        completion_notes,
        reviewer_id: currentUser.id,
        user_name: currentUser.name,
      });
      await refreshData();
    } catch (err) {
      console.error('Failed to update action status via API:', err);
      setFindings((prev) =>
        prev.map((f) => {
          if (f.id === findingId) {
            const updatedActions = f.corrective_actions.map((act) =>
              act.id === actionId
                ? { ...act, status, completion_notes: completion_notes || act.completion_notes, reviewer_id: currentUser.id, reviewed_at: new Date().toISOString() }
                : act
            );
            return { ...f, corrective_actions: updatedActions };
          }
          return f;
        })
      );
    }
  };

  return (
    <AuditContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        register,
        logout,
        openAuthModal,
        closeAuthModal,
        isAuthModalOpen,
        setCurrentUserRole,
        organization,
        users,
        audits,
        tasks,
        checks,
        documents,
        findings,
        activities,
        templates,
        activeView,
        setActiveView,
        selectedAuditId,
        setSelectedAuditId,
        searchQuery,
        setSearchQuery,
        theme,
        toggleTheme,
        isLoading,
        refreshData,
        createAudit,
        updateAuditStatus,
        createTask,
        updateTaskStatus,
        evaluateComplianceCheck,
        uploadDocument,
        reviewDocument,
        createFinding,
        updateFindingStatus,
        addCorrectiveAction,
        updateActionStatus,
        addActivityLog,
      }}
    >
      {children}
    </AuditContext.Provider>
  );
};

export const useAudit = () => {
  const context = useContext(AuditContext);
  if (!context) throw new Error('useAudit must be used within an AuditProvider');
  return context;
};
