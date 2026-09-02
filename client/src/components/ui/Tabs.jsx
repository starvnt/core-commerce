import { createContext, useContext, useState } from 'react';
import { cn } from '../../services/cn';

const TabsCtx = createContext(null);

export function Tabs({ value, defaultValue, onValueChange, children, className }) {
  const [internal, setInternal] = useState(defaultValue);
  const v = value ?? internal;
  const set = onValueChange ?? setInternal;
  return (
    <TabsCtx.Provider value={{ value: v, set }}>
      <div className={className}>{children}</div>
    </TabsCtx.Provider>
  );
}

export function TabsList({ className, children }) {
  return (
    <div className={cn(
      'inline-flex items-center gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur',
      className,
    )}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className, icon }) {
  const ctx = useContext(TabsCtx);
  const active = ctx.value === value;
  return (
    <button
      type="button"
      onClick={() => ctx.set(value)}
      className={cn(
        'relative inline-flex items-center gap-2 px-3.5 h-9 rounded-xl text-[12.5px] font-medium transition-all duration-200',
        active
          ? 'bg-gradient-to-b from-aura-500 to-aura-600 text-white shadow-[0_4px_16px_-4px_rgba(42,120,245,0.6)]'
          : 'text-platinum-300/80 hover:text-platinum-50 hover:bg-white/[0.04]',
        className,
      )}
    >
      {icon}
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className }) {
  const ctx = useContext(TabsCtx);
  if (ctx.value !== value) return null;
  return (
    <div className={cn('anim-fade-in mt-6', className)}>
      {children}
    </div>
  );
}
