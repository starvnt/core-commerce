import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import Icon from '../components/Icon';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, StatTile, Field, Separator } from '../components/ui';
import { formatMoney, formatDate, formatTimeAgo } from '../services/format';

const STATUS_VARIANT = {
  PENDING: 'warning', CONFIRMED: 'aura', IN_PROGRESS: 'gold', COMPLETED: 'success', CANCELLED: 'danger',
};

export default function BookingDetail() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [activity, setActivity] = useState([]);
  const [payments, setPayments] = useState([]);
  const [payAmt, setPayAmt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [a, b, c] = await Promise.allSettled([
        api.get(`/bookings/${id}`),
        api.get(`/activity/booking/${id}`),
        api.get(`/payments/booking/${id}`),
      ]);
      if (a.status === 'fulfilled') setBooking(a.value.data.data);
      if (b.status === 'fulfilled') setActivity(b.value.data.data || []);
      if (c.status === 'fulfilled') setPayments(c.value.data.data || []);
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function setStatus(status) {
    setBusy(true);
    try { await api.patch(`/bookings/${id}/status`, { status }); load(); } catch (e) { alert(e.message); } finally { setBusy(false); }
  }
  async function makePayment() {
    if (!payAmt || payAmt <= 0) return;
    setBusy(true);
    try {
      await api.post('/payments', { bookingId: id, amountMinor: Math.round(Number(payAmt) * 100), currency: booking.currency || 'INR' });
      setPayAmt(0);
      load();
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        <div className="skeleton h-32 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="skeleton h-64 rounded-2xl" />
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <Card className="p-10 text-center">
        <Icon name="x" size={28} className="mx-auto text-rose-400" />
        <h2 className="font-display text-lg font-semibold text-platinum-50 mt-3">Booking not found</h2>
        <Link to="/bookings" className="inline-block mt-4"><Button>Back to bookings</Button></Link>
      </Card>
    );
  }

  const progress = booking.totalMinor ? Math.min(100, Math.round(((booking.paidMinor || 0) / booking.totalMinor) * 100)) : 0;
  const pendingAmt = Math.max(0, (booking.totalMinor || 0) - (booking.paidMinor || 0));

  return (
    <div className="flex flex-col gap-7 anim-fade-in">
      {/* Header */}
      <Card accent className="relative overflow-hidden p-7">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-gold-300/15 blur-3xl" />
        </div>
        <div className="relative flex flex-col gap-5">
          <div className="flex items-center gap-2 text-[12px] text-platinum-300/65">
            <Link to="/customers/me" className="hover:text-platinum-100 transition-colors">My workspace</Link>
            <span className="text-platinum-300/40">·</span>
            <span>Booking</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
            <div className="min-w-0">
              <Badge variant={STATUS_VARIANT[booking.status] || 'default'} size="md" dot={booking.status === 'IN_PROGRESS'}>
                {booking.status}
              </Badge>
              <h1 className="font-display text-[28px] sm:text-[34px] font-semibold tracking-[-0.025em] text-platinum-50 mt-3">
                {booking.title || 'Booking'}
              </h1>
              <p className="text-platinum-300/70 text-[13.5px] mt-1">
                {formatDate(booking.startDate)}{booking.endDate ? ` → ${formatDate(booking.endDate)}` : ''}
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {booking.status === 'PENDING' && (
                  <Button variant="gold" onClick={() => setStatus('CONFIRMED')} disabled={busy}>
                    <Icon name="check" size={14} /> Confirm
                  </Button>
                )}
                {booking.status === 'CONFIRMED' && (
                  <Button variant="gold" onClick={() => setStatus('IN_PROGRESS')} disabled={busy}>
                    <Icon name="bolt" size={14} /> Start
                  </Button>
                )}
                {booking.status === 'IN_PROGRESS' && (
                  <Button variant="success" onClick={() => setStatus('COMPLETED')} disabled={busy}>
                    <Icon name="check" size={14} /> Complete
                  </Button>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10.5px] uppercase tracking-[0.18em] text-platinum-300/60 font-medium">Total</div>
              <div className="font-display text-[40px] font-semibold text-gold-300 tracking-[-0.025em] tabular-nums">
                {formatMoney(booking.totalMinor, booking.currency)}
              </div>
              <div className="text-[12px] text-platinum-300/65 mt-1">
                <span className="text-emerald-300 font-medium">{formatMoney(booking.paidMinor, booking.currency)}</span> paid · {progress}%
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger">
        <div style={{ '--i': 0 }} className="anim-slide-up">
          <StatTile label="Total" value={formatMoney(booking.totalMinor, booking.currency)} icon={<Icon name="money" size={18} />} accent="gold" />
        </div>
        <div style={{ '--i': 1 }} className="anim-slide-up">
          <StatTile label="Paid" value={formatMoney(booking.paidMinor, booking.currency)} icon={<Icon name="check" size={18} />} accent="emerald" />
        </div>
        <div style={{ '--i': 2 }} className="anim-slide-up">
          <StatTile label="Pending" value={formatMoney(pendingAmt, booking.currency)} icon={<Icon name="clock" size={18} />} accent="rose" />
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader><CardTitle eyebrow="Finance">Payments</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-[12.5px] text-platinum-300/65">Payment progress</span>
                <span className="text-[12px] text-platinum-300/85 tabular-nums">{progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-gold-300 to-gold-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <Separator className="my-5" />
            <Field label="Record a payment">
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <input
                  type="number"
                  placeholder="Amount in INR"
                  value={payAmt || ''}
                  onChange={(e) => setPayAmt(e.target.value)}
                  className="h-11 px-3.5 rounded-xl bg-white/[0.03] text-platinum-50 border border-white/[0.07] placeholder:text-platinum-300/40 focus:outline-none focus:border-aura-500/60 focus:bg-white/[0.05] focus:shadow-[0_0_0_4px_rgba(42,120,245,0.12)]"
                />
                <Button onClick={makePayment} disabled={busy}>
                  <Icon name="plus" size={14} /> Add
                </Button>
              </div>
            </Field>
            <Separator className="my-5" />
            {payments.length === 0 ? (
              <p className="text-[13px] text-platinum-300/70 py-4 text-center">No payments recorded yet</p>
            ) : (
              <ul className="flex flex-col">
                {payments.map((p) => (
                  <li key={p.paymentId} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
                    <div>
                      <div className="text-[12.5px] text-platinum-100">{formatDate(p.createdAt)}</div>
                      <div className="text-[11px] text-platinum-300/55 mt-0.5">{p.method || '—'}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] font-medium text-platinum-50 tabular-nums">{formatMoney(p.amountMinor, p.currency)}</span>
                      <Badge variant={p.status === 'PAID' ? 'success' : p.status === 'FAILED' ? 'danger' : 'warning'} size="sm">{p.status}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
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
