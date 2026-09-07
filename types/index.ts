export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatarColor: string;
  createdAt?: string;
}

export interface UserSettingsData {
  theme: 'light' | 'dark' | 'system';
  defaultModel: string;
  temperature: number;
  customInstructions: string | null;
}

export interface Conversation {
  id: string;
  title: string;
  pinned: number | boolean;
  archived: number | boolean;
  model: string;
  created_at: string;
  updated_at: string;
}

export type MessageStatus = 'complete' | 'streaming' | 'error' | 'stopped';

export interface MessageAttachment {
  name: string;
  mimeType: string;
  data: string; // base64 data url or base64 string
  size?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  status: MessageStatus;
  error_message?: string | null;
  edited?: number | boolean;
  attachment?: MessageAttachment | null;
  created_at: string;
}
