export type SupportCategory = 'order-status' | 'product' | 'payment' | 'general';

export interface SupportMessage {
  id: string;
  sender_type: 'customer' | 'admin';
  sender_name: string;
  sender_email: string | null;
  body: string;
  created_at: string;
  author: string;
  isCustomer: boolean;
}

export interface SupportTicket {
  id: string;
  ticket_number: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  category: SupportCategory | string;
  order_number: string | null;
  subject: string;
  status: string;
  created_at: string;
  message: string;
  messages: SupportMessage[];
}

export interface NewSupportTicket {
  category: SupportCategory;
  orderNumber?: string;
  subject: string;
  message: string;
}

export interface SupportTicketRow {
  id: string;
  ticket_number: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  category: string;
  order_number: string | null;
  subject: string;
  status: string;
  created_at: string;
  message: string;
}

export interface SupportTicketMessageRow {
  id: string;
  ticket_id: string;
  sender_type: string;
  sender_name: string;
  sender_email: string | null;
  message?: string | null;
  body?: string | null;
  created_at: string;
}

export const mapSupportTicket = (
  row: SupportTicketRow,
  messageRows: SupportTicketMessageRow[],
): SupportTicket => ({
  ...row,
  messages: messageRows.map((message) => ({
    id: message.id,
    sender_type: message.sender_type === 'customer' ? 'customer' : 'admin',
    sender_name: message.sender_name,
    sender_email: message.sender_email,
    body: message.message ?? message.body ?? '',
    created_at: message.created_at,
    author: message.sender_name,
    isCustomer: message.sender_type === 'customer',
  })),
});
