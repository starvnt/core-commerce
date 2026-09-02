import React, { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import Icon from '../../components/Icon';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, StatTile } from '../../components/ui';
import { formatTimeAgo } from '../../services/format';

const STATUS_VARIANT = {
  PENDING: 'warning', PROCESSING: 'aura', PROCESSED: 'success', FAILED: 'danger',
};

const accentMap = { aura: 'aura', gold: 'gold', emerald: 'emerald', rose: 'rose' };

export default function AdminOutbox() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [a, s] = await Promise.all([api.get('/outbox'), api.get('/outbox/stats')]);
      setItems(a.data.data || []);
      setStats(s.data.data || {});
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function retry(id) {
    try { await api.post(`/outbox/${id}/retry`); load(); } catch (e) { alert(e.message); }
  }

  const statsGrid = [
    { label: 'Pending',    value: stats.PENDING ?? 0,    icon: 'clock', accent: 'gold' },
    { label: 'Processing', value: stats.PROCESSING ?? 0, icon: 'bolt',  accent: 'aura' },
    { label: 'Processed',  value: stats.PROCESSED ?? 0,  icon: 'check', accent: 'emerald' },
    { label: 'Failed',     value: stats.FAILED ?? 0,     icon: 'flag',  accent: 'rose' },
  ];

  return (
    <div className="flex flex-col gap-7 anim-fade-in">
      <Card accent className="relative overflow-hidden p-7">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-aura-500/25 blur-3xl" />
          <div className="absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-gold-300/15 blur-3xl" />
        </div>
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="max-w-2xl">
            <Badge variant="aura" size="md" dot className="mb-3">Event log</Badge>
            <h1 className="font-display text-[32px] sm:text-[40px] font-semibold tracking-[-0.025em] text-platinum-50 leading-[1.05]">
              Outbox
            </h1>
            <p className="text-platinum-300/80 text-[14px] mt-2 max-w-xl">
              Transactional events processed by the worker. Failed events can be retried — the system is idempotent.
            </p>
          </div>
          <Button variant="secondary" onClick={load}>
            <Icon name="refresh" size={14} /> Refresh
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        {statsGrid.map((s, i) => (
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

      <Card>
        <CardHeader><CardTitle eyebrow="Events">Delivery feed</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto h-12 w-12 rounded-xl bg-white/[0.04] border border-white/[0.06] grid place-items-center text-platinum-300/60">
                <Icon name="zap" size={22} />
              </div>
              <h3 className="font-display text-[15.5px] font-semibold text-platinum-50 mt-3">Outbox empty</h3>
              <p className="text-[12.5px] text-platinum-300/70 mt-1.5">No events pending.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead className="text-platinum-300/55 text-[11px] uppercase tracking-[0.12em]">
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-4 py-3 font-medium">Event</th>
                    <th className="text-left px-4 py-3 font-medium">Entity</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Attempts</th>
                    <th className="text-left px-4 py-3 font-medium">Last error</th>
                    <th className="text-left px-4 py-3 font-medium">When</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((e) => (
                    <tr key={e.eventId} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                      <td className="px-4 py-3.5 font-mono text-[11.5px] text-aura-300">{e.eventName}</td>
                      <td className="px-4 py-3.5 font-mono text-[11.5px] text-platinum-300/85">{e.entityId}</td>
                      <td className="px-4 py-3.5">
                        <Badge variant={STATUS_VARIANT[e.status] || 'default'} size="sm" dot={e.status === 'PROCESSING'}>{e.status}</Badge>
                      </td>
                      <td className="px-4 py-3.5 tabular-nums text-platinum-300/85">
                        <span className={e.attempts >= e.maxAttempts ? 'text-rose-300' : 'text-platinum-100'}>{e.attempts}</span>
                        <span className="text-platinum-300/55">/{e.maxAttempts}</span>
                      </td>
                      <td className="px-4 py-3.5 text-[12px] text-platinum-300/65 max-w-[280px] truncate" title={e.lastError}>{e.lastError || '—'}</td>
                      <td className="px-4 py-3.5 text-[12px] text-platinum-300/65">{formatTimeAgo(e.availableAt)}</td>
                      <td className="px-4 py-3.5">
                        {e.status === 'FAILED' && (
                          <Button variant="ghost" size="icon" onClick={() => retry(e.eventId)} aria-label="Retry">
                            <Icon name="refresh" size={14} />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
