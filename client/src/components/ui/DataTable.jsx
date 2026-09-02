import { cn } from '../../services/cn';

// columns: [{ key, label, render?(row), align?: 'left'|'right', width?: string, className? }]
// rows: array of objects
export function DataTable({ columns, rows, empty, onRowClick, className }) {
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-white/[0.06]', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10.5px] uppercase tracking-[0.14em] text-platinum-300/60 bg-white/[0.02]">
              {columns.map((c) => (
                <th
                  key={c.key}
                  style={c.width ? { width: c.width } : undefined}
                  className={cn(
                    'px-5 py-3 font-medium',
                    c.align === 'right' && 'text-right',
                  )}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center text-platinum-300/60">
                  {empty || 'No records yet'}
                </td>
              </tr>
            ) : rows.map((row, i) => (
              <tr
                key={row.id || row._id || i}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'border-t border-white/[0.04] transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-aura-500/[0.06]',
                )}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={cn(
                      'px-5 py-3.5 align-middle text-platinum-100',
                      c.align === 'right' && 'text-right tabular-nums',
                      c.className,
                    )}
                  >
                    {c.render ? c.render(row) : (row[c.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
