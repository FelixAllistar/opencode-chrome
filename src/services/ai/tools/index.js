import { analyzeCodeToolDefinition } from './analyzeCodeTool.js';
import { getDocumentationToolDefinition } from './getDocumentationTool.js';
import { webFetchToolDefinition } from './webFetchTool.js';

export const TOOL_DEFINITIONS = [
  webFetchToolDefinition,
  analyzeCodeToolDefinition,
  getDocumentationToolDefinition,
];

export const DEFAULT_ENABLED_TOOL_IDS = TOOL_DEFINITIONS
  .filter((definition) => definition.defaultEnabled)
  .map((definition) => definition.id);

const createToolMap = (definitions) =>
  definitions.reduce((map, definition) => {
    map[definition.id] = definition.tool;
    return map;
  }, {});

const ALL_TOOLS_MAP = createToolMap(TOOL_DEFINITIONS);

export const tools = ALL_TOOLS_MAP;

export function getTools(enabledToolIds = DEFAULT_ENABLED_TOOL_IDS) {
  const normalizedIds = Array.isArray(enabledToolIds) && enabledToolIds.length > 0
    ? new Set(enabledToolIds)
    : new Set(DEFAULT_ENABLED_TOOL_IDS);

  return TOOL_DEFINITIONS.reduce((map, definition) => {
    if (normalizedIds.has(definition.id)) {
      map[definition.id] = definition.tool;
    }
    return map;
  }, {});
}

export function getToolDefinition(toolId) {
  return TOOL_DEFINITIONS.find((definition) => definition.id === toolId) ?? null;
}
