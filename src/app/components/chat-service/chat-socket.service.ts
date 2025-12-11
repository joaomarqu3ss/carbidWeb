import { Injectable, OnDestroy } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject, Observable } from 'rxjs';
import { Message } from './models/message.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatSocketService  {
    
  private client: Client | null = null;
  private connected = false;
  private messageSubject = new Subject<Message>();
  private subscriptions: StompSubscription[] = [];

  messages$: Observable<Message> = this.messageSubject.asObservable();

    connect(token: string) {
    if (this.connected) return;

    this.client = new Client({
      // use SockJS factory so SockJS fallback works
      webSocketFactory: () => new SockJS(`${environment.apiChat}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      // automatic reconnect
      reconnectDelay: 5000,
      onConnect: frame => {
        this.connected = true;
        console.log('[STOMP] conectado', frame);

        // subscribe to the user queue for private messages
        // /user/queue/messages is the path we used in backend examples
        const sub = this.client!.subscribe('/user/queue/messages', (msg: IMessage) => {
          if (msg.body) {
            try {
              const payload = JSON.parse(msg.body) as Message;
              this.messageSubject.next(payload);
            } catch (err) {
              console.warn('Invalid message body', err);
            }
          }
        });

        this.subscriptions.push(sub);
      },
      onStompError: frame => {
        console.error('[STOMP] Broker error', frame);
      },
      onWebSocketError: err => {
        console.error('[STOMP] WebSocket error', err);
      }
    });

    this.client.activate();
  }

  disconnect() {
    if (!this.client) return;
    this.subscriptions.forEach(s => s.unsubscribe());
    this.client.deactivate();
    this.client = null;
    this.connected = false;
  }

  send(destination: string, body: any) {
    if (!this.client || !this.connected) {
      console.warn('STOMP não está conectado — message não enviada via WS');
      return;
    }
    this.client.publish({
      destination,
      body: JSON.stringify(body)
    });
  }

  // helper to send chat message via the /app/chat.send mapping used on backend
  sendChatMessage(receiverId: string, content: string) {
    this.send('/app/chat.send', { receiverId, content });
  }

  ngOnDestroy() {
    this.disconnect();
    this.messageSubject.complete();
  }

}