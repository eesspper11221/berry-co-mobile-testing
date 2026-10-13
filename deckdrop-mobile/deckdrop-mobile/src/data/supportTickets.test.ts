import assert from 'node:assert/strict';
import test from 'node:test';
import { appendDemoReply, createDemoTicket, createDemoTickets } from './supportTickets';

const customer = { id: 'user-1', name: 'Juan Dela Cruz', email: 'juan@example.com' };

test('sample data includes customer and support conversation messages for the current user', () => {
  const tickets = createDemoTickets(customer);
  assert.equal(tickets.length, 2);
  assert.ok(tickets.every((ticket) => ticket.user_id === customer.id));
  assert.ok(tickets[0].messages.some((message) => !message.isCustomer));
});

test('local submission creates a demo ticket with trimmed fields and opening message', () => {
  const ticket = createDemoTicket(customer, {
    category: 'general',
    orderNumber: '  BC-12345  ',
    subject: '  Question  ',
    message: '  Can you help?  ',
  }, '2026-10-13T12:00:00.000Z');

  assert.equal(ticket.user_id, customer.id);
  assert.equal(ticket.order_number, 'BC-12345');
  assert.equal(ticket.subject, 'Question');
  assert.equal(ticket.message, 'Can you help?');
  assert.equal(ticket.messages[0].body, 'Can you help?');
  assert.equal(ticket.messages[0].isCustomer, true);
});

test('local customer reply appends a message without changing ticket ownership', () => {
  const [ticket] = createDemoTickets(customer);
  const updated = appendDemoReply(ticket, customer, '  Thanks for the update.  ', '2026-10-13T12:00:00.000Z');

  assert.equal(updated.user_id, customer.id);
  assert.equal(updated.status, 'pending');
  assert.equal(updated.messages.at(-1)?.body, 'Thanks for the update.');
  assert.equal(updated.messages.at(-1)?.isCustomer, true);
});