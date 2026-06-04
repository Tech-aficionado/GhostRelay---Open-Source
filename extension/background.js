/**
 * GhostRelay Browser Extension - Background Service Worker
 * Handles context menu integration, alias generation, and token refresh
 */

const API_BASE = 'https://email-alias-worker.ghostrelay-1.workers.dev';

// Create context menu item for right-clicking email fields
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'ghostrelay-generate',
    title: 'Generate GhostRelay Alias',
    contexts: ['editable'],
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== 'ghostrelay-generate') return;
  if (!tab || !tab.id) return;

  const { token } = await chrome.storage.local.get('token');
  if (!token) {
    // Notify user to sign in
    await showBadge('!', '#f43f5e');
    return;
  }

  await generateAndFill(tab, token);
});

/**
 * Generate a new alias and fill it into the active tab's email field
 */
async function generateAndFill(tab, token, isRetry = false) {
  let label = 'Extension';
  try {
    // tab.url may be undefined if tabs permission is missing or for restricted pages
    if (tab.url) {
      label = 'From ' + new URL(tab.url).hostname;
    }
  } catch (e) {
    // URL parsing failed, use default label
  }

  try {
    const res = await fetch(`${API_BASE}/api/aliases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ label }),
    });

    if (res.status === 401 && !isRetry) {
      const newToken = await doRefreshToken();
      if (!newToken) {
        await showBadge('!', '#f43f5e');
        return;
      }
      return generateAndFill(tab, newToken, true);
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('GhostRelay: API error', err.error || res.status);
      await showBadge('X', '#f43f5e');
      return;
    }

    const data = await res.json();
    const alias = data.alias.address;

    // Send to content script to fill and copy
    try {
      await chrome.tabs.sendMessage(tab.id, {
        type: 'FILL_AND_COPY',
        email: alias,
      });
    } catch (e) {
      // Content script may not be injected on this page (chrome://, edge://, etc.)
      // Try injecting it first
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js'],
        });
        await chrome.tabs.sendMessage(tab.id, {
          type: 'FILL_AND_COPY',
          email: alias,
        });
      } catch (injectErr) {
        console.warn('GhostRelay: Cannot inject into this page', injectErr.message);
      }
    }

    await showBadge('✓', '#06d6a0');
  } catch (err) {
    console.error('GhostRelay: Failed to generate alias', err);
    await showBadge('X', '#f43f5e');
  }
}

/**
 * Refresh the access token using the stored refresh token
 * Returns new access token on success, null on failure
 */
async function doRefreshToken() {
  const { refreshToken } = await chrome.storage.local.get('refreshToken');
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      // Refresh token is invalid/expired, clear auth state
      await chrome.storage.local.remove(['token', 'refreshToken', 'userEmail']);
      return null;
    }

    const data = await res.json();
    await chrome.storage.local.set({ token: data.token });
    return data.token;
  } catch {
    return null;
  }
}

/**
 * Show a brief badge on the extension icon for feedback
 */
async function showBadge(text, color) {
  try {
    await chrome.action.setBadgeText({ text });
    await chrome.action.setBadgeBackgroundColor({ color });
    setTimeout(async () => {
      try { await chrome.action.setBadgeText({ text: '' }); } catch {}
    }, 3000);
  } catch {}
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'REFRESH_TOKEN') {
    doRefreshToken().then(token => {
      sendResponse({ success: !!token, token });
    });
    return true; // async response
  }

  if (message.type === 'WATCH_FOR_LOGIN') {
    // The popup asked us to watch for a login on the website.
    // sync.js will push the token to chrome.storage once the user logs in.
    // We set a badge to remind the user.
    showBadge('…', '#6366f1');
    sendResponse({ ok: true });
  }
});

// When tokens appear in storage (pushed by sync.js), clear the waiting badge
chrome.storage.onChanged.addListener((changes) => {
  if (changes.token && changes.token.newValue) {
    // Token was just stored (user logged in on website, sync.js pushed it)
    chrome.action.setBadgeText({ text: '✓' });
    chrome.action.setBadgeBackgroundColor({ color: '#06d6a0' });
    setTimeout(() => {
      chrome.action.setBadgeText({ text: '' }).catch(() => {});
    }, 5000);
  }
});
