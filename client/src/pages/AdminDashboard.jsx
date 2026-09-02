import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Icon from '../components/Icon';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, StatTile } from '../components/ui';
import { formatMoney, formatTimeAgo } from '../services/format';

const STATUS_VARIANT = {
  OPEN: 'aura', RESPONDED: 'gold', CLOSED: 'default', ACCEPTED: 'success', REJECTED: 'danger',
  PENDING: 'warning', CONFIRMED: 'aura', IN_PROGRESS: 'gold', COMPLETED: 'success', CANCELLED: 'danger',
};

const accentMap = { aura: 'aura', gold: 'gold', emerald: 'emerald', rose: 'rose' };

export default function AdminDashboard() {
  const [stats, setStats] = useState({ customers: 0, inquiries: 0, quotes: 0, bookings: 0, revenue: 0 });
  const [outboxStats, setOutboxStats] = useState({});
  const [recent, setRecent] = useState({ inquiries: [], bookings: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [c, i, q, b, o, ri, rb] = await Promise.allSettled([
          api.get('/customers', { params: { limit: 1 } }),
          api.get('/inquiries', { params: { limit: 1 } }),
          api.get('/quotes', { params: { limit: 1 } }),
          api.get('/bookings', { params: { limit: 100 } }),
          api.get('/outbox/stats'),
          api.get('/inquiries', { params: { limit: 5 } }),
          api.get('/bookings', { params: { limit: 5 } }),
        ]);
        if (!mounted) return;
        const customers = c.status === 'fulfilled' ? (c.value.data?.data?.length || 0) : 0;
        const inquiries = i.status === 'fulfilled' ? (i.value.data?.data?.length || 0) : 0;
        const quotes = q.status === 'fulfilled' ? (q.value.data?.data?.length || 0) : 0;
        const bookings = (b.status === 'fulfilled' ? b.value.data?.data : []) || [];
        const revenue = bookings.reduce((s, bk) => s + (bk.paidMinor || 0), 0);
        setStats({ customers, inquiries, quotes, bookings: bookings.length, revenue });
        if (o.status === 'fulfilled') setOutboxStats(o.value.data?.data || {});
        if (ri.status === 'fulfilled') setRecent((r) => ({ ...r, inquiries: ri.value.data?.data || [] }));
        if (rb.status === 'fulfilled') setRecent((r) => ({ ...r, bookings: rb.value.data?.data || [] }));
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);

  const outboxEntries = [
    { label: 'PENDING',    value: outboxStats.PENDING ?? 0,    icon: 'clock',  accent: 'gold' },
    { label: 'PROCESSING', value: outboxStats.PROCESSING ?? 0, icon: 'bolt',   accent: 'aura' },
    { label: 'PROCESSED',  value: outboxStats.PROCESSED ?? 0,  icon: 'check',  accent: 'emerald' },
    { label: 'FAILED',     value: outboxStats.FAILED ?? 0,     icon: 'flag',   accent: 'rose' },
  ];

  return (
    <div className="flex flex-col gap-7 anim-fade-in">
      {/* Hero */}
      <Card accent className="relative overflow-hidden p-7 sm:p-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 -right-16 h-72 w-72 rounded-full bg-aura-500/25 blur-3xl" />
          <div className="absolute -bottom-20 -left-12 h-64 w-64 rounded-full bg-gold-300/15 blur-3xl" />
        </div>
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="max-w-2xl">
            <Badge variant="gold" size="md" dot className="mb-3">Live cockpit</Badge>
            <h1 className="font-display text-[32px] sm:text-[40px] font-semibold tracking-[-0.025em] text-platinum-50 leading-[1.05]">
              Operations overview
            </h1>
            <p className="text-platinum-300/80 text-[14px] mt-2 max-w-xl">
              Real-time pulse of your commerce engine — events, customers, and revenue at a glance.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/outbox"><Button variant="secondary"><Icon name="zap" size={14} /> Outbox</Button></Link>
            <Link to="/admin/automation"><Button variant="gold"><Icon name="bolt" size={14} /> Automation</Button></Link>
          </div>
        </div>
      </Card>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        {[
          { label: 'Customers',     value: stats.customers, icon: 'users',     accent: 'aura' },
          { label: 'Inquiries',     value: stats.inquiries, icon: 'inbox',     accent: 'gold' },
          { label: 'Bookings',      value: stats.bookings,  icon: 'briefcase', accent: 'emerald' },
          { label: 'Revenue (paid)', value: stats.revenue ? formatMoney(stats.revenue) : '₹0', icon: 'money', accent: 'rose' },
        ].map((s, i) => (
          <div key={s.label} style={{ '--i': i }} className="anim-slide-up">
            <StatTile
              label={s.label}
              value={loading ? '—' : s.value}
              icon={<Icon name={s.icon} size={18} />}
              accent={accentMap[s.accent]}
            />
          </div>
        ))}
      </div>

      {/* Outbox stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        {outboxEntries.map((s, i) => (
          <div key={s.label} style={{ '--i': i }} className="anim-slide-up">
            <StatTile
              label={`Outbox · ${s.label}`}
              value={loading ? '—' : s.value}
              icon={<Icon name={s.icon} size={18} />}
              accent={accentMap[s.accent]}
            />
          </div>
        ))}
      </div>

      {/* Recent tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle eyebrow="Pipeline">Recent inquiries</CardTitle>
            <Link to="/admin/inquiries" className="text-[12px] text-aura-300 hover:text-aura-200 transition-colors">View all →</Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
              </div>
            ) : recent.inquiries.length === 0 ? (
              <p className="text-[13px] text-platinum-300/70 py-6 text-center">No inquiries yet</p>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {recent.inquiries.map((it) => (
                  <li key={it.inquiryId}>
                    <Link to={`/admin/inquiries/${it.inquiryId}`} className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-aura-500/40 hover:bg-white/[0.05] transition-all">
                      <div className="min-w-0">
                        <div className="text-[13.5px] font-medium text-platinum-50 truncate">{it.subject}</div>
                        <div className="text-[11.5px] text-platinum-300/55 mt-0.5">{formatTimeAgo(it.createdAt)}</div>
                      </div>
                      <Badge variant={STATUS_VARIANT[it.status] || 'default'} size="sm">{it.status}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle eyebrow="Confirmed">Recent bookings</CardTitle>
            <Link to="/admin/bookings" className="text-[12px] text-aura-300 hover:text-aura-200 transition-colors">View all →</Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
              </div>
            ) : recent.bookings.length === 0 ? (
              <p className="text-[13px] text-platinum-300/70 py-6 text-center">No bookings yet</p>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {recent.bookings.map((b) => (
                  <li key={b.bookingId} className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                    <div className="min-w-0">
                      <div className="text-[13.5px] font-medium text-platinum-50 truncate">{b.title || b.bookingId}</div>
                      <div className="text-[11.5px] text-platinum-300/55 mt-0.5">
                        <span className="text-gold-300 font-medium tabular-nums">{formatMoney(b.totalMinor, b.currency)}</span> · {formatTimeAgo(b.createdAt)}
                      </div>
                    </div>
                    <Badge variant={STATUS_VARIANT[b.status] || 'default'} size="sm">{b.status}</Badge>
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
