import { AfterViewChecked, Component, ElementRef, Input, ViewChild, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jwtDecode } from 'jwt-decode';

import { Message } from '../../models/message';
import { Conversation } from '../../models/conversation';
import { ChatService } from '../../services/chat';

interface JwtPayload {
  user_id: number;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

@Component({
  selector: 'app-chat-window',
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './chat-window.html',
  styleUrl: './chat-window.scss',
})
export class ChatWindow implements AfterViewChecked {
  private chat = inject(ChatService);

  @Input() messages: Message[] = [];
  @Input() conversationId?: number;
  @Input() conversation?: Conversation;
  @Input() connectionStatus: ConnectionStatus = 'disconnected';

  @ViewChild('messageContainer')
  private messageContainer!: ElementRef;

  messageText = '';
  currentUserId = 0;
  private readonly nearBottomThreshold = 100;
  private isNearBottom = true;
  private renderedMessageCount = -1;
  private renderedConversationId?: number;

  constructor() {
    const token = localStorage.getItem('access');

    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        this.currentUserId = decoded.user_id;
      } catch {
        this.currentUserId = 0;
      }
    }
  }

  isOwnMessage(message: Message): boolean {
    return Number(message.sender.id) === Number(this.currentUserId);
  }

  get conversationTitle(): string {
    if (!this.conversation) {
      return 'Conversation';
    }

    if (this.conversation.conversation_type === 'PRIVATE') {
      const otherParticipant = this.conversation.participants.find(
        (participant) => Number(participant.user.id) !== Number(this.currentUserId),
      );

      return (
        otherParticipant?.user.display_name ||
        otherParticipant?.user.username ||
        this.conversation.name ||
        'Conversation'
      );
    }

    return this.conversation.name || 'Group conversation';
  }

  get conversationInitial(): string {
    return this.conversationTitle.trim().charAt(0).toUpperCase() || 'C';
  }

  ngAfterViewChecked(): void {
    const hasNewMessages = this.renderedMessageCount !== this.messages.length;
    const conversationChanged = this.renderedConversationId !== this.conversationId;

    if (conversationChanged || (hasNewMessages && this.isNearBottom)) {
      this.scrollToBottom();
    }

    this.renderedMessageCount = this.messages.length;
    this.renderedConversationId = this.conversationId;
  }

  onMessageScroll(): void {
    const element = this.messageContainer.nativeElement;
    this.isNearBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight <= this.nearBottomThreshold;
  }

  onComposerKeydown(event: Event): void {
    if ((event as KeyboardEvent).shiftKey) {
      return;
    }

    event.preventDefault();
    this.sendMessage();
  }

  get isMessageEmpty(): boolean {
    return !this.messageText.trim();
  }

  private scrollToBottom(): void {
    if (this.messageContainer) {
      const element = this.messageContainer.nativeElement;

      element.scrollTop = element.scrollHeight;
      this.isNearBottom = true;
    }
  }

  sendMessage(): void {
    const content = this.messageText.trim();

    if (!content || !this.conversationId) {
      return;
    }

    this.chat.sendWebSocketMessage(content);

    this.messageText = '';
  }
}
