import type { ChatMode } from './index';

// Basic project and session shapes for the OpenCode-backed Dev mode.
export interface OpenCodeProject {
  id: string;
  worktree: string;
}

export interface OpenCodeSessionRef {
  id: string;
  projectId: string;
  directory: string;
  title: string;
  createdAt?: number;
  updatedAt?: number;
  messageCount?: number;
  lastMessage?: string;
}

export interface SendMessagePayload {
  text: string;
  files?: { url: string; mediaType?: string; filename?: string }[];
}

// Shared discriminant for the two chat pipelines.
export type Mode = ChatMode;
