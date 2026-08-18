import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Subject,Observable } from 'rxjs';
import { Message, PaginatedMessages } from '../models/message';
import { environment } from '../../environments/environment';

import { Conversation } from '../models/conversation';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private http = inject(HttpClient);
  private socket?: WebSocket;
  private incomingMessages = new Subject<Message>();

messages$ = this.incomingMessages.asObservable();
  markConversationRead(conversationId: number) {
    return this.http.post(`${environment.apiUrl}/conversations/${conversationId}/mark-read/`, {});
  }

  connectWebSocket(conversationId: number): WebSocket {
    const token = localStorage.getItem('access');

    if (!token) {
      throw new Error('No access token found');
    }

    const url = `${environment.wsUrl}/chat/${conversationId}/?token=${token}`;

    this.socket = new WebSocket(url);

    return this.socket;
  }

  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${environment.apiUrl}/conversations/`);
  }
  getMessages(conversationId: number) {
    return this.http.get<PaginatedMessages>(
      `${environment.apiUrl}/messages/?conversation=${conversationId}`,
    );
  }
  sendMessage(conversationId: number, content: string) {
    return this.http.post<Message>(`${environment.apiUrl}/messages/`, {
      conversation: conversationId,
      content: content,
    });
  }
  sendWebSocketMessage(content: string): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }

    this.socket.send(
      JSON.stringify({
        message: content,
      }),
    );
  }
  disconnectWebSocket(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = undefined;
    }
  }
  createConversation(data: {
    conversation_type: string;
    name: string;
    description: string;
    participant_ids: number[];
  }) {
    return this.http.post<Conversation>(`${environment.apiUrl}/conversations/`, data);
  }
  emitMessage(message: Message): void {
  this.incomingMessages.next(message);
}
}
