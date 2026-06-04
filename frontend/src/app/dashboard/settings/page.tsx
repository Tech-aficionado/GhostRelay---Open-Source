"use client";

import { useState } from "react";
import { useDashboard } from "@/lib/DashboardContext";

export default function SettingsPage() {
  const { user, showToast } = useDashboard();
  const [notification, setNotification] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [bounceAlerts, setBounceAlerts] = useState(true);

  const handleSave = () => {
    showToast("Settings saved successfully!", "success");
  };

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--relay-text)]">Account Settings</h1>
        <p className="text-[var(--relay-text-muted)] text-sm mt-1">
          Manage your profile, notifications, and billing.
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
              placeholder="Optional display name"
              className="w-full px-4 py-3 bg-[var(--relay-bg)] border border-[var(--relay-border)] rounded-xl text-[var(--relay-text)] text-sm focus:outline-none focus:border-[var(--relay-primary)] focus:ring-2 focus:ring-[var(--relay-primary)]/10 transition-smooth placeholder:text-[var(--relay-text-dim)]"
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
              <div className="text-xs text-[var(--relay-text-muted)]">Download all your aliases and settings</div>
            </div>
            <button className="text-sm border border-[var(--relay-border)] text-[var(--relay-text-muted)] px-4 py-2 rounded-lg transition-smooth hover:border-[var(--relay-primary)] hover:text-[var(--relay-primary)] font-medium">
              Export
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-[var(--relay-text)]">Delete account</div>
              <div className="text-xs text-[var(--relay-text-muted)]">Permanently delete your account and all data</div>
            </div>
            <button className="text-sm border border-[var(--relay-danger)]/30 text-[var(--relay-danger)] px-4 py-2 rounded-lg transition-smooth hover:bg-[var(--relay-danger)] hover:text-white hover:border-[var(--relay-danger)] font-medium">
              Delete
            </button>
          </div>
        </div>
      </section>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="bg-[var(--relay-primary)] hover:bg-[var(--relay-primary-hover)] text-white font-semibold px-6 py-3 rounded-xl transition-smooth btn-glow"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
