export interface CreateChatRoomRequest {
  user1Id: string;
  user2Id: string;
}

export interface SendMessageRequest {
  chatRoomId: string;
  senderId: string;
  content: string;
}
