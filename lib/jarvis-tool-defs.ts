export interface ToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
}

export interface ToolDefinition {
  type: "function"
  function: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}

export const TOOLS: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "addGoal",
      description: "Add a new goal or task for today",
      parameters: {
        type: "object",
        properties: {
          text: { type: "string", description: "The goal text" },
          priority: { type: "string", enum: ["high", "medium", "low"], description: "Priority level" },
          dueDate: { type: "string", description: "Due date (YYYY-MM-DD)" },
          estimatedMinutes: { type: "number", description: "Estimated minutes to complete" },
        },
        required: ["text"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "toggleGoal",
      description: "Mark a goal as done or undo it",
      parameters: {
        type: "object",
        properties: {
          text: { type: "string", description: "The exact text of the goal to toggle" },
        },
        required: ["text"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "deleteGoal",
      description: "Delete a goal permanently",
      parameters: {
        type: "object",
        properties: {
          text: { type: "string", description: "The exact text of the goal to delete" },
        },
        required: ["text"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "logWater",
      description: "Log water intake in milliliters",
      parameters: {
        type: "object",
        properties: {
          ml: { type: "number", description: "Milliliters of water consumed" },
        },
        required: ["ml"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "logHabit",
      description: "Mark a habit as completed for today",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "The habit name" },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "journalEntry",
      description: "Create a journal entry with mood tracking",
      parameters: {
        type: "object",
        properties: {
          content: { type: "string", description: "The journal content" },
          mood: { type: "string", enum: ["great", "good", "okay", "bad", "awful"], description: "Current mood" },
        },
        required: ["content", "mood"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getGoals",
      description: "Get all current goals and their status",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "getContext",
      description: "Get a summary of the user's current LifeOS data (goals, health, habits, etc.)",
      parameters: { type: "object", properties: {} },
    },
  },
]
