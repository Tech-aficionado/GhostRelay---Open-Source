/**
 * GhostRelay Browser Extension - Popup Script
 * Handles auth, alias generation, and clipboard/form filling
 * 
 * Auth sync with website:
 * - sync.js runs on ghostrelay.me and pushes localStorage tokens to chrome.storage
 * - When you open this popup and tokens are in chrome.storage, you're logged in
 */

const API_BASE = 'https://email-alias-worker.ghostrelay-1.workers.dev';
const WEBSITE_URL = 'https://ghostrelay.me';

let currentAlias = '';
let isGenerating = false;

document.addEventListener('DOMContentLoaded', init);

async function init() {
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
  const userBadge = document.getElementById('user-badge');
  const userAvatar = document.getElementById('user-avatar');
  const userEmailEl = document.getElementById('user-email');

  if (!loginSection || !mainSection) return;

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
    if (email && userBadge && userEmailEl && userAvatar) {
      userEmailEl.textContent = email;
      userAvatar.textContent = email.charAt(0).toUpperCase();
      userBadge.classList.add('visible');
    }
  }

  function setStatus(el, msg, type) {
    if (!el) return;
    el.textContent = msg;
    el.className = `status ${type}`;
    if (msg && type !== 'info') {
      setTimeout(() => { el.textContent = ''; el.className = 'status'; }, 4000);
    }
  }

  // -- Login via email/password --
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
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      let data;
      try { data = await res.json(); } catch {
        throw new Error(`Server error (${res.status})`);
      }

      if (!res.ok) {
        throw new Error(data.error || `Login failed (${res.status})`);
      }

      if (!data.token || !data.refreshToken || !data.user) {
        throw new Error('Unexpected server response');
      }

      await chrome.storage.local.set({
        token: data.token,
        refreshToken: data.refreshToken,
        userEmail: data.user.email,
      });

      // Sync to website
      pushTokensToWebsite(data.token, data.refreshToken, data.user.email);
      showMain(data.user.email);
    } catch (err) {
      if (err instanceof TypeError) {
        setStatus(loginStatus, 'Cannot reach server. Check your connection.', 'error');
      } else {
        setStatus(loginStatus, err.message, 'error');
      }
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = 'Sign In';
    }
  });

  // -- Sign in via website --
  if (webLoginBtn) {
    webLoginBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: `${WEBSITE_URL}/dashboard` });
      setStatus(loginStatus, 'Sign in on the site, then click the extension icon again.', 'info');
    });
  }

  // -- Generate alias --
  generateBtn.addEventListener('click', async () => {
    if (isGenerating) return;
    await generateAlias(false);
  });

  async function generateAlias(isRetry) {
    const { token } = await chrome.storage.local.get('token');
    if (!token) { showLogin(); return; }

    const label = aliasLabel.value.trim();
    isGenerating = true;
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> Creating...';

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
          setStatus(loginStatus, 'Session expired. Please sign in.', 'error');
          return;
        }
        return generateAlias(true);
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create alias');

      currentAlias = data.alias.address;
      aliasText.textContent = currentAlias;
      aliasResult.classList.add('visible');
      fillBtn.classList.add('visible');

      const copied = await safeCopyToClipboard(currentAlias);
      if (copied) {
        setStatus(mainStatus, 'Copied to clipboard!', 'success');
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        setTimeout(() => { copyBtn.textContent = 'Copy'; copyBtn.classList.remove('copied'); }, 2000);
      } else {
        setStatus(mainStatus, 'Alias created!', 'success');
      }
    } catch (err) {
      if (err instanceof TypeError) {
        setStatus(mainStatus, 'Network error. Try again.', 'error');
      } else {
        setStatus(mainStatus, err.message, 'error');
      }
    } finally {
      isGenerating = false;
      generateBtn.disabled = false;
      generateBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> Generate Alias';
    }
  }

  // -- Copy --
  copyBtn.addEventListener('click', async () => {
    if (!currentAlias) return;
    const copied = await safeCopyToClipboard(currentAlias);
    if (copied) {
      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('copied');
      setTimeout(() => { copyBtn.textContent = 'Copy'; copyBtn.classList.remove('copied'); }, 2000);
    }
  });

  // -- Fill --
  fillBtn.addEventListener('click', async () => {
    if (!currentAlias) return;
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) { setStatus(mainStatus, 'No active tab', 'error'); return; }

      try {
        await chrome.tabs.sendMessage(tab.id, { type: 'FILL_EMAIL', email: currentAlias });
        setStatus(mainStatus, 'Filled!', 'success');
      } catch {
        // Inject content script and retry
        try {
          await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
          await chrome.tabs.sendMessage(tab.id, { type: 'FILL_EMAIL', email: currentAlias });
          setStatus(mainStatus, 'Filled!', 'success');
        } catch {
          setStatus(mainStatus, 'Cannot fill on this page', 'error');
        }
      }
    } catch { setStatus(mainStatus, 'Failed', 'error'); }
  });

  // -- Logout --
  logoutBtn.addEventListener('click', async () => {
    await chrome.storage.local.remove(['token', 'refreshToken', 'userEmail']);
    currentAlias = '';
    aliasResult.classList.remove('visible');
    fillBtn.classList.remove('visible');
    userBadge.classList.remove('visible');
    clearWebsiteTokens();
    showLogin();
  });

  // -- Keyboard shortcuts --
  loginPassword.addEventListener('keydown', e => { if (e.key === 'Enter') loginBtn.click(); });
  loginEmail.addEventListener('keydown', e => { if (e.key === 'Enter') loginPassword.focus(); });
  aliasLabel.addEventListener('keydown', e => { if (e.key === 'Enter') generateBtn.click(); });

  // -- Listen for storage changes while popup is open (e.g. sync.js pushes token) --
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.token?.newValue) {
      chrome.storage.local.get(['userEmail']).then(({ userEmail }) => showMain(userEmail));
    }
  });
}

// === Helper functions (outside init to be accessible) ===

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
      await chrome.storage.local.remove(['token', 'refreshToken', 'userEmail']);
      return null;
    }
    const data = await res.json();
    await chrome.storage.local.set({ token: data.token });
    return data.token;
  } catch { return null; }
}

function pushTokensToWebsite(token, refreshToken, userEmail) {
  chrome.tabs.query({ url: ['*://ghostrelay.me/*', '*://www.ghostrelay.me/*', '*://frontend-pearl-six-47.vercel.app/*'] })
    .then(tabs => {
      for (const tab of tabs) {
        if (tab.id) chrome.tabs.sendMessage(tab.id, { type: 'PUSH_TOKEN_TO_WEBSITE', token, refreshToken, userEmail }).catch(() => {});
      }
    }).catch(() => {});
}

function clearWebsiteTokens() {
  chrome.tabs.query({ url: ['*://ghostrelay.me/*', '*://www.ghostrelay.me/*', '*://frontend-pearl-six-47.vercel.app/*'] })
    .then(tabs => {
      for (const tab of tabs) {
        if (tab.id) chrome.tabs.sendMessage(tab.id, { type: 'PUSH_TOKEN_TO_WEBSITE', token: null, refreshToken: null, userEmail: null }).catch(() => {});
      }
    }).catch(() => {});
}

async function safeCopyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;left:-9999px;opacity:0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch { return false; }
  }
}
