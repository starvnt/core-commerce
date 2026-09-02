import { useEffect, useRef } from 'react';
import { cn } from '../../services/cn';

export function Dialog({ open, onClose, title, description, children, footer, size = 'md' }) {
  const ref = useRef(null);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (open && !dlg.open) dlg.showModal();
    if (!open && dlg.open) dlg.close();
  }, [open]);

  useEffect(() => {
    function onCancel(e) {
      e.preventDefault();
      onClose?.();
    }
    const dlg = ref.current;
    if (!dlg) return;
    dlg.addEventListener('cancel', onCancel);
    return () => dlg.removeEventListener('cancel', onCancel);
  }, [onClose]);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <dialog
      ref={ref}
      className={cn(
        'p-0 m-auto rounded-2xl border border-white/[0.08]',
        'bg-gradient-to-b from-[rgba(20,24,35,0.96)] to-[rgba(11,14,21,0.98)]',
        'text-platinum-50 backdrop:bg-black/60 backdrop:backdrop-blur-sm',
        'shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]',
        sizes[size],
        'w-[92vw]',
      )}
    >
      <div className="px-6 pt-5 pb-2">
        {title && <h2 className="font-display text-lg font-semibold tracking-[-0.01em]">{title}</h2>}
        {description && <p className="text-[13px] text-platinum-300/70 mt-1">{description}</p>}
      </div>
      <div className="px-6 py-3">{children}</div>
      {footer && (
        <div className="px-6 pb-5 pt-3 flex items-center justify-end gap-2 border-t border-white/[0.05]">
          {footer}
        </div>
      )}
    </dialog>
  );
}
