import type { Tool } from 'ai';

export type ToolInstance = Tool<any, any>;

export interface ToolDefinition {
  id: string;
  label: string;
  description: string;
  defaultEnabled: boolean;
  tool: ToolInstance;
}
