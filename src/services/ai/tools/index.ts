

import { braveSearchToolDefinition } from './braveSearchTool';
import { getDocumentationToolDefinition } from './getDocumentationTool';
import { webFetchToolDefinition } from './webFetchTool';
import type { ToolDefinition } from './types';

export const TOOL_DEFINITIONS: readonly ToolDefinition[] = [
  webFetchToolDefinition,

  braveSearchToolDefinition,

  getDocumentationToolDefinition,
];

export const DEFAULT_ENABLED_TOOL_IDS: readonly string[] = TOOL_DEFINITIONS
  .filter((definition) => definition.defaultEnabled)
  .map((definition) => definition.id);

const createToolMap = (
  definitions: readonly ToolDefinition[]
): Record<string, ToolDefinition['tool']> =>
  definitions.reduce<Record<string, ToolDefinition['tool']>>((map, definition) => {
    map[definition.id] = definition.tool;
    return map;
  }, {});

const ALL_TOOLS_MAP = createToolMap(TOOL_DEFINITIONS);

export const tools = ALL_TOOLS_MAP;

export function getTools(enabledToolIds?: readonly string[]) {
  const normalizedIds =
    Array.isArray(enabledToolIds) && enabledToolIds.length > 0
      ? new Set(enabledToolIds)
      : new Set(DEFAULT_ENABLED_TOOL_IDS);

  return TOOL_DEFINITIONS.reduce<Record<string, ToolDefinition['tool']>>((map, definition) => {
    if (normalizedIds.has(definition.id)) {
      map[definition.id] = definition.tool;
    }
    return map;
  }, {});
}

export function getToolDefinition(toolId: string): ToolDefinition | null {
  return TOOL_DEFINITIONS.find((definition) => definition.id === toolId) ?? null;
}
