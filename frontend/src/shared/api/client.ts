import { CONFIG } from "@/shared/model/config";
import {
  clearSession,
  getAccessToken,
  refreshAccessToken,
} from "@/shared/model/session";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

type ApiRequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
};

async function parseError(res: Response): Promise<string> {
  const text = await res.text();
  if (!text) {
    return res.statusText;
  }
  try {
    const json = JSON.parse(text) as { message?: string };
    return json.message ?? text;
  } catch {
    return text;
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { method = "GET", body, auth = true, signal } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = await getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const doFetch = () =>
    fetch(`${CONFIG.API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: "include",
      signal,
    });

  let response = await doFetch();

  if (response.status === 401 && auth) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers.Authorization = `Bearer ${refreshed}`;
      response = await doFetch();
    } else {
      clearSession();
      throw new ApiError(401, "Требуется авторизация");
    }
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    throw new ApiError(response.status, await parseError(response));
  }

  return response.json() as Promise<T>;
}
