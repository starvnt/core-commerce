import { cn } from '../../services/cn';

const variants = {
  default: 'bg-white/[0.05] text-platinum-100 border-white/[0.07]',
  aura:    'bg-aura-500/15 text-aura-200 border-aura-500/30',
  gold:    'bg-gold-300/15 text-gold-200 border-gold-300/30',
  success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  danger:  'bg-rose-500/15 text-rose-300 border-rose-500/30',
  outline: 'bg-transparent text-platinum-200 border-white/[0.10]',
};

const sizes = {
  sm: 'text-[10px] px-1.5 py-0.5 gap-1',
  md: 'text-[11px] px-2 py-0.5 gap-1.5',
  lg: 'text-[12px] px-2.5 py-1 gap-2',
};

export function Badge({ variant = 'default', size = 'md', dot = false, className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium uppercase tracking-[0.08em]',
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {dot && (
        <span className={cn(
          'h-1.5 w-1.5 rounded-full anim-pulse-soft',
          variant === 'success' && 'bg-emerald-400',
          variant === 'warning' && 'bg-amber-400',
          variant === 'danger' && 'bg-rose-400',
          variant === 'aura' && 'bg-aura-400',
          variant === 'gold' && 'bg-gold-300',
          (!variant || variant === 'default' || variant === 'outline') && 'bg-platinum-200',
        )} />
      )}
      {children}
    </span>
  );
}
