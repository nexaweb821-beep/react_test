// Vercel function: POST /api/inquiries
//
// Vercel's filesystem is read-only/ephemeral, so enquiries are NOT written to
// server/data/inquiries.json here. Instead each valid enquiry is:
//   1. logged (visible under the project's Logs tab in Vercel), and
//   2. forwarded as JSON to INQUIRY_WEBHOOK_URL if that env var is set
//      (Slack/Discord incoming webhook, Zapier, Make, your CRM, …).
import { validateInquiry, rateLimited, newEntry } from '../server/inquiry.js';

async function forward(entry) {
  const url = process.env.INQUIRY_WEBHOOK_URL;
  if (!url) return;
  const text = `New project enquiry from ${entry.name} <${entry.email}>${entry.budget ? ` · ${entry.budget}` : ''}\n${entry.message}`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // `text` makes Slack/Discord-style webhooks render nicely; the rest is for Zapier/CRMs.
    body: JSON.stringify({ text, content: text, ...entry }),
  });
  if (!r.ok) throw new Error(`Webhook responded ${r.status}`);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!String(req.headers['content-type'] || '').includes('application/json')) {
    return res.status(415).json({ error: 'Expected application/json' });
  }

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) return res.status(429).json({ error: 'Too many requests — please try again later.' });

  const input = req.body && typeof req.body === 'object' ? req.body : null;
  if (!input) return res.status(400).json({ error: 'Invalid JSON.' });

  const { data, errors } = validateInquiry(input);
  if (Object.keys(errors).length) return res.status(422).json({ error: 'Please check the form.', fields: errors });

  const entry = newEntry(data);
  console.log('[inquiry]', JSON.stringify(entry));

  try {
    await forward(entry);
  } catch (err) {
    console.error('[inquiry] webhook failed:', err);
    return res.status(502).json({ error: 'We could not deliver your message. Please email us instead.' });
  }
  return res.status(201).json({ ok: true, id: entry.id });
}
