/**
 * Utilities for converting between internal message format and AI Elements UIMessage format
 */

/**
 * Convert internal message format to UIMessage format expected by AI Elements
 * @param {Object} internalMsg - Internal message with parts array
 * @returns {Object} UIMessage compatible object
 */
export function toUIMessage(internalMsg) {
  // Preserve all parts for AI Elements to handle, including tool calls and results
  return {
    id: internalMsg.id,
    role: internalMsg.role,
    parts: internalMsg.parts || [],
    // For backward compatibility, also provide content string
    content: internalMsg.parts
      ?.filter(part => part.type === 'text')
      ?.map(part => part.text)
      ?.join('') || '',
  };
}

/**
 * Convert UIMessage format back to internal format
 * @param {Object} uiMsg - UIMessage from AI Elements
 * @param {string} status - Status of the message ('ready', 'streaming', 'error')
 * @returns {Object} Internal message format
 */
export function fromUIMessage(uiMsg, status = 'ready') {
  return {
    id: uiMsg.id,
    role: uiMsg.role,
    parts: [{ type: 'text', text: uiMsg.content || '' }],
    status: status,
  };
}

/**
 * Convert array of internal messages to UIMessage array
 * @param {Array} internalMessages - Array of internal message objects
 * @returns {Array} Array of UIMessage objects
 */
export function toUIMessages(internalMessages) {
  return internalMessages.map(toUIMessage);
}

/**
 * Convert array of UIMessage objects to internal format
 * @param {Array} uiMessages - Array of UIMessage objects
 * @param {string} status - Status to apply to all messages
 * @returns {Array} Array of internal message objects
 */
export function fromUIMessages(uiMessages, status = 'ready') {
  return uiMessages.map(uiMsg => fromUIMessage(uiMsg, status));
}

/**
 * Create a tool call part
 * @param {string} toolName - Name of the tool being called
 * @param {Object} toolInput - Input parameters for the tool
 * @param {string} toolCallId - Unique identifier for this tool call
 * @returns {Object} Tool call part object
 */
export function createToolCallPart(toolName, toolInput, toolCallId) {
  return {
    type: 'tool-call',
    toolCallId,
    toolName,
    args: toolInput,
  };
}

/**
 * Create a tool result part
 * @param {string} toolCallId - Unique identifier for the tool call
 * @param {any} result - Result from the tool execution
 * @param {string} [error] - Optional error message if tool failed
 * @returns {Object} Tool result part object
 */
export function createToolResultPart(toolCallId, result, error) {
  return {
    type: 'tool-result',
    toolCallId,
    result: error ? null : result,
    error,
  };
}

/**
 * Check if a message contains tool calls
 * @param {Object} message - Message object to check
 * @returns {boolean} True if message contains tool calls
 */
export function hasToolCalls(message) {
  return message.parts?.some(part => part.type === 'tool-call') || false;
}

/**
 * Check if a message contains tool results
 * @param {Object} message - Message object to check
 * @returns {boolean} True if message contains tool results
 */
export function hasToolResults(message) {
  return message.parts?.some(part => part.type === 'tool-result') || false;
}

/**
 * Extract tool calls from a message
 * @param {Object} message - Message object
 * @returns {Array} Array of tool call parts
 */
export function getToolCalls(message) {
  return message.parts?.filter(part => part.type === 'tool-call') || [];
}

/**
 * Extract tool results from a message
 * @param {Object} message - Message object
 * @returns {Array} Array of tool result parts
 */
export function getToolResults(message) {
  return message.parts?.filter(part => part.type === 'tool-result') || [];
}