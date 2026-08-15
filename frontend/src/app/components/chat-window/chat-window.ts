import { AfterViewChecked, Component, ElementRef, Input, ViewChild, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jwtDecode } from 'jwt-decode';

import { Message } from '../../models/message';
import { ChatService } from '../../services/chat';

interface JwtPayload {
  user_id: number;
}

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

  @ViewChild('messageContainer')
  private messageContainer!: ElementRef;

  messageText = '';
  currentUserId = 0;

  constructor() {
    const token = localStorage.getItem('access');

    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        this.currentUserId = decoded.user_id;
        console.log('Current logged-in user ID:', this.currentUserId);
      } catch {
        this.currentUserId = 0;
      }
    }
  }

  isOwnMessage(message: Message): boolean {
    return Number(message.sender.id) === Number(this.currentUserId);
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    if (this.messageContainer) {
      const element = this.messageContainer.nativeElement;

      element.scrollTop = element.scrollHeight;
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
