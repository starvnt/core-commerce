import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Icon from '../components/Icon';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from '../components/ui';
import { formatMoney, formatTimeAgo } from '../services/format';

const STATUS_VARIANT = {
  OPEN: 'aura', RESPONDED: 'gold', CLOSED: 'default', ACCEPTED: 'success', REJECTED: 'danger',
  PENDING: 'warning', CONFIRMED: 'aura', IN_PROGRESS: 'gold', COMPLETED: 'success', CANCELLED: 'danger',
  DRAFT: 'default', SENT: 'aura', VIEWED: 'gold', NEGOTIATING: 'gold', EXPIRED: 'warning',
  ACTIVE: 'success', NEW: 'aura', BLOCKED: 'danger', BOOKED: 'gold',
  PROCESSED: 'success', PROCESSING: 'aura', FAILED: 'danger',
  PAID: 'success', REFUNDED: 'warning',
};

export default function AdminList({ endpoint, title, eyebrow, columns, detailPath }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  async function load() {
    setLoading(true);
    try { const { data } = await api.get(endpoint); setRows(data.data || []); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [endpoint]);

  const filtered = q ? rows.filter((r) => JSON.stringify(r).toLowerCase().includes(q.toLowerCase())) : rows;

  const keyOf = (r) => r[columns[0].key.split('.')[0]] || Math.random().toString(36).slice(2);

  return (
    <div className="flex flex-col gap-7 anim-fade-in">
      <Card accent className="relative overflow-hidden p-7">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-aura-500/25 blur-3xl" />
          <div className="absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-gold-300/15 blur-3xl" />
        </div>
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="max-w-2xl">
            {eyebrow && <Badge variant="aura" size="md" dot className="mb-3">{eyebrow}</Badge>}
            <h1 className="font-display text-[32px] sm:text-[40px] font-semibold tracking-[-0.025em] text-platinum-50 leading-[1.05]">
              {title}
            </h1>
            <p className="text-platinum-300/80 text-[14px] mt-2">
              <span className="tabular-nums font-medium text-platinum-50">{filtered.length}</span>
              {q ? <> matching <span className="text-gold-300">"{q}"</span></> : <> total records</>}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              leftIcon={<Icon name="search" size={15} />}
              className="w-72"
            />
            <Button variant="secondary" onClick={load}>
              <Icon name="refresh" size={14} /> Refresh
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle eyebrow="Records">All {title.toLowerCase()}</CardTitle>
          {detailPath && <span className="text-[11px] text-platinum-300/55">Click row to open detail</span>}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto h-12 w-12 rounded-xl bg-white/[0.04] border border-white/[0.06] grid place-items-center text-platinum-300/60">
                <Icon name="inbox" size={22} />
              </div>
              <h3 className="font-display text-[15.5px] font-semibold text-platinum-50 mt-3">
                {q ? 'No matches' : `No ${title.toLowerCase()} yet`}
              </h3>
              {q && <p className="text-[12.5px] text-platinum-300/70 mt-1.5">Try a different search term.</p>}
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6">
              <table className="w-full text-[13px]">
                <thead className="text-platinum-300/55 text-[11px] uppercase tracking-[0.12em]">
                  <tr className="border-b border-white/[0.06]">
                    {columns.map((c) => (
                      <th key={c.key} className="text-left px-6 py-3 font-medium">{c.label}</th>
                    ))}
                    {detailPath && <th className="w-10"></th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const Inner = (
                      <>
                        {columns.map((c) => (
                          <td key={c.key} className="px-6 py-3.5">
                            {c.render ? c.render(r) : (
                              c.key.endsWith('Minor') ? <span className="tabular-nums text-platinum-50 font-medium">{formatMoney(r[c.key], r.currency)}</span> :
                              c.key === 'status' ? <Badge variant={STATUS_VARIANT[r[c.key]] || 'default'} size="sm">{r[c.key]}</Badge> :
                              c.key.endsWith('At') || c.key.endsWith('Date') ? <span className="text-platinum-300/75">{formatTimeAgo(r[c.key])}</span> :
                              <span className="text-platinum-100">{String(r[c.key] ?? '—').slice(0, 80)}</span>
                            )}
                          </td>
                        ))}
                        {detailPath && (
                          <td className="px-6 py-3.5">
                            <Link to={detailPath(r)} className="text-aura-300 hover:text-aura-200 transition-colors">
                              <Icon name="arrow" size={14} />
                            </Link>
                          </td>
                        )}
                      </>
                    );
                    return detailPath ? (
                      <tr key={keyOf(r)} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] cursor-pointer" onClick={() => window.location.assign(detailPath(r))}>
                        {Inner}
                      </tr>
                    ) : (
                      <tr key={keyOf(r)} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">{Inner}</tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
