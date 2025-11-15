/**
 * MSW handlers for authentication endpoints
 */

import { http, HttpResponse } from "msw";
import { mockState, simulateDelay } from "../state";
import {
  generateMockToken,
  validateMockToken,
  generateUUID,
} from "../utils/tenantResolver";
import type { LoginRequest, AuthResponse, RefreshTokenRequest } from "@/lib/types/api";

export const authHandlers = [
  // POST /auth/login
  http.post("/auth/login", async ({ request }) => {
    await simulateDelay();

    const body = (await request.json()) as LoginRequest;
    const { email, password } = body;

    // Find user by email
    const user = Object.values(mockState.users).find((u) => u.email === email);

    if (!user || user.password !== password) {
      return HttpResponse.json(
        { message: "Invalid email or password", code: "INVALID_CREDENTIALS" },
        { status: 401 }
      );
    }

    // Generate tokens
    const accessTokenPayload = {
      sub: user.id,
      role: user.role,
      salonId: user.salonId,
      exp: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
    };

    const refreshTokenPayload = {
      sub: user.id,
      type: "refresh",
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
    };

    const accessToken = generateMockToken(accessTokenPayload);
    const refreshToken = generateMockToken(refreshTokenPayload);

    // Store refresh token
    mockState.refreshTokens[refreshToken] = {
      userId: user.id,
      expiresAt: refreshTokenPayload.exp * 1000,
    };

    const response: AuthResponse = {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        avatarUrl: user.avatarUrl,
        salonId: user.salonId,
      },
    };

    return HttpResponse.json(response, { status: 200 });
  }),

  // POST /auth/refresh
  http.post("/auth/refresh", async ({ request }) => {
    await simulateDelay();

    const body = (await request.json()) as RefreshTokenRequest;
    const { refreshToken } = body;

    // Validate refresh token
    const payload = validateMockToken(refreshToken);
    if (!payload || payload.type !== "refresh") {
      return HttpResponse.json(
        { message: "Invalid or expired refresh token", code: "INVALID_REFRESH_TOKEN" },
        { status: 401 }
      );
    }

    // Check if token exists in store
    const storedToken = mockState.refreshTokens[refreshToken];
    if (!storedToken || Date.now() >= storedToken.expiresAt) {
      return HttpResponse.json(
        { message: "Refresh token expired", code: "TOKEN_EXPIRED" },
        { status: 401 }
      );
    }

    // Get user
    const user = mockState.users[storedToken.userId];
    if (!user) {
      return HttpResponse.json(
        { message: "User not found", code: "USER_NOT_FOUND" },
        { status: 401 }
      );
    }

    // Generate new access token
    const newAccessTokenPayload = {
      sub: user.id,
      role: user.role,
      salonId: user.salonId,
      exp: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
    };

    const newAccessToken = generateMockToken(newAccessTokenPayload);

    return HttpResponse.json(
      { accessToken: newAccessToken },
      { status: 200 }
    );
  }),

  // POST /auth/logout
  http.post("/auth/logout", async ({ request }) => {
    await simulateDelay();

    const body = (await request.json()) as { refreshToken?: string } | null;
    const refreshToken = body?.refreshToken;

    // Remove refresh token from store
    if (refreshToken && mockState.refreshTokens[refreshToken]) {
      delete mockState.refreshTokens[refreshToken];
    }

    return new HttpResponse(null, { status: 204 });
  }),
];

