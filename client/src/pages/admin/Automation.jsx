import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Icon from '../../components/Icon';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '../../components/ui';

const STATUS_VARIANT = {
  SUCCEEDED: 'success', SUCCESS: 'success', FAILED: 'danger', ERROR: 'danger', RUNNING: 'aura', PENDING: 'warning',
};

const RULES = [
  { id: 'CUSTOMER_CREATED_ACTIVITY',   on: 'customer.created',    do: 'Log to activity timeline',          desc: 'Records every customer signup to the global activity feed.' },
  { id: 'INQUIRY_CREATED_ACTIVITY',    on: 'inquiry.created',     do: 'Log + notify partner',              desc: 'Pings the matched vendor and posts to vendor inbox.' },
  { id: 'QUOTE_SENT_NOTIFY_CUSTOMER',  on: 'quote.sent',          do: 'Email customer with quote',         desc: 'Sends a branded quote email and creates a notification.' },
  { id: 'BOOKING_CONFIRMED_ACTIVITY',  on: 'booking.confirmed',   do: 'Log + send confirm',                desc: 'Confirms dates, vendors, and triggers the milestone track.' },
  { id: 'FOLLOW_UP_OVERDUE_ALERT',     on: 'followup.overdue',    do: 'Alert partner staff',               desc: 'Flags stale inquiries for partner follow-up.' },
];

const iconMap = { OPEN: 'inbox', PENDING: 'clock', auras: 'inbox' };

export default function AdminAutomation() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    Promise.allSettled([
      api.get('/automation/logs'),
      api.get('/outbox/stats'),
    ]).then(([a, b]) => {
      if (a.status === 'fulfilled') setLogs(a.value.data?.data || []);
      if (b.status === 'fulfilled') setStats(b.value.data?.data || {});
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex flex-col gap-7 anim-fade-in">
      <Card accent className="relative overflow-hidden p-7">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-aura-500/25 blur-3xl" />
          <div className="absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-gold-300/15 blur-3xl" />
        </div>
        <div className="relative">
          <Badge variant="aura" size="md" dot className="mb-3">Rules engine</Badge>
          <h1 className="font-display text-[30px] sm:text-[36px] font-semibold tracking-[-0.025em] text-platinum-50 leading-[1.05]">
            Automation
          </h1>
          <p className="text-platinum-300/80 text-[13.5px] mt-2 max-w-xl">
            Event-driven actions with idempotency. Every rule fires on its trigger; every execution is logged.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-[12px]">
            <Badge variant="default">{RULES.length} rules</Badge>
            <Badge variant="success">{stats.PROCESSED ?? 0} processed</Badge>
            <Badge variant="warning">{stats.PENDING ?? 0} pending</Badge>
            <Badge variant="danger">{stats.FAILED ?? 0} failed</Badge>
          </div>
        </div>
      </Card>

      {/* Rules grid */}
      <div>
        <div className="flex items-end justify-between mb-4">
          <div>
            <Badge variant="gold" size="md" className="mb-2">Active</Badge>
            <h2 className="font-display text-[22px] font-semibold text-platinum-50 tracking-[-0.015em]">Rules</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 stagger">
          {RULES.map((r, i) => (
            <div key={r.id} style={{ '--i': i }} className="anim-slide-up">
              <Card hover className="overflow-hidden h-full">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-aura-300/80 truncate">{r.id}</div>
                      <h3 className="font-display text-[15px] font-semibold text-platinum-50 mt-1.5 tracking-[-0.01em]">{r.do}</h3>
                    </div>
                    <Badge variant="success" size="sm" dot>active</Badge>
                  </div>
                  <p className="text-[12.5px] text-platinum-300/70 mt-3 leading-relaxed">{r.desc}</p>
                  <div className="mt-4 flex items-center gap-2 text-[11.5px]">
                    <span className="text-platinum-300/55">on</span>
                    <code className="px-2 py-0.5 rounded-md bg-gold-300/10 text-gold-200 border border-gold-300/20 font-mono">{r.on}</code>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Logs */}
      <Card>
        <CardHeader><CardTitle eyebrow="Feed">Recent executions</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
            </div>
          ) : logs.length === 0 ? (
            <div className="py-10 text-center">
              <div className="mx-auto h-12 w-12 rounded-xl bg-white/[0.04] border border-white/[0.06] grid place-items-center text-platinum-300/60">
                <Icon name="bolt" size={22} />
              </div>
              <h3 className="font-display text-[15.5px] font-semibold text-platinum-50 mt-3">No automation runs yet</h3>
              <p className="text-[12.5px] text-platinum-300/70 mt-1.5 max-w-md mx-auto">
                As events flow through the outbox, automation logs will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead className="text-platinum-300/55 text-[11px] uppercase tracking-[0.12em]">
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-4 py-3 font-medium">Rule</th>
                    <th className="text-left px-4 py-3 font-medium">Event</th>
                    <th className="text-left px-4 py-3 font-medium">Entity</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">When</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l, i) => (
                    <tr key={i} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                      <td className="px-4 py-3.5 font-mono text-[11.5px] text-aura-300">{l.ruleId}</td>
                      <td className="px-4 py-3.5 font-mono text-[11.5px] text-platinum-300/85">{l.eventName}</td>
                      <td className="px-4 py-3.5 font-mono text-[11.5px] text-platinum-300/85">{l.entityId}</td>
                      <td className="px-4 py-3.5">
                        <Badge variant={STATUS_VARIANT[l.status] || 'default'} size="sm">{l.status}</Badge>
                      </td>
                      <td className="px-4 py-3.5 text-[12px] text-platinum-300/65">{l.createdAt}</td>
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
