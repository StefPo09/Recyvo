"use client";

import React from "react";
import Link from "next/link";

export type RankId = "none" | "bronze" | "silver" | "gold" | "diamond" | "eco_champion";

export type RankDef = {
  id: RankId;
  label: string;
  threshold: number;
  emoji?: string;
};

export const RANKS: RankDef[] = [
  { id: "none", label: "No rank", threshold: 0, emoji: "—" },
  { id: "bronze", label: "Bronze", threshold: 10, emoji: "🥉" },
  { id: "silver", label: "Silver", threshold: 50, emoji: "🥈" },
  { id: "gold", label: "Gold", threshold: 200, emoji: "🥇" },
  { id: "diamond", label: "Diamond", threshold: 500, emoji: "💎" },
  { id: "eco_champion", label: "Eco Champion", threshold: 1000, emoji: "🏆" },
];

export function rankForPoints(points: number): RankDef {
  if (points >= 1000) return RANKS.find((r) => r.id === "eco_champion")!;
  if (points >= 500) return RANKS.find((r) => r.id === "diamond")!;
  if (points >= 200) return RANKS.find((r) => r.id === "gold")!;
  if (points >= 50) return RANKS.find((r) => r.id === "silver")!;
  if (points >= 10) return RANKS.find((r) => r.id === "bronze")!;
  return RANKS.find((r) => r.id === "none")!;
}

export function nextRank(current: RankDef): RankDef {
  const idx = RANKS.findIndex((r) => r.id === current.id);
  if (idx < 0 || idx === RANKS.length - 1) return current;
  return RANKS[idx + 1];
}

export function progressFraction(points: number) {
  const current = rankForPoints(points);
  const next = nextRank(current);
  if (current.id === "eco_champion") return 1;
  const currentMin = current.threshold;
  const nextMin = next.threshold;
  const denom = Math.max(1, nextMin - currentMin);
  let frac = (points - currentMin) / denom;
  if (frac < 0) frac = 0;
  if (frac > 1) frac = 1;
  return frac;
}

export default function RankProgress({
  points,
  showLabel = true,
  className = "",
  onOpenLeaguesAction,
}: {
  points: number;
  showLabel?: boolean;
  className?: string;
  // If provided, this will be called when medal is clicked. Naming follows Next conventions for client actions.
  onOpenLeaguesAction?: () => void;
}) {
  const current = rankForPoints(points);
  const fraction = progressFraction(points);
  const percent = Math.round(fraction * 100);
  const emoji = current.emoji ?? "🏅";

  const Medal = (
    <button
      onClick={onOpenLeaguesAction}
      aria-label="Open Leagues"
      className="flex flex-col items-center gap-1 focus:outline-none"
      style={{ background: "transparent", border: 0 }}
    >
      <div className="text-2xl" aria-hidden>
        {emoji}
      </div>
      <div className="text-xs text-(--color-text-secondary) mt-1">{current.label}</div>
    </button>
  );

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1">
        {showLabel && (
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-(--color-text-secondary)">Points</div>
            <div className="text-sm font-semibold text-(--color-text-primary)">{points}</div>
          </div>
        )}
        <div className="w-full bg-(--color-green-accent) rounded-full h-2 overflow-hidden">
          <div
            className="h-2 rounded-full bg-(--color-green-primary) transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="text-xs text-(--color-text-secondary) mt-1">
          {current.id === "eco_champion" ? "Eco Champion — max rank" : `${percent}% to ${nextRank(current).label}`}
        </div>
      </div>

      <div>
          {onOpenLeaguesAction ? (
              Medal
            ) : (
          <Link href="/LeaguesPage" className="flex flex-col items-center gap-1">
            <div className="text-2xl">{emoji}</div>
            <div className="text-xs text-(--color-text-secondary) mt-1">{current.label}</div>
          </Link>
        )}
      </div>
    </div>
  );
}



