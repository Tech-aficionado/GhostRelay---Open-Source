/**
 * GhostRelay API Client
 * Handles communication with the Cloudflare Worker backend
 * Supports automatic token refresh on 401 responses
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

interface ApiOptions {
  method?: string;
  body?: unknown;
  token?: string | null;
  skipRefresh?: boolean; // prevent infinite refresh loops
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, token, skipRefresh = false } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data: Record<string, unknown>;
  try {
    data = await response.json();
  } catch {
    throw new ApiError(
      `Server returned non-JSON response (status ${response.status})`,
      response.status
    );
  }

  // Auto-refresh on 401 if we have a refresh token
  if (response.status === 401 && !skipRefresh && token) {
    const { getRefreshToken, setToken: saveToken } = await import("./auth");
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        const refreshResult = await refreshAccessToken(refreshToken);
        saveToken(refreshResult.token);
        // Retry original request with new token
        return apiRequest<T>(endpoint, { ...options, token: refreshResult.token, skipRefresh: true });
      } catch {
        // Refresh failed — token is truly expired
        throw new ApiError(
          (data.error as string) || "Session expired. Please login again.",
          401
        );
      }
    }
  }

  if (!response.ok) {
    throw new ApiError(
      (data.error as string) || `Request failed with status ${response.status}`,
      response.status
    );
  }

  return data as T;
}

// ===== Auth =====

export interface AuthResponse {
  user: { id: string; email: string };
  token: string;
  refreshToken: string;
  sessionId: string;
}

export async function register(email: string, password: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: { email, password },
  });
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export interface RefreshResponse {
  token: string;
  sessionId: string;
}

export async function refreshAccessToken(refreshToken: string): Promise<RefreshResponse> {
  return apiRequest<RefreshResponse>("/api/auth/refresh", {
    method: "POST",
    body: { refreshToken },
    skipRefresh: true, // prevent infinite loop
  });
}

export async function logout(token: string): Promise<void> {
  await apiRequest("/api/auth/logout", {
    method: "POST",
    token,
    skipRefresh: true,
  });
}

// ===== Sessions =====

export interface Session {
  id: string;
  deviceName: string;
  ipAddress: string;
  createdAt: string;
  lastUsedAt: string;
  isCurrent: boolean;
}

interface ListSessionsResponse {
  sessions: Session[];
}

export async function listSessions(token: string): Promise<ListSessionsResponse> {
  return apiRequest<ListSessionsResponse>("/api/auth/sessions", { token });
}

export async function revokeSession(sessionId: string, token: string): Promise<void> {
  await apiRequest(`/api/auth/sessions/${sessionId}`, {
    method: "DELETE",
    token,
  });
}

// ===== Aliases =====

export interface AliasData {
  id: string;
  address: string;
  label: string;
  notes: string;
  category: string;
  active: boolean;
  forwarded: number;
  createdAt: string;
}

interface ListAliasesResponse {
  aliases: AliasData[];
  count: number;
  limit: number;
}

interface CreateAliasResponse {
  alias: AliasData;
}

export async function listAliases(token: string): Promise<ListAliasesResponse> {
  return apiRequest<ListAliasesResponse>("/api/aliases", { token });
}

export async function createAlias(label: string, token: string, customAlias?: string, notes?: string, category?: string, expiresInDays?: number, maxEmails?: number): Promise<CreateAliasResponse> {
  const body: { label: string; customAlias?: string; notes?: string; category?: string; expiresInDays?: number; maxEmails?: number } = { label };
  if (customAlias) {
    body.customAlias = customAlias;
  }
  if (notes) {
    body.notes = notes;
  }
  if (category) {
    body.category = category;
  }
  if (expiresInDays) {
    body.expiresInDays = expiresInDays;
  }
  if (maxEmails) {
    body.maxEmails = maxEmails;
  }
  return apiRequest<CreateAliasResponse>("/api/aliases", {
    method: "POST",
    body,
    token,
  });
}

export async function toggleAlias(id: string, active: boolean, token: string): Promise<void> {
  await apiRequest(`/api/aliases/${id}`, {
    method: "PATCH",
    body: { active },
    token,
  });
}

export async function updateAliasNotes(id: string, notes: string, token: string): Promise<void> {
  await apiRequest(`/api/aliases/${id}`, {
    method: "PATCH",
    body: { notes },
    token,
  });
}

export async function updateAliasCategory(id: string, category: string, token: string): Promise<void> {
  await apiRequest(`/api/aliases/${id}`, {
    method: "PATCH",
    body: { category },
    token,
  });
}

export async function deleteAlias(id: string, token: string): Promise<void> {
  await apiRequest(`/api/aliases/${id}`, {
    method: "DELETE",
    token,
  });
}

// ===== Bounces =====

export interface BounceData {
  id: string;
  aliasId: string;
  aliasAddress: string;
  recipientEmail: string;
  bounceType: "hard" | "soft" | "complaint";
  bounceReason: string;
  originalSender: string;
  originalSubject: string;
  bouncedAt: string;
  acknowledged: boolean;
}

interface ListBouncesResponse {
  bounces: BounceData[];
  count: number;
}

export interface BounceStats {
  totalBounces: number;
  hardBounces: number;
  softBounces: number;
  complaints: number;
  unacknowledged: number;
  topBouncingAliases: {
    id: string;
    address: string;
    bounceCount: number;
  }[];
}

export async function listBounces(token: string): Promise<ListBouncesResponse> {
  return apiRequest<ListBouncesResponse>("/api/bounces", { token });
}

export async function getBounceStats(token: string): Promise<BounceStats> {
  return apiRequest<BounceStats>("/api/bounces/stats", { token });
}

export async function acknowledgeBounce(bounceId: string, token: string): Promise<void> {
  await apiRequest(`/api/bounces/${bounceId}/acknowledge`, {
    method: "PATCH",
    token,
  });
}

export async function deleteBounce(bounceId: string, token: string): Promise<void> {
  await apiRequest(`/api/bounces/${bounceId}`, {
    method: "DELETE",
    token,
  });
}

// ===== Health Check =====

export async function healthCheck(): Promise<{ status: string; timestamp: number }> {
  return apiRequest("/api/health");
}

// ===== Email Logs =====

export interface EmailLog {
  id: string;
  aliasId: string;
  aliasAddress: string;
  aliasLabel: string;
  sender: string;
  subject: string;
  forwardedAt: string;
}

interface ListEmailLogsResponse {
  logs: EmailLog[];
  total: number;
  limit: number;
  offset: number;
}

export async function listEmailLogs(token: string, limit = 50, offset = 0): Promise<ListEmailLogsResponse> {
  return apiRequest<ListEmailLogsResponse>(`/api/email-logs?limit=${limit}&offset=${offset}`, { token });
}

export async function listAliasEmailLogs(aliasId: string, token: string, limit = 50): Promise<{ logs: EmailLog[]; count: number }> {
  return apiRequest(`/api/email-logs/${aliasId}?limit=${limit}`, { token });
}

// ===== Sender Blocklist =====

export interface BlockedSender {
  id: string;
  senderEmail: string;
  createdAt: string;
}

interface ListBlockedResponse {
  blocked: BlockedSender[];
  count: number;
}

export async function listBlockedSenders(aliasId: string, token: string): Promise<ListBlockedResponse> {
  return apiRequest<ListBlockedResponse>(`/api/blocklist/${aliasId}`, { token });
}

export async function blockSender(aliasId: string, senderEmail: string, token: string): Promise<{ blocked: BlockedSender }> {
  return apiRequest(`/api/blocklist/${aliasId}`, {
    method: "POST",
    body: { senderEmail },
    token,
  });
}

export async function unblockSender(aliasId: string, blockId: string, token: string): Promise<void> {
  await apiRequest(`/api/blocklist/${aliasId}/${blockId}`, {
    method: "DELETE",
    token,
  });
}

// ===== Analytics =====

export interface AnalyticsOverview {
  totalAliases: number;
  activeAliases: number;
  totalForwarded: number;
  last24h: number;
  last7d: number;
  uniqueSenders30d: number;
}

export interface VolumeDataPoint {
  date: string;
  count: number;
}

export interface TopAlias {
  id: string;
  address: string;
  label: string;
  totalForwarded: number;
  recentCount: number;
}

export interface DayVolume {
  day: string;
  dayIndex: number;
  count: number;
}

export async function getAnalyticsOverview(token: string): Promise<AnalyticsOverview> {
  return apiRequest<AnalyticsOverview>("/api/analytics/overview", { token });
}

export async function getAnalyticsVolume(token: string, days = 30): Promise<{ volume: VolumeDataPoint[]; days: number }> {
  return apiRequest(`/api/analytics/volume?days=${days}`, { token });
}

export async function getTopAliases(token: string): Promise<{ aliases: TopAlias[] }> {
  return apiRequest("/api/analytics/top-aliases", { token });
}

export async function getBusiestDays(token: string): Promise<{ days: DayVolume[] }> {
  return apiRequest("/api/analytics/busiest-days", { token });
}

// ===== Password Reset =====

export async function forgotPassword(email: string): Promise<{ message: string }> {
  return apiRequest("/api/auth/forgot-password", {
    method: "POST",
    body: { email },
    skipRefresh: true,
  });
}

export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  return apiRequest("/api/auth/reset-password", {
    method: "POST",
    body: { token, newPassword },
    skipRefresh: true,
  });
}

export async function verifyResetToken(token: string): Promise<{ valid: boolean; error?: string }> {
  return apiRequest(`/api/auth/verify-reset-token?token=${encodeURIComponent(token)}`, {
    skipRefresh: true,
  });
}

// ===== Alias Availability =====

export async function checkAliasAvailability(alias: string, token: string): Promise<{ available: boolean; reason?: string }> {
  return apiRequest(`/api/aliases/check-availability?alias=${encodeURIComponent(alias)}`, { token });
}

// ===== Multiple Forwarding Destinations =====

export interface Destination {
  id: string;
  email: string;
  active: boolean;
  createdAt: string;
}

interface ListDestinationsResponse {
  destinations: Destination[];
  primaryEmail: string;
  count: number;
  limit: number;
}

export async function listDestinations(aliasId: string, token: string): Promise<ListDestinationsResponse> {
  return apiRequest<ListDestinationsResponse>(`/api/aliases/${aliasId}/destinations`, { token });
}

export async function addDestination(aliasId: string, email: string, token: string): Promise<{ destination: Destination }> {
  return apiRequest(`/api/aliases/${aliasId}/destinations`, {
    method: "POST",
    body: { email },
    token,
  });
}

export async function removeDestination(aliasId: string, destId: string, token: string): Promise<void> {
  await apiRequest(`/api/aliases/${aliasId}/destinations/${destId}`, {
    method: "DELETE",
    token,
  });
}

export async function toggleDestination(aliasId: string, destId: string, active: boolean, token: string): Promise<void> {
  await apiRequest(`/api/aliases/${aliasId}/destinations/${destId}`, {
    method: "PATCH",
    body: { active },
    token,
  });
}

// ===== Wildcard/Catch-All Rules =====

export interface WildcardRule {
  id: string;
  pattern: string;
  label: string;
  notes: string;
  active: boolean;
  forwarded: number;
  createdAt: string;
}

interface ListWildcardsResponse {
  wildcards: WildcardRule[];
  count: number;
  limit: number;
}

export async function listWildcards(token: string): Promise<ListWildcardsResponse> {
  return apiRequest<ListWildcardsResponse>("/api/wildcards", { token });
}

export async function createWildcard(pattern: string, label: string, token: string, notes?: string): Promise<{ wildcard: WildcardRule }> {
  return apiRequest("/api/wildcards", {
    method: "POST",
    body: { pattern, label, notes },
    token,
  });
}

export async function toggleWildcard(id: string, active: boolean, token: string): Promise<void> {
  await apiRequest(`/api/wildcards/${id}`, {
    method: "PATCH",
    body: { active },
    token,
  });
}

export async function deleteWildcard(id: string, token: string): Promise<void> {
  await apiRequest(`/api/wildcards/${id}`, {
    method: "DELETE",
    token,
  });
}

// ===== Push Notifications =====

export async function getVapidKey(token: string): Promise<{ publicKey: string }> {
  return apiRequest("/api/push/vapid-key", { token });
}

export async function subscribePush(subscription: PushSubscriptionJSON, token: string): Promise<void> {
  await apiRequest("/api/push/subscribe", {
    method: "POST",
    body: subscription,
    token,
  });
}

export async function unsubscribePush(endpoint: string, token: string): Promise<void> {
  await apiRequest("/api/push/unsubscribe", {
    method: "DELETE",
    body: { endpoint },
    token,
  });
}

export { ApiError };
