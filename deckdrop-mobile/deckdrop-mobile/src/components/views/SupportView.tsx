import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, LifeBuoy, LoaderCircle, MessageSquareText, RotateCcw, Send } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import {
  type SupportCategory,
  type SupportTicket,
} from '../../data/supportTickets';
import {
  addUserSupportTicketReply,
  createUserSupportTicket,
  fetchUserSupportTickets,
} from '../../lib/repositories/supportTickets';

type SupportMode = 'submit' | 'track';
const categories: { value: SupportCategory; label: string }[] = [
  { value: 'order-status', label: 'Order status / Shipping' },
  { value: 'product', label: 'Product / Card condition' },
  { value: 'payment', label: 'Payment / Checkout' },
  { value: 'general', label: 'General question' },
];

const inputClass = 'mt-1.5 w-full rounded-xl border border-[#35322E]/15 bg-[#FAF5EB] px-3.5 py-3 text-sm font-medium text-[#35322E] placeholder-[#35322E]/40 outline-none focus:border-[#E23B2E] focus:ring-2 focus:ring-[#E23B2E]/10';

const statusClass = (status: string) => {
  if (status === 'resolved') return 'bg-emerald-100 text-emerald-800';
  if (status === 'pending') return 'bg-amber-100 text-amber-800';
  return 'bg-[#E23B2E]/10 text-[#B82A20]';
};

