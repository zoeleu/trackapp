// Copyright (C) 2026  Zoe Leullier
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
import type { TokenCacheEntry } from "@/lib/_types/tracking";

// ── In-memory cache ───────────────────────────────────────────────────────
// Suitable for a single-process deployment. Swap for Redis or similar when
// scaling horizontally so every cold start doesn't force a re-auth.

const TOKEN_KEY = "external_tracking";

const store = new Map<string, TokenCacheEntry>();
let inFlightRequest: Promise<string> | null = null;

/** Return the cached token if it exists and hasn't expired, otherwise null. */
export function getToken(): string | null {
  const entry = store.get(TOKEN_KEY);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    store.delete(TOKEN_KEY);
    return null;
  }

  return entry.authToken;
}

/** Store a token with a TTL in seconds (converted to epoch-ms expiry). */
export function setToken(authToken: string, ttlSeconds: number): void {
  // Shave 5 s off the expiry to avoid edge-case race conditions where the
  // token is technically still valid but expires before the downstream call
  // completes.
  const expiresAt = Date.now() + ttlSeconds * 1_000 - 5_000;
  store.set(TOKEN_KEY, { authToken, expiresAt });
}

/**
 * Return the current in-flight auth request promise, or null if none is
 * pending. Used to deduplicate concurrent token-fetch calls.
 */
export function getInFlightRequest(): Promise<string> | null {
  return inFlightRequest;
}

/** Register an in-flight auth request so concurrent callers can await it. */
export function setInFlightRequest(promise: Promise<string> | null): void {
  inFlightRequest = promise;
}
