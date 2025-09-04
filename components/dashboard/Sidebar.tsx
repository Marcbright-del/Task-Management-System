import React from 'react';
import type { Board, ActivityLogEntry } from '../../types';
import { ThemeSwitcher } from './ThemeSwitcher';
import { ProjectStats } from './ProjectStats';
import { PriorityChart } from './PriorityChart';
import { UpcomingTasks } from './UpcomingTasks';
import { OverdueTasks } from './OverdueTasks';
import { TagCloud } from './TagCloud';
import { ActivityFeed } from './ActivityFeed';
import { QuickAddTask } from './QuickAddTask';
import { AIInsight } from './AIInsight';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { DownloadIcon } from '../icons/DownloadIcon';
import { InboxIcon } from '../icons/InboxIcon';

interface SidebarProps {
  board: Board;
  activityLog: ActivityLogEntry[];
  addTask: (columnId: string, title: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  activeTag: string | null;
  setActiveTag: (tag: string | null) => void;
  setShowArchived: (show: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = (props) => {
  const { board, activityLog, addTask, isCollapsed, setIsCollapsed, activeTag, setActiveTag, setShowArchived } = props;

  if (isCollapsed) {
    return null; // The expand button is handled in App.tsx
  }

  const allTasks = board.flatMap(c => c.tasks);
  
  const handleExport = () => {
    const dataStr = JSON.stringify(board, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'gemini-board.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <aside className="fixed top-0 left-0 h-full w-[320px] bg-base-200 flex flex-col z-10 border-r border-base-300">
      <header className="p-4 border-b border-base-300 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-primary" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v7.5a.5.5 0 01-.5.5H5.5a.5.5 0 01-.5-.5V5z" />
            </svg>
            <h2 className="text-xl font-bold">Dashboard</h2>
        </div>
         <button 
            onClick={() => setIsCollapsed(true)} 
            className="p-2 rounded-md hover:bg-base-300"
            aria-label="Collapse sidebar"
        >
          <ChevronLeftIcon />
        </button>
      </header>
      
      <div className="flex-grow p-4 overflow-y-auto space-y-6">
        <ThemeSwitcher />
        <ProjectStats tasks={allTasks} />
        <QuickAddTask columns={board} onAddTask={addTask} />
        
        <div>
            <h3 className="text-sm font-bold uppercase text-base-content-secondary mb-2">Tools & Data</h3>
            <div className="space-y-2">
                <button onClick={() => setShowArchived(true)} className="w-full flex items-center gap-3 p-2 text-sm font-semibold bg-base-100 hover:bg-base-300 rounded-lg">
                    <InboxIcon /> View Archives
                </button>
                 <button onClick={handleExport} className="w-full flex items-center gap-3 p-2 text-sm font-semibold bg-base-100 hover:bg-base-300 rounded-lg">
                    <DownloadIcon /> Export Board to JSON
                </button>
            </div>
        </div>

        <PriorityChart tasks={allTasks} />
        <AIInsight board={board} />
        <OverdueTasks tasks={allTasks} />
        <UpcomingTasks tasks={allTasks} />
        <TagCloud tasks={allTasks} activeTag={activeTag} setActiveTag={setActiveTag} />
        <ActivityFeed log={activityLog} />
      </div>
    </aside>
  );
};
