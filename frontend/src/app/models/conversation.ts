import { User } from './user';

export interface Participant {
  id: number;
  role: string;
  joined_at: string;

  user: User;
}

export interface Conversation {
  id: number;

  conversation_type: string;

  name: string;

  description: string;

  participant_count: number;

  participants: Participant[];

  created_at: string;

  updated_at: string;
}