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

export interface DemoCustomer {
  id: string;
  name: string;
  email: string;
}

export interface NewSupportTicket {
  category: SupportCategory;
  orderNumber?: string;
  subject: string;
  message: string;
}

const createMessage = (
  id: string,
  senderType: SupportMessage['sender_type'],
  senderName: string,
  senderEmail: string | null,
  body: string,
  createdAt: string,
): SupportMessage => ({
  id,
  sender_type: senderType,
  sender_name: senderName,
  sender_email: senderEmail,
  body,
  created_at: createdAt,
  author: senderName,
  isCustomer: senderType === 'customer',
});

export const createDemoTickets = (customer: DemoCustomer): SupportTicket[] => [
  {
    id: 'demo-ticket-shipping',
    ticket_number: 'TICK-96567',
    user_id: customer.id,
    customer_name: customer.name,
    customer_email: customer.email,
    category: 'order-status',
    order_number: 'BC-1021203',
    subject: 'Order delivery update',
    status: 'pending',
    created_at: '2026-10-02T10:18:13.000Z',
    message: 'Could you please share an update on my shipment?',
    messages: [
      createMessage('demo-shipping-customer', 'customer', customer.name, customer.email, 'Could you please share an update on my shipment?', '2026-10-02T10:18:13.000Z'),
      createMessage('demo-shipping-support', 'admin', 'Berry Co. Support', null, 'Your order is being prepared for dispatch. We will send tracking details as soon as it ships.', '2026-10-02T11:05:00.000Z'),
    ],
  },
  {
    id: 'demo-ticket-product',
    ticket_number: 'TICK-29875',
    user_id: customer.id,
    customer_name: customer.name,
    customer_email: customer.email,
    category: 'product',
    order_number: null,
    subject: 'Question about card condition',
    status: 'open',
    created_at: '2026-10-04T08:15:00.000Z',
    message: 'Can you confirm whether this card has any surface scratches?',
    messages: [
      createMessage('demo-product-customer', 'customer', customer.name, customer.email, 'Can you confirm whether this card has any surface scratches?', '2026-10-04T08:15:00.000Z'),
    ],
  },
];

export const createDemoTicket = (
  customer: DemoCustomer,
  input: NewSupportTicket,
  createdAt = new Date().toISOString(),
): SupportTicket => {
  const id = `demo-ticket-${Date.now()}`;
  const ticketNumber = `TICK-${String(Date.now()).slice(-5)}`;
  const openingMessage = input.message.trim();
  const message = createMessage(`demo-message-${id}`, 'customer', customer.name, customer.email, openingMessage, createdAt);
  return {
    id,
    ticket_number: ticketNumber,
    user_id: customer.id,
    customer_name: customer.name,
    customer_email: customer.email,
    category: input.category,
    order_number: input.orderNumber?.trim() || null,
    subject: input.subject.trim(),
    status: 'open',
    created_at: createdAt,
    message: openingMessage,
    messages: [message],
  };
};

export const appendDemoReply = (
  ticket: SupportTicket,
  customer: DemoCustomer,
  body: string,
  createdAt = new Date().toISOString(),
): SupportTicket => ({
  ...ticket,
  status: 'pending',
  messages: [
    ...ticket.messages,
    createMessage(`demo-reply-${Date.now()}`, 'customer', customer.name, customer.email, body.trim(), createdAt),
  ],
});