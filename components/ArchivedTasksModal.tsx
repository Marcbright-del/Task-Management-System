import React from 'react';
import type { Task } from '../types';
import { XIcon } from './icons/XIcon';
import { ArchiveIcon } from './icons/ArchiveIcon';
import { TrashIcon } from './icons/TrashIcon';

interface ArchivedTasksModalProps {
  archivedTasks: Task[];
  onClose: () => void;
  onRestoreTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export const ArchivedTasksModal: React.FC<ArchivedTasksModalProps> = (props) => {
    const { archivedTasks, onClose, onRestoreTask, onDeleteTask } = props;

    const handleWrapperClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
          onClose();
      }
    };
    
    const handleDelete = (task: Task) => {
        if(window.confirm(`Are you sure you want to permanently delete the archived task "${task.title}"? This action cannot be undone.`)) {
            onDeleteTask(task.id);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={handleWrapperClick}>
            <div className="bg-base-100 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <header className="p-4 border-b border-base-300 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold">Archived Tasks</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-base-200"><XIcon /></button>
                </header>
                <div className="flex-grow p-6 overflow-y-auto">
                    {archivedTasks.length > 0 ? (
                        <ul className="space-y-3">
                            {archivedTasks.map(task => (
                                <li key={task.id} className="bg-base-200 p-3 rounded-lg flex justify-between items-center">
                                    <span className="font-semibold">{task.title}</span>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => onRestoreTask(task.id)} 
                                            className="flex items-center gap-1.5 px-3 py-1 text-sm bg-base-300 hover:bg-success/20 hover:text-success rounded-md"
                                            title="Restore Task"
                                        >
                                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a5 5 0 00-5 5v1h10V7a5 5 0 00-5-5zM6 7v1h8V7a3 3 0 00-6 0z" /><path fillRule="evenodd" d="M6 12a2 2 0 00-2 2v2a2 2 0 002 2h8a2 2 0 002-2v-2a2 2 0 00-2-2H6zm2-1a1 1 0 100 2h4a1 1 0 100-2H8z" clipRule="evenodd" /></svg>
                                            Restore
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(task)} 
                                            className="p-2 text-base-content-secondary hover:text-error hover:bg-error/10 rounded-md"
                                            title="Delete Permanently"
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-base-content-secondary">No archived tasks.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
