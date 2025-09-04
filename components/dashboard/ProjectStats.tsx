
import React, { useMemo } from 'react';
import type { Task } from '../../types';

interface ProjectStatsProps {
  tasks: Task[];
}

export const ProjectStats: React.FC<ProjectStatsProps> = ({ tasks }) => {
    const stats = useMemo(() => {
        return {
            total: tasks.length,
            todo: tasks.filter(t => t.columnId === 'todo').length,
            inProgress: tasks.filter(t => t.columnId === 'inprogress').length,
            done: tasks.filter(t => t.columnId === 'done').length,
        }
    }, [tasks]);

  return (
    <div>
        <h3 className="text-sm font-bold uppercase text-base-content-secondary mb-2">Project Stats</h3>
        <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-base-100 p-2 rounded-lg">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-base-content-secondary">Total</p>
            </div>
            <div className="bg-base-100 p-2 rounded-lg">
                <p className="text-2xl font-bold">{stats.todo}</p>
                <p className="text-xs text-base-content-secondary">To Do</p>
            </div>
            <div className="bg-base-100 p-2 rounded-lg">
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-xs text-base-content-secondary">In Progress</p>
            </div>
            <div className="bg-base-100 p-2 rounded-lg">
                <p className="text-2xl font-bold">{stats.done}</p>
                <p className="text-xs text-base-content-secondary">Done</p>
            </div>
        </div>
    </div>
  );
};