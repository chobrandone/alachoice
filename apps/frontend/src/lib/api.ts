/**
 * Typed fetch wrapper for the ALA API. Unwraps the { success, data, error, meta }
 * envelope, throws ApiError on failure, and attaches the admin bearer token when
 * present. The React app NEVER talks to Supabase directly for writes — only here.
 */
const BASE_URL = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:4000/api/v1';

export interface ApiMeta {
  page?: number;
  pageSize?: number;
  total?: number;
}

export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;
  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const TOKEN_KEY = 'ala_admin_token';
export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

const PORTAL_TOKEN_KEY = 'ala_portal_token';
export const portalTokenStore = {
  get: () => localStorage.getItem(PORTAL_TOKEN_KEY),
  set: (t: string) => localStorage.setItem(PORTAL_TOKEN_KEY, t),
  clear: () => localStorage.removeItem(PORTAL_TOKEN_KEY),
};

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Attach the admin bearer token. */
  auth?: boolean;
  /** Attach the client-portal bearer token. */
  portalAuth?: boolean;
  /** Skip envelope parsing (e.g. CSV downloads). */
  raw?: boolean;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<{ data: T; meta?: ApiMeta }> {
  const { body, auth, portalAuth, raw, headers, ...rest } = opts;
  const h = new Headers(headers);
  const isFormData = body instanceof FormData;
  if (body !== undefined && !isFormData) h.set('Content-Type', 'application/json');
  if (auth) {
    const token = tokenStore.get();
    if (token) h.set('Authorization', `Bearer ${token}`);
  }
  if (portalAuth) {
    const token = portalTokenStore.get();
    if (token) h.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: h,
    body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
  });

  if (raw) {
    if (!res.ok) throw new ApiError(res.status, 'HTTP_ERROR', res.statusText);
    return { data: (await res.blob()) as unknown as T };
  }

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    const err = json?.error;
    throw new ApiError(res.status, err?.code ?? 'HTTP_ERROR', err?.message ?? res.statusText, err?.details);
  }
  return { data: json.data as T, meta: json.meta };
}

export const api = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'PUT', body }),
  delete: <T>(path: string, opts?: RequestOptions) => request<T>(path, { ...opts, method: 'DELETE' }),
};
