import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

// Core chat/model types shared across the app.

export type ChatId = string;

export type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error';

export type MessageRole = 'user' | 'assistant';

export type ProviderType =
  | 'openai'
  | 'anthropic'
  | 'openai-compatible'
  | 'google'
  | 'openrouter';

export interface ProviderApiKeys {
  openCode?: string;
  google?: string;
  openRouter?: string;
  anthropic?: string;
  openai?: string;
}

export interface ModelConfig {
  id: string;
  name: string;
  type: ProviderType;
  isVision: boolean;
  supportsTools: boolean;
}

// Chain-of-thought step data structure used for UI rendering.
export interface ChainOfThoughtStep {
  label: string;
  description?: string;
  status: 'complete' | 'active' | 'pending';
  icon?: string | LucideIcon;
  searchResults?: string[];
  image?: {
    src: string;
    alt: string;
    caption?: string;
  };
  content?: ReactNode;
  toolName?: string;
  toolArgs?: unknown;
  toolResult?: unknown;
}

// Message parts – richer union that matches the shapes used by the AI SDK.

export interface TextMessagePart {
  type: 'text';
  text: string;
}

export interface FileMessagePart {
  type: 'file';
  url: string;
  mediaType?: string;
  filename?: string;
}

export interface ImageMessagePart {
  type: 'image';
  // Raw image payload; in practice we treat this as an opaque value.
  image: Uint8Array | string;
  alt?: string;
}

export interface ReasoningMessagePart {
  type: 'reasoning';
  text: string;
}

export type ToolMessagePartType = `tool-${string}`;

export interface ToolMessagePart {
  type: ToolMessagePartType;
  state?: 'input-available' | 'output-available' | 'output-error' | string;
  input?: unknown;
  output?: unknown;
  toolCallId?: string;
  errorText?: string;
}

export interface ChainOfThoughtMessagePart {
  type: 'chain-of-thought';
  steps: ChainOfThoughtStep[];
}

export interface UnknownMessagePart {
  // Fallback for any part shapes we do not explicitly model yet.
  type: string;
  [key: string]: unknown;
}

export type MessagePart =
  | TextMessagePart
  | FileMessagePart
  | ImageMessagePart
  | ReasoningMessagePart
  | ToolMessagePart
  | ChainOfThoughtMessagePart
  | UnknownMessagePart;

// Chat message structure used across the app.
export interface Message {
  id: string;
  role: MessageRole;
  parts: MessagePart[];
  status?: ChatStatus;
}

export interface ChatMetadata {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
  lastMessage: string;
}

export interface ChatData {
  metadata: ChatMetadata;
  messages: Message[];
  status: ChatStatus;
}

export interface Model {
  id: string;
  name: string;
  type: ProviderType;
  isVision: boolean;
  supportsTools: boolean;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  // Add more as needed
}

export type ChatErrorKind =
  | 'missing-key'
  | 'connectivity'
  | 'stream'
  | 'api'
  | 'tool'
  | 'unknown';

export interface ChatError {
  kind: ChatErrorKind;
  message: string;
  /**
   * Duplicate field for UI compatibility with existing error objects.
   */
  error?: string;
  /**
   * Optional human-readable or structured details payload.
   */
  details?: unknown;
  /**
   * Original Error instance, when available.
   */
  underlying?: Error;
}
