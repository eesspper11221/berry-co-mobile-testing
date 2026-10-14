import assert from 'node:assert/strict';
import test from 'node:test';
import { mapSupportTicket } from './supportTickets';

const ticket = {
  id: 'ticket-1',
  ticket_number: 'TICK-12345',
  user_id: 'user-1',
  customer_name: 'Juan Dela Cruz',
  customer_email: 'juan@example.com',
  category: 'order-status',
  order_number: 'BC-12345',
  subject: 'Order update',
  status: 'open',
  created_at: '2026-10-13T12:00:00.000Z',
  message: 'Please share an update.',
};

test('maps a support ticket and customer/admin conversation from Supabase rows', () => {
  const mapped = mapSupportTicket(ticket, [
    {
      id: 'message-1',
      ticket_id: ticket.id,
      sender_type: 'customer',
      sender_name: ticket.customer_name,
      sender_email: ticket.customer_email,
      message: 'Please share an update.',
      created_at: ticket.created_at,
    },
    {
      id: 'message-2',
      ticket_id: ticket.id,
      sender_type: 'admin',
      sender_name: 'Berry Co. Support',
      sender_email: null,
      message: 'Your order is being prepared.',
      created_at: '2026-10-13T13:00:00.000Z',
    },
  ]);

  assert.equal(mapped.ticket_number, 'TICK-12345');
  assert.equal(mapped.user_id, 'user-1');
  assert.equal(mapped.messages.length, 2);
  assert.equal(mapped.messages[0].body, 'Please share an update.');
  assert.equal(mapped.messages[0].isCustomer, true);
  assert.equal(mapped.messages[1].author, 'Berry Co. Support');
  assert.equal(mapped.messages[1].isCustomer, false);
});

test('supports message rows that expose their content as body', () => {
  const mapped = mapSupportTicket(ticket, [{
    id: 'message-1',
    ticket_id: ticket.id,
    sender_type: 'customer',
    sender_name: ticket.customer_name,
    sender_email: ticket.customer_email,
    body: 'A reply from the customer.',
    created_at: ticket.created_at,
  }]);

  assert.equal(mapped.messages[0].body, 'A reply from the customer.');
});
