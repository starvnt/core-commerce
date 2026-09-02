import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Icon from '../components/Icon';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, StatTile, Separator } from '../components/ui';
import { formatMoney, formatDate, formatTimeAgo } from '../services/format';

const STATUS_VARIANT = {
  DRAFT: 'default', SENT: 'aura', VIEWED: 'gold', NEGOTIATING: 'gold', ACCEPTED: 'success', REJECTED: 'danger', EXPIRED: 'warning',
};

export default function QuoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [a, b] = await Promise.allSettled([
        api.get(`/quotes/${id}`),
        api.get(`/activity/quote/${id}`),
      ]);
      if (a.status === 'fulfilled') setQuote(a.value.data.data);
      if (b.status === 'fulfilled') setActivity(b.value.data.data || []);
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function accept() {
    if (!confirm('Accept this quote? This will create a booking.')) return;
    try {
      const { data } = await api.post(`/quotes/${id}/accept`, { idempotencyKey: `${id}-accept-${Date.now()}` });
      const bookingId = data.data?.booking?.bookingId || data.data?.bookingId;
      if (bookingId) navigate(`/bookings/${bookingId}`);
      else load();
    } catch (e) { alert(e.message); }
  }
  async function reject() {
    const reason = prompt('Reason for rejection?', 'Budget mismatch');
    if (!reason) return;
    try { await api.post(`/quotes/${id}/reject`, { reason }); load(); } catch (e) { alert(e.message); }
  }
  async function setStatus(status) {
    try { await api.patch(`/quotes/${id}/status`, { status }); load(); } catch (e) { alert(e.message); }
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

  if (!quote) {
    return (
      <Card className="p-10 text-center">
        <Icon name="x" size={28} className="mx-auto text-rose-400" />
        <h2 className="font-display text-lg font-semibold text-platinum-50 mt-3">Quote not found</h2>
        <Link to="/quotes" className="inline-block mt-4"><Button>Back to quotes</Button></Link>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-7 anim-fade-in">
      {/* Header */}
      <Card accent className="relative overflow-hidden p-7">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-gold-300/25 blur-3xl" />
          <div className="absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-aura-500/15 blur-3xl" />
        </div>
        <div className="relative flex flex-col gap-5">
          <div className="flex items-center gap-2 text-[12px] text-platinum-300/65">
            <Link to="/customers/me" className="hover:text-platinum-100 transition-colors">My workspace</Link>
            <span className="text-platinum-300/40">·</span>
            <span>Quote</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
            <div className="min-w-0">
              <Badge variant={STATUS_VARIANT[quote.status] || 'default'} size="md" dot={quote.status === 'SENT' || quote.status === 'VIEWED'}>
                {quote.status}
              </Badge>
              <h1 className="font-display text-[28px] sm:text-[34px] font-semibold tracking-[-0.025em] text-platinum-50 mt-3">
                {quote.subject || 'Quote'}
              </h1>
              <p className="text-platinum-300/70 text-[13.5px] mt-1">
                From <span className="font-mono text-aura-300">{quote.organizationId || 'vendor'}</span> · Valid until {formatDate(quote.validUntil)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-[10.5px] uppercase tracking-[0.18em] text-platinum-300/60 font-medium">Total</div>
              <div className="font-display text-[40px] font-semibold text-gold-300 tracking-[-0.025em] tabular-nums">
                {formatMoney(quote.totalMinor, quote.currency)}
              </div>
            </div>
          </div>
          {(quote.status === 'SENT' || quote.status === 'VIEWED' || quote.status === 'DRAFT') && (
            <div className="flex flex-wrap gap-2">
              {(quote.status === 'SENT' || quote.status === 'VIEWED') && (
                <>
                  <Button variant="gold" onClick={accept}><Icon name="check" size={14} /> Accept & Book</Button>
                  <Button variant="danger" onClick={reject}><Icon name="x" size={14} /> Reject</Button>
                </>
              )}
              {quote.status === 'DRAFT' && (
                <Button variant="gold" onClick={() => setStatus('SENT')}>
                  <Icon name="send" size={14} /> Send to customer
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle eyebrow="Items">Line items</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead className="text-platinum-300/55 text-[11px] uppercase tracking-[0.12em]">
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-4 py-3 font-medium">Item</th>
                    <th className="text-right px-4 py-3 font-medium w-20">Qty</th>
                    <th className="text-right px-4 py-3 font-medium w-32">Unit</th>
                    <th className="text-right px-4 py-3 font-medium w-32">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(quote.lineItems || []).map((li, i) => (
                    <tr key={i} className="border-b border-white/[0.04] last:border-0">
                      <td className="px-4 py-3.5 font-medium text-platinum-50">{li.title}</td>
                      <td className="px-4 py-3.5 text-right text-platinum-300/85 tabular-nums">{li.quantity}</td>
                      <td className="px-4 py-3.5 text-right text-platinum-300/85 tabular-nums">{formatMoney(li.unitPriceMinor, quote.currency)}</td>
                      <td className="px-4 py-3.5 text-right text-platinum-50 font-medium tabular-nums">{formatMoney(li.totalMinor, quote.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Separator className="my-5" />
            <dl className="flex flex-col gap-2.5 text-[13.5px] max-w-xs ml-auto">
              <div className="flex justify-between"><dt className="text-platinum-300/65">Subtotal</dt><dd className="text-platinum-50 tabular-nums">{formatMoney(quote.subtotalMinor, quote.currency)}</dd></div>
              <div className="flex justify-between"><dt className="text-platinum-300/65">Discount</dt><dd className="text-platinum-50 tabular-nums">− {formatMoney(quote.discountMinor, quote.currency)}</dd></div>
              <div className="flex justify-between"><dt className="text-platinum-300/65">Tax</dt><dd className="text-platinum-50 tabular-nums">{formatMoney(quote.taxMinor, quote.currency)}</dd></div>
              <div className="flex justify-between pt-2 border-t border-white/[0.08]"><dt className="font-medium text-platinum-100">Total</dt><dd className="font-display text-[20px] font-semibold text-gold-300 tabular-nums">{formatMoney(quote.totalMinor, quote.currency)}</dd></div>
            </dl>
          </CardContent>
        </Card>

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
                      <div className="text-[11px] text-platinum-300/55 mt-0.5">{formatTimeAgo(a.createdAt)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
