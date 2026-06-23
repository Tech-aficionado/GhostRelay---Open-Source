"use client";

import { useState, useEffect, useCallback } from "react";
import { useDashboard } from "@/lib/DashboardContext";
import { getToken, clearAuth } from "@/lib/auth";
import * as api from "@/lib/api";

export default function SettingsPage() {
  const { user, showToast, handleLogout } = useDashboard();
  const [displayName, setDisplayName] = useState("");
  const [notification, setNotification] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [bounceAlerts, setBounceAlerts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const loadSettings = useCallback(async () => {
    const token = getToken();
    if (!token) { setLoadingSettings(false); return; }
    try {
      const data = await api.getUserSettings(token);
      setDisplayName(data.displayName || "");
      setNotification(data.emailNotifications ?? true);
      setWeeklyReport(data.weeklyReport ?? false);
      setBounceAlerts(data.bounceAlerts ?? true);
    } catch {
      // Use defaults
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    const token = getToken();
    if (!token) return;

    setSaving(true);
    try {
      await api.updateUserSettings(token, {
        displayName,
        emailNotifications: notification,
        weeklyReport,
        bounceAlerts,
      });
      showToast("Settings saved", "success");
    } catch (err) {
      showToast(err instanceof api.ApiError ? err.message : "Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    const token = getToken();
    if (!token) return;

    setExporting(true);
    try {
      const data = await api.exportUserData(token);
      generatePDF(data);
      showToast("PDF export ready", "success");
    } catch (err) {
      showToast(err instanceof api.ApiError ? err.message : "Export failed", "error");
    } finally {
      setExporting(false);
    }
  };

  const generatePDF = (data: Record<string, unknown>) => {
    const exportData = data as {
      exportedAt?: string;
      user?: { email?: string; displayName?: string; createdAt?: string };
      aliases?: { address?: string; label?: string; active?: number; forwarded_count?: number; created_at?: string; notes?: string; category?: string }[];
      wildcardRules?: { pattern?: string; label?: string; active?: number; forwarded_count?: number }[];
      emailLogs?: { alias_address?: string; sender?: string; subject?: string; forwarded_at?: string }[];
    };

    const aliases = exportData.aliases || [];
    const wildcards = exportData.wildcardRules || [];
    const logs = (exportData.emailLogs || []).slice(0, 100); // Limit logs in PDF
    const userInfo = exportData.user || {};

    const html = `<!DOCTYPE html>
<html>
<head>
<title>GhostRelay Data Export</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a2e; padding: 40px; font-size: 12px; line-height: 1.5; }
  .header { text-align: center; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #6366f1; }
  .header h1 { font-size: 22px; color: #6366f1; margin-bottom: 4px; }
  .header p { color: #64748b; font-size: 11px; }
  .section { margin-bottom: 28px; }
  .section h2 { font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }
  .info-item { background: #f8fafc; padding: 8px 12px; border-radius: 6px; }
  .info-item .label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
  .info-item .value { font-size: 13px; font-weight: 600; color: #1e293b; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th { background: #f1f5f9; padding: 8px 10px; text-align: left; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0; }
  td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; color: #334155; }
  tr:nth-child(even) { background: #fafbfc; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; }
  .badge-active { background: #dcfce7; color: #166534; }
  .badge-inactive { background: #fee2e2; color: #991b1b; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 10px; }
  .empty { color: #94a3b8; font-style: italic; padding: 12px; text-align: center; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<div class="header">
  <h1>GhostRelay Data Export</h1>
  <p>Exported on ${new Date(exportData.exportedAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
</div>

<div class="section">
  <h2>Account Information</h2>
  <div class="info-grid">
    <div class="info-item"><div class="label">Email</div><div class="value">${userInfo.email || '—'}</div></div>
    <div class="info-item"><div class="label">Display Name</div><div class="value">${userInfo.displayName || '—'}</div></div>
    <div class="info-item"><div class="label">Member Since</div><div class="value">${userInfo.createdAt ? new Date(userInfo.createdAt).toLocaleDateString() : '—'}</div></div>
    <div class="info-item"><div class="label">Total Aliases</div><div class="value">${aliases.length}</div></div>
  </div>
</div>

<div class="section">
  <h2>Email Aliases (${aliases.length})</h2>
  ${aliases.length === 0 ? '<div class="empty">No aliases</div>' : `
  <table>
    <thead><tr><th>Address</th><th>Label</th><th>Status</th><th>Forwarded</th><th>Created</th></tr></thead>
    <tbody>
      ${aliases.map(a => `<tr>
        <td>${a.address || ''}</td>
        <td>${a.label || '—'}</td>
        <td><span class="badge ${a.active ? 'badge-active' : 'badge-inactive'}">${a.active ? 'Active' : 'Disabled'}</span></td>
        <td>${a.forwarded_count || 0}</td>
        <td>${a.created_at ? new Date(a.created_at).toLocaleDateString() : '—'}</td>
      </tr>`).join('')}
    </tbody>
  </table>`}
</div>

${wildcards.length > 0 ? `
<div class="section">
  <h2>Wildcard Rules (${wildcards.length})</h2>
  <table>
    <thead><tr><th>Pattern</th><th>Label</th><th>Status</th><th>Matched</th></tr></thead>
    <tbody>
      ${wildcards.map(w => `<tr>
        <td>${w.pattern || ''}</td>
        <td>${w.label || '—'}</td>
        <td><span class="badge ${w.active ? 'badge-active' : 'badge-inactive'}">${w.active ? 'Active' : 'Disabled'}</span></td>
        <td>${w.forwarded_count || 0}</td>
      </tr>`).join('')}
    </tbody>
  </table>
</div>` : ''}

${logs.length > 0 ? `
<div class="section">
  <h2>Recent Email Activity (last ${logs.length})</h2>
  <table>
    <thead><tr><th>Alias</th><th>From</th><th>Subject</th><th>Date</th></tr></thead>
    <tbody>
      ${logs.map(l => `<tr>
        <td>${l.alias_address || ''}</td>
        <td>${(l.sender || '').substring(0, 30)}</td>
        <td>${(l.subject || '(no subject)').substring(0, 40)}</td>
        <td>${l.forwarded_at ? new Date(l.forwarded_at).toLocaleDateString() : '—'}</td>
      </tr>`).join('')}
    </tbody>
  </table>
</div>` : ''}

<div class="footer">
  <p>GhostRelay — Privacy-first email aliasing • ghostrelay.me</p>
  <p>This document contains personal data. Handle securely.</p>
</div>
</body>
</html>`;

    // Open in new window and trigger print (Save as PDF)
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
      // Fallback if onload doesn't fire
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") {
      showToast("Type DELETE to confirm", "error");
      return;
    }

    const token = getToken();
    if (!token) return;

    setDeleting(true);
    try {
      await api.deleteAccount(token);
      clearAuth();
      window.location.href = "/";
    } catch (err) {
      showToast(err instanceof api.ApiError ? err.message : "Failed to delete account", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--relay-text)]">Account Settings</h1>
        <p className="text-[var(--relay-text-muted)] text-sm mt-1">
          Manage your profile, notifications, and account.
        </p>
      </div>

      {/* Profile Section */}
      <section className="glass-card p-4 sm:p-6 md:p-8 rounded-2xl mb-4 sm:mb-6">
        <h2 className="text-lg font-semibold text-[var(--relay-text)] mb-5">Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--relay-text-muted)] mb-2">Email Address</label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <input
                type="email"
                value={user?.email || ""}
                readOnly
                className="w-full sm:flex-1 px-4 py-3 bg-[var(--relay-bg)] border border-[var(--relay-border)] rounded-xl text-[var(--relay-text)] text-sm opacity-60 cursor-not-allowed truncate"
              />
              <span className="self-start text-xs text-[var(--relay-text-dim)] bg-[var(--relay-card-hover)] px-3 py-1.5 rounded-lg whitespace-nowrap">Primary</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--relay-text-muted)] mb-2">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Optional display name"
              maxLength={50}
              disabled={loadingSettings}
              className="w-full px-4 py-3 bg-[var(--relay-bg)] border border-[var(--relay-border)] rounded-xl text-[var(--relay-text)] text-sm focus:outline-none focus:border-[var(--relay-primary)] focus:ring-2 focus:ring-[var(--relay-primary)]/10 transition-smooth placeholder:text-[var(--relay-text-dim)] disabled:opacity-50"
            />
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="glass-card p-4 sm:p-6 md:p-8 rounded-2xl mb-4 sm:mb-6">
        <h2 className="text-lg font-semibold text-[var(--relay-text)] mb-5">Notifications</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-[var(--relay-text)]">Email notifications</div>
              <div className="text-xs text-[var(--relay-text-muted)]">Receive alerts when aliases receive emails</div>
            </div>
            <button
              onClick={() => setNotification(!notification)}
              className={`w-12 h-7 rounded-full transition-smooth relative ${
                notification ? "bg-[var(--relay-primary)]" : "bg-[var(--relay-border)]"
              }`}
              aria-label="Toggle email notifications"
            >
              <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-smooth shadow-sm ${
                notification ? "left-6" : "left-1"
              }`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-[var(--relay-text)]">Weekly report</div>
              <div className="text-xs text-[var(--relay-text-muted)]">Get a weekly summary of alias activity</div>
            </div>
            <button
              onClick={() => setWeeklyReport(!weeklyReport)}
              className={`w-12 h-7 rounded-full transition-smooth relative ${
                weeklyReport ? "bg-[var(--relay-primary)]" : "bg-[var(--relay-border)]"
              }`}
              aria-label="Toggle weekly report"
            >
              <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-smooth shadow-sm ${
                weeklyReport ? "left-6" : "left-1"
              }`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-[var(--relay-text)]">Bounce alerts</div>
              <div className="text-xs text-[var(--relay-text-muted)]">Get notified when emails bounce</div>
            </div>
            <button
              onClick={() => setBounceAlerts(!bounceAlerts)}
              className={`w-12 h-7 rounded-full transition-smooth relative ${
                bounceAlerts ? "bg-[var(--relay-primary)]" : "bg-[var(--relay-border)]"
              }`}
              aria-label="Toggle bounce alerts"
            >
              <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-smooth shadow-sm ${
                bounceAlerts ? "left-6" : "left-1"
              }`} />
            </button>
          </div>
        </div>
      </section>

      {/* Account Limits */}
      <section className="glass-card p-4 sm:p-6 md:p-8 rounded-2xl mb-4 sm:mb-6">
        <h2 className="text-lg font-semibold text-[var(--relay-text)] mb-5">Account Limits</h2>
        <div className="flex items-center justify-between p-4 bg-[var(--relay-primary)]/5 border border-[var(--relay-primary)]/20 rounded-xl">
          <div>
            <div className="text-sm font-semibold text-[var(--relay-text)]">Email Aliases</div>
            <div className="text-xs text-[var(--relay-text-muted)]">Up to 20 aliases per account • Unlimited forwarding</div>
          </div>
          <div className="text-sm font-semibold text-[var(--relay-primary)]">Free</div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="glass-card p-6 md:p-8 rounded-2xl border-[var(--relay-danger)]/20 mb-6">
        <h2 className="text-lg font-semibold text-[var(--relay-danger)] mb-5">Danger Zone</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-[var(--relay-text)]">Export all data</div>
              <div className="text-xs text-[var(--relay-text-muted)]">Download all your aliases and settings as JSON</div>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="text-sm border border-[var(--relay-border)] text-[var(--relay-text-muted)] px-4 py-2 rounded-lg transition-smooth hover:border-[var(--relay-primary)] hover:text-[var(--relay-primary)] font-medium disabled:opacity-50"
            >
              {exporting ? "Exporting..." : "Export"}
            </button>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-[var(--relay-text)]">Delete account</div>
                <div className="text-xs text-[var(--relay-text-muted)]">Permanently delete your account and all data</div>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                className="text-sm border border-[var(--relay-danger)]/30 text-[var(--relay-danger)] px-4 py-2 rounded-lg transition-smooth hover:bg-[var(--relay-danger)] hover:text-white hover:border-[var(--relay-danger)] font-medium"
              >
                Delete
              </button>
            </div>
            {showDeleteConfirm && (
              <div className="p-4 border border-[var(--relay-danger)]/20 rounded-xl bg-[var(--relay-danger)]/5">
                <p className="text-xs text-[var(--relay-text-muted)] mb-3">
                  This action is irreversible. All aliases, email logs, and settings will be permanently deleted. Type <strong className="text-[var(--relay-danger)]">DELETE</strong> to confirm.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder="Type DELETE"
                    className="flex-1 px-3 py-2 bg-[var(--relay-bg)] border border-[var(--relay-border)] rounded-lg text-sm text-[var(--relay-text)] focus:outline-none focus:border-[var(--relay-danger)]"
                  />
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting || deleteConfirm !== "DELETE"}
                    className="text-sm bg-[var(--relay-danger)] text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 hover:bg-red-600 transition-smooth"
                  >
                    {deleting ? "Deleting..." : "Confirm"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[var(--relay-primary)] hover:bg-[var(--relay-primary-hover)] text-white font-semibold px-6 py-3 rounded-xl transition-smooth btn-glow disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
