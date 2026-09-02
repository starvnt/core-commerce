import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Icon from '../components/Icon';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Field, Separator } from '../components/ui';
import { formatMoney, formatDate, formatDateTime, formatTimeAgo } from '../services/format';
import { useAuth } from '../services/auth';

const STATUS_VARIANT = {
  OPEN: 'aura', RESPONDED: 'gold', CLOSED: 'default', ACCEPTED: 'success', REJECTED: 'danger',
};

export default function InquiryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [inquiry, setInquiry] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activity, setActivity] = useState([]);
  const [quote, setQuote] = useState(null);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [a, b, c] = await Promise.allSettled([
        api.get(`/inquiries/${id}`),
        api.get(`/messages/thread/${id}`),
        api.get(`/activity/inquiry/${id}`),
      ]);
      if (a.status === 'fulfilled') setInquiry(a.value.data.data);
      if (b.status === 'fulfilled') setMessages(b.value.data.data || []);
      if (c.status === 'fulfilled') setActivity(c.value.data.data || []);
      if (a.status === 'fulfilled') {
        try {
          const { data } = await api.get(`/quotes/inquiry/${id}`);
          setQuote(data.data);
        } catch {/* no quote yet */}
      }
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function sendReply() {
    if (!reply.trim()) return;
    setBusy(true);
    try {
      await api.post('/messages', { threadId: id, threadType: 'INQUIRY', senderType: user?.role === 'CUSTOMER' ? 'CUSTOMER' : 'STAFF', body: reply });
      setReply('');
      load();
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  }

  async function setStatus(status) {
    setBusy(true);
    try { await api.patch(`/inquiries/${id}/status`, { status }); load(); } catch (e) { alert(e.message); } finally { setBusy(false); }
  }

  async function createQuote() {
    const subject = inquiry?.subject || 'Quote';
    const totalStr = prompt('Total amount in INR (will be stored as minor units):', '100000');
    if (!totalStr) return;
    const totalMinor = Math.round(Number(totalStr) * 100);
    try {
      const { data } = await api.post('/quotes', {
        inquiryId: id,
        customerId: inquiry.customerId,
        organizationId: inquiry.organizationId,
        subject,
        totalMinor,
        currency: 'INR',
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        lineItems: [{ title: subject, quantity: 1, unitPriceMinor: totalMinor, totalMinor }],
      });
      navigate(`/quotes/${data.data.quoteId}`);
    } catch (e) { alert(e.message); }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        <div className="skeleton h-32 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="skeleton h-64 rounded-2xl" />
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <Card className="p-10 text-center">
        <Icon name="x" size={28} className="mx-auto text-rose-400" />
        <h2 className="font-display text-lg font-semibold text-platinum-50 mt-3">Inquiry not found</h2>
        <Link to="/inquiries" className="inline-block mt-4"><Button>Back to inquiries</Button></Link>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-7 anim-fade-in">
      {/* Header */}
      <Card accent className="relative overflow-hidden p-7">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-aura-500/25 blur-3xl" />
          <div className="absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-gold-300/15 blur-3xl" />
        </div>
        <div className="relative flex flex-col gap-5">
          <div className="flex items-center gap-2 text-[12px] text-platinum-300/65">
            <Link to="/customers/me" className="hover:text-platinum-100 transition-colors">My workspace</Link>
            <span className="text-platinum-300/40">·</span>
            <span>Inquiry</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="min-w-0">
              <Badge variant={STATUS_VARIANT[inquiry.status] || 'default'} size="md" dot={inquiry.status === 'OPEN'}>
                {inquiry.status}
              </Badge>
              <h1 className="font-display text-[28px] sm:text-[34px] font-semibold tracking-[-0.025em] text-platinum-50 mt-3">
                {inquiry.subject || 'Inquiry'}
              </h1>
              <p className="text-platinum-300/70 text-[13.5px] mt-1">
                Vendor <span className="font-mono text-aura-300">{inquiry.organizationId || '—'}</span> · Sent {formatTimeAgo(inquiry.createdAt)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {inquiry.status === 'OPEN' && (
                <Button variant="secondary" onClick={() => setStatus('RESPONDED')}>
                  <Icon name="check" size={14} /> Mark Responded
                </Button>
              )}
              {inquiry.status !== 'CLOSED' && (
                <Button variant="danger" onClick={() => setStatus('CLOSED')}>
                  <Icon name="x" size={14} /> Close
                </Button>
              )}
              {quote ? (
                <Link to={`/quotes/${quote.quoteId}`}>
                  <Button variant="gold"><Icon name="doc" size={14} /> View Quote</Button>
                </Link>
              ) : (
                <Button variant="gold" onClick={createQuote}>
                  <Icon name="doc" size={14} /> Create Quote
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader><CardTitle eyebrow="Message">Original message</CardTitle></CardHeader>
          <CardContent>
            <p className="text-[13.5px] text-platinum-100 whitespace-pre-wrap leading-relaxed">{inquiry.body}</p>
            <div className="text-[11.5px] text-platinum-300/55 mt-3">Sent {formatTimeAgo(inquiry.createdAt)}</div>
            <Separator className="my-5" />
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
              <DT k="Customer"><span className="font-mono text-[11.5px]">{inquiry.customerId}</span></DT>
              <DT k="Vendor"><span className="font-mono text-[11.5px]">{inquiry.organizationId || '—'}</span></DT>
              <DT k="Budget">{inquiry.budgetMinor ? formatMoney(inquiry.budgetMinor, inquiry.currency) : '—'}</DT>
              <DT k="Event date">{inquiry.eventDate ? formatDateTime(inquiry.eventDate) : '—'}</DT>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle eyebrow="Thread">Conversation</CardTitle></CardHeader>
          <CardContent>
            {messages.length === 0 ? (
              <div className="py-10 text-center">
                <div className="mx-auto h-12 w-12 rounded-xl bg-white/[0.04] border border-white/[0.06] grid place-items-center text-platinum-300/60">
                  <Icon name="chat" size={22} />
                </div>
                <p className="mt-3 text-[13px] text-platinum-300/70">No replies yet</p>
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {messages.map((m) => {
                  const isCustomer = m.senderType === 'CUSTOMER';
                  return (
                    <li key={m.messageId} className={`rounded-xl px-4 py-3 border ${isCustomer ? 'bg-aura-500/[0.08] border-aura-500/25' : 'bg-white/[0.03] border-white/[0.06]'}`}>
                      <div className="text-[10.5px] uppercase tracking-[0.14em] text-platinum-300/55 font-medium">
                        {m.senderType} · {formatTimeAgo(m.createdAt)}
                      </div>
                      <div className="text-[13.5px] text-platinum-100 mt-1.5 whitespace-pre-wrap leading-relaxed">{m.body}</div>
                    </li>
                  );
                })}
              </ul>
            )}
            <Separator className="my-5" />
            <Field label="Reply">
              <textarea
                rows={3}
                placeholder="Write a reply…"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] text-platinum-50 border border-white/[0.07] placeholder:text-platinum-300/40 focus:outline-none focus:border-aura-500/60 focus:bg-white/[0.05] focus:shadow-[0_0_0_4px_rgba(42,120,245,0.12)] resize-y"
              />
            </Field>
            <div className="mt-3 flex justify-end">
              <Button onClick={sendReply} disabled={busy}>
                <Icon name="send" size={14} /> Send Reply
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle eyebrow="Timeline">Activity</CardTitle></CardHeader>
        <CardContent>
          {activity.length === 0 ? (
            <p className="text-[13px] text-platinum-300/70 py-6 text-center">No activity recorded</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {activity.map((a) => (
                <li key={a.activityId} className="flex gap-3">
                  <div className="mt-1.5 h-2 w-2 rounded-full bg-aura-400 ring-4 ring-aura-500/15 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] text-platinum-100 leading-snug">{a.message}</div>
                    <div className="text-[11px] text-platinum-300/55 mt-0.5">{formatTimeAgo(a.createdAt)} · {a.source}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DT({ k, children }) {
  return (
    <div>
      <dt className="text-[10.5px] uppercase tracking-[0.14em] text-platinum-300/55 font-medium">{k}</dt>
      <dd className="mt-1 text-platinum-50">{children}</dd>
    </div>
  );
}
