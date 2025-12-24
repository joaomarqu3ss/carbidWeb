import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";
import { ChatHistoryResponse } from "./dtos/mensagem-request";

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    
    http = inject(HttpClient)

    buscarHistorico(senderId: string, recipientId: string): Observable<ChatHistoryResponse[]> {
        return this.http.get<ChatHistoryResponse[]>(`${environment.apiChat}/messages/${senderId}/${recipientId}`);
    }
}