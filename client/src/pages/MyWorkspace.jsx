import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../services/auth';
import { formatMoney, formatDate, formatTimeAgo } from '../services/format';
import Icon from '../components/Icon';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Input, Label, Field, StatTile, Tabs, TabsList, TabsTrigger, TabsContent, Dialog, Separator } from '../components/ui';

const accentMap = { aura: 'aura', gold: 'gold', emerald: 'emerald', rose: 'rose' };

export default function MyWorkspace() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [budget, setBudget] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [guests, setGuests] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      let me = null;
      try {
        const meRes = await api.get(`/customers/by-user/${user.userId || user.id}`);
        me = meRes.data.data;
      } catch (err) {
        if (err.message && err.message.includes('404')) {
          try {
            const created = await api.post('/customers', {
              userId: user.userId || user.id,
              name: user.name,
              email: user.email,
              phone: user.phone || '',
              city: '',
              eventType: '',
            });
            me = created.data.data;
          } catch {/* ignore */}
        }
      }
      if (!me) { setLoading(false); return; }
      setCustomer(me);

      const cid = me.customerId;
      const calls = await Promise.allSettled([
        api.get(`/inquiries/customer/${cid}`),
        api.get(`/quotes/customer/${cid}`),
        api.get(`/bookings/customer/${cid}`),
        api.get(`/budget/customer/${cid}`),
        api.get(`/tasks/customer/${cid}`),
        api.get(`/timeline`, { params: { customerId: cid } }),
        api.get(`/guests`, { params: { customerId: cid } }),
        api.get(`/activity/customer/${cid}`),
      ]);
      setInquiries(calls[0].status === 'fulfilled' ? calls[0].value.data.data || [] : []);
      setQuotes(calls[1].status === 'fulfilled' ? calls[1].value.data.data || [] : []);
      setBookings(calls[2].status === 'fulfilled' ? calls[2].value.data.data || [] : []);
      setBudget(calls[3].status === 'fulfilled' ? calls[3].value.data : null);
      setTasks(calls[4].status === 'fulfilled' ? calls[4].value.data || [] : []);
      setTimeline(calls[5].status === 'fulfilled' ? calls[5].value.data || [] : []);
      setGuests(calls[6].status === 'fulfilled' ? calls[6].value.data || [] : []);
      setActivity(calls[7].status === 'fulfilled' ? calls[7].value.data || [] : []);
    } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { loadAll(); }, [loadAll]);

  if (loading) {
    return (
      <div className="flex flex-col gap-7">
        <div className="skeleton h-40 rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
        <div className="skeleton h-72 rounded-2xl" />
      </div>
    );
  }

  if (!customer) {
    return (
      <Card className="p-12 text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] grid place-items-center text-platinum-300/60">
          <Icon name="users" size={24} />
        </div>
        <h2 className="font-display text-[22px] font-semibold text-platinum-50 mt-4">Set up your profile</h2>
        <p className="text-platinum-300/70 text-[13.5px] mt-1.5 max-w-md mx-auto">
          Tell us about your event so we can connect you with the right partners.
        </p>
        <div className="mt-5">
          <Button onClick={() => navigate('/onboarding')}>
            <Icon name="spark" size={14} /> Start onboarding
          </Button>
        </div>
      </Card>
    );
  }

  const activeQuotes = quotes.filter((q) => ['SENT', 'VIEWED', 'NEGOTIATING'].includes(q.status)).length;

  return (
    <div className="flex flex-col gap-7 anim-fade-in">
      {/* Hero header */}
      <Card accent className="relative overflow-hidden p-7 sm:p-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 -right-16 h-72 w-72 rounded-full bg-aura-500/25 blur-3xl" />
          <div className="absolute -bottom-20 -left-12 h-64 w-64 rounded-full bg-gold-300/15 blur-3xl" />
        </div>
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="max-w-2xl">
            <Badge variant="aura" size="md" dot className="mb-3">My Workspace</Badge>
            <h1 className="font-display text-[32px] sm:text-[40px] font-semibold tracking-[-0.025em] text-platinum-50 leading-[1.05]">
              Hi, {customer.name}
            </h1>
            <p className="text-platinum-300/80 text-[14px] mt-2 leading-relaxed">
              {customer.eventType ? `${customer.eventType}${customer.eventDate ? ` · ${formatDate(customer.eventDate)}` : ''}` : 'Your event workspace'}
              {customer.city ? ` · ${customer.city}` : ''}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => navigate('/explore')}>
              <Icon name="discover" size={14} /> Find Vendors
            </Button>
            <NewInquiryDialog customer={customer} onCreated={(id) => navigate(`/inquiries/${id}`)} />
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <div style={{ '--i': 0 }} className="anim-slide-up">
          <StatTile label="Inquiries" value={inquiries.length} icon={<Icon name="inbox" size={18} />} accent="aura" />
        </div>
        <div style={{ '--i': 1 }} className="anim-slide-up">
          <StatTile label="Active Quotes" value={activeQuotes} icon={<Icon name="doc" size={18} />} accent="gold" />
        </div>
        <div style={{ '--i': 2 }} className="anim-slide-up">
          <StatTile label="Bookings" value={bookings.length} icon={<Icon name="briefcase" size={18} />} accent="emerald" />
        </div>
        <div style={{ '--i': 3 }} className="anim-slide-up">
          <StatTile
            label="Total Budget"
            value={budget?.totalMinor ? formatMoney(budget.totalMinor, budget.currency) : '—'}
            icon={<Icon name="money" size={18} />}
            accent="rose"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <div className="overflow-x-auto -mx-1">
          <TabsList>
            <TabsTrigger value="overview" icon={<Icon name="home" size={14} />}>Overview</TabsTrigger>
            <TabsTrigger value="inquiries" icon={<Icon name="inbox" size={14} />}>Inquiries</TabsTrigger>
            <TabsTrigger value="quotes" icon={<Icon name="doc" size={14} />}>Quotes</TabsTrigger>
            <TabsTrigger value="bookings" icon={<Icon name="briefcase" size={14} />}>Bookings</TabsTrigger>
            <TabsTrigger value="budget" icon={<Icon name="money" size={14} />}>Budget</TabsTrigger>
            <TabsTrigger value="tasks" icon={<Icon name="checklist" size={14} />}>Tasks</TabsTrigger>
            <TabsTrigger value="timeline" icon={<Icon name="clock" size={14} />}>Timeline</TabsTrigger>
            <TabsTrigger value="guests" icon={<Icon name="users" size={14} />}>Guests</TabsTrigger>
            <TabsTrigger value="activity" icon={<Icon name="bolt" size={14} />}>Activity</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <CardHeader><CardTitle eyebrow="Profile">Event details</CardTitle></CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
                  <DT k="Type">{customer.eventType || '—'}</DT>
                  <DT k="Date">{formatDate(customer.eventDate)}</DT>
                  <DT k="Venue">{customer.venue || '—'}</DT>
                  <DT k="City">{customer.city || '—'}</DT>
                  <DT k="Guests">{customer.guestCount || '—'}</DT>
                  <DT k="Budget">{formatMoney(customer.budgetMinor, customer.currency)}</DT>
                  <DT k="Status">
                    <StatusBadge status={customer.status} />
                  </DT>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle eyebrow="Activity">Recent</CardTitle></CardHeader>
              <CardContent>
                {activity.length === 0 ? (
                  <div className="py-10 text-center">
                    <div className="mx-auto h-10 w-10 rounded-xl bg-white/[0.04] grid place-items-center text-platinum-300/60">
                      <Icon name="bolt" size={18} />
                    </div>
                    <p className="mt-3 text-[13px] text-platinum-300/70">No activity yet</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3.5">
                    {activity.slice(0, 8).map((a) => (
                      <div key={a.activityId} className="flex gap-3">
                        <div className="mt-1.5 h-2 w-2 rounded-full bg-aura-400 ring-4 ring-aura-500/15 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] text-platinum-100 leading-snug">{a.message}</div>
                          <div className="text-[11px] text-platinum-300/55 mt-0.5">{formatTimeAgo(a.createdAt)} · {a.source}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inquiries"><InquiriesTab inquiries={inquiries} /></TabsContent>
        <TabsContent value="quotes"><QuotesTab quotes={quotes} /></TabsContent>
        <TabsContent value="bookings"><BookingsTab bookings={bookings} /></TabsContent>
        <TabsContent value="budget"><BudgetTab budget={budget} customer={customer} reload={loadAll} /></TabsContent>
        <TabsContent value="tasks"><TasksTab tasks={tasks} customer={customer} reload={loadAll} /></TabsContent>
        <TabsContent value="timeline"><TimelineTab items={timeline} customer={customer} reload={loadAll} /></TabsContent>
        <TabsContent value="guests"><GuestsTab guests={guests} customer={customer} reload={loadAll} /></TabsContent>
        <TabsContent value="activity"><ActivityTab activity={activity} /></TabsContent>
      </Tabs>
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

function StatusBadge({ status }) {
  if (!status) return '—';
  const map = {
    ACTIVE: 'success', NEW: 'aura', BLOCKED: 'danger', BOOKED: 'gold', CLOSED: 'default',
  };
  return <Badge variant={map[status] || 'default'} size="sm">{status}</Badge>;
}

function NewInquiryDialog({ customer, onCreated }) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    setBusy(true); setError('');
    try {
      const { data } = await api.post('/inquiries', {
        customerId: customer.customerId,
        subject: subject || `Inquiry for ${customer.eventType || 'my event'}`,
        body: 'Hi! Could you share availability and pricing?',
      });
      setOpen(false); setSubject('');
      onCreated(data.data.inquiryId);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  return (
    <>
      <Button variant="gold" onClick={() => setOpen(true)}>
        <Icon name="send" size={14} /> New Inquiry
      </Button>
      <Dialog
        open={open}
        onClose={() => !busy && setOpen(false)}
        title="Start a new inquiry"
        description="Send a message to a vendor about your event."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
            <Button variant="gold" onClick={submit} loading={busy}>Send Inquiry</Button>
          </>
        }
      >
        <Field label="Subject">
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={`Inquiry for ${customer.eventType || 'my event'}`}
            className="w-full h-11 px-3.5 rounded-xl bg-white/[0.03] text-platinum-50 border border-white/[0.07] placeholder:text-platinum-300/40 focus:outline-none focus:border-aura-500/60 focus:bg-white/[0.05] focus:shadow-[0_0_0_4px_rgba(42,120,245,0.12)]"
          />
        </Field>
        {error && <p className="text-[12px] text-rose-400 mt-3">{error}</p>}
      </Dialog>
    </>
  );
}

/* ---------- Tab components ---------- */

function EmptyTab({ icon, title }) {
  return (
    <Card className="p-12 text-center">
      <div className="mx-auto h-12 w-12 rounded-xl bg-white/[0.04] border border-white/[0.06] grid place-items-center text-platinum-300/60">
        <Icon name={icon} size={22} />
      </div>
      <h3 className="font-display text-[16px] font-semibold text-platinum-50 mt-3">{title}</h3>
    </Card>
  );
}

function InquiriesTab({ inquiries }) {
  if (inquiries.length === 0) return <EmptyTab icon="inbox" title="No inquiries yet" />;
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="text-platinum-300/55 text-[11px] uppercase tracking-[0.12em]">
            <tr className="border-b border-white/[0.06]">
              <th className="text-left px-6 py-3 font-medium">Subject</th>
              <th className="text-left px-6 py-3 font-medium">Vendor</th>
              <th className="text-left px-6 py-3 font-medium">Status</th>
              <th className="text-left px-6 py-3 font-medium">Updated</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((i) => (
              <tr key={i.inquiryId} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                <td className="px-6 py-3.5 font-medium text-platinum-50">{i.subject}</td>
                <td className="px-6 py-3.5 font-mono text-[11.5px] text-platinum-300/70">{i.organizationId}</td>
                <td className="px-6 py-3.5"><StatusBadge status={i.status} /></td>
                <td className="px-6 py-3.5 text-platinum-300/70">{formatTimeAgo(i.updatedAt)}</td>
                <td className="px-6 py-3.5">
                  <Link to={`/inquiries/${i.inquiryId}`} className="text-aura-300 hover:text-aura-200">
                    <Icon name="arrow" size={14} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function QuotesTab({ quotes }) {
  if (quotes.length === 0) return <EmptyTab icon="doc" title="No quotes yet" />;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">
      {quotes.map((q, i) => (
        <Link key={q.quoteId} to={`/quotes/${q.quoteId}`} style={{ '--i': i }} className="anim-slide-up block">
          <Card hover className="overflow-hidden h-full">
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10.5px] uppercase tracking-[0.14em] text-aura-300/80 font-medium">{q.quoteId}</div>
                  <h3 className="font-display text-[15.5px] font-semibold text-platinum-50 mt-1 truncate tracking-[-0.01em]">{q.subject || 'Quote'}</h3>
                </div>
                <StatusBadge status={q.status} />
              </div>
              <div className="font-display text-[28px] font-semibold text-gold-300 mt-4 tracking-[-0.02em]">
                {formatMoney(q.totalMinor, q.currency)}
              </div>
              <div className="text-[11.5px] text-platinum-300/60 mt-1.5">Valid until {formatDate(q.validUntil)}</div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function BookingsTab({ bookings }) {
  if (bookings.length === 0) return <EmptyTab icon="briefcase" title="No bookings yet" />;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">
      {bookings.map((b, i) => {
        const pct = b.totalMinor ? Math.min(100, Math.round(((b.paidMinor || 0) / b.totalMinor) * 100)) : 0;
        return (
          <Link key={b.bookingId} to={`/bookings/${b.bookingId}`} style={{ '--i': i }} className="anim-slide-up block">
            <Card hover className="overflow-hidden h-full">
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[10.5px] uppercase tracking-[0.14em] text-aura-300/80 font-medium">{b.bookingId}</div>
                    <h3 className="font-display text-[15.5px] font-semibold text-platinum-50 mt-1 truncate tracking-[-0.01em]">{b.title || 'Booking'}</h3>
                    <div className="text-[12px] text-platinum-300/65 mt-1.5">{formatDate(b.startDate)} {b.endDate ? `→ ${formatDate(b.endDate)}` : ''}</div>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <div className="font-display text-[28px] font-semibold text-gold-300 mt-4 tracking-[-0.02em]">
                  {formatMoney(b.totalMinor, b.currency)}
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-gold-300 to-gold-500" style={{ width: `${pct}%` }} />
                </div>
                <div className="text-[11.5px] text-platinum-300/60 mt-2">{formatMoney(b.paidMinor, b.currency)} paid · {pct}%</div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

function BudgetTab({ budget, customer, reload }) {
  const summary = budget?.summary || {};
  const overBudget = summary.health === 'OVER_BUDGET';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <Card>
        <CardHeader>
          <CardTitle eyebrow="Total">Budget</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-display text-[40px] font-semibold text-gold-300 tracking-[-0.02em]">
            {formatMoney(budget?.totalMinor, budget?.currency)}
          </div>
          <Separator className="my-5" />
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-[13px]">
            <DT k="Committed">{formatMoney(summary.committedMinor, budget?.currency)}</DT>
            <DT k="Paid">{formatMoney(summary.paidMinor, budget?.currency)}</DT>
            <DT k="Pending">{formatMoney(summary.pendingMinor, budget?.currency)}</DT>
            <DT k="Remaining">{formatMoney(summary.remainingMinor, budget?.currency)}</DT>
          </dl>
          {overBudget && (
            <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/[0.08] text-amber-200 text-[12.5px] px-3.5 py-2.5 flex items-center gap-2">
              <Icon name="flag" size={14} />
              Over budget by {formatMoney((summary.committedMinor || 0) - (budget?.totalMinor || 0), budget?.currency)}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle eyebrow="Allocate">By category</CardTitle>
        </CardHeader>
        <CardContent>
          {(budget?.allocations || []).length === 0 ? (
            <p className="text-[13px] text-platinum-300/70 py-6 text-center">No allocations yet</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {budget.allocations.map((a) => (
                <li key={a.allocationId} className="flex items-center justify-between text-[13px] py-2 border-b border-white/[0.04] last:border-0">
                  <span className="text-platinum-100">{a.category}</span>
                  <span className="font-medium text-platinum-50 tabular-nums">{formatMoney(a.plannedMinor, budget?.currency)}</span>
                </li>
              ))}
            </ul>
          )}
          <Separator className="my-5" />
          <p className="text-[12px] text-platinum-300/55 leading-relaxed">
            Manage allocations in the API or via the budget endpoint. Refresh to see live values.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function TasksTab({ tasks, customer, reload }) {
  const [title, setTitle] = useState('');
  const [cat, setCat] = useState('GENERAL');
  const [busy, setBusy] = useState(false);

  async function add() {
    if (!title.trim()) return;
    setBusy(true);
    try {
      await api.post('/tasks', { customerId: customer.customerId, title, category: cat });
      setTitle('');
      reload();
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  }
  async function toggle(t) {
    try {
      const next = t.status === 'DONE' ? 'OPEN' : 'DONE';
      await api.patch(`/tasks/${t.taskId}/status`, { status: next });
      reload();
    } catch (e) { alert(e.message); }
  }
  async function remove(t) {
    if (!confirm('Delete this task?')) return;
    try { await api.delete(`/tasks/${t.taskId}`); reload(); } catch (e) { alert(e.message); }
  }

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader><CardTitle eyebrow="Add">New task</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-3">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="New task…" />
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="h-11 px-3.5 rounded-xl bg-white/[0.03] text-platinum-50 border border-white/[0.07] focus:outline-none focus:border-aura-500/60"
            >
              {['GENERAL', 'VENDOR', 'PAYMENT', 'TIMELINE', 'BUDGET'].map((c) => <option key={c} className="bg-obsidian-700">{c}</option>)}
            </select>
            <Button onClick={add} disabled={busy}><Icon name="plus" size={14} /> Add</Button>
          </div>
        </CardContent>
      </Card>

      {tasks.length === 0 ? (
        <EmptyTab icon="checklist" title="No tasks yet" />
      ) : (
        <Card>
          <ul className="flex flex-col">
            {tasks.map((t) => (
              <li key={t.taskId} className="flex items-center gap-3 px-6 py-3.5 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                <input
                  type="checkbox"
                  checked={t.status === 'DONE'}
                  onChange={() => toggle(t)}
                  className="h-4 w-4 rounded border-white/20 bg-white/[0.04] text-aura-500 focus:ring-aura-500/40"
                />
                <div className="min-w-0 flex-1">
                  <div className={`text-[13.5px] ${t.status === 'DONE' ? 'line-through text-platinum-300/50' : 'text-platinum-50'}`}>
                    {t.title}
                  </div>
                  <div className="text-[11px] text-platinum-300/55 mt-0.5">{t.category}</div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove(t)} aria-label="Delete task">
                  <Icon name="trash" size={14} />
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function TimelineTab({ items, customer, reload }) {
  const [form, setForm] = useState({ title: '', startTime: '', category: 'CEREMONY', location: '' });
  const [busy, setBusy] = useState(false);

  async function add() {
    if (!form.title || !form.startTime) return;
    setBusy(true);
    try {
      await api.post('/timeline', { ...form, customerId: customer.customerId, startTime: new Date(form.startTime).toISOString() });
      setForm({ title: '', startTime: '', category: 'CEREMONY', location: '' });
      reload();
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  }
  async function setStatus(t, status) {
    try { await api.patch(`/timeline/${t.timelineId}/status`, { status }); reload(); } catch (e) { alert(e.message); }
  }

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader><CardTitle eyebrow="Schedule">New timeline item</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Wedding ceremony" /></Field>
            <Field label="Time"><Input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></Field>
            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="h-11 px-3.5 rounded-xl bg-white/[0.03] text-platinum-50 border border-white/[0.07] focus:outline-none focus:border-aura-500/60"
              >
                {['CEREMONY', 'RECEPTION', 'PHOTO', 'FOOD', 'MUSIC', 'TRAVEL', 'OTHER'].map((c) => <option key={c} className="bg-obsidian-700">{c}</option>)}
              </select>
            </Field>
            <Field label="Location"><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Main hall" /></Field>
          </div>
          <div className="mt-5 flex justify-end">
            <Button onClick={add} disabled={busy}><Icon name="plus" size={14} /> Add timeline item</Button>
          </div>
        </CardContent>
      </Card>

      {items.length === 0 ? <EmptyTab icon="clock" title="No timeline items yet" /> : (
        <Card>
          <ul className="flex flex-col">
            {items.map((t) => (
              <li key={t.timelineId} className="flex items-center gap-4 px-6 py-4 border-b border-white/[0.04] last:border-0">
                <div className="h-2 w-2 rounded-full bg-aura-400 ring-4 ring-aura-500/15 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-medium text-platinum-50">{t.title}</div>
                  <div className="text-[12px] text-platinum-300/65 mt-0.5">{formatDate(t.startTime)} · {t.category} · {t.location || '—'}</div>
                </div>
                <StatusBadge status={t.status} />
                {t.status !== 'DONE' && (
                  <Button variant="ghost" size="sm" onClick={() => setStatus(t, t.status === 'PLANNED' ? 'IN_PROGRESS' : 'DONE')}>
                    <Icon name="arrow" size={12} />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function GuestsTab({ guests, customer, reload }) {
  const [form, setForm] = useState({ name: '', email: '', side: 'FRIEND', plusOnes: 0, mealPreference: '' });
  const [busy, setBusy] = useState(false);

  async function add() {
    if (!form.name) return;
    setBusy(true);
    try {
      await api.post('/guests', { ...form, customerId: customer.customerId, plusOnes: Number(form.plusOnes) || 0 });
      setForm({ name: '', email: '', side: 'FRIEND', plusOnes: 0, mealPreference: '' });
      reload();
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  }
  async function setRsvp(g, rsvp) {
    try { await api.patch(`/guests/${g.guestId}/rsvp`, { rsvpStatus: rsvp }); reload(); } catch (e) { alert(e.message); }
  }
  async function remove(g) {
    if (!confirm(`Remove ${g.name}?`)) return;
    try { await api.delete(`/guests/${g.guestId}`); reload(); } catch (e) { alert(e.message); }
  }

  const counts = guests.reduce((acc, g) => { acc[g.rsvpStatus] = (acc[g.rsvpStatus] || 0) + 1; return acc; }, {});

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
        <div style={{ '--i': 0 }} className="anim-slide-up"><StatTile label="Total" value={guests.length} icon={<Icon name="users" size={18} />} accent="aura" /></div>
        <div style={{ '--i': 1 }} className="anim-slide-up"><StatTile label="Accepted" value={counts.ACCEPTED || 0} icon={<Icon name="check" size={18} />} accent="emerald" /></div>
        <div style={{ '--i': 2 }} className="anim-slide-up"><StatTile label="Pending" value={(counts.PENDING || 0) + (counts.INVITED || 0)} icon={<Icon name="clock" size={18} />} accent="gold" /></div>
        <div style={{ '--i': 3 }} className="anim-slide-up"><StatTile label="Declined" value={counts.DECLINED || 0} icon={<Icon name="x" size={18} />} accent="rose" /></div>
      </div>

      <Card>
        <CardHeader><CardTitle eyebrow="Add">New guest</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Email"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="Side">
              <select
                value={form.side}
                onChange={(e) => setForm({ ...form, side: e.target.value })}
                className="h-11 px-3.5 rounded-xl bg-white/[0.03] text-platinum-50 border border-white/[0.07] focus:outline-none focus:border-aura-500/60"
              >
                {['BRIDE', 'GROOM', 'FAMILY', 'FRIEND', 'COLLEAGUE', 'OTHER'].map((s) => <option key={s} className="bg-obsidian-700">{s}</option>)}
              </select>
            </Field>
            <Field label="Plus ones"><Input type="number" min={0} value={form.plusOnes} onChange={(e) => setForm({ ...form, plusOnes: e.target.value })} /></Field>
            <Field label="Meal preference"><Input value={form.mealPreference} onChange={(e) => setForm({ ...form, mealPreference: e.target.value })} placeholder="Veg / Non-Veg / Vegan" /></Field>
          </div>
          <div className="mt-5 flex justify-end">
            <Button onClick={add} disabled={busy}><Icon name="plus" size={14} /> Add guest</Button>
          </div>
        </CardContent>
      </Card>

      {guests.length === 0 ? <EmptyTab icon="users" title="No guests yet" /> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="text-platinum-300/55 text-[11px] uppercase tracking-[0.12em]">
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-6 py-3 font-medium">Name</th>
                  <th className="text-left px-6 py-3 font-medium">Side</th>
                  <th className="text-left px-6 py-3 font-medium">Meal</th>
                  <th className="text-left px-6 py-3 font-medium">RSVP</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {guests.map((g) => (
                  <tr key={g.guestId} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                    <td className="px-6 py-3.5">
                      <div className="font-medium text-platinum-50">{g.name}</div>
                      <div className="text-[11.5px] text-platinum-300/55">{g.email}</div>
                    </td>
                    <td className="px-6 py-3.5 text-platinum-300/85">{g.side}</td>
                    <td className="px-6 py-3.5 text-platinum-300/85">{g.mealPreference || '—'}</td>
                    <td className="px-6 py-3.5">
                      <select
                        value={g.rsvpStatus}
                        onChange={(e) => setRsvp(g, e.target.value)}
                        className="h-9 px-2.5 rounded-lg bg-white/[0.03] text-platinum-50 border border-white/[0.07] focus:outline-none focus:border-aura-500/60 text-[12.5px]"
                      >
                        {['PENDING', 'INVITED', 'ACCEPTED', 'DECLINED', 'TENTATIVE'].map((s) => <option key={s} className="bg-obsidian-700">{s}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-3.5">
                      <Button variant="ghost" size="icon" onClick={() => remove(g)} aria-label="Remove">
                        <Icon name="trash" size={14} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function ActivityTab({ activity }) {
  if (activity.length === 0) return <EmptyTab icon="bolt" title="No activity yet" />;
  return (
    <Card>
      <CardHeader><CardTitle eyebrow="Feed">Activity timeline</CardTitle></CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-4">
          {activity.map((a) => (
            <li key={a.activityId} className="flex gap-3">
              <div className="mt-1.5 h-2 w-2 rounded-full bg-aura-400 ring-4 ring-aura-500/15 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] text-platinum-50 leading-snug">{a.message}</div>
                <div className="text-[11px] text-platinum-300/55 mt-0.5">{formatTimeAgo(a.createdAt)} · {a.source}</div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
