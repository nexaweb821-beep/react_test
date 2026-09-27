# Oriel — editorial one-page site

React (Vite) frontend + zero-dependency Node backend. GSAP 3.13 + ScrollTrigger, Lenis 1.3.

## Run

```bash
npm install
npm run dev      # Vite on :5173 (proxies /api) + Node API on :3001
npm run build    # builds client/dist
npm start        # Node serves client/dist + API on :5173 (PORT env or --port to change)
```

## Structure

```
client/
  index.html              curtain markup, pre-paint .motion script (3.5s safety), fonts
  src/App.jsx             loads content, section theme switching, mounts motion
  src/lib/motion.js       Lenis + GSAP: intro/curtain transitions, pins, reveals, magnetic
  src/lib/content.js      /api/content fetch (falls back to bundled JSON), image URLs, inquiry POST
  src/components/         one component per section + ui.jsx primitives
  src/styles/style.css    tokens, type scale, layout, all section styles, breakpoints
server/
  server.js               GET /api/content, POST /api/inquiries, GET /api/health, static + SPA
  data/content.json       ALL site copy and images — edit this to rebrand
  data/inquiries.json     created on first enquiry (git-ignored)
```

## Deploy to Vercel

`vercel.json` builds the client (`npm run build` → `client/dist`) and the `api/` folder
becomes serverless functions (`/api/content`, `/api/health`, `/api/inquiries`).
`server/server.js` is only for local use.

- CLI: `npx vercel` (preview) → `npx vercel --prod`.
- Or push to GitHub and import the repo at vercel.com/new (no settings to change).
- Enquiries: Vercel can't write files, so they're logged (Vercel → Logs) and, if
  `INQUIRY_WEBHOOK_URL` is set in Project → Settings → Environment Variables, POSTed there.

## Debug flags

- `?nosmooth` — disable Lenis (native scroll).
- `?motion` — force animations on even when the OS asks for reduced motion.

## Notes

- Reduced motion: GSAP and Lenis never start; all content renders statically.
- Pinned sections: the expanding image (all widths) and the horizontal work track (> 900px).
- Images are Unsplash placeholders; swap the ids in `content.json` for real photography.
