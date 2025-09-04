import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Task, Subtask } from '../types';
import { Priority } from '../types';
import { generateSubtasks, suggestPriority, generateDescription, suggestTags } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';
import { TrashIcon } from './icons/TrashIcon';
import { Tag } from './Tag';
import { ArchiveIcon } from './icons/ArchiveIcon';
import { XIcon } from './icons/XIcon';
import { useNotifications } from '../contexts/NotificationContext';

interface TaskModalProps {
  task: Task;
  onClose: () => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onArchiveTask: (taskId: string) => void;
}

type ActiveTab = 'details' | 'activity';
type DescTab = 'write' | 'preview';

export const TaskModal: React.FC<TaskModalProps> = (props) => {
  const { task, onClose, onUpdateTask, onDeleteTask, onArchiveTask } = props;
  const [editableTask, setEditableTask] = useState<Task>(task);
  const [activeTab, setActiveTab] = useState<ActiveTab>('details');
  const [descTab, setDescTab] = useState<DescTab>('write');
  const modalRef = useRef<HTMLDivElement>(null);
  const { addNotification } = useNotifications();

  // AI States
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);
  const [isSuggestingPriority, setIsSuggestingPriority] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    setEditableTask(task);
  }, [task]);
  
  // Close modal on outside click
  const handleWrapperClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
          onClose();
      }
  };
  
  const handleUpdate = <K extends keyof Task,>(field: K, value: Task[K]) => {
    const updatedTask = { ...editableTask, [field]: value };
    setEditableTask(updatedTask);
    onUpdateTask(updatedTask);
  };
  
  const handleAIFeature = async (feature: 'subtasks' | 'priority' | 'description' | 'tags') => {
    if (!editableTask.title) {
        addNotification('Please enter a task title first.', 'warning');
        return;
    };
    const setters: Record<string, Function> = {
        subtasks: setIsGeneratingSubtasks,
        priority: setIsSuggestingPriority,
        description: setIsGeneratingDesc,
        tags: setIsSuggestingTags,
    };
    setters[feature](true);

    try {
        switch (feature) {
            case 'subtasks':
                const subtaskTexts = await generateSubtasks(editableTask.title);
                const newSubtasks: Subtask[] = subtaskTexts.map((text, i) => ({ id: `sub-${Date.now()}-${i}`, text, completed: false }));
                handleUpdate('subtasks', [...editableTask.subtasks, ...newSubtasks]);
                addNotification('AI subtasks generated!', 'success');
                break;
            case 'priority':
                const priority = await suggestPriority(editableTask.title, editableTask.description);
                handleUpdate('priority', priority);
                addNotification(`AI suggested priority: ${priority}`, 'info');
                break;
            case 'description':
                const description = await generateDescription(editableTask.title);
                handleUpdate('description', description);
                addNotification('AI description generated!', 'success');
                break;
            case 'tags':
                const tags = await suggestTags(editableTask.title, editableTask.description);
                const currentTags = new Set(editableTask.tags || []);
                tags.forEach(t => currentTags.add(t));
                handleUpdate('tags', Array.from(currentTags));
                addNotification('AI tags suggested!', 'info');
                break;
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        addNotification(message, 'error');
    } finally {
        setters[feature](false);
    }
  };
  
  const handleAddTag = () => {
    if (newTag.trim() && !(editableTask.tags || []).includes(newTag.trim())) {
      const newTags = [...(editableTask.tags || []), newTag.trim()];
      handleUpdate('tags', newTags);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = (editableTask.tags || []).filter(tag => tag !== tagToRemove);
    handleUpdate('tags', newTags);
  };
  
  const handleDelete = () => {
    if(window.confirm(`Are you sure you want to permanently delete "${editableTask.title}"? This action cannot be undone.`)) {
        onDeleteTask(editableTask.id);
    }
  };

  const timeSince = (dateString: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4" onClick={handleWrapperClick}>
      <div 
        ref={modalRef}
        className="bg-base-100 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
      >
        <header className="p-4 border-b border-base-300 flex justify-between items-center flex-shrink-0">
          <input 
            type="text"
            value={editableTask.title}
            onChange={(e) => setEditableTask({...editableTask, title: e.target.value})}
            onBlur={() => onUpdateTask(editableTask)}
            placeholder="Task title"
            className="text-xl font-bold bg-transparent focus:outline-none focus:bg-base-200 rounded-md w-full p-1 -ml-1"
          />
          <button onClick={onClose} className="p-2 rounded-full hover:bg-base-200"><XIcon /></button>
        </header>

        <div className="flex-grow overflow-y-auto">
            <div className="p-6">
                 {/* Main Content Area */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        {/* Description */}
                        <div>
                            <label className="text-sm font-bold text-base-content-secondary">Description</label>
                            <div className="mt-1 border border-base-300 rounded-lg">
                                <div className="flex items-center justify-between p-2 bg-base-200 rounded-t-lg">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setDescTab('write')} className={`px-3 py-1 text-sm rounded-md ${descTab === 'write' ? 'bg-base-100 font-semibold' : 'hover:bg-base-300'}`}>Write</button>
                                        <button onClick={() => setDescTab('preview')} className={`px-3 py-1 text-sm rounded-md ${descTab === 'preview' ? 'bg-base-100 font-semibold' : 'hover:bg-base-300'}`}>Preview</button>
                                    </div>
                                    <button onClick={() => handleAIFeature('description')} disabled={isGeneratingDesc || !editableTask.title} className="flex items-center gap-1.5 px-2 py-1 text-xs bg-brand-secondary text-white rounded-md hover:opacity-90 disabled:opacity-50">
                                        <SparklesIcon /> {isGeneratingDesc ? 'Generating...' : 'Generate with AI'}
                                    </button>
                                </div>
                                {descTab === 'write' ? (
                                    <textarea 
                                        value={editableTask.description}
                                        onChange={(e) => setEditableTask({...editableTask, description: e.target.value})}
                                        onBlur={() => onUpdateTask(editableTask)}
                                        placeholder="Add a more detailed description... (Markdown supported)"
                                        className="w-full h-40 p-3 bg-base-100 text-base-content focus:outline-none resize-y rounded-b-lg"
                                    />
                                ) : (
                                    <div className="prose dark:prose-invert prose-sm max-w-none p-3 h-40 overflow-y-auto">
                                         <ReactMarkdown remarkPlugins={[remarkGfm]}>{editableTask.description || 'Nothing to preview.'}</ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Subtasks */}
                        <div>
                             <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-bold text-base-content-secondary">Subtasks</label>
                                <button onClick={() => handleAIFeature('subtasks')} disabled={isGeneratingSubtasks || !editableTask.title} className="flex items-center gap-1.5 px-2 py-1 text-xs bg-brand-secondary text-white rounded-md hover:opacity-90 disabled:opacity-50">
                                    <SparklesIcon /> {isGeneratingSubtasks ? 'Generating...' : 'Suggest Subtasks'}
                                </button>
                            </div>
                            <div className="space-y-2">
                                {editableTask.subtasks.map((subtask, index) => (
                                    <div key={subtask.id} className="flex items-center gap-2 group">
                                        <input type="checkbox" checked={subtask.completed} onChange={e => {
                                            const newSubtasks = [...editableTask.subtasks];
                                            newSubtasks[index].completed = e.target.checked;
                                            handleUpdate('subtasks', newSubtasks);
                                        }} className="rounded" />
                                        <input type="text" value={subtask.text} 
                                            onChange={e => {
                                                const newSubtasks = [...editableTask.subtasks];
                                                newSubtasks[index].text = e.target.value;
                                                handleUpdate('subtasks', newSubtasks);
                                            }}
                                            className={`w-full bg-transparent p-1 rounded-md focus:bg-base-200 focus:outline-none ${subtask.completed ? 'line-through text-base-content-secondary' : ''}`}
                                        />
                                        <button onClick={() => {
                                            const newSubtasks = editableTask.subtasks.filter(st => st.id !== subtask.id);
                                            handleUpdate('subtasks', newSubtasks);
                                        }} className="opacity-0 group-hover:opacity-100 text-base-content-secondary hover:text-error"><TrashIcon /></button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => {
                                const newSubtasks = [...editableTask.subtasks, {id: `sub-${Date.now()}`, text: '', completed: false}];
                                handleUpdate('subtasks', newSubtasks);
                            }} className="mt-2 text-sm text-brand-primary hover:underline">+ Add subtask</button>
                        </div>

                         {/* Activity Log */}
                        <div>
                             <h3 className="text-sm font-bold text-base-content-secondary mb-2">Activity</h3>
                             <ul className="space-y-3 text-xs">
                                {(editableTask.activity || []).map(entry => (
                                    <li key={entry.id} className="flex justify-between items-start gap-2">
                                        <span className="text-base-content">{entry.message}</span>
                                        <span className="text-base-content-secondary flex-shrink-0">{timeSince(entry.timestamp)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-4">
                        {/* Priority */}
                         <div>
                            <label className="text-sm font-bold text-base-content-secondary">Priority</label>
                            <div className="flex items-center gap-2 mt-1">
                                <select value={editableTask.priority} onChange={(e) => handleUpdate('priority', e.target.value as Priority)} className="w-full bg-base-200 border border-transparent rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary">
                                    {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                                <button onClick={() => handleAIFeature('priority')} disabled={isSuggestingPriority || !editableTask.title} title="Suggest Priority" className="p-2 bg-brand-secondary text-white rounded-md hover:opacity-90 disabled:opacity-50">
                                    <SparklesIcon />
                                </button>
                            </div>
                        </div>
                        {/* Due Date */}
                        <div>
                            <label className="text-sm font-bold text-base-content-secondary">Due Date</label>
                             <input type="date" value={editableTask.dueDate || ''} onChange={(e) => handleUpdate('dueDate', e.target.value)} className="mt-1 w-full bg-base-200 border border-transparent rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                        </div>
                        {/* Tags */}
                         <div>
                            <label className="text-sm font-bold text-base-content-secondary">Tags</label>
                             <div className="flex flex-wrap gap-1 mt-1">
                                {(editableTask.tags || []).map(tag => <Tag key={tag} tag={tag} onRemove={() => handleRemoveTag(tag)} />)}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <input type="text" value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddTag()} placeholder="Add a tag..." className="w-full bg-base-200 border border-transparent rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                                <button onClick={() => handleAIFeature('tags')} disabled={isSuggestingTags || !editableTask.title} title="Suggest Tags" className="p-2 bg-brand-secondary text-white rounded-md hover:opacity-90 disabled:opacity-50">
                                    <SparklesIcon />
                                </button>
                            </div>
                        </div>
                         {/* Cover Image */}
                        <div>
                             <label className="text-sm font-bold text-base-content-secondary">Cover Image URL</label>
                             <input type="text" value={editableTask.coverImage || ''} onChange={(e) => setEditableTask({...editableTask, coverImage: e.target.value})} onBlur={() => onUpdateTask(editableTask)} placeholder="Paste image URL..." className="mt-1 w-full bg-base-200 border border-transparent rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <footer className="p-4 border-t border-base-300 flex justify-between items-center flex-shrink-0">
          <span className="text-xs text-base-content-secondary">Task ID: {task.id}</span>
          <div className="flex items-center gap-2">
            <button onClick={() => onArchiveTask(task.id)} className="flex items-center gap-2 px-3 py-2 text-sm bg-base-200 hover:bg-base-300 rounded-md">
                <ArchiveIcon /> Archive
            </button>
            <button onClick={handleDelete} className="flex items-center gap-2 px-3 py-2 text-sm bg-error/10 text-error hover:bg-error/20 rounded-md">
              <TrashIcon /> Delete
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
