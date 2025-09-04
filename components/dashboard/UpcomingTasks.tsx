
import React, { useMemo } from 'react';
import type { Task } from '../../types';
import { CalendarIcon } from '../icons/CalendarIcon';

interface UpcomingTasksProps {
  tasks: Task[];
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + 1); // Adjust for timezone
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
};

export const UpcomingTasks: React.FC<UpcomingTasksProps> = ({ tasks }) => {
    const upcoming = useMemo(() => {
        return tasks
            .filter(t => t.dueDate && t.columnId !== 'done')
            .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
            .slice(0, 5);
    }, [tasks]);

    if (upcoming.length === 0) return null;

    return (
        <div>
            <h3 className="text-sm font-bold uppercase text-base-content-secondary mb-2">Upcoming Deadlines</h3>
            <div className="space-y-2 text-sm">
                {upcoming.map(task => (
                    <div key={task.id} className="bg-base-100 p-2 rounded-lg flex justify-between items-center">
                        <span className="font-semibold truncate pr-2">{task.title}</span>
                        <div className="flex items-center gap-1.5 text-xs text-base-content-secondary flex-shrink-0">
                             <CalendarIcon className="h-4 w-4" />
                             <span>{formatDate(task.dueDate!)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};