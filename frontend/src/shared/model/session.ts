import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { createGStore } from "create-gstore";
import { publicFetchClient } from "../api/instance";
import { components } from "../api/schema/generated";

type Session = {
  sub: string;
  userId: string;
  roles: string[];
  exp: number;
  iat: number;
  iss: string;
};

const TOKEN_KEY = "token"; 


let refreshTokenPromise: Promise<string | null> | null = null;

export const useSession = createGStore(() => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  const login = (token: string) => {
    localStorage.setItem(TOKEN_KEY, token); 
    setToken(token);
    
  };

  const logout = async () => {
    
    try {
      await publicFetchClient.POST('/auth/logout' as const, {
        body: {},
       
      });
    } catch (e) {
      console.error('Logout error:', e);
    }
    
   
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  const session = token ? jwtDecode<Session>(token) : null;

  const refreshToken = async () => {
    if (!token) {
      return null;
    }

    let currentSession: Session;
    try {
      currentSession = jwtDecode<Session>(token);
    } catch (e) {
      logout();
      return null;
    }

    
    if (currentSession.exp < Date.now() / 1000) {
      if (!refreshTokenPromise) {
        refreshTokenPromise = publicFetchClient.POST('/auth/refresh' as const, {
          body: {},
        }).then(({ data, error }) => {
          refreshTokenPromise = null;
          if (error) {
            logout();
            return null;
          }
          
          if (data?.token) {
            login(data.token);  
            return data.token;
          }
          return null;
        }).catch(() => {
          refreshTokenPromise = null;
          logout();
          return null;
        });
      }
      return refreshTokenPromise;
    }

    return token;  
  };

  return { refreshToken, login, logout, session };
});