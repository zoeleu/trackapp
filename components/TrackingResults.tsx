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
import type { TrackingResponse } from "@/lib/_types/tracking";

export default function TrackingResults({ data }: { data: TrackingResponse }) {
  const { trackingNumber, events, totalEvents } = data;

  return (
    <div className="w-full max-w-xl rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">
          Tracking
        </p>
        <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          {trackingNumber}
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          {totalEvents} event{totalEvents !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Timeline */}
      {events.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-400">
          No tracking events yet.
        </p>
      ) : (
        <ol className="relative ml-3 border-l border-zinc-200 dark:border-zinc-800">
          {events.map((event) => (
            <li key={event.id} className="mb-6 ml-6 last:mb-0">
              <span className="absolute -left-[9px] mt-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white ring-4 ring-white dark:bg-zinc-950 dark:ring-zinc-950">
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-400" />
              </span>
              <time className="mb-1 block text-xs font-normal leading-none text-zinc-400">
                {new Date(event.timestamp).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {event.description}
              </p>
              <p className="text-xs text-zinc-500">{event.status}</p>
              <p className="text-xs text-zinc-400">{event.location}</p>
              {event.comments && (
                <p className="mt-0.5 text-xs italic text-zinc-400">
                  {event.comments}
                </p>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
