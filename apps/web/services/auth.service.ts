const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthUserResponse = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

export type RegisterResponse = AuthUserResponse;

export class AuthApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
  }
}

const TECHNICAL_ERROR_PATTERNS = [
  /bad request/i,
  /internal server error/i,
  /fetch failed/i,
  /network error/i,
  /typeerror/i,
  /cannot read/i,
  /unexpected error/i,
  /stack trace/i,
  /failed to fetch/i,
  /traceback/i,
];

function sanitizeErrorMessage(msg: string | null | undefined, fallback: string): string {
  if (!msg || typeof msg !== "string") return fallback;
  if (TECHNICAL_ERROR_PATTERNS.some((pattern) => pattern.test(msg))) {
    return fallback;
  }
  return msg;
}

function extractErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") {
    return fallback;
  }

  const detail = (data as { detail?: unknown }).detail;

  if (typeof detail === "string") {
    return sanitizeErrorMessage(detail, fallback);
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (item && typeof item === "object" && "msg" in item) {
          return sanitizeErrorMessage(String((item as { msg: unknown }).msg), fallback);
        }
        return null;
      })
      .filter((msg): msg is string => Boolean(msg) && msg !== fallback);

    if (messages.length > 0) {
      return messages.join(", ");
    }
  }

  return fallback;
}

async function postAuth<T>(
  path: string,
  body: unknown,
  fallbackError: string,
): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    const data: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      throw new AuthApiError(
        extractErrorMessage(data, fallbackError),
        response.status,
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof AuthApiError) {
      throw error;
    }
    throw new AuthApiError(fallbackError, 500);
  }
}

/**
 * Registers a new user account.
 */
export async function register(
  payload: RegisterPayload,
): Promise<AuthUserResponse> {
  return postAuth<AuthUserResponse>(
    "/api/auth/register",
    payload,
    "Não foi possível criar a conta.",
  );
}

/**
 * Authenticates an existing user (no JWT in this stage).
 */
export async function login(
  payload: LoginPayload,
): Promise<AuthUserResponse> {
  return postAuth<AuthUserResponse>(
    "/api/auth/login",
    payload,
    "Não foi possível entrar. Tente novamente.",
  );
}
