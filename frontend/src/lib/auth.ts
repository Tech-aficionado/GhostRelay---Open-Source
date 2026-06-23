/**
 * Auth utilities — manages tokens, refresh tokens, and session state in localStorage
 * Supports device-aware session management and Firebase authentication
 */

const TOKEN_KEY = "ghostrelay_token";
const REFRESH_TOKEN_KEY = "ghostrelay_refresh_token";
const SESSION_ID_KEY = "ghostrelay_session_id";
const USER_KEY = "ghostrelay_user";
const AUTH_PROVIDER_KEY = "ghostrelay_auth_provider";

export interface StoredUser {
  id: string;
  email: string;
}

// ===== Access Token =====

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ===== Refresh Token =====

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function removeRefreshToken(): void {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// ===== Session ID =====

export function getSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_ID_KEY);
}

export function setSessionId(id: string): void {
  localStorage.setItem(SESSION_ID_KEY, id);
}

export function removeSessionId(): void {
  localStorage.removeItem(SESSION_ID_KEY);
}

// ===== User =====

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user: StoredUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function removeStoredUser(): void {
  localStorage.removeItem(USER_KEY);
}

// ===== Combined Auth Operations =====

/**
 * Store all auth data from a login/register response
 */
export function saveAuthData(data: {
  token: string;
  refreshToken: string;
  sessionId: string;
  user: StoredUser;
}): void {
  setToken(data.token);
  setRefreshToken(data.refreshToken);
  setSessionId(data.sessionId);
  setStoredUser(data.user);
  // Notify extension sync script of auth state change
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("ghostrelay-auth-change"));
  }
}

/**
 * Clear all auth state (full logout)
 */
export function clearAuth(): void {
  removeToken();
  removeRefreshToken();
  removeSessionId();
  removeStoredUser();
  // Notify extension sync script of auth state change
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("ghostrelay-auth-change"));
  }
}

/**
 * Check if user has a valid session (refresh token exists)
 * Access tokens may be expired but can be refreshed
 */
export function hasSession(): boolean {
  return !!getRefreshToken() || getAuthProvider() === "firebase";
}

/**
 * Get a valid token for API calls — handles both email/password and Firebase auth.
 * For Firebase users, refreshes the ID token from Firebase SDK.
 * For email/password users, returns the stored access token.
 */
export async function getActiveToken(): Promise<string | null> {
  const provider = getAuthProvider();

  if (provider === "firebase") {
    // Get fresh Firebase ID token
    const token = await getFirebaseToken();
    if (token) {
      setToken(token); // keep localStorage in sync
    }
    return token;
  }

  // Email/password — return stored token (auto-refresh happens in apiRequest)
  return getToken();
}

// ===== Auth Provider Tracking =====

export function getAuthProvider(): "firebase" | "email" | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_PROVIDER_KEY) as "firebase" | "email" | null;
}

export function setAuthProvider(provider: "firebase" | "email"): void {
  localStorage.setItem(AUTH_PROVIDER_KEY, provider);
}

export function removeAuthProvider(): void {
  localStorage.removeItem(AUTH_PROVIDER_KEY);
}

// ===== Firebase Google Auth =====
// These functions use dynamic imports to avoid Firebase initialization during SSR

/**
 * Sign in with Google via Firebase popup
 * Returns the Firebase user and ID token
 */
export async function signInWithGoogle(): Promise<{
  user: StoredUser;
  token: string;
}> {
  const { signInWithPopup } = await import("firebase/auth");
  const { getFirebaseAuth, getGoogleProvider } = await import("./firebase");

  const auth = getFirebaseAuth();
  const googleProvider = getGoogleProvider();
  const result = await signInWithPopup(auth, googleProvider);
  const firebaseUser = result.user;
  const token = await firebaseUser.getIdToken();

  const user: StoredUser = {
    id: firebaseUser.uid,
    email: firebaseUser.email || "",
  };

  // Store auth state
  setToken(token);
  setStoredUser(user);
  setAuthProvider("firebase");

  return { user, token };
}

/**
 * Sign out from Firebase
 */
export async function firebaseSignOut(): Promise<void> {
  const { signOut } = await import("firebase/auth");
  const { getFirebaseAuth } = await import("./firebase");

  const auth = getFirebaseAuth();
  await signOut(auth);
  clearAuth();
}

/**
 * Clear all auth state including provider info
 */
export function clearAuthFull(): void {
  clearAuth();
  removeAuthProvider();
}

/**
 * Subscribe to Firebase auth state changes
 * Returns an unsubscribe function
 */
export async function onFirebaseAuthChanged(
  callback: (user: { uid: string; email: string | null } | null) => void
): Promise<() => void> {
  const { onAuthStateChanged } = await import("firebase/auth");
  const { getFirebaseAuth } = await import("./firebase");

  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, callback);
}

/**
 * Get the current Firebase ID token (refreshes if expired)
 */
export async function getFirebaseToken(): Promise<string | null> {
  const { getFirebaseAuth } = await import("./firebase");

  const auth = getFirebaseAuth();
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  return currentUser.getIdToken(true);
}
