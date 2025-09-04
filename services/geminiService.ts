import { GoogleGenAI, Type } from "@google/genai";
import { Priority, Board, Task } from '../types';

// Ensure the API key is available in the environment variables
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.error("Gemini API key is not set. Please set the process.env.API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

interface SubtaskResponse {
    subtasks: string[];
}

export const generateSubtasks = async (taskTitle: string): Promise<string[]> => {
    if (!API_KEY) {
      // Prevent API call if key is missing
      return Promise.reject(new Error("API Key not configured."));
    }
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Break down the following high-level task into a short list of simple, actionable subtasks. Task: "${taskTitle}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        subtasks: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING,
                                description: "A single, actionable subtask."
                            }
                        }
                    },
                    required: ["subtasks"],
                }
            }
        });

        const jsonText = response.text.trim();
        const parsedResponse: SubtaskResponse = JSON.parse(jsonText);
        
        return parsedResponse.subtasks || [];
    } catch (error) {
        console.error("Error generating subtasks with Gemini:", error);
        // You might want to throw a more specific error to be caught by the UI
        throw new Error("Failed to generate AI subtasks. Please try again.");
    }
};

interface PriorityResponse {
    priority: Priority;
}

export const suggestPriority = async (taskTitle: string, taskDescription: string): Promise<Priority> => {
    if (!API_KEY) {
        return Promise.reject(new Error("API Key not configured."));
    }
    if (!taskTitle.trim()) {
        return Promise.reject(new Error("Task title cannot be empty."));
    }

    try {
        const prompt = `Based on the following task, suggest a priority level.
        Task Title: "${taskTitle}"
        Description: "${taskDescription || 'No description provided.'}"
        
        Choose one of the following priority levels: ${Object.values(Priority).join(', ')}.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
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
        });

        const jsonText = response.text.trim();
        const parsedResponse: PriorityResponse = JSON.parse(jsonText);

        if (parsedResponse.priority && Object.values(Priority).includes(parsedResponse.priority)) {
            return parsedResponse.priority;
        } else {
            throw new Error("Received an invalid priority from AI.");
        }

    } catch (error) {
        console.error("Error suggesting priority with Gemini:", error);
        throw new Error("Failed to get AI priority suggestion. Please try again.");
    }
};

interface DescriptionResponse {
    description: string;
}

export const generateDescription = async (taskTitle: string): Promise<string> => {
    if (!API_KEY) {
        return Promise.reject(new Error("API Key not configured."));
    }
    if (!taskTitle.trim()) {
        return Promise.reject(new Error("Task title cannot be empty."));
    }

    try {
        const prompt = `Generate a brief, one to two-sentence description for a task titled: "${taskTitle}"`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        description: {
                            type: Type.STRING,
                            description: "The generated task description."
                        }
                    },
                    required: ["description"],
                }
            }
        });
        
        const jsonText = response.text.trim();
        const parsedResponse: DescriptionResponse = JSON.parse(jsonText);
        return parsedResponse.description || '';

    } catch (error) {
        console.error("Error generating description with Gemini:", error);
        throw new Error("Failed to generate AI description. Please try again.");
    }
};

export const generateProjectInsight = async (board: Board): Promise<string> => {
     if (!API_KEY) {
        return Promise.reject(new Error("API Key not configured."));
    }
    
    // Create a concise summary of the board state
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

    try {
        const prompt = `Based on this project status summary, provide one brief, actionable productivity insight or suggestion for the project manager. Be encouraging and concise.
        
        ${summary}`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text.trim();

    } catch (error) {
        console.error("Error generating insight with Gemini:", error);
        throw new Error("Failed to generate AI insight. Please try again.");
    }
};

interface TagsResponse {
    tags: string[];
}

export const suggestTags = async (taskTitle: string, taskDescription: string): Promise<string[]> => {
    if (!API_KEY) {
        return Promise.reject(new Error("API Key not configured."));
    }
     if (!taskTitle.trim()) {
        return Promise.reject(new Error("Task title cannot be empty."));
    }

    try {
        const prompt = `Based on the following task, suggest 3-5 relevant, single-word tags for categorization.
        Task Title: "${taskTitle}"
        Description: "${taskDescription || 'No description provided.'}"`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        tags: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING,
                                description: "A single relevant tag."
                            }
                        }
                    },
                    required: ["tags"],
                }
            }
        });

        const jsonText = response.text.trim();
        const parsedResponse: TagsResponse = JSON.parse(jsonText);
        return parsedResponse.tags || [];

    } catch (error) {
        console.error("Error suggesting tags with Gemini:", error);
        throw new Error("Failed to get AI tag suggestions. Please try again.");
    }
};
