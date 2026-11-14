import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { createGStore } from "create-gstore";
import { queryClient } from "@/shared/api/query-client";
import { CONFIG } from "./config";
import type { LoginResponse } from "@/shared/api/types";

const TOKEN_KEY = "taskflow_access_token";

export type JwtPayload = {
  sub: string;
  username?: string;
  roles?: string[];
  exp: number;
};

let memoryToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

function readToken(): string | null {
  return memoryToken ?? localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string | null) {
  memoryToken = token;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function clearSession() {
  setAccessToken(null);
}

export async function refreshAccessToken(): Promise<string | null> {
  const current = readToken();
  if (!current) {
    return null;
  }

  try {
    const decoded = jwtDecode<JwtPayload>(current);
    if (decoded.exp > Date.now() / 1000 + 30) {
      return current;
    }
  } catch {
    clearSession();
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = fetch(`${CONFIG.API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then(async (res) => {
        refreshPromise = null;
        if (!res.ok) {
          clearSession();
          return null;
        }
        const data = (await res.json()) as LoginResponse;
        setAccessToken(data.accessToken);
        return data.accessToken;
      })
      .catch(() => {
        refreshPromise = null;
        clearSession();
        return null;
      });
  }

  return refreshPromise;
}

export async function getAccessToken(): Promise<string | null> {
  const token = readToken();
  if (!token) {
    return null;
  }
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (decoded.exp <= Date.now() / 1000 + 30) {
      return refreshAccessToken();
    }
    return token;
  } catch {
    clearSession();
    return null;
  }
}

export const useSession = createGStore(() => {
  const [token, setToken] = useState(() => readToken());

  const login = (accessToken: string) => {
    setAccessToken(accessToken);
    setToken(accessToken);
  };

  const logout = async () => {
    const auth = readToken();
    clearSession();
    setToken(null);
    queryClient.clear();
    if (!auth) return;
    try {
      await fetch(`${CONFIG.API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: { Authorization: `Bearer ${auth}` },
      });
    } catch {
      /* local session is already closed */
    }
  };

  const session = token
    ? (() => {
        try {
          return jwtDecode<JwtPayload>(token);
        } catch {
          return null;
        }
      })()
    : null;

  return { session, login, logout, token };
});
