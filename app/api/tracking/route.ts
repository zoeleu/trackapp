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
import { type NextRequest } from "next/server";
import { verifyTurnstileToken } from "@/lib/_turnstile/verify";
import { resolveToken } from "@/lib/_token/resolve";
import { fetchTracking } from "@/lib/_tracking/api";

/**
 * POST /api/tracking
 *
 * Requires a Turnstile challenge token. Verifies it server-side before
 * proxying the tracking lookup to the external tracking API.
 *
 * Body: `{ trackingNumber: string, turnstileToken: string }`
 */
export async function POST(request: NextRequest) {
  // ── Parse body ──────────────────────────────────────────────────────
  let body: { trackingNumber?: string; turnstileToken?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const trackingNumber = body.trackingNumber?.trim();
  const turnstileToken = body.turnstileToken;

  if (!trackingNumber) {
    return Response.json(
      { error: "Missing tracking number." },
      { status: 400 },
    );
  }

  if (!turnstileToken || typeof turnstileToken !== "string") {
    return Response.json(
      { error: "Missing Turnstile token." },
      { status: 400 },
    );
  }

  // ── Verify Turnstile token ─────────────────────────────────────────
  const remoteIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined;

  try {
    const result = await verifyTurnstileToken(turnstileToken, remoteIp);
    if (!result.success) {
      return Response.json(
        { error: result.error ?? "Captcha verification failed." },
        { status: 400 },
      );
    }
  } catch (e) {
    console.error("Turnstile verification error.");
    return Response.json(
      { error: "Captcha verification failed." },
      { status: 500 },
    );
  }

  // ── Resolve auth token (cache → fetch) ─────────────────────────────
  let token: string;
  try {
    token = await resolveToken();
  } catch {
    return Response.json(
      { error: "Unable to authenticate with the tracking service." },
      { status: 502 },
    );
  }

  // ── Fetch tracking data ─────────────────────────────────────────────
  try {
    const data = await fetchTracking(token, trackingNumber);
    return Response.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error.";
    console.error("Tracking fetch failed.");

    if (message === "Tracking number not found.") {
      return Response.json({ error: message }, { status: 404 });
    }

    return Response.json(
      { error: "Unable to retrieve tracking information." },
      { status: 502 },
    );
  }
}
