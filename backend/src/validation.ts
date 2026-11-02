// Small input-validation helpers shared by the routes.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const isUuid = (v: unknown): v is string => typeof v === 'string' && UUID_RE.test(v);
export const isEmail = (v: unknown): v is string => typeof v === 'string' && v.length <= 255 && EMAIL_RE.test(v);

// Parses an optional numeric query/body value. Returns undefined when absent,
// throws 400 when present but not a finite number within [min, max].
export function optNumber(v: unknown, name: string, min = 0, max = Number.MAX_SAFE_INTEGER): number | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  const n = Number(v);
  if (!Number.isFinite(n) || n < min || n > max) {
    throw new HttpError(400, `Invalid ${name}`);
  }
  return n;
}

export function optString(v: unknown, maxLen = 200): string | undefined {
  if (typeof v !== 'string') return undefined;
  const s = v.trim();
  return s ? s.slice(0, maxLen) : undefined;
}

export const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);
