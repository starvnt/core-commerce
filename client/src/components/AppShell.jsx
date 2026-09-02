import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button, Badge, Input, Avatar, Separator, Card, ToastStack } from './ui';
import Icon from './Icon';
import { useAuth, logout, isAdmin, isPartner, isCustomer } from '../services/auth';
import { cn } from '../services/cn';
import api from '../services/api';

const ICON_PROPS = { strokeWidth: 1.6, width: 18, height: 18 };

function NavItem({ to, icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 px-3 h-10 rounded-xl text-[13px] font-medium transition-all duration-200',
          isActive
            ? 'text-platinum-50 bg-gradient-to-r from-aura-500/20 via-aura-500/10 to-transparent'
            : 'text-platinum-300/80 hover:text-platinum-50 hover:bg-white/[0.04]',
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-gradient-to-b from-aura-300 to-aura-600" />
          )}
          <Icon name={icon} {...ICON_PROPS} className={cn('transition-colors', isActive ? 'text-aura-300' : 'text-platinum-300/60 group-hover:text-platinum-100')} />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}

function Topbar({ user }) {
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [q, setQ] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { data } = await api.get('/notifications/unread-count');
        if (mounted) setUnread(data.data?.count || 0);
      } catch { /* not logged in */ }
    };
    if (user) load();
    const id = setInterval(load, 30000);
    return () => { mounted = false; clearInterval(id); };
  }, [user]);

  return (
    <header className="sticky top-0 z-30 h-16 px-7 flex items-center gap-5 border-b border-white/[0.05] bg-[rgba(6,7,11,0.72)] backdrop-blur-xl backdrop-saturate-[140%]">
      <form
        className="flex-1 max-w-xl"
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
        }}
      >
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search customers, vendors, bookings…"
          leftIcon={<Icon name="search" size={16} />}
        />
      </form>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/notifications')}
          aria-label="Notifications"
          className="relative"
        >
          <Icon name="bell" size={18} />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-aura-500 text-[10px] font-semibold text-white grid place-items-center ring-2 ring-obsidian-500">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Button>
        {user ? (
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2.5 pl-1 pr-3 h-10 rounded-xl border border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.04] transition-colors"
          >
            <Avatar name={user.name} size="sm" />
            <div className="text-left hidden md:block">
              <div className="text-[12.5px] font-medium text-platinum-50 leading-tight">{user.name}</div>
              <div className="text-[10.5px] uppercase tracking-[0.12em] text-platinum-300/60 leading-tight">{user.role}</div>
            </div>
          </button>
        ) : (
          <Button asChild={false} onClick={() => navigate('/login')}>Sign in</Button>
        )}
      </div>
    </header>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-3 px-2 py-2 group">
      <div className="relative h-10 w-10 rounded-xl overflow-hidden border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-aura-500 via-aura-700 to-gold-500" />
        <div className="absolute inset-0 grid place-items-center text-white font-display text-lg font-bold tracking-[-0.04em]">S</div>
        <div className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] rounded-xl" />
      </div>
      <div className="min-w-0">
        <div className="font-display text-[15px] font-semibold tracking-[-0.01em] text-platinum-50 leading-tight group-hover:text-platinum-50">StarVnt</div>
        <div className="text-[10px] uppercase tracking-[0.16em] text-gold-300/80 leading-tight">Core · Commerce</div>
      </div>
    </Link>
  );
}

function NavSection({ title, children }) {
  return (
    <div className="px-1.5 mt-5">
      <div className="px-3 mb-2 text-[10px] uppercase tracking-[0.18em] text-platinum-300/45 font-medium">{title}</div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

export default function AppShell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/landing';

  function onLogout() {
    logout();
    navigate('/login');
  }

  // Auth + landing pages render their own full-bleed layout; skip the chrome.
  if (isAuthRoute) {
    return (
      <div className="min-h-screen text-platinum-50">
        <ToastStack />
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-platinum-50">
      <ToastStack />
      <div className="grid grid-cols-[260px_1fr] min-h-screen">
        <aside className="sticky top-0 h-screen flex flex-col gap-1 px-4 py-4 border-r border-white/[0.06] bg-[rgba(8,10,16,0.78)] backdrop-blur-xl">
          <Brand />
          <Separator className="my-3" />

          <div className="flex-1 overflow-y-auto pr-1 -mr-1">
            <NavSection title="Discover">
              <NavItem to="/" icon="home" label="Home" end />
              <NavItem to="/explore" icon="discover" label="Explore Vendors" />
              <NavItem to="/search" icon="search" label="Search" />
            </NavSection>

            {isCustomer(user) && (
              <NavSection title="My Event">
                <NavItem to="/customers/me" icon="user" label="My Profile" />
                <NavItem to="/customers/me" icon="briefcase" label="My Workspace" />
                <NavItem to="/inquiries" icon="inbox" label="Inquiries" />
                <NavItem to="/quotes" icon="doc" label="Quotes" />
                <NavItem to="/bookings" icon="briefcase" label="Bookings" />
                <NavItem to="/notifications" icon="bell" label="Notifications" />
              </NavSection>
            )}

            {(isAdmin(user) || isPartner(user)) && (
              <NavSection title="Operations">
                <NavItem to="/admin" icon="shield" label="Cockpit" end />
                {isAdmin(user) && <NavItem to="/admin/customers" icon="users" label="Customers" />}
                {isAdmin(user) && <NavItem to="/admin/inquiries" icon="inbox" label="Inquiries" />}
                {isAdmin(user) && <NavItem to="/admin/quotes" icon="doc" label="Quotes" />}
                {isAdmin(user) && <NavItem to="/admin/bookings" icon="briefcase" label="Bookings" />}
                {isAdmin(user) && <NavItem to="/admin/payments" icon="money" label="Payments" />}
                {isAdmin(user) && <NavItem to="/admin/outbox" icon="zap" label="Outbox" />}
                {isAdmin(user) && <NavItem to="/admin/automation" icon="bolt" label="Automation" />}
                {isAdmin(user) && <NavItem to="/admin/organizations" icon="partner" label="Organizations" />}
                {isAdmin(user) && <NavItem to="/admin/analytics" icon="globe" label="Analytics" />}
                {isAdmin(user) && <NavItem to="/admin/audit" icon="shield" label="Audit Log" />}
              </NavSection>
            )}

            <NavSection title="Account">
              <NavItem to="/notifications" icon="bell" label="Notifications" />
              {user && <NavItem to="/profile" icon="cog" label="Settings" />}
            </NavSection>
          </div>

          {user && (
            <Card className="mt-2 p-3 flex items-center gap-2.5">
              <Avatar name={user.name} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] font-medium text-platinum-50 truncate">{user.name}</div>
                <Badge size="sm" variant="aura" className="mt-1">{user.role}</Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={onLogout} title="Sign out">
                <Icon name="logout" size={16} />
              </Button>
            </Card>
          )}
        </aside>

        <div className="flex flex-col min-h-screen">
          <Topbar user={user} />
          <main className="flex-1 px-8 py-7 max-w-[1400px] w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

