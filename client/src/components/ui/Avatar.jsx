import { cn } from '../../services/cn';
import { initialsOf } from '../../services/format';

const sizes = {
  xs: 'h-7 w-7 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

export function Avatar({ name = '', size = 'md', className }) {
  const initials = initialsOf(name || '?');
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold tracking-[-0.01em]',
        'bg-gradient-to-br from-aura-500/40 via-aura-700/30 to-gold-500/40 text-platinum-50',
        'border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
        sizes[size],
        className,
      )}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
