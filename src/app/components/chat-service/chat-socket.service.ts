import { Injectable } from '@angular/core';
import SockJS from 'sockjs-client';
import { Client, Message } from '@stomp/stompjs';
import { EnviarMensagemRequest, ChatMessage } from './dtos/mensagem-request';
import { BehaviorSubject, map, Observable, timestamp } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChatSocketService  {

  stompClient: Client | null = null;
  private connected = false
  private messagesSubject = new BehaviorSubject<any>(null);
  
  message$ = this.messagesSubject.asObservable();
  
  private connectionSubject = new BehaviorSubject<boolean>(false);

  public connectionStatus$ = this.connectionSubject.asObservable();

  connect() {
    const socket = new SockJS('http://localhost:8082/ws');

    this.stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: str => console.log(str)
    });

    this.stompClient.onConnect = (frame) => {
      console.log('Connected to WebSocket!');

      this.connectionSubject.next(true);

      this.stompClient?.subscribe('/user/queues/messages', (message : Message) => {
        this.messagesSubject.next(JSON.parse(message.body))
      });
    };

    this.stompClient.onStompError = (frame) => {
      console.error('Broker error: ' + frame.headers['message']);
      console.error('Details ' + frame.body);
    };

    this.stompClient?.activate()
  };

  sendMessage(payload : any) {

    if(this.stompClient && this.stompClient.connected) {

      const chatMessage = {
        offerId: payload.offerId,
        senderId: payload.senderId,
        recipientId: payload.recipientId,
        content: payload.content
      }

      console.log('Send message to ' + payload.recipientId);
      this.stompClient.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(chatMessage)
      });

    }
    else {
      console.error('WebSocket is not connected')
    }

  }

 
  
}