// Current message structure used throughout the app
export interface MessagePart {
  type: 'text' | 'tool-call' | 'tool-result' | 'reasoning' | string;
  text?: string;
  toolCallId?: string;
  toolName?: string;
  args?: any;
  result?: any;
  error?: string;
  input?: any;
  output?: any;
  errorText?: string;
  state?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
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