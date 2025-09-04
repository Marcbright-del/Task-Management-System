
import React, { useMemo } from 'react';
import type { Task } from '../../types';
import { Priority } from '../../types';

interface PriorityChartProps {
  tasks: Task[];
}

const priorityOrder = [Priority.CRITICAL, Priority.HIGH, Priority.MEDIUM, Priority.LOW];
const priorityColors: Record<Priority, string> = {
    [Priority.CRITICAL]: 'bg-red-500',
    [Priority.HIGH]: 'bg-orange-500',
    [Priority.MEDIUM]: 'bg-yellow-500',
    [Priority.LOW]: 'bg-sky-500',
}

export const PriorityChart: React.FC<PriorityChartProps> = ({ tasks }) => {
    const priorityCounts = useMemo(() => {
        const counts = {
            [Priority.CRITICAL]: 0,
            [Priority.HIGH]: 0,
            [Priority.MEDIUM]: 0,
            [Priority.LOW]: 0,
        };
        tasks.forEach(task => {
            if (task.columnId !== 'done') {
                counts[task.priority]++;
            }
        });
        return counts;
    }, [tasks]);

    const maxCount = Math.max(...Object.values(priorityCounts), 1);

    return (
        <div>
            <h3 className="text-sm font-bold uppercase text-base-content-secondary mb-2">Active Priorities</h3>
            <div className="space-y-2 bg-base-100 p-3 rounded-lg">
                {priorityOrder.map(priority => (
                    <div key={priority} className="flex items-center gap-2 text-xs">
                        <span className="w-16 text-right font-semibold text-base-content-secondary">{priority}</span>
                        <div className="flex-1 bg-base-300 rounded-full h-4">
                            <div 
                                className={`h-4 rounded-full ${priorityColors[priority]} flex items-center justify-end pr-2 text-white font-bold`}
                                style={{ width: `${(priorityCounts[priority] / maxCount) * 100}%` }}
                            >
                                {priorityCounts[priority] > 0 && priorityCounts[priority]}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};