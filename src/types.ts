export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskActivityLogEntry {
  id: string;
  message: string;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  columnId: string;
  subtasks: Subtask[];
  tags?: string[];
  dueDate?: string;
  coverImage?: string;
  activity?: TaskActivityLogEntry[];
}

export interface Column {
  id:string;
  title: string;
  tasks: Task[];
}

export type Board = Column[];

export interface ActivityLogEntry {
  id: string;
  message: string;
  timestamp: string;
}
