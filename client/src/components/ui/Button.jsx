import { forwardRef } from 'react';
import { cn } from '../../services/cn';

const variants = {
  default: 'bg-gradient-to-b from-aura-500 to-aura-600 text-white shadow-[0_8px_24px_-8px_rgba(42,120,245,0.55)] hover:from-aura-400 hover:to-aura-500 focus-visible:ring-aura-400/60',
  secondary: 'bg-white/[0.04] text-platinum-50 border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.14] focus-visible:ring-platinum-300/40',
  outline: 'bg-transparent text-platinum-100 border border-line hover:border-aura-500/60 hover:text-platinum-50 focus-visible:ring-aura-400/50',
  ghost: 'bg-transparent text-platinum-200 hover:bg-white/[0.04] hover:text-platinum-50 focus-visible:ring-platinum-300/30',
  gold: 'bg-gradient-to-b from-gold-300 to-gold-500 text-obsidian-500 shadow-[0_8px_24px_-8px_rgba(212,168,71,0.55)] hover:from-gold-200 hover:to-gold-400 focus-visible:ring-gold-300/60',
  danger: 'bg-gradient-to-b from-rose-500 to-rose-700 text-white hover:from-rose-400 hover:to-rose-600 focus-visible:ring-rose-400/50',
  success: 'bg-gradient-to-b from-emerald-500 to-emerald-700 text-white hover:from-emerald-400 hover:to-emerald-600 focus-visible:ring-emerald-400/50',
};

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-[15px] gap-2 rounded-xl',
  icon: 'h-10 w-10 rounded-xl',
};

export const Button = forwardRef(function Button(
  { variant = 'default', size = 'md', className, type = 'button', loading = false, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium tracking-[-0.005em] transition-all duration-150 select-none whitespace-nowrap',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian-500',
        'disabled:opacity-50 disabled:pointer-events-none',
        'active:scale-[0.985]',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          <span>Working…</span>
        </span>
      ) : children}
    </button>
  );
});
