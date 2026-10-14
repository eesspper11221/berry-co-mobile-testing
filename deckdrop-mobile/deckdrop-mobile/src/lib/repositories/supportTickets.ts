import {supabase} from '../supabase/client';
import {
  mapSupportTicket,
  type NewSupportTicket,
  type SupportTicket,
  type SupportTicketMessageRow,
  type SupportTicketRow,
} from '../../data/supportTickets';

interface SupportTicketMessageInsert {
  ticket_id: string;
  sender_type: 'customer';
  sender_name: string;
  sender_email: string;
  message: string;
}

const insertSupportTicketMessage = async (message: SupportTicketMessageInsert): Promise<void> => {
  const {error} = await supabase.from('support_ticket_messages').insert(message);
  if (!error) return;

  const missingMessageColumn = (
    (error.code === 'PGRST204' || error.code === '42703')
    && error.message.includes('support_ticket_messages')
    && error.message.includes('message')
  );
  if (!missingMessageColumn) throw new Error(error.message);

  const {message: body, ...messageFields} = message;
  const {error: bodyError} = await supabase
    .from('support_ticket_messages')
    .insert({...messageFields, body});
  if (bodyError) throw new Error(bodyError.message);
};

export const fetchUserSupportTickets = async (userId: string): Promise<SupportTicket[]> => {
  const {data, error} = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', {ascending: false});
  if (error) throw new Error(error.message);

  const ticketRows = (data || []) as SupportTicketRow[];
  if (ticketRows.length === 0) return [];

  const {data: messageData, error: messageError} = await supabase
    .from('support_ticket_messages')
    .select('*')
    .in('ticket_id', ticketRows.map((ticket) => ticket.id))
    .order('created_at', {ascending: true});
  if (messageError) throw new Error(messageError.message);

  const messagesByTicket = new Map<string, SupportTicketMessageRow[]>();
  for (const message of (messageData || []) as SupportTicketMessageRow[]) {
    const messages = messagesByTicket.get(message.ticket_id) || [];
    messages.push(message);
    messagesByTicket.set(message.ticket_id, messages);
  }

  return ticketRows.map((ticket) => mapSupportTicket(ticket, messagesByTicket.get(ticket.id) || []));
};

export const createUserSupportTicket = async (
  userId: string,
  customerName: string,
  customerEmail: string,
  input: NewSupportTicket,
): Promise<SupportTicketRow> => {
  const openingMessage = input.message.trim();
  const ticketNumber = `TICK-${Math.floor(10000 + Math.random() * 90000)}`;
  const {data, error} = await supabase
    .from('support_tickets')
    .insert({
      ticket_number: ticketNumber,
      user_id: userId,
      customer_name: customerName.trim(),
      customer_email: customerEmail.trim(),
      category: input.category,
      order_number: input.orderNumber?.trim() || null,
      subject: input.subject.trim(),
      status: 'open',
      message: openingMessage,
    })
    .select('*')
    .single();
  if (error) throw new Error(error.message);

  const ticket = data as SupportTicketRow;
  try {
    await insertSupportTicketMessage({
      ticket_id: ticket.id,
      sender_type: 'customer',
      sender_name: customerName.trim(),
      sender_email: customerEmail.trim(),
      message: openingMessage,
    });
  } catch (error) {
    const messageError = error instanceof Error ? error.message : 'Unknown database error.';
    throw new Error(`Ticket ${ticket.ticket_number} was created, but its opening message could not be saved: ${messageError}`);
  }
  return ticket;
};

export const addUserSupportTicketReply = async (
  ticketId: string,
  customerName: string,
  customerEmail: string,
  message: string,
): Promise<void> => {
  await insertSupportTicketMessage({
    ticket_id: ticketId,
    sender_type: 'customer',
    sender_name: customerName.trim(),
    sender_email: customerEmail.trim(),
    message: message.trim(),
  });
};
