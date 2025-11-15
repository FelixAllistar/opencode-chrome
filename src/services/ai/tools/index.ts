

import { braveSearchToolDefinition, createBraveSearchTool } from './braveSearchTool';
import { context7ToolDefinition, createContext7Tool } from './context7Tool';
import { getDocumentationToolDefinition } from './getDocumentationTool';
import { webFetchToolDefinition } from './webFetchTool';
import type { ToolDefinition } from './types';

export const TOOL_DEFINITIONS: readonly ToolDefinition[] = [
  webFetchToolDefinition,

  context7ToolDefinition,

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

export function getTools(
  enabledToolIds?: readonly string[],
  runtimeContext?: {
    getBraveSearchApiKey?: () => string | undefined;
    getContext7ApiKey?: () => string | undefined;
  }
) {
  const normalizedIds =
    Array.isArray(enabledToolIds) && enabledToolIds.length > 0
      ? new Set(enabledToolIds)
      : new Set(DEFAULT_ENABLED_TOOL_IDS);

  return TOOL_DEFINITIONS.reduce<Record<string, ToolDefinition['tool']>>((map, definition) => {
    if (!normalizedIds.has(definition.id)) {
      return map;
    }

    if (definition.id === 'braveSearch' && runtimeContext?.getBraveSearchApiKey) {
      map[definition.id] = createBraveSearchTool({
        getToken: runtimeContext.getBraveSearchApiKey,
      });
      return map;
    }

    if (definition.id === 'context7Docs' && runtimeContext?.getContext7ApiKey) {
      map[definition.id] = createContext7Tool({
        getApiKey: runtimeContext.getContext7ApiKey,
      });
      return map;
    }

    map[definition.id] = definition.tool;
    return map;
  }, {});
}

export function getToolDefinition(toolId: string): ToolDefinition | null {
  return TOOL_DEFINITIONS.find((definition) => definition.id === toolId) ?? null;
}
