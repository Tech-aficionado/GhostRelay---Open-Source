# GhostRelay Browser Extension

Auto-generate GhostRelay email aliases directly from signup forms.

## Features

- **One-click alias generation** — Click the extension icon, generate an alias, and it's auto-copied to clipboard
- **Form auto-fill** — Click "Fill into active email field" to paste the alias into a detected email input
- **Right-click context menu** — Right-click any email field and select "Generate GhostRelay Alias"
- **Smart detection** — Finds email inputs across React, Vue, Angular, and vanilla sites
- **Secure auth** — Uses your existing GhostRelay account with token refresh

## Installation (Development)

1. Open Chrome/Edge and navigate to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `extension/` folder from this project
5. The GhostRelay icon should appear in your toolbar

**After making changes:** Click the reload (↻) button on the extension card at `chrome://extensions/` to pick up changes.

## Usage

1. Click the GhostRelay extension icon
2. Sign in with your GhostRelay account (same email/password as the website)
3. Or click "Sign in via GhostRelay website" to log in on the site — the extension will sync automatically
4. Optionally add a label (e.g., "Netflix signup")
5. Click "Generate New Alias"
6. The alias is created and auto-copied to clipboard
7. Click "Fill into active email field" to paste it into a form

**Note:** The extension and website share the same account. If you log in on one, the other picks it up automatically.

## Files

- `manifest.json` — Extension configuration (Manifest V3)
- `popup.html/js` — Extension popup UI and logic
- `content.js` — Page injection for email field detection and filling
- `background.js` — Service worker for context menu and token refresh
- `icons/` — Extension icons (add 16x16, 48x48, 128x128 PNGs)

## Notes

- The extension communicates with the same GhostRelay Worker API
- Update `API_BASE` in popup.js and background.js if using a custom API URL
- Icons need to be created (16px, 48px, 128px PNG files in the `icons/` folder)
