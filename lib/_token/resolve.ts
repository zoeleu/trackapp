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
import {
  getToken,
  getInFlightRequest,
  setInFlightRequest,
} from "@/lib/_token/cache";
import { fetchToken } from "@/lib/_token/auth";

/**
 * Return a valid auth token — cache-first, with in-flight deduplication so
 * concurrent requests share a single auth call.
 */
export async function resolveToken(): Promise<string> {
  const cached = getToken();
  if (cached) return cached;

  const inFlight = getInFlightRequest();
  if (inFlight) return inFlight;

  const promise = fetchToken().finally(() => setInFlightRequest(null));
  setInFlightRequest(promise);

  return promise;
}
