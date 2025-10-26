/**
 * Utilities for converting between internal message format and AI Elements UIMessage format
 */

/**
 * Convert internal message format to UIMessage format expected by AI Elements
 * @param {Object} internalMsg - Internal message with parts array
 * @returns {Object} UIMessage compatible object
 */
export function toUIMessage(internalMsg) {
  return {
    id: internalMsg.id,
    role: internalMsg.role,
    content: internalMsg.parts
      ?.filter(part => part.type === 'text')
      ?.map(part => part.text)
      ?.join('') || '',
    // Add any additional UIMessage fields as needed
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