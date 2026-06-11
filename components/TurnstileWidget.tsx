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

import { forwardRef } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

export type TurnstileWidgetRef = TurnstileInstance;

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  theme?: "light" | "dark" | "auto";
}

const TurnstileWidget = forwardRef<TurnstileWidgetRef, TurnstileWidgetProps>(
  function TurnstileWidget({ onVerify, onExpire, onError, theme = "auto" }, ref) {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    if (!siteKey) {
      console.error(
        "TurnstileWidget: NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set.",
      );
      return null;
    }

    return (
      <div className="flex justify-center">
        <Turnstile
          ref={ref}
          siteKey={siteKey}
          onSuccess={onVerify}
          onExpire={onExpire}
          onError={onError}
          options={{ theme }}
        />
      </div>
    );
  },
);

export default TurnstileWidget;
