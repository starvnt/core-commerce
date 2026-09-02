// Lightweight class-name combiner. Replaces clsx/classnames without a dep.
// Accepts strings, arrays, objects (truthy keys are included), and falsy values.
export function cn(...inputs) {
  const out = [];
  for (const v of inputs) {
    if (!v) continue;
    if (typeof v === 'string' || typeof v === 'number') {
      out.push(String(v));
    } else if (Array.isArray(v)) {
      const sub = cn(...v);
      if (sub) out.push(sub);
    } else if (typeof v === 'object') {
      for (const k of Object.keys(v)) if (v[k]) out.push(k);
    }
  }
  return out.join(' ');
}
