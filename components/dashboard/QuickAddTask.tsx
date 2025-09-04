
import React, { useState } from 'react';
import type { Column } from '../../types';
import { PlusIcon } from '../icons/PlusIcon';

interface QuickAddTaskProps {
  columns: Column[];
  onAddTask: (columnId: string, title: string) => void;
}

export const QuickAddTask: React.FC<QuickAddTaskProps> = ({ columns, onAddTask }) => {
  const [title, setTitle] = useState('');
  const [columnId, setColumnId] = useState(columns.length > 0 ? columns[0].id : '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
        setError('Title cannot be empty.');
        return;
    }
     if (!columnId) {
        setError('Please select a column.');
        return;
    }
    onAddTask(columnId, title);
    setTitle('');
    setError('');
    // Clear focus from input to allow 'N' shortcut again
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  return (
    <div>
      <h3 className="text-sm font-bold uppercase text-base-content-secondary mb-2">Quick Add Task</h3>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          id="quick-add-input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task title... (Press 'N')"
          className="w-full bg-base-100 border border-base-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
        <select
          value={columnId}
          onChange={(e) => setColumnId(e.target.value)}
          className="w-full bg-base-100 border border-base-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
        >
          {columns.map(col => <option key={col.id} value={col.id}>{col.title}</option>)}
        </select>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button type="submit" className="w-full flex items-center justify-center gap-2 p-2 bg-brand-primary text-white font-semibold rounded-md hover:opacity-90">
            <PlusIcon />
            Add Task
        </button>
      </form>
    </div>
  );
};