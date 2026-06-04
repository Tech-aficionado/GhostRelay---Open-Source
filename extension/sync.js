/**
 * GhostRelay Browser Extension - Token Sync Content Script
 * Runs only on the GhostRelay website to sync auth state with the extension.
 * 
 * This ensures the extension and website share the same login session.
 * When you log in on the website, the extension picks it up automatically.
 * When you log out on the website, the extension logs out too.
 */

const TOKEN_KEY = 'ghostrelay_token';
const REFRESH_TOKEN_KEY = 'ghostrelay_refresh_token';
const USER_KEY = 'ghostrelay_user';

/**
 * Read auth state from the website's localStorage and push it to chrome.storage
 */
function syncTokensToExtension() {
  const token = localStorage.getItem(TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  const userRaw = localStorage.getItem(USER_KEY);

  let userEmail = '';
  try {
    const user = JSON.parse(userRaw || '{}');
    userEmail = user.email || '';
  } catch {}

  if (token && refreshToken) {
    // User is logged in on the website — sync to extension
    chrome.storage.local.set({
      token,
      refreshToken,
      userEmail,
      syncedFromWebsite: true,
    });
  } else {
    // User logged out on the website — clear extension auth too
    chrome.storage.local.get(['syncedFromWebsite'], (result) => {
      if (result.syncedFromWebsite) {
        // Only clear if the tokens were originally synced from website
        chrome.storage.local.remove(['token', 'refreshToken', 'userEmail', 'syncedFromWebsite']);
      }
    });
  }
}

// Sync on page load
syncTokensToExtension();

// Watch for storage changes (login/logout on the website in this tab)
window.addEventListener('storage', (event) => {
  if (event.key === TOKEN_KEY || event.key === REFRESH_TOKEN_KEY || event.key === null) {
    syncTokensToExtension();
  }
});

// Also listen for custom event from the website (for same-tab login)
window.addEventListener('ghostrelay-auth-change', () => {
  syncTokensToExtension();
});

// Periodic check to catch same-tab localStorage changes (storage event doesn't fire for same-tab)
let lastToken = localStorage.getItem(TOKEN_KEY);
setInterval(() => {
  const currentToken = localStorage.getItem(TOKEN_KEY);
  if (currentToken !== lastToken) {
    lastToken = currentToken;
    syncTokensToExtension();
  }
}, 2000);

// Listen for extension popup asking to check sync
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CHECK_WEBSITE_AUTH') {
    syncTokensToExtension();
    const token = localStorage.getItem(TOKEN_KEY);
    sendResponse({ loggedIn: !!token });
  } else if (message.type === 'PUSH_TOKEN_TO_WEBSITE') {
    // Extension logged in independently — push tokens to website
    if (message.token && message.refreshToken) {
      localStorage.setItem(TOKEN_KEY, message.token);
      localStorage.setItem(REFRESH_TOKEN_KEY, message.refreshToken);
      if (message.userEmail) {
        localStorage.setItem(USER_KEY, JSON.stringify({ id: '', email: message.userEmail }));
      }
      // Trigger a custom event so the website's React app can pick up the change
      window.dispatchEvent(new Event('ghostrelay-auth-change'));
      window.dispatchEvent(new StorageEvent('storage', { key: TOKEN_KEY }));
    } else if (message.token === null) {
      // Logout from extension — clear website tokens
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem('ghostrelay_session_id');
      window.dispatchEvent(new Event('ghostrelay-auth-change'));
      window.dispatchEvent(new StorageEvent('storage', { key: TOKEN_KEY }));
    } else if (message.token && !message.refreshToken) {
      // Just updating access token (after refresh)
      localStorage.setItem(TOKEN_KEY, message.token);
    }
    sendResponse({ success: true });
  }
  return true;
});
