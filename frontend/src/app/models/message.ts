import { User } from './user';

export interface Message {

  id: number;

  conversation: number;

  sender: User;

  content: string;

  message_type: string;

  created_at: string;

  updated_at: string;

  is_edited: boolean;

}

export interface PaginatedMessages {

  count: number;

  next: string | null;

  previous: string | null;

  results: Message[];

}