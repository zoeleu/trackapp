"use client";
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

import { useState, useRef, useCallback } from "react";
import TurnstileWidget, {
  type TurnstileWidgetRef,
} from "@/components/TurnstileWidget";
import TrackingResults from "@/components/TrackingResults";
import type { TrackingResponse } from "@/lib/_types/tracking";

type FormState =
  | { phase: "idle" }
  | { phase: "awaiting_captcha" }
  | { phase: "fetching" }
  | { phase: "success"; data: TrackingResponse }
  | { phase: "error"; message: string };

export default function TrackingForm() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [state, setState] = useState<FormState>({ phase: "idle" });
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  const handleCaptchaVerify = useCallback((token: string) => {
    void submitTracking(token);
  }, []);

  async function submitTracking(turnstileToken: string) {
    const number = trackingNumber.trim();
    if (!number) {
      setState({ phase: "idle" });
      return;
    }

    setState({ phase: "fetching" });

    try {
      const res = await fetch("/api/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber: number, turnstileToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        setState({
          phase: "error",
          message: data.error ?? "Failed to fetch tracking data.",
        });
        turnstileRef.current?.reset();
        return;
      }

      setState({ phase: "success", data });
    } catch {
      setState({ phase: "error", message: "Network error. Please try again." });
      turnstileRef.current?.reset();
    }
  }

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setState({ phase: "awaiting_captcha" });
        }}
        className="flex w-full flex-col gap-4"
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter tracking number…"
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-400"
            disabled={state.phase === "fetching"}
          />
          <button
            type="submit"
            disabled={!trackingNumber.trim() || state.phase === "fetching"}
            className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {state.phase === "fetching" ? "Searching…" : "Track"}
          </button>
        </div>

        <TurnstileWidget
          ref={turnstileRef}
          onVerify={handleCaptchaVerify}
          onExpire={() => setState({ phase: "idle" })}
          onError={() => {
            setState({
              phase: "error",
              message: "Captcha widget error. Please refresh and try again.",
            });
          }}
        />
      </form>

      {state.phase === "error" && (
        <div className="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {state.message}
        </div>
      )}

      {state.phase === "success" && <TrackingResults data={state.data} />}
    </div>
  );
}
