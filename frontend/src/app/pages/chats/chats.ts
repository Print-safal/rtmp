import { Component, inject, OnDestroy } from '@angular/core';

import { Navbar } from '../../components/navbar/navbar';
import { Sidebar } from '../../components/sidebar/sidebar';
import { ChatWindow } from '../../components/chat-window/chat-window';
import { ConnectionStatus } from '../../components/chat-window/chat-window';

import { Conversation } from '../../models/conversation';
import { ChatService } from '../../services/chat';
import { Message } from '../../models/message';

@Component({
  selector: 'app-chats',
  imports: [Navbar, Sidebar, ChatWindow],
  templateUrl: './chats.html',
  styleUrl: './chats.scss',
})
export class Chats implements OnDestroy {

  private chat = inject(ChatService);

  selectedConversation?: Conversation;

  messages: Message[] = [];
  connectionStatus: ConnectionStatus = 'disconnected';
  private activeSocket?: WebSocket;


  loadConversation(conversation: Conversation): void {

    this.chat.disconnectWebSocket();

    this.connectionStatus = 'connecting';

    this.selectedConversation = conversation;


    // Mark conversation as read
    this.chat.markConversationRead(conversation.id).subscribe({

      error: (error) => {
        console.error(
          'Failed to mark conversation as read:',
          error
        );
      },

    });


    // Load existing messages
    this.chat.getMessages(conversation.id).subscribe({

      next: (response) => {
        this.messages = response.results;
      },

      error: (error) => {
        console.error(
          'Failed to load messages:',
          error
        );
      },

    });


    // Connect to WebSocket
    const socket = this.chat.connectWebSocket(
      conversation.id
    );
    this.activeSocket = socket;


    socket.onopen = () => {

      if (this.activeSocket === socket) {
        this.connectionStatus = 'connected';
      }

      console.log(
        `WebSocket connected to conversation ${conversation.id}`
      );

    };


    socket.onmessage = (event) => {

      const message = JSON.parse(event.data);

      if (message.id) {

        this.messages.push(message);

        this.chat.emitMessage(message);

      }

    };


    socket.onerror = (error) => {

      if (this.activeSocket === socket) {
        this.connectionStatus = 'disconnected';
      }

      console.error(
        'WebSocket error:',
        error
      );

    };


    socket.onclose = (event) => {

      if (this.activeSocket === socket) {
        this.connectionStatus = 'disconnected';
        this.activeSocket = undefined;
      }

      console.log(
        'WebSocket closed:',
        event.code
      );

    };

  }


  ngOnDestroy(): void {

    this.chat.disconnectWebSocket();
    this.activeSocket = undefined;
    this.connectionStatus = 'disconnected';

  }

}
