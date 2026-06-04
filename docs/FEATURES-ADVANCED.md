# Advanced Features Implementation

## Features Added

### 1. Multiple Forwarding Destinations
- Each alias can forward to up to 5 email addresses (great for teams)
- Default still forwards to the user's primary email
- Add/remove/toggle individual destinations via the dashboard
- API: `GET/POST /api/aliases/:id/destinations`, `PATCH/DELETE /api/aliases/:id/destinations/:destId`
- Frontend: 📨 button on each alias → opens Destinations panel

### 2. Catch-All Wildcard Aliases
- Create patterns like `*-shopping` that match any incoming email (e.g. `summer-shopping@ghostrelay.me`)
- Wildcards auto-create tracked aliases on first match
- Up to 10 wildcard rules per user
- API: `GET/POST/PATCH/DELETE /api/wildcards`
- Frontend: "Wildcards" button in dashboard header → opens Wildcards panel

### 3. Temporary/Expiring Aliases
- Create aliases that auto-disable after N days or N emails (whichever comes first)
- Set during alias creation via the "Temporary alias" toggle
- Expiration checked on each incoming email; alias disabled automatically
- Shows remaining time/emails in the alias list

### 4. Mobile PWA (Offline + Push Notifications)
- Service worker (`/sw.js`) provides offline caching with network-first strategy
- Push notifications when emails are forwarded to your aliases
- Updated `manifest.json` with shortcuts, orientation, categories
- Auto-registered on page load

### 5. Browser Extension (Chrome/Edge/Firefox)
- Located in `extension/` folder
- One-click alias generation from the toolbar popup
- Auto-copies new alias to clipboard
- "Fill into active email field" button for signup forms
- Right-click context menu on any email input
- Smart email field detection across all major frameworks
- Uses existing GhostRelay auth (token + refresh flow)

---

## Database Migration

Run the migration to add the new tables and columns:

```bash
cd worker
npx wrangler d1 execute ghostrelay-db --file=../database/migration-advanced-features.sql
# For local dev:
npx wrangler d1 execute ghostrelay-db --local --file=../database/migration-advanced-features.sql
```

## Worker Secrets (for Push Notifications)

If you want push notifications working, generate VAPID keys and set them:

```bash
# Generate VAPID keys (use any web-push library)
npx web-push generate-vapid-keys

# Set secrets
npx wrangler secret put VAPID_PUBLIC_KEY
npx wrangler secret put VAPID_PRIVATE_KEY
```

## Extension Installation

1. Open `chrome://extensions/` (or Edge equivalent)
2. Enable Developer Mode
3. Click "Load unpacked" → select the `extension/` folder
4. Add your icon files (16px, 48px, 128px PNG) to `extension/icons/`

---

## New Files Created

```
database/migration-advanced-features.sql  — DB migration
worker/src/wildcards.js                   — Wildcard rules API handler
worker/src/destinations.js                — Multiple destinations API handler
worker/src/push.js                        — Push notification subscriptions handler
frontend/public/sw.js                     — Service worker (offline + push)
frontend/src/components/WildcardsPanel.tsx — Wildcard rules management UI
frontend/src/components/DestinationsPanel.tsx — Multi-destination management UI
extension/                                — Full browser extension
  ├── manifest.json
  ├── popup.html
  ├── popup.js
  ├── content.js
  ├── background.js
  ├── README.md
  └── icons/.gitkeep
```

## Modified Files

```
worker/src/index.js       — Added routes for wildcards, destinations, push; CORS for extensions
worker/src/email.js       — Multi-destination forwarding, wildcard matching, push notifications, expiry checks
worker/src/aliases.js     — Temporary alias support (expiresAt, maxEmails, isTemporary)
frontend/src/lib/api.ts   — New API functions for destinations, wildcards, push
frontend/src/app/layout.tsx — Service worker registration
frontend/src/app/dashboard/page.tsx — New panels, updated types, new buttons
frontend/src/components/AliasItem.tsx — Destinations button, expiry display
frontend/src/components/CreateAliasModal.tsx — Temporary alias options
frontend/public/manifest.json — Enhanced PWA manifest
```
