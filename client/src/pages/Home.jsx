import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../services/auth';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, StatTile } from '../components/ui';
import Icon from '../components/Icon';

const accentMap = { aura: 'aura', gold: 'gold', success: 'success', rose: 'rose' };

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [stats, setStats] = useState({ customers: 0, bookings: 0, revenue: 0, events: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [f, c, b] = await Promise.allSettled([
          api.get('/search/featured?limit=6'),
          api.get('/customers', { params: { limit: 1 } }),
          api.get('/bookings', { params: { limit: 1 } }),
        ]);
        if (!mounted) return;
        if (f.status === 'fulfilled') setFeatured(f.value.data?.data || []);
        const customerCount = c.status === 'fulfilled' ? (c.value.data?.data?.length || 0) : 0;
        const bookingCount = b.status === 'fulfilled' ? (b.value.data?.data?.length || 0) : 0;
        setStats({ customers: customerCount, bookings: bookingCount, revenue: 0, events: 0 });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="flex flex-col gap-7 anim-fade-in">
      {/* Hero greeting */}
      <Card accent className="relative overflow-hidden p-7 sm:p-9">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-aura-500/25 blur-3xl" />
          <div className="absolute -bottom-24 -left-12 h-72 w-72 rounded-full bg-gold-300/15 blur-3xl" />
        </div>
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="max-w-2xl">
            <Badge variant="aura" size="md" dot className="mb-4">{greeting}</Badge>
            <h1 className="font-display text-[34px] sm:text-[44px] font-semibold tracking-[-0.025em] text-platinum-50 leading-[1.05]">
              {user ? `Welcome back, ${user.name.split(' ')[0]}.` : 'Plan a beautiful event.'}
            </h1>
            <p className="text-platinum-300/80 text-[15px] mt-3 leading-relaxed">
              {user
                ? 'Continue where you left off — explore vendors, follow up on inquiries, and confirm bookings.'
                : 'A premium commerce platform built for event planning and partner orchestration.'}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link to="/explore">
                <Button variant="default" size="lg">
                  <Icon name="discover" size={16} /> Explore Vendors
                </Button>
              </Link>
              {user ? (
                <Link to="/customers/me">
                  <Button variant="gold" size="lg">
                    <Icon name="bolt" size={16} /> My Workspace
                  </Button>
                </Link>
              ) : (
                <Link to="/signup">
                  <Button variant="gold" size="lg">
                    <Icon name="spark" size={16} /> Get started
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        {[
          { label: 'Customers',       value: loading ? '—' : stats.customers, icon: 'users',     accent: 'aura' },
          { label: 'Active Bookings', value: loading ? '—' : stats.bookings,  icon: 'briefcase', accent: 'gold' },
          { label: 'Categories',      value: '5+',                          icon: 'globe',     accent: 'success' },
          { label: 'Automation Rules', value: '5',                          icon: 'bolt',      accent: 'aura' },
        ].map((s, i) => (
          <div key={s.label} style={{ '--i': i }} className="anim-slide-up">
            <StatTile
              label={s.label}
              value={s.value}
              icon={<Icon name={s.icon} size={18} />}
              accent={accentMap[s.accent]}
            />
          </div>
        ))}
      </div>

      {/* Featured partners */}
      <div>
        <div className="flex items-end justify-between mb-4">
          <div>
            <Badge variant="gold" size="md" className="mb-2">Curated</Badge>
            <h2 className="font-display text-[22px] font-semibold text-platinum-50 tracking-[-0.015em]">Featured Partners</h2>
          </div>
          <Link to="/explore" className="text-[12.5px] text-aura-300 hover:text-aura-200 transition-colors">View all →</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-56 rounded-2xl" />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <Card className="p-10 text-center">
            <div className="mx-auto h-12 w-12 rounded-xl bg-white/[0.04] border border-white/[0.06] grid place-items-center text-platinum-300/60">
              <Icon name="globe" size={22} />
            </div>
            <h3 className="font-display text-[17px] font-semibold text-platinum-50 mt-3">No featured partners yet</h3>
            <p className="text-platinum-300/70 text-[13px] mt-1.5">Once partners register and are featured, they'll show up here.</p>
            <Link to="/explore" className="inline-block mt-4">
              <Button>Browse all vendors</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
            {featured.slice(0, 6).map((v, i) => (
              <div key={v.organizationId} style={{ '--i': i }} className="anim-slide-up">
                <Link to={`/vendors/${v.organizationId}`} className="block group">
                  <Card hover className="overflow-hidden h-full">
                    <div className="relative h-32 bg-gradient-to-br from-aura-700/30 via-aura-500/15 to-gold-300/20 border-b border-white/[0.05]">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.08),transparent_60%)]" />
                      <div className="absolute bottom-3 left-4 h-12 w-12 rounded-xl bg-white text-aura-700 grid place-items-center font-display text-lg font-bold border-2 border-obsidian-500 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                        {v.name?.[0] || '?'}
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="font-display text-[15.5px] font-semibold text-platinum-50 tracking-[-0.005em] truncate group-hover:text-aura-200 transition-colors">
                        {v.name}
                      </div>
                      <div className="text-[12px] text-platinum-300/60 mt-0.5">
                        {v.address?.city || v.city || 'India'}
                        {v.capabilities?.length ? ` · ${v.capabilities[0]}` : ''}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {(v.capabilities || []).slice(0, 3).map((c) => (
                          <Badge key={c} variant="outline" size="sm">{c}</Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
