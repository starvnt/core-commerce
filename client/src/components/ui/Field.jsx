import { forwardRef, useId } from 'react';
import { cn } from '../../services/cn';

export const Label = forwardRef(function Label({ className, children, ...rest }, ref) {
  return (
    <label
      ref={ref}
      className={cn(
        'text-[11.5px] uppercase tracking-[0.14em] font-medium text-platinum-300/80',
        className,
      )}
      {...rest}
    >
      {children}
    </label>
  );
});

export const Input = forwardRef(function Input(
  { className, type = 'text', invalid = false, leftIcon, rightSlot, ...rest },
  ref,
) {
  return (
    <div className={cn('relative flex items-center', leftIcon && 'pl-10')}>
      {leftIcon && (
        <span className="pointer-events-none absolute left-3.5 text-platinum-300/60">
          {leftIcon}
        </span>
      )}
      <input
        ref={ref}
        type={type}
        className={cn(
          'w-full h-11 px-3.5 rounded-xl bg-white/[0.03] text-platinum-50',
          'border border-white/[0.07] placeholder:text-platinum-300/40',
          'transition-all duration-150',
          'focus:outline-none focus:border-aura-500/60 focus:bg-white/[0.05] focus:shadow-[0_0_0_4px_rgba(42,120,245,0.12)]',
          'disabled:opacity-50 disabled:pointer-events-none',
          invalid && 'border-rose-500/60 focus:border-rose-500/70 focus:shadow-[0_0_0_4px_rgba(244,63,94,0.12)]',
          className,
        )}
        {...rest}
      />
      {rightSlot && <span className="absolute right-2 flex items-center">{rightSlot}</span>}
    </div>
  );
});

export function Field({ label, hint, error, required, leftIcon, rightSlot, children, className }) {
  const id = useId();
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-aura-400 ml-1">*</span>}
        </Label>
      )}
      <div className="relative">
        <Input
          id={id}
          invalid={!!error}
          leftIcon={leftIcon}
          rightSlot={rightSlot}
          {...(typeof children === 'object' ? {} : {})}
        />
        {typeof children !== 'object' && children}
      </div>
      {error
        ? <p className="text-[11.5px] text-rose-400">{error}</p>
        : hint && <p className="text-[11.5px] text-platinum-300/60">{hint}</p>}
    </div>
  );
}
