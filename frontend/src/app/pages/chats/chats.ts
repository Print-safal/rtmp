import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth';
import { Navbar } from '../../components/navbar/navbar';
import { Sidebar } from '../../components/sidebar/sidebar';
import { ChatWindow } from '../../components/chat-window/chat-window';
import { Conversation } from '../../models/conversation';
import { ChatService } from '../../services/chat';
import { Message } from '../../models/message';
@Component({
  selector: 'app-chats',
  imports: [Navbar, Sidebar, ChatWindow],
  templateUrl: './chats.html',
  styleUrl: './chats.scss',
})
export class Chats implements OnInit,OnDestroy{
  private chat = inject(ChatService);

  selectedConversation?: Conversation;

  messages: Message[] = [];
  private auth = inject(AuthService);

  ngOnInit(): void {
    this.auth.me().subscribe({
      next: (user) => {
        console.log('Current user:', user);
      },

      error: (err) => {
        console.error(err);
      },
    });
  }
  loadConversation(conversation: Conversation) {
    this.chat.disconnectWebSocket();
    this.selectedConversation = conversation;

    this.chat.getMessages(conversation.id).subscribe({
      next: (response) => {
        this.messages = response.results;

        console.log('Messages:', this.messages);
      },

      error: console.error,
    });

    const socket = this.chat.connectWebSocket(conversation.id);

    socket.onopen = () => {
      console.log(`WebSocket connected to conversation ${conversation.id}`);
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      console.log('WebSocket message:', message);

      if (message.id) {
        this.messages.push(message);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onclose = (event) => {
      console.log('WebSocket closed:', event.code);
    };
  }
  ngOnDestroy(): void {
  this.chat.disconnectWebSocket();
}
}
