import React, { useState } from 'react';
import { useAudit } from '../../context/AuditContext';
import { Plus, CheckCircle2 } from 'lucide-react';

interface TasksViewProps {
  onOpenCreateTaskModal: (auditId?: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({ onOpenCreateTaskModal }) => {
  const { tasks, audits, users, updateTaskStatus, setSelectedAuditId, setActiveView } = useAudit();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#2D3139] tracking-tight">Audit Tasks Directory</h1>
          <p className="text-sm text-[#5D6470] mt-1 font-medium">Track actionable items, assignees, and deadlines across all active audits.</p>
        </div>
        <button
          onClick={() => onOpenCreateTaskModal()}
          className="flex items-center space-x-2 rounded-xl bg-[#DEC3B3] px-4.5 py-2.5 text-sm font-bold text-[#2D3139] hover:bg-[#d5b5a3] transition-all border border-[#CDB1A1] shadow-xs cursor-pointer active:scale-98"
        >
          <Plus className="h-4 w-4" />
          <span>New Task</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-3xl border border-[#E5D6CE] bg-white p-4 shadow-xs">
        <span className="text-xs font-bold text-[#5D6470] mr-1">Filter Status:</span>
        {['ALL', 'Not Started', 'In Progress', 'Submitted', 'Under Review', 'Completed', 'Overdue'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              statusFilter === st ? 'bg-[#DEC3B3] text-[#2D3139] border border-[#CDB1A1] shadow-xs' : 'text-[#5D6470] hover:bg-[#E7EBEE]'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredTasks.map((task) => {
          const relatedAudit = audits.find((a) => a.id === task.audit_id);
          const assignee = users.find((u) => u.id === task.assignee_id);

          return (
            <div
              key={task.id}
              className="flex flex-col justify-between gap-3 rounded-2xl border border-[#E5D6CE] bg-white p-5 md:flex-row md:items-center transition-all hover:border-[#DEC3B3] shadow-xs"
            >
              <div className="flex items-start space-x-3">
                <button
                  onClick={() => updateTaskStatus(task.id, task.status === 'Completed' ? 'In Progress' : 'Completed')}
                  className={`h-5 w-5 rounded border flex items-center justify-center transition-colors mt-0.5 ${
                    task.status === 'Completed' ? 'border-[#8C7567] bg-[#DEC3B3] text-[#2D3139]' : 'border-[#D2DCE4] hover:border-[#DEC3B3]'
                  }`}
                >
                  {task.status === 'Completed' && <CheckCircle2 className="h-3.5 w-3.5" />}
                </button>
                <div>
                  <h3 className={`text-sm font-bold ${task.status === 'Completed' ? 'line-through text-[#6C737E]' : 'text-[#2D3139]'}`}>
                    {task.title}
                  </h3>
                  <p className="text-xs text-[#6C737E] mt-1">{task.description}</p>
                  <div className="mt-2 flex items-center space-x-3 text-[11px] text-[#6C737E]">
                    <span>Audit: <strong className="text-[#8C7567] cursor-pointer hover:underline" onClick={() => { setSelectedAuditId(task.audit_id); setActiveView('audit-detail'); }}>{relatedAudit?.title || task.audit_id}</strong></span>
                    <span>Assignee: <strong className="text-[#2D3139]">{assignee?.name || 'Unassigned'}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-xs text-[#6C737E]">Due: {task.due_date}</span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                    task.status === 'Overdue'
                      ? 'bg-[#E5D6CE] text-[#8C7567] border-[#DEC3B3]'
                      : task.status === 'Completed'
                      ? 'bg-[#E7EBEE] text-[#2D3139] border-[#D2DCE4]'
                      : 'bg-[#F8F2EF] text-[#6C737E] border-[#E5D6CE]'
                  }`}
                >
                  {task.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
