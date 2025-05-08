export interface ChatMessage {
  id: string;
  content: string;
  loanRequestId: string;
  senderUserId: string;
  senderUserName: string;
  receiverUserId: string;
  receiverUserName: string;
  createdAt: string;
}
