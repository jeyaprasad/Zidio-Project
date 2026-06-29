/**
 * Shared auth utilities for NexusHR frontend.
 * Centralises token management, API calls with auth headers,
 * and redirect-to-login guard used by protected routes.
 */

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("nexushr_token");
}

export function getUser(): { email: string; fullName: string; role: string } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("nexushr_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function logout() {
  if (typeof window === "undefined") return;
  const token = getToken();
  if (token) {
    // Fire-and-forget blacklist request
    fetch("/api/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
  localStorage.removeItem("nexushr_token");
  localStorage.removeItem("nexushr_refresh");
  localStorage.removeItem("nexushr_user");
  window.location.href = "/login";
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(path, { ...options, headers });
  if (res.status === 401) {
    logout();
  }
  return res;
}

/** Redirect guard — call inside beforeLoad for protected routes */
export function requireAuth() {
  if (typeof window !== "undefined" && !getToken()) {
    throw new Error("REDIRECT_LOGIN");
  }
}
