"use client";

import React from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGear } from "@fortawesome/free-solid-svg-icons";
import RankProgress from "@/components/RankProgress";

export default function TopBar({ userData }: { userData: any }) {
  const points = userData?.nr_puncte ?? 0;
  return (
    <div className="shrink-0 bg-linear-to-r from-(--color-green-primary) to-(--color-green-primary) text-(--color-text-on-green) px-6 pt-6 pb-8 rounded-b-3xl">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-(--color-text-on-green) rounded-full flex items-center justify-center text-(--color-green-primary) font-bold text-sm">🤖</div>
          <h1 className="text-lg font-semibold font-(family-name:--font-header)">SEB: Eco Assistant</h1>
        </div>
        <Link
          href="/SettingsPage"
          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium hover:bg-white/20 transition-colors"
          aria-label="Settings"
        >
          <FontAwesomeIcon icon={faUserGear} className="text-sm" />
          <span>Settings</span>
        </Link>
      </div>

      <div className="bg-(--color-bg-card) rounded-xl p-4 shadow-sm">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-(--color-text-secondary) text-sm font-medium font-(family-name:--font-body)">{userData?.nume || "User"}</p>
            <p className="text-2xl font-bold text-(--color-text-primary) mt-1 font-(family-name:--font-header)">Points: <span className="text-(--color-green-primary)">{points}</span></p>
          </div>
        </div>

        <RankProgress points={points} />
      </div>
    </div>
  );
}

