<div align="center">

# 👻 GhostRelay

### Privacy-focused email aliasing on Cloudflare's free tier

Generate disposable email aliases that forward to your real inbox — protect your identity from spam, breaches, and data sellers.

**[🌐 Live Demo](https://www.ghostrelay.me)** · **[📖 Docs](./CONTEXT.md)** · **[🤝 Contributing](./CONTRIBUTING.md)**

<br/>

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](./CONTRIBUTING.md)
[![Cost](https://img.shields.io/badge/hosting-%240%2Fmonth-success?style=flat-square)](#tech-stack)

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)

</div>

---

## What It Does

1. You sign up with your real email (stored securely, never exposed)
2. Generate random aliases like `a7x9k2m@ghostrelay.me`
3. Use aliases anywhere — newsletters, signups, online shopping
4. All emails forward to your real inbox instantly
5. Getting spam? Disable the alias with one click

---

## Tech Stack

| Layer | Technology | Cost |
|-------|-----------|------|
| Frontend | Next.js 16 + React 19 + Tailwind v4 | Free (Vercel) |
| Backend | Cloudflare Worker (ES modules) | Free tier |
| Database | Cloudflare D1 (SQLite at the edge) | Free tier |
| Email Routing | Cloudflare Email Routing | Free |
| Email Sending | Resend (SPF/DKIM/DMARC) | Free tier |
| Domain | ghostrelay.me | ~$10/year |

**Total running cost: $0/month** (excluding the domain)

---

## Features

- **Alias management** — Create, label, enable/disable, delete
- **Wildcard aliases** — Patterns like `*-shopping` auto-create tracked aliases
- **Multiple destinations** — Forward one alias to up to 5 inboxes
- **Temporary aliases** — Auto-expire after N days or N emails
- **Activity logs** — See who emailed which alias and when
- **Analytics dashboard** — Forwarding trends, top senders, bounce rates
- **Sender blocklist** — Block specific senders across all aliases
- **Bounce tracking** — Resend webhook integration for delivery monitoring
- **Browser extension** — One-click alias generation, auto-fill on signup forms
- **PWA** — Offline support, push notifications on new forwards
- **Rate limiting** — Per-endpoint protection against abuse
- **Security hardened** — CORS, security headers, encrypted auth tokens

---

## Architecture

```
Browser / Extension
       │
       ▼  REST API (HTTPS)
┌─────────────────────┐
│  Cloudflare Worker   │◄── Email Routing (catch-all)
│  - Auth (HMAC)       │
│  - Alias CRUD        │
│  - Email forwarding  │
│  - Webhooks          │
└────────┬────────────┘
         │ D1 Binding
         ▼
┌─────────────────────┐
│  Cloudflare D1       │
│  (SQLite at edge)    │
└─────────────────────┘
```

---

## Running Locally

```bash
# Clone
git clone https://github.com/Tech-aficionado/GhostRelay---Open-Source.git
cd GhostRelay---Open-Source

# Frontend
cd frontend
npm install
npm run dev          # → http://localhost:3000

# Backend
cd worker
npm install
npx wrangler d1 execute ghostrelay-db --local --file=../database/schema.sql
npx wrangler dev    # → http://localhost:8787
```

The frontend works in demo mode (localStorage) if no backend is available.

---

## Deployment

```bash
# Worker
cd worker
# Set your own domain and org inbox in wrangler.toml [vars]:
#   EMAIL_DOMAIN, ORG_FORWARD_TO
npx wrangler secret put JWT_SECRET
npx wrangler secret put RESEND_API_KEY
npx wrangler deploy

# Frontend
cd frontend
npx vercel --prod
# Set NEXT_PUBLIC_API_URL in Vercel project settings
```

---

## Project Structure

```
├── frontend/          Next.js 16 app (TypeScript)
├── worker/            Cloudflare Worker backend
├── database/          SQL schemas and migrations
├── extension/         Browser extension (Chrome/Edge/Firefox)
└── docs/              Setup guides (SPF/DKIM, advanced features)
```

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for
setup instructions, project layout, and the pull request workflow. Never commit
secrets — use `.env.example` files to document new environment variables.

## License

Released under the [MIT License](./LICENSE).
