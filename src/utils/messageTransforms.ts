import type { Message, MessagePart, ToolMessagePart } from '@/types/index.ts';

const MAX_TOOL_PART_TEXT_LENGTH = 900;

const safeStringify = (value: unknown): string => {
  if (value === undefined || value === null) {
    return '';
  }

  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(value);
  }
};

const describeToolPartForModel = (part: ToolMessagePart | (MessagePart & { [key: string]: unknown })): string => {
  const toolName =
    (part as any).toolName ??
    (typeof part.type === 'string' ? part.type.replace?.('tool-', '') : undefined) ??
    'tool';

  const segments: string[] = [];

  if ((part as any).state === 'input-available' || (part as any).args || (part as any).input) {
    const args = (part as any).args ?? (part as any).input;
    const argsText = safeStringify(args);
    if (argsText) {
      segments.push(`${toolName} input: ${argsText}`);
    }
  }

  if ((part as any).state === 'output-available' || (part as any).result || (part as any).output) {
    const output = (part as any).output ?? (part as any).result;
    const outputText = typeof output === 'string' ? output : safeStringify(output);
    if (outputText) {
      segments.push(`${toolName} output: ${outputText}`);
    }
  }

  if (segments.length === 0) {
    return '';
  }

  const combined = segments.join(' | ');
  return combined.length > MAX_TOOL_PART_TEXT_LENGTH
    ? `${combined.slice(0, MAX_TOOL_PART_TEXT_LENGTH)}...`
    : combined;
};

export const isVisualMessagePart = (part: MessagePart | unknown): boolean => {
  if (!part || typeof part !== 'object') {
    return false;
  }

  const typed = part as MessagePart & { mediaType?: string };

  if (typed.type === 'image') {
    return true;
  }

  if (typed.type === 'file') {
    return Boolean(typed.mediaType?.startsWith?.('image/'));
  }

  return false;
};

export const sanitizeMessagePartsForModel = (
  parts: MessagePart[] | undefined,
  isVisionModel: boolean
): MessagePart[] => {
  const source = Array.isArray(parts) ? parts : [];
  const sanitized: MessagePart[] = [];

  for (const part of source) {
    if (!isVisionModel && isVisualMessagePart(part)) {
      continue;
    }

    if (part.type === 'text') {
      sanitized.push({ ...part });
      continue;
    }

    if (part.type === 'reasoning' && (part as any).text) {
      sanitized.push({ type: 'text', text: (part as any).text } as MessagePart);
      continue;
    }

    if (typeof part.type === 'string' && part.type.startsWith('tool-')) {
      const text = describeToolPartForModel(part as ToolMessagePart);
      if (text) {
        sanitized.push({ type: 'text', text } as MessagePart);
      }
      continue;
    }

    if (isVisionModel) {
      sanitized.push(part);
    }
  }

  return sanitized;
};

export const filterMessagesForAPI = (messages: Message[]): Message[] => {
  return messages.filter((message) => {
    if (message.status === 'error') {
      return false;
    }

    if (
      message.parts?.some(
        (part) =>
          typeof part.type === 'string' &&
          part.type.startsWith('tool-') &&
          (part as any).state === 'output-error'
      )
    ) {
      return false;
    }

    return true;
  });
};

