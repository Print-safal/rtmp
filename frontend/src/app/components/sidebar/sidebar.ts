import { Component, inject, OnInit, output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserService } from '../../services/user';
import { User } from '../../models/user';
import { ChatService } from '../../services/chat';
import { Conversation } from '../../models/conversation';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit {
  private chat = inject(ChatService);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  conversations: Conversation[] = [];
  users: User[] = [];

  currentUser: User | null = null;

  conversationSelected = output<Conversation>();

  showNewChat = false;
  selectedConversationId?: number;

  ngOnInit(): void {
    // Get currently logged-in user
    this.authService.me().subscribe({
      next: (user) => {
        console.log('Current user:', user);
        this.currentUser = user;
      },

      error: (error) => {
        console.error('Failed to get current user:', error);
      },
    });

    // Get conversations
    this.chat.getConversations().subscribe({
      next: (response) => {
        console.log('Conversations:', response);
        this.conversations = response;
      },

      error: console.error,
    });
  }

  selectConversation(conversation: Conversation): void {
    this.selectedConversationId = conversation.id;

    this.conversationSelected.emit(conversation);
  }

  openNewChat(): void {
    this.showNewChat = true;

    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
      },

      error: (error) => {
        console.error('Failed to load users:', error);
      },
    });
  }

  closeNewChat(): void {
    this.showNewChat = false;
  }

  createChat(user: User): void {
    this.chat
      .createConversation({
        conversation_type: 'PRIVATE',
        name: user.display_name || user.username,
        description: '',
        participant_ids: [user.id],
      })
      .subscribe({
        next: (conversation) => {
          console.log('Conversation created:', conversation);

          const alreadyExists = this.conversations.some(
            (existing) => existing.id === conversation.id,
          );

          if (!alreadyExists) {
            this.conversations.unshift(conversation);
          }

          this.selectedConversationId = conversation.id;

          this.showNewChat = false;

          this.conversationSelected.emit(conversation);
        },

        error: (error) => {
          console.error('Failed to create conversation:', error);
        },
      });
  }

  getConversationName(conversation: Conversation): string {
    // Group chats keep their existing name
    if (conversation.conversation_type !== 'PRIVATE') {
      return conversation.name;
    }

    // We don't know the current user yet
    if (!this.currentUser) {
      return conversation.name;
    }

    // Find the other person in the private conversation
    const otherParticipant = conversation.participants.find(
      (participant) => participant.user.id !== this.currentUser!.id,
    );

    return (
      otherParticipant?.user.display_name || otherParticipant?.user.username || conversation.name
    );
  }
}
