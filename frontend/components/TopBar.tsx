"use client";

import React from "react";
import Link from "next/link";
// Use a plain <img> here instead of next/image to avoid a dev-mode runtime
// issue where the image component can attempt to read numeric attributes
// (height/width) before they exist and cause `toString` errors in the
// dev overlay. A regular <img> is fine for this small logo.
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGear } from "@fortawesome/free-solid-svg-icons";
import RankProgress from "@/components/RankProgress";
import logo from "@/Logo/Transparent/color.png";
import { useSettings } from "@/lib/SettingsContext";

export default function TopBar({ userData }: { userData: any }) {
  const points = userData?.nr_puncte ?? 0;
  const { resolvedTheme } = useSettings();
  const isDark = resolvedTheme === "Dark";
  return (
    <div className={`shrink-0 rounded-b-3xl bg-linear-to-r px-6 pb-8 pt-6 text-(--color-text-on-green) ${isDark ? "from-green-900 to-green-800" : "from-green-700 to-green-600"}`}>
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 relative">
            {/* static import may be an object (StaticImageData) or a string;
                normalize to a src string and fall back to the import itself */}
            {
              (() => {
                // avoid next/image here to prevent run-time toString issues in dev
                // normalize StaticImageData to a string src and fall back to the repo public path
                const src = (logo as any)?.src ?? (logo as any) ?? "/logo/transparent/color.png";
                return <img src={src} alt="Recyvo" className="w-8 h-8 object-contain" />;
              })()
            }
          </div>
          <h1 className="text-2xl" style={{ fontFamily: "var(--font-logo)", fontWeight: 700 }}>
            Recyvo
          </h1>
        </div>
        <Link href="/SettingsPage" className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-medium transition-colors hover:bg-white/25" aria-label="Settings">
          <FontAwesomeIcon icon={faUserGear} className="text-sm" />
          <span>Settings</span>
        </Link>
      </div>

      <div className="bg-(--color-bg-card) rounded-xl p-4 shadow-sm">
        <div className="flex justify-between items-start mb-3">
          <div>
            {/* removed server-rendered username to avoid SSR/client hydration mismatch */}
            <p className="text-2xl font-bold text-(--color-text-primary) mt-1 font-(family-name:--font-header)">Points: <span className="text-(--color-green-primary)">{points}</span></p>
          </div>
        </div>

        <RankProgress points={points} />
      </div>
    </div>
  );
}

