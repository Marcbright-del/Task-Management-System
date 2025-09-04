import { Type } from "@google/genai";
import { Priority, Board } from '../types';

// A generic function to call our backend API proxy
async function callGeminiApi<T>(action: string, payload: any): Promise<T> {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, payload }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API call failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
     console.error(`Error calling Gemini API for action "${action}":`, error);
     throw error;
  }
}

interface SubtaskResponse {
    subtasks: string[];
}

export const generateSubtasks = (taskTitle: string): Promise<string[]> => {
    const payload = {
        model: "gemini-2.5-flash",
        contents: `Break down the following high-level task into a short list of simple, actionable subtasks. Task: "${taskTitle}"`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    subtasks: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING, description: "A single, actionable subtask." }
                    }
                },
                required: ["subtasks"],
            }
        }
    };
    return callGeminiApi<SubtaskResponse>('generateSubtasks', payload).then(res => res.subtasks);
};

interface PriorityResponse {
    priority: Priority;
}

export const suggestPriority = (taskTitle: string, taskDescription: string): Promise<Priority> => {
    const payload = {
        model: "gemini-2.5-flash",
        contents: `Based on the following task, suggest a priority level.
        Task Title: "${taskTitle}"
        Description: "${taskDescription || 'No description provided.'}"
        Choose one of the following priority levels: ${Object.values(Priority).join(', ')}.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    priority: {
                        type: Type.STRING,
                        description: "The suggested priority for the task.",
                        enum: Object.values(Priority),
                    }
                },
                required: ["priority"],
            }
        }
    };
    return callGeminiApi<PriorityResponse>('suggestPriority', payload).then(res => res.priority);
};

interface DescriptionResponse {
    description: string;
}

export const generateDescription = (taskTitle: string): Promise<string> => {
    const payload = {
        model: "gemini-2.5-flash",
        contents: `Generate a brief, one to two-sentence description for a task titled: "${taskTitle}"`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    description: { type: Type.STRING, description: "The generated task description." }
                },
                required: ["description"],
            }
        }
    };
    return callGeminiApi<DescriptionResponse>('generateDescription', payload).then(res => res.description);
};

interface TagsResponse {
    tags: string[];
}

export const suggestTags = (taskTitle: string, taskDescription: string): Promise<string[]> => {
    const payload = {
        model: "gemini-2.5-flash",
        contents: `Based on the following task, suggest 3-5 relevant, single-word tags for categorization.
        Task Title: "${taskTitle}"
        Description: "${taskDescription || 'No description provided.'}"`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    tags: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING, description: "A single relevant tag." }
                    }
                },
                required: ["tags"],
            }
        }
    };
    return callGeminiApi<TagsResponse>('suggestTags', payload).then(res => res.tags);
};

interface InsightResponse {
    text: string;
}

export const generateProjectInsight = async (board: Board): Promise<string> => {
    const allTasks = board.flatMap(c => c.tasks);
    const overdueTasks = allTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.columnId !== 'done');
    const summary = `
      Project Status Summary:
      - Total Tasks: ${allTasks.length}
      - Columns:
        ${board.map(c => `  - ${c.title}: ${c.tasks.length} tasks`).join('\n')}
      - Priorities:
        - Critical: ${allTasks.filter(t => t.priority === Priority.CRITICAL).length}
        - High: ${allTasks.filter(t => t.priority === Priority.HIGH).length}
      - Overdue Tasks: ${overdueTasks.length}
    `;

    const payload = {
        model: "gemini-2.5-flash",
        contents: `Based on this project status summary, provide one brief, actionable productivity insight or suggestion for the project manager. Be encouraging and concise.\n\n${summary}`,
    };
    
    return callGeminiApi<InsightResponse>('generateProjectInsight', payload).then(res => res.text);
};
