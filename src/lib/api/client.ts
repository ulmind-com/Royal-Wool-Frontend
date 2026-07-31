import { API_BASE_URL } from "@/lib/site";

/**
 * REST client for the existing Royal Wool backend.
 *
 * The backend is hosted on a free tier that sleeps: the first request after
 * idle can take 30–50s and may answer 502/503 while the container boots.
 * So GETs get a long timeout plus bounded retries; writes are never retried.
 */

const TIMEOUT_MS = 60_000;
const RETRYABLE_STATUS = new Set([502, 503, 504, 522, 524]);
const TOKEN_KEY = "rw_token";

export class ApiError extends Error {
  readonly status: number;
  readonly detail: string | undefined;

  constructor(status: number, message: string, detail?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }

  get isNotFound() {
    return this.status === 404;
  }

  /** True when the backend is unreachable or still waking up. */
  get isOffline() {
    return this.status === 0 || RETRYABLE_STATUS.has(this.status);
  }
}

/** Auth token is written in Phase 3; reading it here means no client changes then. */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function buildUrl(path: string, query?: QueryParams): string {
  const url = new URL(path.startsWith("/") ? path : `/${path}`, API_BASE_URL);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

export type QueryParams = Record<string, string | number | boolean | undefined | null>;

export interface ApiRequestInit extends Omit<RequestInit, "body"> {
  query?: QueryParams;
  json?: unknown;
  /** Retry attempts for idempotent reads. Writes force 1. */
  retries?: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function apiFetch<T>(path: string, init: ApiRequestInit = {}): Promise<T> {
  const { query, json, retries, signal, headers, method = "GET", ...rest } = init;
  const isRead = method.toUpperCase() === "GET";
  const maxAttempts = isRead ? Math.max(1, retries ?? 3) : 1;

  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept", "application/json");
  if (json !== undefined) requestHeaders.set("Content-Type", "application/json");
  const token = getAuthToken();
  if (token) requestHeaders.set("Authorization", `Bearer ${token}`);

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const timeout = new AbortController();
    const timer = setTimeout(() => timeout.abort(), TIMEOUT_MS);
    const onAbort = () => timeout.abort();
    signal?.addEventListener("abort", onAbort);

    try {
      const response = await fetch(buildUrl(path, query), {
        ...rest,
        method,
        headers: requestHeaders,
        ...(json === undefined ? {} : { body: JSON.stringify(json) }),
        signal: timeout.signal,
      });

      if (!response.ok) {
        const detail = await readDetail(response);
        const error = new ApiError(response.status, detail ?? response.statusText, detail);
        if (isRead && RETRYABLE_STATUS.has(response.status) && attempt < maxAttempts) {
          lastError = error;
          await sleep(attempt * 1500);
          continue;
        }
        throw error;
      }

      if (response.status === 204) return undefined as T;
      return (await response.json()) as T;
    } catch (error) {
      // Caller aborted (navigation, unmount) — surface immediately.
      if (signal?.aborted) throw error;
      if (error instanceof ApiError && !error.isOffline) throw error;

      lastError = error instanceof ApiError ? error : new ApiError(0, "Network unavailable");
      if (attempt >= maxAttempts) break;
      await sleep(attempt * 1500);
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
    }
  }

  throw lastError instanceof ApiError ? lastError : new ApiError(0, "Network unavailable");
}

async function readDetail(response: Response): Promise<string | undefined> {
  try {
    const text = await response.text();
    if (!text) return undefined;
    try {
      const parsed = JSON.parse(text) as { detail?: unknown; message?: unknown };
      const detail = parsed.detail ?? parsed.message;
      if (typeof detail === "string") return detail;
      return text.slice(0, 300);
    } catch {
      return text.slice(0, 300);
    }
  } catch {
    return undefined;
  }
}
