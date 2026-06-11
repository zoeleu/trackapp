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
import type {
  TrackingApiResponse,
  TrackingResponse,
  TrackingResult,
  TrackingEvent,
} from "@/lib/_types/tracking";

const TRACKING_TIMEOUT_MS = 15_000;

/**
 * Fetch tracking updates from the external API. Normalises the upstream
 * response into a simpler shape for the UI.
 */
export async function fetchTracking(
  token: string,
  trackingNumber: string,
): Promise<TrackingResponse> {
  const baseUrl = process.env.EXTERNAL_TRACKING_API_URL;

  if (!baseUrl) {
    throw new Error("Missing EXTERNAL_TRACKING_API_URL environment variable.");
  }

  const sanitised = trackingNumber.trim();
  const url = `${baseUrl}/tracking/${encodeURIComponent(sanitised)}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TRACKING_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json, text/plain, */*",
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
        Referer:
          process.env.TRACKING_REFERER ?? "https://cademinhaentrega.com.br/",
        Carrier: process.env.TRACKING_CARRIER ?? "201801",
        "sec-ch-ua":
          '"Chromium";v="148", "Google Chrome";v="148", "Not/A)Brand";v="99"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Linux"',
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("Tracking number not found.");
      }
      throw new Error(
        `Tracking API returned ${res.status}.`,
      );
    }

    const data: TrackingApiResponse = await res.json();

    if (!data?.results || !Array.isArray(data.results)) {
      throw new Error("Unexpected tracking API response shape.");
    }

    return normaliseResponse(data, sanitised);
  } finally {
    clearTimeout(timer);
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────

function normaliseResponse(
  upstream: TrackingApiResponse,
  trackingNumber: string,
): TrackingResponse {
  return {
    trackingNumber,
    totalEvents: upstream.infoPager?.totalItems ?? upstream.results.length,
    events: upstream.results.map(normaliseEvent),
  };
}

function normaliseEvent(result: TrackingResult): TrackingEvent {
  return {
    id: result.id,
    timestamp: result.dt_tracking,
    status: result.status_ship.description,
    description:
      result.tracking_type.shipper_type.description ||
      result.tracking_type.internal_type.description,
    location: buildLocation(result),
    comments: result.comments,
  };
}

function buildLocation(result: TrackingResult): string {
  const addr = result.service_center.address;
  const city = addr.city.name;
  const state = addr.city.state.abbr;
  const neighborhood = addr.neighborhood;

  const cityState = [city, state].filter(Boolean).join(", ");
  const parts = [neighborhood, cityState].filter(Boolean);

  const dest = result.packing_list?.service_center_destination;
  if (dest) {
    const destCity = dest.address.city.name;
    const destState = dest.address.city.state.abbr;
    const courier = result.packing_list?.courier?.name;
    if (destCity) {
      const destStr = [destCity, destState].filter(Boolean).join(", ");
      parts.push(
        `→ ${destStr}${courier ? ` (${courier})` : ""}`,
      );
    }
  }

  return parts.join(", ") || "—";
}
