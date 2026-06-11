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
import type { AuthResponse } from "@/lib/_types/tracking";
import { setToken } from "@/lib/_token/cache";

const AUTH_TIMEOUT_MS = 10_000;

/**
 * Fetch a fresh JWT from the external auth endpoint (simple GET — no
 * credentials needed). Enforces a timeout so a hung upstream doesn't stall
 * the request indefinitely.
 */
export async function fetchToken(): Promise<string> {
  const url = process.env.EXTERNAL_AUTH_URL;

  if (!url) {
    throw new Error("Missing EXTERNAL_AUTH_URL environment variable.");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AUTH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(
        `Auth request failed with status ${res.status}.`,
      );
    }

    const data: AuthResponse = await res.json();

    if (!data.access_token || typeof data.expires_in !== "number") {
      throw new Error(
        "Unexpected auth response shape. Expected { access_token, expires_in }.",
      );
    }

    setToken(data.access_token, data.expires_in);

    return data.access_token;
  } finally {
    clearTimeout(timer);
  }
}
