import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatSocketService } from './chat-socket.service';
import { environment } from '../../../environments/environment';
import { ChatRoom } from './models/chat-room.model';
import { Message } from './models/message.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

    constructor(
    private http: HttpClient,
    private socket: ChatSocketService
  ) {}

  listChatRoomsForUser(userId: string): Observable<ChatRoom[]> {
    return this.http.get<ChatRoom[]>(`${environment.apiChat}/chatrooms/user/${userId}`);
  }

  createChatRoom(req: { roomId: string, usuario1: string, usuario2: string }) {
    return this.http.post<ChatRoom>(`${environment.apiChat}/chatrooms`, req);
  }

  listMessages(chatRoomId: string) {
    return this.http.get<Message[]>(`${environment.apiChat}/messages/chat/${chatRoomId}`);
  }

  // send via REST (fallback)
  sendMessageRest(payload: { chatRoomId: string, senderId: string, content: string }) {
    return this.http.post<Message>(`${environment.apiChat}/messages`, payload);
  }

  // WebSocket send (preferred)
  sendMessageWs(receiverId: string, content: string) {
    this.socket.sendChatMessage(receiverId, content);
  }

  // expose incoming messages
  onMessage() {
    return this.socket.messages$;
  }

  // connect websocket with token
  connectSocket(token: string) {
    this.socket.connect(token);
  }

  disconnectSocket() {
    this.socket.disconnect();
  }
}