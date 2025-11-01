import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

// Chain of thought step data structure
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
  toolArgs?: any;
  toolResult?: any;
}

// Simplified message part types
export interface MessagePart {
  type: 'text' | 'chain-of-thought' | 'user';
  text?: string;
  steps?: ChainOfThoughtStep[];
}

// Simplified message structure
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  parts: MessagePart[];
  status?: 'ready' | 'streaming' | 'submitted' | 'error';
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
  status: 'ready' | 'submitted' | 'streaming' | 'error';
}

export interface Model {
  id: string;
  name: string;
  type: 'openai' | 'anthropic';
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  // Add more as needed
}