export const SupportView: React.FC = () => {
  const { currentUser, navigateTo } = useStore();
  const [mode, setMode] = useState<SupportMode>('submit');
  const [name, setName] = useState(currentUser?.full_name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [category, setCategory] = useState<SupportCategory | ''>('');
  const [orderNumber, setOrderNumber] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [ticketLoadError, setTicketLoadError] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [reply, setReply] = useState('');
  const [replyError, setReplyError] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const ticketRequestId = useRef(0);

  useEffect(() => {
    setName(currentUser?.full_name || '');
    setEmail(currentUser?.email || '');
  }, [currentUser?.id, currentUser?.full_name, currentUser?.email]);

  const refreshTickets = useCallback(async () => {
    const requestId = ++ticketRequestId.current;
    const userId = currentUser?.id;
    if (!userId) {
      setTickets([]);
      setSelectedTicketId('');
      setIsLoadingTickets(false);
      return;
    }

    setIsLoadingTickets(true);
    setTicketLoadError('');
    try {
      const loadedTickets = await fetchUserSupportTickets(userId);
      if (requestId !== ticketRequestId.current) return;
      setTickets(loadedTickets);
      setSelectedTicketId((selectedId) => (
        loadedTickets.some((ticket) => ticket.id === selectedId)
          ? selectedId
          : loadedTickets[0]?.id || ''
      ));
    } catch (error) {
      if (requestId !== ticketRequestId.current) return;
      setTicketLoadError(error instanceof Error ? error.message : 'Unable to load your support tickets.');
    } finally {
      if (requestId === ticketRequestId.current) setIsLoadingTickets(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    setTickets([]);
    setSelectedTicketId('');
    void refreshTickets();
    return () => {
      ticketRequestId.current += 1;
    };
  }, [refreshTickets]);

  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId) || null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');
    if (!currentUser) {
      setSubmitError('Please sign in to submit a support ticket.');
      return;
    }
    if (!name.trim() || !email.trim() || !category || !subject.trim() || !message.trim()) {
      setSubmitError('Complete all required fields before submitting.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setSubmitError('Enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const ticket = await createUserSupportTicket(currentUser.id, name, email, {
        category,
        orderNumber,
        subject,
        message,
      });
      setSubmitSuccess(`Ticket ${ticket.ticket_number} was sent to Berry Co. Support.`);
      setSubject('');
      setMessage('');
      setOrderNumber('');
      setSelectedTicketId(ticket.id);
      await refreshTickets();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to submit your support ticket.');
      await refreshTickets();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTicket || !reply.trim()) return;
    setReplyError('');
    setIsSendingReply(true);
    try {
      await addUserSupportTicketReply(
        selectedTicket.id,
        currentUser!.full_name,
        currentUser!.email,
        reply,
      );
      setReply('');
      await refreshTickets();
    } catch (error) {
      setReplyError(error instanceof Error ? error.message : 'Unable to send your reply.');
    } finally {
      setIsSendingReply(false);
    }
  };

  if (!currentUser) {
    return (
      <main className="px-4 py-12 text-center">
        <LifeBuoy size={36} className="mx-auto text-[#E23B2E]" />
        <h1 className="mt-4 text-xl font-black text-[#35322E]">Sign in to contact support</h1>
        <p className="mx-auto mt-2 max-w-xs text-sm text-[#35322E]/65">Support tickets and conversations are private to your Berry Co. account.</p>
        <button type="button" onClick={() => navigateTo('login')} className="mt-5 rounded-full bg-[#E23B2E] px-6 py-3 text-sm font-black text-white">Sign in</button>
      </main>
    );
  }

  return (
    <main className="space-y-4 px-4 pb-8 pt-3">
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E23B2E]">Account</p>
        <h1 className="text-xl font-black text-[#35322E]">Customer Support</h1>
        <p className="text-xs font-medium text-[#35322E]/60">Send a request or continue a ticket conversation.</p>
      </div>

      <div className="grid grid-cols-2 rounded-xl bg-[#F3E4C8] p-1" role="tablist" aria-label="Support options">
        <button type="button" role="tab" aria-selected={mode === 'submit'} onClick={() => setMode('submit')} className={`rounded-lg px-2 py-2.5 text-xs font-extrabold transition ${mode === 'submit' ? 'bg-[#FAF5EB] text-[#E23B2E] shadow-xs' : 'text-[#35322E]/65'}`}>
          <MessageSquareText size={14} className="mr-1.5 inline" />Submit ticket
        </button>
        <button type="button" role="tab" aria-selected={mode === 'track'} onClick={() => setMode('track')} className={`rounded-lg px-2 py-2.5 text-xs font-extrabold transition ${mode === 'track' ? 'bg-[#FAF5EB] text-[#E23B2E] shadow-xs' : 'text-[#35322E]/65'}`}>
          Track tickets
        </button>
      </div>

      {mode === 'submit' ? (
        <section className="rounded-2xl border border-[#35322E]/10 bg-[#FAF5EB] p-4 shadow-xs sm:p-5">
          {submitSuccess ? (
            <div className="py-5 text-center" role="status">
              <CheckCircle2 size={36} className="mx-auto text-emerald-600" />
              <h2 className="mt-3 text-lg font-black text-[#35322E]">Ticket submitted</h2>
              <p className="mt-2 text-sm text-[#35322E]/70">{submitSuccess}</p>
              <button type="button" onClick={() => { setSubmitSuccess(''); setMode('track'); }} className="mt-5 rounded-full bg-[#E23B2E] px-5 py-2.5 text-xs font-black text-white">Track tickets</button>
              <button type="button" onClick={() => setSubmitSuccess('')} className="ml-2 mt-5 rounded-full bg-[#F3E4C8] px-5 py-2.5 text-xs font-black text-[#35322E]">New ticket</button>
            </div>
          ) : (
            <form className="space-y-3.5" onSubmit={handleSubmit} noValidate>
              <div>
                <h2 className="text-base font-black text-[#35322E]">Submit a support ticket</h2>
                <p className="mt-1 text-xs text-[#35322E]/60">Required fields are marked with an asterisk.</p>
              </div>
              {submitError && <InlineNotice message={submitError} />}
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-bold text-[#35322E]">Full name *<input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className={inputClass} placeholder="Your name" /></label>
                <label className="block text-xs font-bold text-[#35322E]">Email address *<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} placeholder="you@example.com" /></label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-bold text-[#35322E]">Inquiry category *<select required value={category} onChange={(event) => setCategory(event.target.value as SupportCategory | '')} className={inputClass}><option value="" disabled>Select a category</option>{categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
                <label className="block text-xs font-bold text-[#35322E]">Order number <span className="font-medium text-[#35322E]/50">(optional)</span><input value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} className={inputClass} placeholder="e.g. BC-98421" /></label>
              </div>
              <label className="block text-xs font-bold text-[#35322E]">Subject *<input required value={subject} onChange={(event) => setSubject(event.target.value)} className={inputClass} placeholder="How can we help?" /></label>
              <label className="block text-xs font-bold text-[#35322E]">Message *<textarea required rows={5} value={message} onChange={(event) => setMessage(event.target.value)} className={`${inputClass} resize-y`} placeholder="Describe your question or issue..." /></label>
              <button type="submit" disabled={isSubmitting} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#E23B2E] px-5 py-2.5 text-sm font-black text-white transition hover:bg-[#B82A20] disabled:cursor-wait disabled:opacity-60">
                {isSubmitting ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={16} />}
                {isSubmitting ? 'Sending...' : 'Send ticket'}
              </button>
            </form>
          )}
        </section>
      ) : (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div><h2 className="text-base font-black text-[#35322E]">Your submitted tickets</h2><p className="text-xs text-[#35322E]/60">Ticket updates for {currentUser.email}</p></div>
            <button type="button" onClick={() => void refreshTickets()} disabled={isLoadingTickets} className="inline-flex items-center gap-1.5 rounded-full bg-[#F3E4C8] px-3.5 py-2 text-xs font-extrabold text-[#35322E] disabled:opacity-50"><RotateCcw size={13} className={isLoadingTickets ? 'animate-spin' : ''} />Refresh</button>
          </div>
          {ticketLoadError && <InlineNotice message={ticketLoadError} />}
          {isLoadingTickets ? (
            <div className="rounded-2xl border border-[#35322E]/10 bg-[#FAF5EB] px-4 py-10 text-center text-sm text-[#35322E]/60">
              <LoaderCircle size={22} className="mx-auto animate-spin text-[#E23B2E]" />
              <p className="mt-3">Loading your support tickets...</p>
            </div>
          ) : ticketLoadError ? (
            <div className="rounded-2xl border border-[#35322E]/10 bg-[#FAF5EB] px-4 py-10 text-center text-sm text-[#35322E]/60">
              <p>Your tickets could not be loaded. Refresh to try again.</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="rounded-2xl border border-[#35322E]/10 bg-[#FAF5EB] px-4 py-10 text-center">
              <LifeBuoy size={30} className="mx-auto text-[#35322E]/40" />
              <p className="mt-3 text-sm font-black text-[#35322E]">No support tickets yet</p>
              <p className="mt-1 text-xs text-[#35322E]/60">Submitted tickets and replies will appear here.</p>
              <button type="button" onClick={() => setMode('submit')} className="mt-4 rounded-full bg-[#E23B2E] px-5 py-2.5 text-xs font-black text-white">Submit a ticket</button>
            </div>
          ) : (
            <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
              <div className="max-h-[34rem] space-y-2 overflow-y-auto pr-1">
                {tickets.map((ticket) => (
                  <button key={ticket.id} type="button" onClick={() => setSelectedTicketId(ticket.id)} aria-pressed={ticket.id === selectedTicketId} className={`w-full min-w-0 rounded-xl border p-3 text-left transition ${ticket.id === selectedTicketId ? 'border-[#E23B2E] bg-[#FAF5EB]' : 'border-[#35322E]/10 bg-[#FAF5EB] hover:border-[#E23B2E]/50'}`}>
                    <div className="flex items-start justify-between gap-2"><span className="text-[10px] font-bold text-[#35322E]/55">{ticket.ticket_number}</span><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black capitalize ${statusClass(ticket.status)}`}>{ticket.status}</span></div>
                    <p className="mt-2 break-words text-xs font-black text-[#35322E]">{ticket.subject}</p>
                    <p className="mt-1 text-[10px] text-[#35322E]/55">{categories.find((item) => item.value === ticket.category)?.label || ticket.category}</p>
                    {ticket.order_number && <p className="mt-1 text-[10px] font-bold text-[#35322E]/65">Order #{ticket.order_number}</p>}
                  </button>
                ))}
              </div>
              {selectedTicket && (
                <article className="min-w-0 overflow-hidden rounded-xl border border-[#35322E]/10 bg-[#FAF5EB]">
                  <div className="border-b border-[#35322E]/10 p-3.5">
                    <div className="flex flex-wrap items-center gap-2"><span className="text-[10px] font-bold text-[#35322E]/55">{selectedTicket.ticket_number}</span><span className={`rounded-full px-2 py-1 text-[10px] font-black capitalize ${statusClass(selectedTicket.status)}`}>{selectedTicket.status}</span></div>
                    <h3 className="mt-2 break-words text-sm font-black text-[#35322E]">{selectedTicket.subject}</h3>
                    <p className="mt-1 text-[10px] text-[#35322E]/55">{categories.find((item) => item.value === selectedTicket.category)?.label || selectedTicket.category}</p>
                  </div>
                  <div className="max-h-[22rem] space-y-3 overflow-y-auto p-3.5" aria-label="Ticket conversation">
                    {selectedTicket.messages.length > 0 ? selectedTicket.messages.map((item) => (
                      <div key={item.id} className={`max-w-[92%] ${item.isCustomer ? 'ml-auto' : ''}`}>
                        <div className={`mb-1 flex flex-wrap gap-x-1.5 text-[9px] text-[#35322E]/55 ${item.isCustomer ? 'justify-end' : ''}`}><span className="font-bold text-[#35322E]/75">{item.author}</span><span aria-hidden="true">·</span><time dateTime={item.created_at}>{new Date(item.created_at).toLocaleString()}</time></div>
                        <p className={`break-words rounded-2xl px-3 py-2.5 text-xs leading-relaxed ${item.isCustomer ? 'rounded-tr-sm bg-[#E23B2E] text-white' : 'rounded-tl-sm bg-[#F3E4C8] text-[#35322E]'}`}>{item.body}</p>
                      </div>
                    )) : <p className="text-xs text-[#35322E]/60">No messages yet. The support team will reply here.</p>}
                  </div>
                  <form onSubmit={handleReply} className="space-y-2 border-t border-[#35322E]/10 p-3">
                    {replyError && <InlineNotice message={replyError} />}
                    <label className="sr-only" htmlFor="support-reply">Reply to support</label>
                    <textarea id="support-reply" rows={3} value={reply} onChange={(event) => setReply(event.target.value)} className="w-full resize-y rounded-xl border border-[#35322E]/15 bg-white px-3 py-2.5 text-xs text-[#35322E] outline-none focus:border-[#E23B2E]" placeholder="Write a reply..." />
                    <button type="submit" disabled={!reply.trim() || isSendingReply} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#E23B2E] px-4 py-2 text-xs font-black text-white disabled:opacity-50">{isSendingReply ? <LoaderCircle size={14} className="animate-spin" /> : <Send size={14} />}{isSendingReply ? 'Sending...' : 'Send reply'}</button>
                  </form>
                </article>
              )}
            </div>
          )}
        </section>
      )}
    </main>
  );
};

const InlineNotice: React.FC<{ message: string }> = ({ message }) => (
  <p role="alert" className="rounded-xl border border-[#E23B2E]/20 bg-[#E23B2E]/5 px-3 py-2.5 text-xs font-semibold text-[#B82A20]">{message}</p>
);