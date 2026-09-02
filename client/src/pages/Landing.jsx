import { Link } from 'react-router-dom';
import { Button, Card, Badge } from '../components/ui';
import Icon from '../components/Icon';

const features = [
  { icon: 'discover', tone: 'aura', title: 'Discover vendors', body: 'Browse curated partners across photography, venues, decor, music, catering, and more — with transparent pricing and reviews.' },
  { icon: 'bolt',    tone: 'gold', title: 'Automate everything', body: 'Inquiries become quotes. Quotes become bookings. State machines, idempotency, and audit trails keep every step accountable.' },
  { icon: 'shield',  tone: 'success', title: 'Enterprise-grade', body: 'Transactional outbox, role-based access, event-driven automation — designed for real money and real events.' },
  { icon: 'money',   tone: 'aura', title: 'Money done right', body: 'All amounts stored as amount_minor + currency. No floats, no surprises, no rounding bugs at payout.' },
  { icon: 'globe',   tone: 'gold', title: 'Customer journey', body: 'Sessions, intent scores, and a real funnel — see what your customers want before they ask.' },
  { icon: 'partner', tone: 'aura', title: 'Built for partners', body: 'A dedicated OS for your vendors: offerings, calendars, and a single inbox across every conversation.' },
];

const toneStyles = {
  aura:    { wrap: 'bg-aura-500/15 text-aura-300 border-aura-500/30', glow: 'group-hover:shadow-aura' },
  gold:    { wrap: 'bg-gold-300/15 text-gold-200 border-gold-300/30',  glow: 'group-hover:shadow-gold' },
  success: { wrap: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', glow: '' },
};

export default function Landing() {
  return (
    <div className="min-h-screen w-full bg-obsidian-500 text-platinum-50 relative overflow-hidden">
      {/* Mesh background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-220px] right-[-120px] h-[640px] w-[640px] rounded-full bg-aura-500/22 blur-3xl anim-mesh-drift" />
        <div className="absolute bottom-[-180px] left-[-140px] h-[520px] w-[520px] rounded-full bg-gold-300/14 blur-3xl anim-mesh-drift" style={{ animationDelay: '-8s' }} />
        <div className="absolute top-1/2 left-1/3 h-[260px] w-[260px] rounded-full bg-aura-700/24 blur-3xl anim-aura-pan" />
      </div>

      {/* Top nav */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5">
        <Link to="/landing" className="flex items-center gap-3 group">
          <div className="relative h-10 w-10 rounded-xl overflow-hidden border border-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-aura-500 via-aura-700 to-gold-500" />
            <div className="absolute inset-0 grid place-items-center text-white font-display text-lg font-bold tracking-[-0.04em]">S</div>
            <div className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] rounded-xl" />
          </div>
          <div>
            <div className="font-display text-[15px] font-semibold tracking-[-0.01em]">StarVnt</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-gold-300/80">Core · Commerce</div>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" size="md">Sign in</Button>
          </Link>
          <Link to="/signup">
            <Button variant="gold" size="md">
              <Icon name="spark" size={14} /> Get started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 px-6 sm:px-10 pt-12 sm:pt-20 pb-16 max-w-6xl mx-auto text-center">
        <Badge variant="aura" size="md" dot className="mx-auto">Premium Event Commerce</Badge>
        <h1 className="font-display text-[44px] sm:text-[68px] leading-[1.02] font-semibold tracking-[-0.03em] mt-5 text-platinum-50">
          Your event.<br />
          <span className="bg-gradient-to-r from-gold-200 via-gold-300 to-gold-200 bg-clip-text text-transparent">Our ecosystem.</span>
        </h1>
        <p className="text-platinum-300/80 text-[16px] sm:text-[18px] leading-relaxed mt-6 max-w-2xl mx-auto">
          Discover verified vendors, send inquiries, receive quotes, confirm bookings — and let automation handle the rest. Built for weddings, conferences, and brand experiences that ship.
        </p>
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/signup">
            <Button variant="gold" size="lg">
              <Icon name="spark" size={16} /> Start planning free
            </Button>
          </Link>
          <Link to="/explore">
            <Button variant="secondary" size="lg">
              <Icon name="discover" size={16} /> Explore vendors
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature grid */}
      <section className="relative z-10 px-6 sm:px-10 pb-20 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {features.map((f, i) => (
            <div key={f.title} style={{ '--i': i }} className="anim-slide-up">
              <Card hover className={cn('p-6 h-full group', toneStyles[f.tone].glow)}>
                <div className={cn(
                  'h-11 w-11 rounded-xl border grid place-items-center mb-4',
                  toneStyles[f.tone].wrap,
                )}>
                  <Icon name={f.icon} size={20} />
                </div>
                <h3 className="font-display text-[17px] font-semibold text-platinum-50 tracking-[-0.01em]">{f.title}</h3>
                <p className="text-platinum-300/75 text-[13.5px] mt-2 leading-relaxed">{f.body}</p>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 px-6 sm:px-10 pb-24 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <Badge variant="gold" size="md" className="mx-auto">How it works</Badge>
          <h2 className="font-display text-[28px] sm:text-[36px] font-semibold tracking-[-0.02em] mt-3 text-platinum-50">From spark to standing ovation in 3 moves</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { n: '01', t: 'Discover', b: 'Browse verified vendors by category, city, and budget. Shortlist the ones you love.' },
            { n: '02', t: 'Inquire & Quote', b: 'Send structured inquiries, receive itemized quotes, and compare in one workspace.' },
            { n: '03', t: 'Book & Automate', b: 'Accept the quote — booking, payment schedules, and reminders handle themselves.' },
          ].map((s, i) => (
            <Card key={s.n} accent className="p-6">
              <div className="text-[11px] uppercase tracking-[0.18em] text-aura-300 font-medium">Step {s.n}</div>
              <h3 className="font-display text-[19px] font-semibold text-platinum-50 mt-2 tracking-[-0.01em]">{s.t}</h3>
              <p className="text-platinum-300/75 text-[13.5px] mt-2 leading-relaxed">{s.b}</p>
            </Card>
          ))}
        </div>
      </section>

      <footer className="relative z-10 px-6 sm:px-10 py-8 text-center text-[12px] text-platinum-300/55 border-t border-white/[0.05]">
        © {new Date().getFullYear()} StarVnt Entertainment · Crafted with care
      </footer>
    </div>
  );
}

// Local cn() import to keep file self-contained
function cn(...a) { return a.filter(Boolean).join(' '); }
