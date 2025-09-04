import React from 'react';
import type { Task } from '../types';
import { Priority } from '../types';
import { Tag } from './Tag';
import { CalendarIcon } from './icons/CalendarIcon';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  isDragging: boolean;
}

const priorityStyles: Record<Priority, string> = {
  [Priority.LOW]: 'bg-sky-500',
  [Priority.MEDIUM]: 'bg-yellow-500',
  [Priority.HIGH]: 'bg-orange-500',
  [Priority.CRITICAL]: 'bg-red-500',
};

const formatDate = (dateString?: string): string | null => {
  if (!dateString) return null;
  // Add a day to the date to correct for timezone issues where it might show the previous day.
  const date = new Date(dateString);
  date.setDate(date.getDate() + 1);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, onDragStart, isDragging }) => {
  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const totalSubtasks = task.subtasks.length;
  const formattedDueDate = formatDate(task.dueDate);
  const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date() && task.columnId !== 'done' : false;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className={`bg-base-100 rounded-lg shadow-sm cursor-pointer border-2 border-transparent hover:border-brand-primary transition-all duration-200 ${isDragging ? 'opacity-50 ring-2 ring-brand-secondary' : ''}`}
    >
      {task.coverImage && (
        <img src={task.coverImage} alt={`Cover image for ${task.title}`} className="w-full h-32 object-cover rounded-t-lg" />
      )}
      <div className="p-3">
        <div className="flex justify-between items-start mb-2">
            <p className="text-base-content font-semibold break-words">{task.title}</p>
            <div className={`flex-shrink-0 w-3 h-3 rounded-full ml-2 mt-1 ${priorityStyles[task.priority]}`} title={`Priority: ${task.priority}`}></div>
        </div>

        {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
            {task.tags.map(tag => <Tag key={tag} tag={tag} />)}
            </div>
        )}
        
        <div className="flex justify-between items-center text-sm text-base-content-secondary">
            {totalSubtasks > 0 ? (
            <div className="flex items-center gap-2" title={`${completedSubtasks}/${totalSubtasks} subtasks completed`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
                <span>{completedSubtasks}/{totalSubtasks}</span>
            </div>
            ) : <div />}
            {formattedDueDate && (
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${isOverdue ? 'bg-error/10 text-error animate-pulse' : 'bg-base-200'}`}>
                <CalendarIcon className="h-4 w-4"/>
                <span>{formattedDueDate}</span>
            </div>
            )}
        </div>
      </div>
    </div>
  );
};