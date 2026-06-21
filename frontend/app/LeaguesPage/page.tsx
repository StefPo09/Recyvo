"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUserById } from "@/lib/api";

const rankBands = [
  { name: "No Rank", min: 0, max: 9, emoji: "—", description: "Start here. Gain 10 points to reach Bronze." },
  { name: "Bronze", min: 10, max: 49, emoji: "🥉", description: "Earn 10–49 points to unlock Bronze." },
  { name: "Silver", min: 50, max: 199, emoji: "🥈", description: "Earn 50–199 points to unlock Silver." },
  { name: "Gold", min: 200, max: 499, emoji: "🥇", description: "Earn 200–499 points to unlock Gold." },
  { name: "Diamond", min: 500, max: 999, emoji: "💎", description: "Earn 500–999 points to unlock Diamond." },
  { name: "Eco Champion", min: 1000, max: Infinity, emoji: "🏆", description: "Over 1000 points - become an Eco Champion!" },
] as const;

function getRankProgress(points: number) {
  const current = rankBands.find((band) => points >= band.min && points <= band.max) ?? rankBands[0];

  if (current.max === Infinity) {
    return {
      current,
      percent: 100,
      label: `${points} pts`,
    };
  }

  const range = current.max - current.min + 1;
  const percent = Math.max(0, Math.min(100, Math.round(((points - current.min) / range) * 100)));

  return {
    current,
    percent,
    label: `${points}/${current.max} pts`,
  };
}

export default function LeaguesPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cleanupVisibility: (() => void) | undefined;
    let refreshTimer: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;

    const refreshUser = async () => {
      try {
        const cur = localStorage.getItem("user");
        if (!cur) return;

        const parsed = JSON.parse(cur);
        if (!parsed?.id) return;

        const fresh = await getUserById(parsed.id);
        if (cancelled) return;

        localStorage.setItem("user", JSON.stringify(fresh));
        setUserData(fresh);
      } catch (err) {
        console.warn("Failed to refresh user data:", err);
      }
    };

    const userExists = localStorage.getItem("user");
    if (userExists) {
      try {
        const user = JSON.parse(userExists);
        setUserData(user);
        setIsAuthenticated(true);

        void refreshUser();

        const onVisibility = () => {
          if (!document.hidden) {
            void refreshUser();
          }
        };

        document.addEventListener("visibilitychange", onVisibility);
        cleanupVisibility = () => document.removeEventListener("visibilitychange", onVisibility);
        refreshTimer = setInterval(() => {
          void refreshUser();
        }, 5000);
      } catch (e) {
        router.push("/StartPage");
      }
    } else {
      router.push("/StartPage");
    }
    setIsLoading(false);

    return () => {
      cancelled = true;
      if (cleanupVisibility) cleanupVisibility();
      if (refreshTimer) clearInterval(refreshTimer);
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--color-bg-card)">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-(--color-green-accent) border-t-(--color-green-primary) rounded-full animate-spin"></div>
          <p className="text-(--color-text-secondary) font-(family-name:--font-body)">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;
  const points = userData?.nr_puncte ?? 0;
  const { current, percent, label } = getRankProgress(points);

  return (
    <div className="flex flex-col h-screen bg-(--color-bg-card)">
      <div className="bg-linear-to-r from-(--color-green-primary) to-(--color-green-primary) text-(--color-text-on-green) px-6 pt-6 pb-4 rounded-b-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold font-(family-name:--font-header)">Leagues</h1>
          <Link href="../HomePage" className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium hover:bg-white/20 transition-colors">Back</Link>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto">
        <div className="mb-5 rounded-xl bg-(--color-bg-main) p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-(--color-text-secondary)">Karma points</p>
              <p className="text-2xl font-bold text-(--color-text-primary)">
                <span className="text-(--color-green-primary)">{points}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-(--color-text-secondary)">Current rank</p>
              <p className="text-base font-semibold text-(--color-text-primary)">{current.name}</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="h-2 w-full rounded-full bg-(--color-green-accent)">
              <div
                className="h-2 rounded-full bg-(--color-green-primary) transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-(--color-text-secondary)">{label}</p>
          </div>
        </div>

        <p className="text-(--color-text-secondary) mb-4">Tap a rank to see details. Your points update from the database after login and when the page refreshes.</p>

        <div className="grid grid-cols-1 gap-4">
          {rankBands.map((r) => (
            <div
              key={r.name}
              className={`bg-(--color-bg-main) p-4 rounded-xl flex items-center justify-between ${
                current.name === r.name ? "ring-2 ring-(--color-green-primary)" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl">{r.emoji}</div>
                <div>
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-xs text-(--color-text-secondary)">{r.description}</div>
                </div>
              </div>
              <div className="text-sm text-(--color-text-secondary)">{r.min}{r.max === Infinity ? '+' : ` - ${r.max}`} pts</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
