import { forwardRef } from 'react';
import { cn } from '../../services/cn';

export const Card = forwardRef(function Card({ className, accent = false, hover = false, children, ...rest }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        'relative rounded-2xl border border-white/[0.06]',
        'bg-gradient-to-b from-[rgba(20,24,35,0.78)] to-[rgba(11,14,21,0.88)]',
        'backdrop-blur-xl backdrop-saturate-[140%]',
        'shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.04)]',
        hover && 'transition-all duration-200 hover:-translate-y-0.5 hover:border-aura-500/40 hover:shadow-aura',
        accent && 'before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-aura-500/70 before:to-transparent before:rounded-t-2xl',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});

export function CardHeader({ className, children, ...rest }) {
  return <div className={cn('px-6 pt-6 pb-2', className)} {...rest}>{children}</div>;
}

export function CardTitle({ className, children, eyebrow, ...rest }) {
  return (
    <div className={cn('flex items-center justify-between gap-4', className)} {...rest}>
      <div className="min-w-0">
        {eyebrow && (
          <div className="text-[10.5px] uppercase tracking-[0.18em] text-aura-300 font-medium mb-1">{eyebrow}</div>
        )}
        <h3 className="font-display text-[17px] font-semibold text-platinum-50 tracking-[-0.01em] truncate">{children}</h3>
      </div>
    </div>
  );
}

export function CardDescription({ className, children }) {
  return <p className={cn('text-[13px] text-platinum-300/80 mt-1.5', className)}>{children}</p>;
}

export function CardContent({ className, children, ...rest }) {
  return <div className={cn('px-6 py-4', className)} {...rest}>{children}</div>;
}

export function CardFooter({ className, children }) {
  return <div className={cn('px-6 pb-6 pt-3 flex items-center gap-2', className)}>{children}</div>;
}
