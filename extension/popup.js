/**
 * GhostRelay Browser Extension - Popup Script
 * Handles auth, alias generation, and clipboard/form filling
 * 
 * Auth is shared with the GhostRelay website:
 * - If you log in on the website, the extension auto-picks it up (via sync.js)
 * - If you log in via the extension, it pushes tokens to the website too
 */

const API_BASE = 'https://email-alias-worker.ghostrelay-1.workers.dev';
const WEBSITE_URL = 'https://ghostrelay.me';

let currentAlias = '';
let isGenerating = false;

// Wait for DOM
document.addEventListener('DOMContentLoaded', init);

async function init() {
  // DOM elements
  const loginSection = document.getElementById('login-section');
  const mainSection = document.getElementById('main-section');
  const loginBtn = document.getElementById('login-btn');
  const loginEmail = document.getElementById('login-email');
  const loginPassword = document.getElementById('login-password');
  const loginStatus = document.getElementById('login-status');
  const webLoginBtn = document.getElementById('web-login-btn');
  const generateBtn = document.getElementById('generate-btn');
  const aliasLabel = document.getElementById('alias-label');
  const aliasResult = document.getElementById('alias-result');
  const aliasText = document.getElementById('alias-text');
  const copyBtn = document.getElementById('copy-btn');
  const fillBtn = document.getElementById('fill-btn');
  const mainStatus = document.getElementById('main-status');
  const logoutBtn = document.getElementById('logout-btn');
  const userEmailEl = document.getElementById('user-email');

  if (!loginSection || !mainSection || !loginBtn || !generateBtn) {
    console.error('GhostRelay: DOM elements not found');
    return;
  }

  // Check auth state
  const { token, userEmail } = await chrome.storage.local.get(['token', 'userEmail']);
  if (token) {
    showMain(userEmail);
  } else {
    showLogin();
  }

  function showLogin() {
    loginSection.classList.add('active');
    mainSection.classList.remove('active');
  }

  function showMain(email) {
    loginSection.classList.remove('active');
    mainSection.classList.add('active');
    if (userEmailEl && email) {
      userEmailEl.textContent = email;
      userEmailEl.style.display = 'block';
    }
  }

  function setStatus(el, msg, type) {
    if (!el) return;
    el.textContent = msg;
    el.className = `status ${type}`;
    if (msg) {
      setTimeout(() => {
        el.textContent = '';
        el.className = 'status';
      }, 4000);
    }
  }

  // Login via extension form
  loginBtn.addEventListener('click', async () => {
    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    if (!email || !password) {
      setStatus(loginStatus, 'Enter email and password', 'error');
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = 'Signing in...';

    try {
      // First verify we can reach the API
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error(`Server error (status ${res.status}). Try again later.`);
      }

      if (!res.ok) {
        throw new Error(data.error || `Login failed (${res.status})`);
      }

      if (!data.token || !data.refreshToken || !data.user) {
        throw new Error('Invalid response from server');
      }

      // Store in extension
      await chrome.storage.local.set({
        token: data.token,
        refreshToken: data.refreshToken,
        userEmail: data.user.email,
        syncedFromWebsite: false,
      });

      // Push tokens to the website so they share the same session
      pushTokensToWebsite(data.token, data.refreshToken, data.user.email);

      showMain(data.user.email);
      setStatus(loginStatus, '', '');
    } catch (err) {
      // Distinguish network errors from API errors
      if (err instanceof TypeError) {
        setStatus(loginStatus, 'Cannot reach server. Check internet connection.', 'error');
      } else {
        setStatus(loginStatus, err.message, 'error');
      }
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = 'Sign In';
    }
  });

  // "Sign in via website" button — opens the site, background monitors for login
  if (webLoginBtn) {
    webLoginBtn.addEventListener('click', async () => {
      // Open the website dashboard (forces login if not authenticated)
      await chrome.tabs.create({ url: `${WEBSITE_URL}/dashboard` });
      
      // Tell background to start monitoring for login
      chrome.runtime.sendMessage({ type: 'WATCH_FOR_LOGIN' });
      
      setStatus(loginStatus, 'Log in on the website, then reopen this popup.', 'success');
    });
  }

  // Generate alias handler
  generateBtn.addEventListener('click', async () => {
    if (isGenerating) return;
    await generateAlias(false);
  });

  async function generateAlias(isRetry) {
    const { token } = await chrome.storage.local.get('token');
    if (!token) {
      showLogin();
      return;
    }

    const label = aliasLabel.value.trim();
    isGenerating = true;
    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating...';

    try {
      const res = await fetch(`${API_BASE}/api/aliases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ label: label || undefined }),
      });

      if (res.status === 401 && !isRetry) {
        const newToken = await doRefreshToken();
        if (!newToken) {
          showLogin();
          setStatus(loginStatus, 'Session expired. Please sign in again.', 'error');
          return;
        }
        return generateAlias(true);
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create alias');
      }

      currentAlias = data.alias.address;
      aliasText.textContent = currentAlias;
      aliasResult.style.display = 'flex';
      fillBtn.style.display = 'block';

      // Copy to clipboard
      const copied = await safeCopyToClipboard(currentAlias);
      if (copied) {
        setStatus(mainStatus, 'Created & copied to clipboard!', 'success');
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
          copyBtn.classList.remove('copied');
        }, 2000);
      } else {
        setStatus(mainStatus, 'Created! Click Copy to copy.', 'success');
      }
    } catch (err) {
      setStatus(mainStatus, err.message, 'error');
    } finally {
      isGenerating = false;
      generateBtn.disabled = false;
      generateBtn.textContent = '⚡ Generate New Alias';
    }
  }

  // Copy button
  copyBtn.addEventListener('click', async () => {
    if (!currentAlias) return;
    const copied = await safeCopyToClipboard(currentAlias);
    if (copied) {
      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
        copyBtn.classList.remove('copied');
      }, 2000);
    } else {
      setStatus(mainStatus, 'Copy failed. Select text manually.', 'error');
    }
  });

  // Fill into active email field
  fillBtn.addEventListener('click', async () => {
    if (!currentAlias) return;

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        setStatus(mainStatus, 'No active tab found', 'error');
        return;
      }

      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'FILL_EMAIL',
          email: currentAlias,
        });
        setStatus(mainStatus, 'Filled into email field!', 'success');
      } catch {
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js'],
          });
          await chrome.tabs.sendMessage(tab.id, {
            type: 'FILL_EMAIL',
            email: currentAlias,
          });
          setStatus(mainStatus, 'Filled into email field!', 'success');
        } catch {
          setStatus(mainStatus, 'Cannot fill on this page', 'error');
        }
      }
    } catch {
      setStatus(mainStatus, 'Failed to fill field', 'error');
    }
  });

  // Logout handler
  logoutBtn.addEventListener('click', async () => {
    await chrome.storage.local.remove(['token', 'refreshToken', 'userEmail', 'syncedFromWebsite']);
    currentAlias = '';
    aliasResult.style.display = 'none';
    fillBtn.style.display = 'none';
    if (userEmailEl) {
      userEmailEl.textContent = '';
      userEmailEl.style.display = 'none';
    }
    showLogin();
    clearWebsiteTokens();
  });

  // Enter key shortcuts
  loginPassword.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') loginBtn.click();
  });
  loginEmail.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') loginPassword.focus();
  });
  aliasLabel.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') generateBtn.click();
  });

  // Listen for storage changes (in case sync.js pushes tokens while popup is open)
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.token && changes.token.newValue) {
      chrome.storage.local.get(['userEmail']).then(({ userEmail }) => {
        showMain(userEmail);
      });
    }
  });
}

/**
 * Refresh the access token. Returns new token or null.
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
      await chrome.storage.local.remove(['token', 'refreshToken', 'userEmail', 'syncedFromWebsite']);
      return null;
    }

    const data = await res.json();
    await chrome.storage.local.set({ token: data.token });
    pushTokensToWebsite(data.token, null, null);
    return data.token;
  } catch {
    return null;
  }
}

/**
 * Push tokens to the GhostRelay website via the sync content script
 */
function pushTokensToWebsite(token, refreshToken, userEmail) {
  chrome.tabs.query({ url: ['*://ghostrelay.me/*', '*://www.ghostrelay.me/*', '*://frontend-pearl-six-47.vercel.app/*'] })
    .then(tabs => {
      for (const tab of tabs) {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'PUSH_TOKEN_TO_WEBSITE',
            token,
            refreshToken,
            userEmail,
          }).catch(() => {});
        }
      }
    }).catch(() => {});
}

/**
 * Clear tokens on the website when logging out from extension
 */
function clearWebsiteTokens() {
  chrome.tabs.query({ url: ['*://ghostrelay.me/*', '*://www.ghostrelay.me/*', '*://frontend-pearl-six-47.vercel.app/*'] })
    .then(tabs => {
      for (const tab of tabs) {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'PUSH_TOKEN_TO_WEBSITE',
            token: null,
            refreshToken: null,
            userEmail: null,
          }).catch(() => {});
        }
      }
    }).catch(() => {});
}

/**
 * Safely copy to clipboard with fallback
 */
async function safeCopyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return ok;
    } catch {
      return false;
    }
  }
}
