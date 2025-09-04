
import React, { useMemo } from 'react';
import type { Task } from '../../types';

interface OverdueTasksProps {
  tasks: Task[];
}

export const OverdueTasks: React.FC<OverdueTasksProps> = ({ tasks }) => {
    const overdue = useMemo(() => {
        const now = new Date();
        return tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.columnId !== 'done');
    }, [tasks]);

    if (overdue.length === 0) return null;

    return (
        <div className="bg-red-500/10 dark:bg-red-500/20 p-3 rounded-lg">
            <h3 className="text-sm font-bold uppercase text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {overdue.length} Overdue Task{overdue.length > 1 ? 's' : ''}
            </h3>
            <div className="space-y-1 text-sm text-red-700 dark:text-red-300 font-semibold">
                {overdue.map(task => (
                    <p key={task.id} className="truncate">- {task.title}</p>
                ))}
            </div>
        </div>
    );
};
