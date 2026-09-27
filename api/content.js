// Vercel function: GET /api/content
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const content = require('../server/data/content.json');

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
  return res.status(200).json(content);
}
