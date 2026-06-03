# GhostRelay 👻

A privacy-focused email aliasing service that generates masked email addresses to protect your real inbox. Your emails pass through like a ghost — invisible to the world.

## How It Works

1. **Sign up** with your real email address
2. **Generate ghost aliases** (e.g., `xk7r9m@ghostrelay.me`)
3. **Use aliases** when signing up for services, newsletters, etc.
4. **Emails forwarded** to your real inbox transparently
5. **Vanish anytime** — disable an alias and it disappears like a ghost

## Tech Stack

| Component | Technology | Cost |
|-----------|-----------|------|
| Frontend | Next.js 16 + TypeScript + Tailwind CSS | Free (Vercel / Cloudflare Pages) |
| Backend API | Cloudflare Workers | Free tier |
| Database | Cloudflare D1 (SQLite) | Free tier |
| Email Routing | Cloudflare Email Routing | Free |
| Domain | Your own domain | ~$10/year |

## Project Structure

```
GhostRelay/
├── frontend/                     # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx        # Root layout (ghost dark theme)
│   │   │   ├── globals.css       # Global styles + ghost color scheme
│   │   │   ├── page.tsx          # Landing page
│   │   │   └── dashboard/
│   │   │       └── page.tsx      # Dashboard (auth + alias management)
│   │   └── components/
│   │       ├── Navbar.tsx        # Landing page navbar
│   │       ├── DashboardNav.tsx  # Dashboard navbar with logout
│   │       ├── AuthForm.tsx      # Login/signup form
│   │       ├── AliasItem.tsx     # Individual alias card
│   │       ├── CreateAliasModal.tsx  # New alias creation modal
│   │       └── Toast.tsx         # Toast notification component
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   └── postcss.config.mjs
├── worker/                       # Cloudflare Worker (API backend)
│   ├── src/
│   │   ├── index.js              # Worker entry point & router
│   │   ├── auth.js               # JWT authentication
│   │   ├── aliases.js            # Alias CRUD operations
│   │   └── email.js              # Email forwarding handler
│   ├── wrangler.toml             # Cloudflare config
│   └── package.json
├── database/
│   └── schema.sql                # D1 database schema
└── README.md
```

## Setup & Development

### Prerequisites

- Node.js 18+
- A Cloudflare account (free)
- A domain added to Cloudflare
- Wrangler CLI (`npm install -g wrangler`)

### 1. Clone & Install

```bash
git clone https://github.com/Tech-aficionado/Email-Alias-Project.git
cd Email-Alias-Project

# Install frontend dependencies
cd frontend
npm install

# Install worker dependencies
cd ../worker
npm install
```

### 2. Run Frontend (Development)

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see GhostRelay.

### 3. Create D1 Database

```bash
cd worker
wrangler d1 create ghostrelay-db
```

Update `wrangler.toml` with the database ID returned.

### 4. Apply Schema

```bash
wrangler d1 execute ghostrelay-db --file=../database/schema.sql
```

### 5. Configure Email Routing

In Cloudflare Dashboard:
- Go to your domain → Email → Email Routing
- Set up a catch-all rule pointing to your Worker

### 6. Deploy Worker

```bash
cd worker
wrangler deploy
```

### 7. Deploy Frontend

**Option A: Vercel (recommended for Next.js)**
```bash
npx vercel --prod
```

**Option B: Cloudflare Pages**
```bash
cd frontend
npm run build
```

## Frontend Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page — features, how-it-works, pricing |
| `/dashboard` | Auth + ghost alias management dashboard |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/aliases` | List user's aliases |
| POST | `/api/aliases` | Create new alias |
| PATCH | `/api/aliases/:id` | Enable/disable alias |
| DELETE | `/api/aliases/:id` | Delete alias |

## Demo Mode

The frontend works as a **standalone demo** using localStorage — no backend required. Open the dashboard, sign up with any email/password, and start creating ghost aliases to see the full UI flow.

## License

MIT
