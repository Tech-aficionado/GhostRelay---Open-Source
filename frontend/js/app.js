// ===== Configuration =====
const API_BASE = '/api'; // Change to your Worker URL in production
const DOMAIN = 'yourdomain.com'; // Change to your actual domain

// ===== State =====
let currentUser = null;
let aliases = [];
let isLoginMode = false;
let previewAlias = '';

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in (from localStorage for demo)
    const savedUser = localStorage.getItem('emailAlias_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
    }
    generatePreviewAlias();
});

// ===== Auth Functions =====
function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('authTitle').textContent = isLoginMode ? 'Login' : 'Sign Up';
    document.getElementById('authBtn').textContent = isLoginMode ? 'Login' : 'Create Account';
    document.getElementById('authToggleText').textContent = isLoginMode
        ? "Don't have an account?"
        : 'Already have an account?';
    document.getElementById('authToggleLink').textContent = isLoginMode ? 'Sign Up' : 'Login';
}

async function handleAuth(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const endpoint = isLoginMode ? '/auth/login' : '/auth/register';

    try {
        // For demo purposes, simulate API call
        // In production, replace with actual fetch to your Worker API
        /*
        const response = await fetch(API_BASE + endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        */

        // Demo: simulate successful auth
        const data = {
            user: { email, id: generateId() },
            token: 'demo-token-' + generateId()
        };

        currentUser = data.user;
        localStorage.setItem('emailAlias_user', JSON.stringify(currentUser));
        localStorage.setItem('emailAlias_token', data.token);

        // Load aliases from localStorage (demo)
        const savedAliases = localStorage.getItem('emailAlias_aliases_' + currentUser.email);
        aliases = savedAliases ? JSON.parse(savedAliases) : [];

        showDashboard();
        showToast('Welcome! ' + (isLoginMode ? 'Logged in' : 'Account created') + ' successfully.', 'success');
    } catch (error) {
        showToast('Authentication failed. Please try again.', 'error');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('emailAlias_user');
    localStorage.removeItem('emailAlias_token');
    document.getElementById('authSection').style.display = 'flex';
    document.getElementById('dashboardSection').style.display = 'none';
}

// ===== Dashboard Functions =====
function showDashboard() {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('dashboardSection').style.display = 'block';
    document.getElementById('userEmail').textContent = currentUser.email;

    // Load aliases
    const savedAliases = localStorage.getItem('emailAlias_aliases_' + currentUser.email);
    aliases = savedAliases ? JSON.parse(savedAliases) : [];

    renderAliases();
    updateStats();
}

function renderAliases() {
    const listEl = document.getElementById('aliasList');
    const emptyState = document.getElementById('emptyState');

    if (aliases.length === 0) {
        listEl.innerHTML = '';
        listEl.appendChild(createEmptyState());
        return;
    }

    listEl.innerHTML = aliases.map(alias => `
        <div class="alias-item ${alias.active ? '' : 'disabled'}">
            <div class="alias-info">
                <div class="alias-address">${alias.address}</div>
                <div class="alias-label-text">${alias.label || 'No label'}</div>
                <div class="alias-meta">Created ${formatDate(alias.createdAt)} &bull; ${alias.forwarded || 0} emails forwarded</div>
            </div>
            <div class="alias-actions">
                <label class="toggle" title="${alias.active ? 'Disable' : 'Enable'} alias">
                    <input type="checkbox" ${alias.active ? 'checked' : ''} onchange="toggleAlias('${alias.id}')">
                    <span class="toggle-slider"></span>
                </label>
                <button class="btn btn-small btn-outline" onclick="copyAlias('${alias.address}')" title="Copy">&#128203;</button>
                <button class="btn btn-small btn-danger" onclick="deleteAlias('${alias.id}')" title="Delete">&#128465;</button>
            </div>
        </div>
    `).join('');
}

function createEmptyState() {
    const div = document.createElement('div');
    div.className = 'empty-state';
    div.innerHTML = `
        <div class="empty-icon">&#128236;</div>
        <h3>No aliases yet</h3>
        <p>Create your first alias to start protecting your privacy.</p>
        <button class="btn btn-primary" onclick="showCreateModal()">Create First Alias</button>
    `;
    return div;
}

function updateStats() {
    document.getElementById('totalAliases').textContent = aliases.length;
    document.getElementById('activeAliases').textContent = aliases.filter(a => a.active).length;
    document.getElementById('totalForwarded').textContent = aliases.reduce((sum, a) => sum + (a.forwarded || 0), 0);
    document.getElementById('aliasCount').textContent = aliases.length;
}

// ===== Alias CRUD =====
function showCreateModal() {
    if (aliases.length >= 5) {
        showToast('Free tier limit reached (5 aliases). Upgrade to Pro for unlimited.', 'error');
        return;
    }
    generatePreviewAlias();
    document.getElementById('createModal').style.display = 'flex';
    document.getElementById('aliasLabel').value = '';
}

function hideCreateModal() {
    document.getElementById('createModal').style.display = 'none';
}

function generatePreviewAlias() {
    previewAlias = generateRandomAlias() + '@' + DOMAIN;
    const previewEl = document.getElementById('previewAddress');
    if (previewEl) {
        previewEl.textContent = previewAlias;
    }
}

function regenerateAlias() {
    generatePreviewAlias();
}

async function createAlias(event) {
    event.preventDefault();
    const label = document.getElementById('aliasLabel').value.trim();

    const newAlias = {
        id: generateId(),
        address: previewAlias,
        label: label,
        active: true,
        forwarded: 0,
        createdAt: new Date().toISOString()
    };

    // In production, call API:
    /*
    const response = await fetch(API_BASE + '/aliases', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('emailAlias_token')
        },
        body: JSON.stringify({ label, address: previewAlias })
    });
    */

    aliases.push(newAlias);
    saveAliases();
    renderAliases();
    updateStats();
    hideCreateModal();
    showToast('Alias created: ' + newAlias.address, 'success');
}

function toggleAlias(id) {
    const alias = aliases.find(a => a.id === id);
    if (alias) {
        alias.active = !alias.active;
        saveAliases();
        renderAliases();
        updateStats();
        showToast(
            alias.active ? 'Alias enabled' : 'Alias disabled',
            'success'
        );
    }
}

function deleteAlias(id) {
    if (!confirm('Delete this alias? Emails sent to it will no longer be forwarded.')) return;

    aliases = aliases.filter(a => a.id !== id);
    saveAliases();
    renderAliases();
    updateStats();
    showToast('Alias deleted', 'success');
}

function copyAlias(address) {
    navigator.clipboard.writeText(address).then(() => {
        showToast('Copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback
        const input = document.createElement('input');
        input.value = address;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        showToast('Copied to clipboard!', 'success');
    });
}

// ===== Helpers =====
function generateRandomAlias() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function generateId() {
    return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function saveAliases() {
    localStorage.setItem('emailAlias_aliases_' + currentUser.email, JSON.stringify(aliases));
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
