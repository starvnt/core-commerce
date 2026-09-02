import { cn } from '../../services/cn';

export function Separator({ className, vertical = false }) {
  return (
    <div
      role="separator"
      className={cn(
        vertical ? 'w-px h-6' : 'h-px w-full',
        'bg-gradient-to-r from-transparent via-white/10 to-transparent',
        vertical && 'bg-gradient-to-b from-transparent via-white/10 to-transparent',
        className,
      )}
    />
  );
}
