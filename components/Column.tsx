import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Column as ColumnType, Task } from '../types';
import { Priority } from '../types';
import { TaskCard } from './TaskCard';
import { PlusIcon } from './icons/PlusIcon';
import { DotsVerticalIcon } from './icons/DotsVerticalIcon';
import { ColumnMenu } from './ColumnMenu';

interface ColumnProps {
  column: ColumnType;
  onAddTask: (columnId: string, title: string) => void;
  onTaskClick: (task: Task) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string, columnId: string) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, columnId: string, index: number) => void;
  draggedItemId: string | null;
  onUpdateTitle: (columnId: string, newTitle: string) => void;
  onDelete: (columnId: string) => void;
}

type SortOption = 'default' | 'priority' | 'dueDate' | 'title';

const priorityOrder: Record<Priority, number> = {
  [Priority.CRITICAL]: 4,
  [Priority.HIGH]: 3,
  [Priority.MEDIUM]: 2,
  [Priority.LOW]: 1,
};

export const Column: React.FC<ColumnProps> = (props) => {
  const { column, onAddTask, onTaskClick, onDragStart, onDragOver, onDrop, draggedItemId, onUpdateTitle, onDelete } = props;
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(column.title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);
  
  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask(column.id, newTaskTitle.trim());
      setNewTaskTitle('');
      setIsAdding(false);
    }
  };

  const handleTitleBlur = () => {
    if (currentTitle.trim() && currentTitle.trim() !== column.title) {
        onUpdateTitle(column.id, currentTitle.trim());
    } else {
        setCurrentTitle(column.title);
    }
    setIsEditingTitle(false);
  };
  
  const sortedTasks = useMemo(() => {
    const tasks = [...column.tasks];
    switch (sortBy) {
      case 'priority':
        return tasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
      case 'dueDate':
        return tasks.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
      case 'title':
        return tasks.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return tasks;
    }
  }, [column.tasks, sortBy]);

  return (
    <div
      className="bg-base-200 rounded-lg p-3 flex flex-col max-h-full"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, column.id, column.tasks.length)}
    >
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <div className="flex items-center gap-2 w-full mr-2" onClick={() => setIsEditingTitle(true)}>
            {isEditingTitle ? (
                 <input
                    ref={titleInputRef}
                    type="text"
                    value={currentTitle}
                    onChange={(e) => setCurrentTitle(e.target.value)}
                    onBlur={handleTitleBlur}
                    onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
                    className="text-lg font-bold bg-base-100 focus:outline-none focus:ring-2 focus:ring-brand-primary rounded-md px-1 -ml-1 w-full"
                />
            ) : (
                <h2 className="text-lg font-bold text-base-content flex items-center gap-2 cursor-pointer w-full">
                    <span className="truncate">{column.title}</span>
                    <span className="text-sm font-normal bg-base-300 text-base-content-secondary rounded-full px-2 py-0.5">{column.tasks.length}</span>
                </h2>
            )}
        </div>
        <div className="relative">
             <button onClick={() => setIsMenuOpen(prev => !prev)} className="p-1 rounded-md hover:bg-base-300">
                <DotsVerticalIcon />
             </button>
             {isMenuOpen && <ColumnMenu onClose={() => setIsMenuOpen(false)} onRename={() => { setIsEditingTitle(true); setIsMenuOpen(false); }} onDelete={() => onDelete(column.id)} />}
        </div>
      </div>

      <div
        className="flex-grow overflow-y-auto space-y-3 pr-2 -mr-3"
        onDragOver={onDragOver}
      >
        {sortedTasks.map((task, index) => (
          <div
            key={task.id}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, column.id, index)}
          >
            <TaskCard
              task={task}
              onClick={() => onTaskClick(task)}
              onDragStart={(e) => onDragStart(e, task.id, column.id)}
              isDragging={draggedItemId === task.id}
            />
          </div>
        ))}
         <div onDrop={(e) => onDrop(e, column.id, column.tasks.length)} className="h-2"></div>
      </div>
      
      <div className="mt-4 flex-shrink-0">
        {isAdding ? (
          <div>
            <textarea
              autoFocus
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddTask(); }}}
              onBlur={() => { if(!newTaskTitle) setIsAdding(false);}}
              placeholder="Enter task title..."
              className="w-full bg-base-100 border-base-300 text-base-content rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
              rows={3}
            />
             <div className="flex items-center justify-end gap-2 mt-2">
                <button onClick={() => setIsAdding(false)} className="text-sm text-base-content-secondary hover:text-base-content">Cancel</button>
                <button onClick={handleAddTask} className="px-3 py-1 bg-brand-primary text-white text-sm font-semibold rounded-md hover:opacity-90">Add</button>
             </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center justify-center gap-2 p-2 text-base-content-secondary hover:bg-base-300 hover:text-base-content rounded-md transition-colors"
          >
            <PlusIcon />
            Add task
          </button>
        )}
      </div>
    </div>
  );
};
