import { useState, useCallback } from 'react';
import type { Board, Task, ActivityLogEntry, TaskActivityLogEntry, Column } from '../types';
import { Priority } from '../types';
import { useNotifications } from '../contexts/NotificationContext';

const INITIAL_BOARD_STATE: Board = [
  {
    id: 'todo',
    title: 'To Do',
    tasks: [
      { id: 'task-1', title: 'Launch new marketing campaign', description: 'Plan and execute a comprehensive marketing campaign for the new product launch.', priority: Priority.HIGH, columnId: 'todo', subtasks: [], tags: ['Marketing', 'Q3 Launch'], dueDate: '2024-10-28', activity: [{id: 'act-1', message: 'Task created', timestamp: new Date().toISOString()}] },
      { id: 'task-2', title: 'Design user onboarding flow', description: 'Create wireframes and mockups for the new user onboarding experience. \n\n**Focus on:**\n- Simplicity\n- Clarity\n- Quick time-to-value', priority: Priority.MEDIUM, columnId: 'todo', subtasks: [], tags: ['UX', 'Design'], dueDate: '2024-11-12', activity: [{id: 'act-2', message: 'Task created', timestamp: new Date().toISOString()}] },
    ],
  },
  {
    id: 'inprogress',
    title: 'In Progress',
    tasks: [
      { id: 'task-3', title: 'Develop API for user authentication', description: 'Implement OAuth2 and JWT-based authentication.', priority: Priority.CRITICAL, columnId: 'inprogress', subtasks: [{ id: 'sub-1', text: 'Define DB schema', completed: true }, { id: 'sub-2', text: 'Implement password hashing', completed: false }], tags: ['Backend', 'Security'], dueDate: '2024-09-30', coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80', activity: [{id: 'act-3', message: 'Task created', timestamp: new Date().toISOString()}] },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    tasks: [
      { id: 'task-4', title: 'Setup CI/CD pipeline', description: '', priority: Priority.LOW, columnId: 'done', subtasks: [], tags: ['DevOps'], activity: [{id: 'act-4', message: 'Task created', timestamp: new Date().toISOString()}] },
    ],
  },
];

const useTaskManager = () => {
    const [board, setBoard] = useState<Board>(INITIAL_BOARD_STATE);
    const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
    const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
    const { addNotification } = useNotifications();

    const logActivity = useCallback((message: string) => {
        setActivityLog(prevLog => [
            { id: `log-${Date.now()}`, message, timestamp: new Date().toISOString() },
            ...prevLog
        ].slice(0, 20)); // Keep last 20 entries
    }, []);

    const logTaskActivity = useCallback((taskId: string, message: string) => {
        setBoard(prevBoard => {
            return prevBoard.map(col => ({
                ...col,
                tasks: col.tasks.map(task => {
                    if (task.id === taskId) {
                        const newActivity: TaskActivityLogEntry = {
                            id: `task-act-${Date.now()}`,
                            message,
                            timestamp: new Date().toISOString()
                        };
                        return {
                            ...task,
                            activity: [newActivity, ...(task.activity || [])]
                        };
                    }
                    return task;
                })
            }));
        });
    }, []);

    const addTask = useCallback((columnId: string, title: string) => {
        const newTask: Task = {
            id: `task-${Date.now()}`,
            title,
            description: '',
            priority: Priority.MEDIUM,
            columnId,
            subtasks: [],
            tags: [],
            activity: [{ id: `task-act-${Date.now()}`, message: 'Task created', timestamp: new Date().toISOString() }]
        };

        setBoard(prevBoard => prevBoard.map(column => 
            column.id === columnId 
                ? { ...column, tasks: [newTask, ...column.tasks] }
                : column
        ));
        logActivity(`Added task "${title}"`);
        addNotification(`Task "${title}" created.`, 'success');
    }, [logActivity, addNotification]);
    
    const updateTask = useCallback((updatedTask: Task) => {
        let oldTask: Task | null = null;
        board.forEach(c => c.tasks.forEach(t => {
            if (t.id === updatedTask.id) oldTask = t;
        }));

        setBoard(prevBoard => prevBoard.map(column => ({
            ...column,
            tasks: column.tasks.map(task => 
                task.id === updatedTask.id ? updatedTask : task
            )
        })));

        if (oldTask && oldTask.priority !== updatedTask.priority) {
            logTaskActivity(updatedTask.id, `Priority changed from ${oldTask.priority} to ${updatedTask.priority}`);
        }
    }, [board, logTaskActivity]);

    const deleteTask = useCallback((taskId: string) => {
        let taskToDelete: Task | null = null;
        setBoard(prevBoard => {
            const newBoard = prevBoard.map(column => {
                const filteredTasks = column.tasks.filter(task => {
                    if (task.id === taskId) {
                        taskToDelete = task;
                        return false;
                    }
                    return true;
                });
                return { ...column, tasks: filteredTasks };
            });
            return newBoard;
        });

        if (taskToDelete) {
            logActivity(`Permanently deleted "${taskToDelete.title}"`);
            addNotification(`Task "${taskToDelete.title}" permanently deleted.`, 'error');
        }
    }, [logActivity, addNotification]);

    const moveTask = useCallback((taskId: string, sourceColumnId: string, destColumnId: string, destIndex: number) => {
        let taskToMove: Task | null = null;
        let sourceColumnTitle = '';
        let destColumnTitle = '';

        // Remove task from source
        const intermediateBoard = board.map(column => {
             if (column.id === sourceColumnId) {
                sourceColumnTitle = column.title;
                const taskIndex = column.tasks.findIndex(t => t.id === taskId);
                if (taskIndex > -1) {
                    taskToMove = column.tasks[taskIndex];
                    return { ...column, tasks: [...column.tasks.slice(0, taskIndex), ...column.tasks.slice(taskIndex + 1)] };
                }
            }
            return column;
        });

        if (!taskToMove) return;

        // Add task to destination
        const finalBoard = intermediateBoard.map(column => {
            if (column.id === destColumnId) {
                destColumnTitle = column.title;
                const newTasks = [...column.tasks];
                newTasks.splice(destIndex, 0, { ...taskToMove!, columnId: destColumnId });
                return { ...column, tasks: newTasks };
            }
            return column;
        });

        setBoard(finalBoard);
        if (sourceColumnId !== destColumnId) {
            const message = `Moved "${taskToMove.title}" from ${sourceColumnTitle} to ${destColumnTitle}`;
            logActivity(message);
            logTaskActivity(taskId, message);
        }
    }, [board, logActivity, logTaskActivity]);
    
    const addColumn = useCallback((title: string) => {
        const newColumn: Column = {
            id: `col-${Date.now()}`,
            title,
            tasks: []
        };
        setBoard(prev => [...prev, newColumn]);
        logActivity(`Added column "${title}"`);
        addNotification(`Column "${title}" added.`, 'info');
    }, [logActivity, addNotification]);

    const updateColumnTitle = useCallback((columnId: string, newTitle: string) => {
        let oldTitle = '';
        setBoard(prev => prev.map(col => {
            if (col.id === columnId) {
                oldTitle = col.title;
                return { ...col, title: newTitle };
            }
            return col;
        }));
        if (oldTitle) {
            logActivity(`Renamed column "${oldTitle}" to "${newTitle}"`);
        }
    }, [logActivity]);

    const deleteColumn = useCallback((columnId: string) => {
        let deletedColumn: Column | null = null;
        setBoard(prev => {
            const columnToDelete = prev.find(c => c.id === columnId);
            if (!columnToDelete || prev.length <= 1) {
                addNotification('Cannot delete the last column.', 'warning');
                return prev;
            };
            deletedColumn = columnToDelete;
            const remainingColumns = prev.filter(c => c.id !== columnId);
            // Move tasks from deleted column to the first remaining column
            remainingColumns[0].tasks.push(...columnToDelete.tasks.map(t => ({...t, columnId: remainingColumns[0].id})));
            return remainingColumns;
        });

        if (deletedColumn) {
            logActivity(`Deleted column "${deletedColumn.title}"`);
            addNotification(`Column "${deletedColumn.title}" deleted. Tasks moved.`, 'error');
        }
    }, [logActivity, addNotification]);

    const moveColumn = useCallback((dragIndex: number, hoverIndex: number) => {
        setBoard(prev => {
            const newBoard = [...prev];
            const [draggedColumn] = newBoard.splice(dragIndex, 1);
            newBoard.splice(hoverIndex, 0, draggedColumn);
            return newBoard;
        });
    }, []);

    const archiveTask = useCallback((taskId: string) => {
        let taskToArchive: Task | null = null;
        setBoard(prev => prev.map(col => {
            const taskIndex = col.tasks.findIndex(t => t.id === taskId);
            if (taskIndex > -1) {
                taskToArchive = col.tasks[taskIndex];
                return {
                    ...col,
                    tasks: col.tasks.filter(t => t.id !== taskId)
                };
            }
            return col;
        }));

        if (taskToArchive) {
            setArchivedTasks(prev => [taskToArchive!, ...prev]);
            logActivity(`Archived task "${taskToArchive.title}"`);
            addNotification(`Task "${taskToArchive.title}" archived.`, 'info');
        }
    }, [logActivity, addNotification]);

    const unarchiveTask = useCallback((taskId: string) => {
        let taskToRestore: Task | null = null;
        setArchivedTasks(prev => prev.filter(t => {
            if (t.id === taskId) {
                taskToRestore = t;
                return false;
            }
            return true;
        }));

        if (taskToRestore) {
            setBoard(prev => {
                const doneColumn = prev.find(c => c.id === 'done');
                if (doneColumn) {
                    return prev.map(c => c.id === 'done' ? {...c, tasks: [taskToRestore!, ...c.tasks]} : c);
                } else {
                    // Fallback to first column if 'Done' doesn't exist
                    prev[0].tasks.unshift(taskToRestore);
                    return [...prev];
                }
            });
            logActivity(`Restored task "${taskToRestore.title}"`);
            addNotification(`Task "${taskToRestore.title}" restored.`, 'success');
        }
    }, [logActivity, addNotification]);
    
    const deleteArchivedTask = useCallback((taskId: string) => {
        let deletedTask: Task | null = null;
        setArchivedTasks(prev => prev.filter(t => {
             if (t.id === taskId) {
                deletedTask = t;
                return false;
            }
            return true;
        }));
        if (deletedTask) {
            logActivity(`Permanently deleted archived task "${deletedTask.title}"`);
            addNotification(`Archived task "${deletedTask.title}" permanently deleted.`, 'error');
        }
    }, [logActivity, addNotification]);


    return { 
        board,
        setBoard,
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
        deleteArchivedTask
    };
};

export { useTaskManager };
