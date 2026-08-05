import type { AuthUserResponse } from "@/services/auth.service";

const AUTH_USER_KEY = "mediassist.auth.user";

export type AuthUser = AuthUserResponse;

export function getUserInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  const first = parts[0][0] ?? "";
  const last = parts[parts.length - 1][0] ?? "";
  return `${first}${last}`.toUpperCase();
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(AUTH_USER_KEY);
    if (!raw) {
      if (typeof document !== "undefined") {
        document.cookie = `${AUTH_USER_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax`;
      }
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    if (
      typeof parsed.id !== "string" ||
      typeof parsed.name !== "string" ||
      typeof parsed.email !== "string"
    ) {
      return null;
    }

    if (typeof document !== "undefined" && !document.cookie.includes(`${AUTH_USER_KEY}=`)) {
      document.cookie = `${AUTH_USER_KEY}=true; path=/; max-age=86400; SameSite=Lax`;
    }

    return {
      id: parsed.id,
      name: parsed.name,
      email: parsed.email,
      created_at:
        typeof parsed.created_at === "string" ? parsed.created_at : "",
    };
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  document.cookie = `${AUTH_USER_KEY}=true; path=/; max-age=86400; SameSite=Lax`;
}

export function clearStoredUser(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(AUTH_USER_KEY);
  document.cookie = `${AUTH_USER_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax`;
}

