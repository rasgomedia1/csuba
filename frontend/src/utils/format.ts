// Postgres DECIMAL columns arrive as strings ("1234.00"); null means "unknown".
export const toNumber = (v: unknown): number | null => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

export const formatEur = (v: unknown, fallback = '—'): string => {
  const n = toNumber(v);
  return n === null ? fallback : eur.format(n);
};

export const formatDate = (v: unknown, fallback = '—'): string => {
  if (!v) return fallback;
  const d = new Date(v as string);
  return Number.isNaN(d.getTime()) ? fallback : d.toLocaleDateString('es-ES');
};
