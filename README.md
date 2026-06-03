# Email Alias Project

A privacy-focused email aliasing service that generates masked email addresses to protect your real inbox. Built on the Cloudflare free stack.

## How It Works

1. **Sign up** with your real email address
2. **Generate aliases** (e.g., `xk7r9m@yourdomain.com`)
3. **Use aliases** when signing up for services, newsletters, etc.
4. **Emails forwarded** to your real inbox transparently
5. **Disable anytime** — stop receiving mail from a specific alias instantly

## Tech Stack

| Component | Technology | Cost |
|-----------|-----------|------|
| Frontend | HTML/CSS/JS (static) | Free (Cloudflare Pages) |
| Backend API | Cloudflare Workers | Free tier |
| Database | Cloudflare D1 (SQLite) | Free tier |
| Email Routing | Cloudflare Email Routing | Free |
| Domain | Your own domain | ~$10/year |

## Project Structure

```
Email-Alias-Project/
├── frontend/             # Static dashboard UI
│   ├── index.html        # Landing page
│   ├── dashboard.html    # Alias management dashboard
│   ├── css/
│   │   └── style.css     # Styles
│   └── js/
│       └── app.js        # Frontend logic
├── worker/               # Cloudflare Worker
│   ├── src/
│   │   ├── index.js      # Worker entry point & router
│   │   ├── auth.js       # Authentication logic
│   │   ├── aliases.js    # Alias CRUD operations
│   │   └── email.js      # Email forwarding handler
│   ├── wrangler.toml     # Cloudflare config
│   └── package.json      # Dependencies
├── database/
│   └── schema.sql        # D1 database schema
└── README.md
```

## Setup & Deployment

### Prerequisites

- A Cloudflare account (free)
- A domain added to Cloudflare
- Node.js 18+ installed
- Wrangler CLI (`npm install -g wrangler`)

### 1. Clone & Install

```bash
git clone https://github.com/Tech-aficionado/Email-Alias-Project.git
cd Email-Alias-Project/worker
npm install
```

### 2. Create D1 Database

```bash
wrangler d1 create email-alias-db
```

Update `wrangler.toml` with the database ID returned.

### 3. Apply Schema

```bash
wrangler d1 execute email-alias-db --file=../database/schema.sql
```

### 4. Configure Email Routing

In Cloudflare Dashboard:
- Go to your domain → Email → Email Routing
- Set up a catch-all rule pointing to your Worker

### 5. Deploy

```bash
wrangler deploy
```

### 6. Deploy Frontend

```bash
# Upload frontend/ to Cloudflare Pages or any static host
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/aliases` | List user's aliases |
| POST | `/api/aliases` | Create new alias |
| PATCH | `/api/aliases/:id` | Enable/disable alias |
| DELETE | `/api/aliases/:id` | Delete alias |

## License

MIT
