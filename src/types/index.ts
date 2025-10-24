export interface Message {
  text: string;
  user: boolean;
  timestamp?: Date;
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