/**
 * Authentication Context and Provider
 */

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { setTokens, setOnTokenRefresh, setOnAuthError, api } from "@/lib/apiClient";
import type { User, AuthResponse, LoginRequest } from "@/lib/types/api";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateTokens: (access: string, refresh?: string) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_STORAGE_KEY = "glownova_refresh_token";
const USER_STORAGE_KEY = "glownova_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Update tokens in state and API client
  const updateTokens = useCallback((access: string, refresh?: string) => {
    setState((prev) => ({
      ...prev,
      accessToken: access,
      refreshToken: refresh || prev.refreshToken,
      isAuthenticated: true,
    }));

    setTokens(access, refresh || state.refreshToken);

    // Store refresh token in localStorage
    if (refresh) {
      if (typeof window !== "undefined") {
        localStorage.setItem(TOKEN_STORAGE_KEY, refresh);
      }
    }
  }, [state.refreshToken]);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      if (typeof window === "undefined") {
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      const storedRefreshToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);

      if (!storedRefreshToken || !storedUser) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        // Try to refresh access token
        const user = JSON.parse(storedUser) as User;
        setState((prev) => ({
          ...prev,
          user,
          refreshToken: storedRefreshToken,
        }));

        setTokens(null, storedRefreshToken);

        const response = await api.post<{ accessToken: string }>("/auth/refresh", {
          refreshToken: storedRefreshToken,
        });

        setState((prev) => ({
          ...prev,
          user,
          accessToken: response.accessToken,
          refreshToken: storedRefreshToken,
          isAuthenticated: true,
          isLoading: false,
        }));

        setTokens(response.accessToken, storedRefreshToken);
      } catch (error) {
        // Clear invalid tokens
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        setState((prev) => ({
          ...prev,
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        }));
        setTokens(null, null);
      }
    };

    initializeAuth();
  }, []);

  // Set up token refresh callback
  useEffect(() => {
    setOnTokenRefresh((newAccessToken: string) => {
      setState((prev) => ({ ...prev, accessToken: newAccessToken }));
    });

    setOnAuthError(() => {
      // Token refresh failed, clear auth state
      if (typeof window !== "undefined") {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
      setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
      setTokens(null, null);
    });
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      const response = await api.post<AuthResponse>("/auth/login", credentials);

      setState({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });

      setTokens(response.accessToken, response.refreshToken);

      // Store tokens and user
      if (typeof window !== "undefined") {
        localStorage.setItem(TOKEN_STORAGE_KEY, response.refreshToken);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
      }
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (state.refreshToken) {
        await api.post("/auth/logout", { refreshToken: state.refreshToken });
      }
    } catch {
      // Ignore errors on logout
    } finally {
      // Clear state
      setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });

      setTokens(null, null);

      // Clear storage
      if (typeof window !== "undefined") {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
  }, [state.refreshToken]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        updateTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

