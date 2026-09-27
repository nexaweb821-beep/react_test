// Content comes from the Node API. The same JSON is bundled as a fallback so the
// site still renders if the API is unreachable (e.g. static hosting).
import fallback from '../../../server/data/content.json';

export async function loadContent(timeoutMs = 2500) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch('/api/content', { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return fallback;
  } finally {
    clearTimeout(timer);
  }
}

/** Unsplash image URL at a given width. */
export function img(id, w = 1600, q = 80) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=${q}`;
}

export function srcSet(id, widths = [640, 960, 1400, 2000]) {
  return widths.map((w) => `${img(id, w)} ${w}w`).join(', ');
}

export async function submitInquiry(payload) {
  const res = await fetch('/api/inquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(body.error || 'Something went wrong.'), { fields: body.fields || {} });
  return body;
}
