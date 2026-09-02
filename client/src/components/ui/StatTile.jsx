import { Card } from './Card';
import { cn } from '../../services/cn';

export function StatTile({ label, value, icon, accent = 'aura', delta, className }) {
  const accents = {
    aura:    'from-aura-500/20 to-aura-700/0  text-aura-300',
    gold:    'from-gold-300/20 to-gold-500/0  text-gold-200',
    emerald: 'from-emerald-500/20 to-emerald-700/0 text-emerald-300',
    rose:    'from-rose-500/20 to-rose-700/0 text-rose-300',
  };
  return (
    <Card hover accent className={cn('overflow-hidden p-5', className)}>
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-40 pointer-events-none', accents[accent])} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-[10.5px] uppercase tracking-[0.16em] text-platinum-300/70 font-medium">{label}</div>
          <div className="font-display text-[28px] font-semibold text-platinum-50 mt-1.5 tabular-nums tracking-[-0.02em]">{value}</div>
          {delta && <div className="text-[11px] text-platinum-300/60 mt-1">{delta}</div>}
        </div>
        {icon && (
          <div className={cn(
            'h-10 w-10 rounded-xl grid place-items-center border border-white/[0.06] bg-white/[0.04]',
            accents[accent].split(' ').pop(),
          )}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
