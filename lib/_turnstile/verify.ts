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
import type { TurnstileVerifyResponse } from "@/lib/_types/tracking";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Verify a Turnstile challenge token against Cloudflare's API.
 *
 * @param token    The Turnstile token from the client-side widget
 * @param remoteIp Optional IP address of the user (passed through to Cloudflare)
 * @returns `{ success, error? }` — success indicates the challenge passed
 */
export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string,
): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Missing TURNSTILE_SECRET_KEY environment variable.");
  }

  const body = new URLSearchParams();
  body.set("secret", secretKey);
  body.set("response", token);
  if (remoteIp) body.set("remoteip", remoteIp);

  const res = await fetch(VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    return { success: false, error: `Verification HTTP ${res.status}` };
  }

  const data: TurnstileVerifyResponse = await res.json();

  if (!data.success) {
    const codes = data["error-codes"]?.join(", ") ?? "unknown";
    return { success: false, error: `Verification failed: ${codes}` };
  }

  return { success: true };
}
