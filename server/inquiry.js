// Inquiry validation + rate limiting, shared by the local server (server/server.js)
// and the Vercel serverless functions (api/*.js).

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const BUDGETS = ['< €250k', '€250k – 750k', '€750k – 2M', '> €2M', 'Not sure yet'];
const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export function validateInquiry(input) {
  const data = {
    name: clean(input.name, 120),
    email: clean(input.email, 200),
    company: clean(input.company, 160),
    budget: clean(input.budget, 40),
    message: clean(input.message, 4000),
  };
  const errors = {};
  if (data.name.length < 2) errors.name = 'Please tell us your name.';
  if (!EMAIL_RE.test(data.email)) errors.email = 'Please enter a valid email address.';
  if (data.budget && !BUDGETS.includes(data.budget)) errors.budget = 'Please choose a budget range.';
  if (data.message.length < 10) errors.message = 'A few words about the project, please (10+ characters).';
  // Honeypot — real people never fill this.
  if (clean(input.website, 200)) errors.website = 'Rejected.';
  return { data, errors };
}

export function newEntry(data) {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    receivedAt: new Date().toISOString(),
    ...data,
  };
}

// Very small in-memory rate limiter: 5 inquiries / 10 min / IP.
// (On serverless this is per warm instance — a best-effort guard, not a hard limit.)
const hits = new Map();
export function rateLimited(ip, max = 5, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(ip, list);
  return list.length > max;
}
