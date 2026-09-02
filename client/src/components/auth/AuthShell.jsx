import { Link } from 'react-router-dom';
import { Badge } from '../ui';

export function AuthShell({ children, panel }) {
  return (
    <div className="min-h-screen w-full grid lg:grid-cols-[1.05fr_1fr] bg-obsidian-500 text-platinum-50">
      {/* Left brand panel — hidden on small screens */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden border-r border-white/[0.05]">
        {/* Gradient mesh */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full bg-aura-500/30 blur-3xl anim-mesh-drift" />
          <div className="absolute bottom-[-120px] right-[-80px] h-[480px] w-[480px] rounded-full bg-gold-300/20 blur-3xl anim-mesh-drift" style={{ animationDelay: '-8s' }} />
          <div className="absolute top-1/3 left-1/3 h-[280px] w-[280px] rounded-full bg-aura-700/30 blur-3xl anim-aura-pan" />
        </div>

        <Link to="/landing" className="relative flex items-center gap-3 group w-fit">
          <div className="relative h-11 w-11 rounded-xl overflow-hidden border border-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-aura-500 via-aura-700 to-gold-500" />
            <div className="absolute inset-0 grid place-items-center text-white font-display text-xl font-bold tracking-[-0.04em]">S</div>
            <div className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] rounded-xl" />
          </div>
          <div>
            <div className="font-display text-[17px] font-semibold tracking-[-0.01em]">StarVnt</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-gold-300/80">Core · Commerce</div>
          </div>
        </Link>

        <div className="relative">
          <Badge variant="aura" size="md" dot>Premium Event Commerce</Badge>
          <h1 className="font-display text-[44px] leading-[1.05] font-semibold tracking-[-0.025em] mt-4 text-platinum-50">
            Run your event<br />
            like a <span className="bg-gradient-to-r from-gold-200 via-gold-300 to-gold-200 bg-clip-text text-transparent">product launch</span>.
          </h1>
          <p className="text-platinum-300/80 text-[15px] leading-relaxed mt-4 max-w-md">
            Discover verified vendors, send inquiries, receive quotes, confirm bookings — and let automation handle the rest.
          </p>

          {/* Mock preview card */}
          <div className="mt-8 max-w-md rounded-2xl border border-white/[0.07] bg-[rgba(11,14,21,0.6)] backdrop-blur-xl p-5 anim-slide-up">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-platinum-300/60">
              <span>Live quote</span>
              <span className="text-emerald-400">● Synced</span>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <div className="font-display text-[28px] font-semibold tabular-nums">₹2,70,000</div>
              <span className="text-[11px] text-platinum-300/60">+ 2 line items</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[10.5px]">
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5">
                <div className="text-platinum-300/50">Inquiries</div>
                <div className="text-platinum-50 font-semibold">12</div>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5">
                <div className="text-platinum-300/50">Quotes</div>
                <div className="text-platinum-50 font-semibold">4</div>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5">
                <div className="text-platinum-300/50">Bookings</div>
                <div className="text-emerald-300 font-semibold">2</div>
              </div>
            </div>
          </div>

          {panel}
        </div>

        <div className="relative flex items-center gap-6 text-[12px] text-platinum-300/60">
          <span>© {new Date().getFullYear()} StarVnt Entertainment</span>
          <span>·</span>
          <span>Crafted with care in Kolkata</span>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md anim-slide-up">
          {children}
        </div>
      </div>
    </div>
  );
}
