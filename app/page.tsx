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
import type { Metadata } from "next";
import TrackingForm from "@/components/TrackingForm";

export const metadata: Metadata = {
  title: "Trackapp — Delivery Tracking",
  description: "Track your deliveries in real time.",
};

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 sm:px-6">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Trackapp
        </h1>
        <p className="mt-3 text-lg text-zinc-500">
          Enter a tracking number to see where your package is.
        </p>
      </div>

      <TrackingForm />
    </main>
  );
}
