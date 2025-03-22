export interface LoanRequestEvent {
  id: string;
  loanRequestId: string;
  eventType: string;
  previousStatus: string | null;
  newStatus: string | null;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  comment: string;
}
