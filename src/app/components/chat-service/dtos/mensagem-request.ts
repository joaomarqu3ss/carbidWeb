export interface EnviarMensagemRequest {
  offerId: string
  senderId: string;
  recipientId: string;
  content: string;
}

export interface ChatMessage {
  senderId: string;
  recipientId: string;
  content: string;
  timestamp?: Date
}

export interface ChatHistoryResponse {
  id: string,
  chatId: string,
  senderId: string,
  recipientId: string,
  content: string,
  timestamp: Date
}

  // RESPONSE findChatMessagesBySenderAndRecipient
	// private UUID id;
	// private String chatId;
	// private String senderId;
	// private String recipientId;
	// private String content;
	
	// @CreationTimestamp
	// private LocalDateTime timestamp;