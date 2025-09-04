import React, { useState, useMemo, useEffect } from 'react';
import { KanbanBoard } from './components/KanbanBoard';
import { TaskModal } from './components/TaskModal';
import { Sidebar } from './components/dashboard/Sidebar';
import { useTaskManager } from './hooks/useTaskManager';
import type { Task, Board } from './types';
import { ChevronRightIcon } from './components/icons/ChevronRightIcon';
import { NotificationProvider } from './contexts/NotificationContext';
import { NotificationContainer } from './components/Notification';
import { ArchivedTasksModal } from './components/ArchivedTasksModal';

const AppContent: React.FC = () => {
  const { 
    board,
    activityLog,
    archivedTasks,
    addTask, 
    updateTask,
    deleteTask,
    moveTask,
    addColumn,
    updateColumnTitle,
    deleteColumn,
    moveColumn,
    archiveTask,
    unarchiveTask,
    deleteArchivedTask,
  } = useTaskManager();
  
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeTask) setActiveTask(null);
        if (showArchived) setShowArchived(false);
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        return;
      }
      
      // Don't trigger other shortcuts if user is typing
      if (document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
      
      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        document.getElementById('quick-add-input')?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTask, showArchived]);

  const handleTaskClick = (task: Task) => {
    setActiveTask(task);
  };

  const handleModalClose = () => {
    setActiveTask(null);
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    updateTask(updatedTask);
    setActiveTask(updatedTask); // Keep modal in sync
  };

  const handleTaskDelete = (taskId: string) => {
    deleteTask(taskId);
    setActiveTask(null);
  };

  const handleTaskArchive = (taskId: string) => {
    archiveTask(taskId);
    setActiveTask(null);
  };
  
  const filteredBoard = useMemo<Board>(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    
    return board.map(column => ({
      ...column,
      tasks: column.tasks.filter(task => {
        const matchesSearch = searchTerm.trim() === '' ||
          task.title.toLowerCase().includes(lowercasedFilter) ||
          (task.description || '').toLowerCase().includes(lowercasedFilter) ||
          (task.tags || []).some(tag => tag.toLowerCase().includes(lowercasedFilter));
          
        const matchesTag = !activeTag || (task.tags || []).includes(activeTag);

        return matchesSearch && matchesTag;
      })
    }));
  }, [board, searchTerm, activeTag]);

  return (
    <>
      <div className="flex h-screen w-screen overflow-hidden">
          <Sidebar
            board={board}
            activityLog={activityLog}
            addTask={addTask}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
            activeTag={activeTag}
            setActiveTag={setActiveTag}
            setShowArchived={setShowArchived}
          />

        <main className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'ml-0' : 'ml-[320px]'}`}>
          <header className="flex-shrink-0 p-4 border-b border-base-300 flex items-center gap-4">
             {isSidebarCollapsed && (
                 <button 
                    onClick={() => setIsSidebarCollapsed(false)} 
                    className="p-2 rounded-md hover:bg-base-200"
                    aria-label="Expand sidebar"
                 >
                    <ChevronRightIcon />
                 </button>
             )}
            <input
              id="search-input"
              type="text"
              placeholder="Search tasks (Press 'F' to focus)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md bg-base-200 border border-transparent rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </header>
          <div className="flex-grow p-6 overflow-auto">
            <KanbanBoard
              board={filteredBoard}
              onAddTask={addTask}
              onMoveTask={moveTask}
              onTaskClick={handleTaskClick}
              onAddColumn={addColumn}
              onUpdateColumnTitle={updateColumnTitle}
              onDeleteColumn={deleteColumn}
              onMoveColumn={moveColumn}
            />
          </div>
        </main>

        {activeTask && (
          <TaskModal
            task={activeTask}
            onClose={handleModalClose}
            onUpdateTask={handleTaskUpdate}
            onDeleteTask={handleTaskDelete}
            onArchiveTask={handleTaskArchive}
          />
        )}

        {showArchived && (
          <ArchivedTasksModal
            archivedTasks={archivedTasks}
            onClose={() => setShowArchived(false)}
            onRestoreTask={unarchiveTask}
            onDeleteTask={deleteArchivedTask}
          />
        )}
      </div>
      <NotificationContainer />
    </>
  );
};


const App: React.FC = () => {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
};

export default App;