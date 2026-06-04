/**
 * GhostRelay Browser Extension - Content Script
 * Detects email input fields and fills generated aliases
 */

// Listen for messages from popup and background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'FILL_EMAIL':
      fillEmailField(message.email);
      sendResponse({ success: true });
      break;

    case 'COPY_TO_CLIPBOARD':
      copyToClipboard(message.text).then(ok => {
        sendResponse({ success: ok });
      });
      return true; // async response

    case 'FILL_AND_COPY':
      fillEmailField(message.email);
      copyToClipboard(message.email).then(ok => {
        sendResponse({ success: true, copied: ok });
      });
      return true; // async response

    default:
      // Unknown message type, don't send response
      return false;
  }
});

/**
 * Copy text to clipboard with fallback
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for contexts where Clipboard API is unavailable
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

/**
 * Fill the most likely email input field on the page
 */
function fillEmailField(email) {
  // Try to find focused email input first
  const active = document.activeElement;
  if (active && isEmailInput(active)) {
    setInputValue(active, email);
    highlightField(active);
    return;
  }

  // Find all email-like inputs
  const inputs = document.querySelectorAll(
    'input[type="email"], input[name*="email" i], input[id*="email" i], input[placeholder*="email" i], input[autocomplete="email"]'
  );

  if (inputs.length > 0) {
    // Prefer visible, empty inputs
    const target = Array.from(inputs).find(
      (input) => isVisible(input) && !input.value
    ) || Array.from(inputs).find(isVisible) || inputs[0];

    setInputValue(target, email);
    highlightField(target);
    return;
  }

  // Fallback: try any text input that might be for email
  const textInputs = document.querySelectorAll('input[type="text"], input:not([type])');
  for (const input of textInputs) {
    if (!isVisible(input)) continue;
    const hint = [
      input.placeholder,
      input.name,
      input.id,
      input.getAttribute('aria-label') || '',
      input.getAttribute('data-testid') || '',
    ].join(' ').toLowerCase();
    if (hint.includes('email') || hint.includes('e-mail') || hint.includes('correo')) {
      setInputValue(input, email);
      highlightField(input);
      return;
    }
  }
}

/**
 * Set input value in a way that triggers React/Vue/Angular change events
 */
function setInputValue(input, value) {
  // Focus the input first
  input.focus();

  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype, 'value'
  )?.set;

  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(input, value);
  } else {
    input.value = value;
  }

  // Dispatch events to trigger framework reactivity
  input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: '' }));
  input.dispatchEvent(new Event('blur', { bubbles: true }));
}

function isEmailInput(el) {
  if (!el || el.tagName !== 'INPUT') return false;
  if (el.type === 'email') return true;
  const hint = [
    el.name, el.id, el.placeholder,
    el.getAttribute('autocomplete') || '',
    el.getAttribute('aria-label') || '',
  ].join(' ').toLowerCase();
  return hint.includes('email');
}

function isVisible(el) {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return false;
  const style = getComputedStyle(el);
  return style.visibility !== 'hidden' && style.display !== 'none' && style.opacity !== '0';
}

/**
 * Briefly highlight the filled field for user feedback
 */
function highlightField(input) {
  if (!input) return;
  const originalOutline = input.style.outline;
  const originalBoxShadow = input.style.boxShadow;

  input.style.outline = '2px solid #6366f1';
  input.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.25)';

  setTimeout(() => {
    input.style.outline = originalOutline;
    input.style.boxShadow = originalBoxShadow;
  }, 2000);
}
