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
// ── External auth response ───────────────────────────────────────────────
// GET https://sinclog-public-tracking-bff.luizalabs.com/v1/auth/token
export interface AuthResponse {
  access_token: string;
  expires_in: number; // seconds until expiry
}

// ── Token cache entry ─────────────────────────────────────────────────────
export interface TokenCacheEntry {
  authToken: string;
  expiresAt: number; // epoch ms
}

// ── Tracking API response (real shape) ────────────────────────────────────
// GET https://sinclog-public-tracking-bff.luizalabs.com/v1/tracking/<number>

export interface TrackingPager {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface TrackingResult {
  id: string;
  id_shipment: number;
  tracking_type: {
    internal_type: {
      id: string;
      description: string;
    };
    shipper_type: {
      id?: string;
      description?: string;
    };
    failure_type: {
      id?: string;
      description?: string;
    };
  };
  status_ship: {
    id: number;
    description: string;
  };
  service_center: {
    address: {
      neighborhood: string;
      city: {
        name: string;
        state: {
          abbr: string;
        };
      };
    };
  };
  packing_list?: {
    id: number;
    courier: {
      id: number;
      name: string;
    };
    service_center_destination: {
      address: {
        city: {
          name: string;
          state: {
            abbr: string;
          };
        };
      };
    };
  };
  tracking_user: {
    id: number;
  };
  comments: string;
  dt_register: string; // ISO 8601
  dt_tracking: string; // ISO 8601
}

export interface TrackingApiResponse {
  infoPager: TrackingPager;
  results: TrackingResult[];
  code: number;
}

// ── Normalised tracking event (used by the UI) ───────────────────────────
export interface TrackingEvent {
  id: string;
  timestamp: string;
  status: string;
  description: string;
  location: string;
  comments: string;
}

// ── Normalised response returned by our proxy ────────────────────────────
export interface TrackingResponse {
  trackingNumber: string;
  events: TrackingEvent[];
  totalEvents: number;
}

// ── Cloudflare Turnstile /siteverify ─────────────────────────────────────
export interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
}
