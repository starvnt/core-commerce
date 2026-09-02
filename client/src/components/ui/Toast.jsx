import { useEffect, useState } from 'react';
import { cn } from '../../services/cn';

let _listeners = new Set();
let _nextId = 1;
let _queue = [];

function emit() {
  for (const l of _listeners) l(_queue);
}

export function toast(opts) {
  const id = _nextId++;
  const t = {
    id,
    title: opts.title || '',
    description: opts.description || '',
    variant: opts.variant || 'default',
    duration: opts.duration ?? 3500,
  };
  _queue = [..._queue, t];
  emit();
  setTimeout(() => {
    _queue = _queue.filter((x) => x.id !== id);
    emit();
  }, t.duration);
}

export function useToasts() {
  const [items, setItems] = useState(_queue);
  useEffect(() => {
    _listeners.add(setItems);
    return () => _listeners.delete(setItems);
  }, []);
  return items;
}

const tones = {
  default: 'border-white/[0.08] bg-[rgba(20,24,35,0.95)] text-platinum-50',
  success: 'border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-100',
  warning: 'border-amber-500/30 bg-amber-500/[0.08] text-amber-100',
  danger:  'border-rose-500/30 bg-rose-500/[0.08] text-rose-100',
  aura:    'border-aura-500/40 bg-aura-500/[0.10] text-aura-100',
};

export function ToastStack() {
  const items = useToasts();
  return (
    <div className="toast-stack">
      {items.map((t) => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto min-w-[260px] max-w-sm rounded-xl border px-4 py-3 shadow-glass',
            'backdrop-blur-xl anim-slide-up',
            tones[t.variant] || tones.default,
          )}
        >
          {t.title && <div className="text-[13px] font-semibold tracking-[-0.005em]">{t.title}</div>}
          {t.description && <div className="text-[12px] opacity-80 mt-0.5">{t.description}</div>}
        </div>
      ))}
    </div>
  );
}
