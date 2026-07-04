import type { ApiResponse, UserPublic } from "@muzzap/shared";
import { useAuthStore } from "@/stores/auth-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  skipAuth?: boolean;
  /** Internal: prevents infinite refresh loops on a request retried after a 401. */
  _isRetry?: boolean;
}

async function refreshSession(): Promise<boolean> {
  const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) return false;
  const json = (await res.json()) as ApiResponse<{
    user: UserPublic;
    accessToken: string;
  }>;
  if (!json.success) return false;
  useAuthStore.getState().setSession(json.data);
  return true;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, skipAuth = false, _isRetry = false } = options;
  const accessToken = useAuthStore.getState().accessToken;

  const res = await fetch(`${API_URL}/api/v1${path}`, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && !skipAuth ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && !skipAuth && !_isRetry) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return apiFetch<T>(path, { ...options, _isRetry: true });
    }
    useAuthStore.getState().clearSession();
  }

  if (res.status === 204) return undefined as T;

  const json = (await res.json()) as ApiResponse<T>;
  if (!json.success) {
    throw new ApiError(json.error.code, json.error.message, json.error.details);
  }
  return json.data;
}

/** Multipart upload variant of apiFetch — used for endpoints receiving raw file bytes (multer). */
export async function apiUpload<T>(
  path: string,
  file: File,
  { _isRetry = false }: { _isRetry?: boolean } = {},
): Promise<T> {
  const accessToken = useAuthStore.getState().accessToken;
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/api/v1${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: formData,
  });

  if (res.status === 401 && !_isRetry) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return apiUpload<T>(path, file, { _isRetry: true });
    }
    useAuthStore.getState().clearSession();
  }

  const json = (await res.json()) as ApiResponse<T>;
  if (!json.success) {
    throw new ApiError(json.error.code, json.error.message, json.error.details);
  }
  return json.data;
}

export { refreshSession };
