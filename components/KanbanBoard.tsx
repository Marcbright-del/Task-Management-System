import React, { useState, useRef } from 'react';
import type { Board, Task } from '../types';
import { Column } from './Column';
import { PlusIcon } from './icons/PlusIcon';

interface KanbanBoardProps {
  board: Board;
  onAddTask: (columnId: string, title: string) => void;
  onMoveTask: (taskId: string, sourceColumnId:string, destColumnId: string, destIndex: number) => void;
  onTaskClick: (task: Task) => void;
  onAddColumn: (title: string) => void;
  onUpdateColumnTitle: (columnId: string, newTitle: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onMoveColumn: (dragIndex: number, hoverIndex: number) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = (props) => {
  const { board, onAddTask, onMoveTask, onTaskClick, onAddColumn, onUpdateColumnTitle, onDeleteColumn, onMoveColumn } = props;
  
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [sourceColumnId, setSourceColumnId] = useState<string | null>(null);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);

  // For column dragging
  const draggedColumnIndex = useRef<number | null>(null);
  const hoveredColumnIndex = useRef<number | null>(null);

  const handleTaskDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string, columnId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedItemId(taskId);
    setSourceColumnId(columnId);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, destColumnId: string, destIndex: number) => {
    e.preventDefault();
    if (draggedItemId && sourceColumnId) {
      onMoveTask(draggedItemId, sourceColumnId, destColumnId, destIndex);
    }
    setDraggedItemId(null);
    setSourceColumnId(null);
  };
  
  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      onAddColumn(newColumnTitle.trim());
      setNewColumnTitle('');
      setIsAddingColumn(false);
    }
  };

  const handleColumnDragStart = (e: React.DragEvent, index: number) => {
    draggedColumnIndex.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColumnDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    hoveredColumnIndex.current = index;
  };

  const handleColumnDragEnd = () => {
    if (draggedColumnIndex.current !== null && hoveredColumnIndex.current !== null && draggedColumnIndex.current !== hoveredColumnIndex.current) {
        onMoveColumn(draggedColumnIndex.current, hoveredColumnIndex.current);
    }
    draggedColumnIndex.current = null;
    hoveredColumnIndex.current = null;
  };

  return (
    <div className="flex gap-6 h-full items-start">
      {board.map((column, index) => (
         <div 
            key={column.id}
            className="w-80 flex-shrink-0"
            draggable
            onDragStart={(e) => handleColumnDragStart(e, index)}
            onDragEnter={(e) => handleColumnDragEnter(e, index)}
            onDragEnd={handleColumnDragEnd}
            onDragOver={(e) => e.preventDefault()}
         >
            <Column
                column={column}
                onAddTask={onAddTask}
                onTaskClick={onTaskClick}
                onDragStart={handleTaskDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                draggedItemId={draggedItemId}
                onUpdateTitle={onUpdateColumnTitle}
                onDelete={onDeleteColumn}
            />
        </div>
      ))}
       <div className="w-80 flex-shrink-0">
         {isAddingColumn ? (
           <div className="bg-base-200 p-2 rounded-lg">
             <input
               autoFocus
               type="text"
               value={newColumnTitle}
               onChange={(e) => setNewColumnTitle(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
               onBlur={() => setIsAddingColumn(false)}
               placeholder="Enter column title..."
               className="w-full bg-base-100 border-base-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
             />
             <div className="flex items-center justify-end gap-2 mt-2">
                <button onClick={() => setIsAddingColumn(false)} className="text-sm text-base-content-secondary hover:text-base-content">Cancel</button>
                <button onClick={handleAddColumn} className="px-3 py-1 bg-brand-primary text-white text-sm font-semibold rounded-md hover:opacity-90">Add</button>
             </div>
           </div>
         ) : (
          <button
            onClick={() => setIsAddingColumn(true)}
            className="w-full flex items-center justify-center gap-2 p-3 text-base-content-secondary bg-base-200/50 hover:bg-base-200 rounded-lg transition-colors"
          >
            <PlusIcon />
            Add another column
          </button>
         )}
      </div>
    </div>
  );
};