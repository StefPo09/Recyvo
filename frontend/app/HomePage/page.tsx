"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faMap, faClock, faHome, faUser, faComments, faUserGear } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { getUserById } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const userExists = localStorage.getItem("user");

    let cleanup: (() => void) | undefined;

    if (userExists) {
      try {
        const user = JSON.parse(userExists);
        setUserData(user);
        setIsAuthenticated(true);
        // Refresh latest user data from backend (points etc.)
        (async () => {
          try {
            if (user?.id) {
              const fresh = await getUserById(user.id);
              // merge and persist
              localStorage.setItem("user", JSON.stringify(fresh));
              setUserData(fresh);
            }
          } catch (e) {
            // ignore network errors here; keep local data
            console.warn("Failed to refresh user data:", e);
          }
        })();

        // When the page becomes visible again (user returns from scanner), refresh points
        const onVisibility = async () => {
          try {
            const cur = localStorage.getItem("user");
            if (!cur) return;
            const parsed = JSON.parse(cur);
            if (parsed?.id) {
              const fresh = await getUserById(parsed.id);
              localStorage.setItem("user", JSON.stringify(fresh));
              setUserData(fresh);
            }
          } catch (err) {
            console.warn("visibility refresh failed:", err);
          }
        };

        document.addEventListener("visibilitychange", onVisibility);
        cleanup = () => document.removeEventListener("visibilitychange", onVisibility);
      } catch (e) {
        // Invalid user data, redirect to StartPage
        router.push("/StartPage");
      }
    } else {
      // No user logged in, redirect to StartPage
      router.push("/StartPage");
    }

    setIsLoading(false);

    return () => {
      if (cleanup) cleanup();
    };
  }, [router]);
// Show loading while checking authentication
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

  // Don't render if not authenticated (router will handle redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-(--color-bg-card)">

      <div className="bg-linear-to-r from-(--color-green-primary) to-(--color-green-primary) text-(--color-text-on-green) px-6 pt-6 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-(--color-text-on-green) rounded-full flex items-center justify-center text-(--color-green-primary) font-bold text-sm">
              🤖
            </div>
            <h1 className="text-lg font-semibold font-(family-name:--font-header)">SEB: Eco Assistant</h1>
          </div>
          <Link
            href="../SettingsPage"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium hover:bg-white/20 transition-colors"
            aria-label="Settings"
          >
            <FontAwesomeIcon icon={faUserGear} className="text-sm" />
            <span>Settings</span>
          </Link>
        </div>


        <div className="bg-(--color-bg-card) rounded-xl p-4 shadow-sm">
          {/* Show name and points */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-(--color-text-secondary) text-sm font-medium font-(family-name:--font-body)">{userData?.nume || "User"}</p>
              <p className="text-2xl font-bold text-(--color-text-primary) mt-1 font-(family-name:--font-header)">Karma Points: <span className="text-(--color-green-primary)">{userData?.nr_puncte ?? 0}</span></p>
            </div>

            {/* Medal badge - clickable to LeaguesPage */}
            <div>
              {(() => {
                const points: number = userData?.nr_puncte ?? 0;

                // Define rank bands
                const bands = [
                  { name: "No Rank", min: 0, max: 9, emoji: "—" },
                  { name: "Bronze", min: 10, max: 49, emoji: "🥉" },
                  { name: "Silver", min: 50, max: 199, emoji: "🥈" },
                  { name: "Gold", min: 200, max: 499, emoji: "🥇" },
                  { name: "Diamond", min: 500, max: 999, emoji: "💎" },
                  { name: "Eco Champion", min: 1000, max: Infinity, emoji: "🏆" },
                ];

                const current = bands.find(b => points >= b.min && points <= b.max) || bands[0];

                return (
                  <Link href="../LeaguesPage" className="flex flex-col items-center cursor-pointer">
                    <span className="text-2xl">{current.emoji}</span>
                    <span className="text-xs text-(--color-text-secondary) mt-1">{current.name}</span>
                  </Link>
                );
              })()}
            </div>
          </div>

          {/* Progress bar - width reflects progress within current tier, starts from 0 */}
          {(() => {
            const points: number = userData?.nr_puncte ?? 0;
            const bands = [
              { name: "No Rank", min: 0, max: 9 },
              { name: "Bronze", min: 10, max: 49 },
              { name: "Silver", min: 50, max: 199 },
              { name: "Gold", min: 200, max: 499 },
              { name: "Diamond", min: 500, max: 999 },
              { name: "Eco Champion", min: 1000, max: Infinity },
            ];
            const current = bands.find(b => points >= b.min && points <= b.max) || bands[0];
            let percent: number;
            let label: string;
            if (current.max === Infinity) {
              percent = 100;
              label = `${points} pts`;
            } else {
              const range = current.max - current.min + 1;
              percent = Math.max(0, Math.min(100, Math.round(((points - current.min) / range) * 100)));
              label = `${points}/${current.max}`;
            }

            return (
              <div>
                <div className="w-full bg-(--color-green-accent) rounded-full h-2">
                  <div className="bg-(--color-green-primary) h-2 rounded-full" style={{ width: `${percent}%` }}></div>
                </div>
                <p className="text-xs text-(--color-text-secondary) mt-2">{label}</p>
              </div>
            );
          })()}
        </div>
      </div>


      <div className="flex-1 px-6 py-6 overflow-y-auto">

        <Link href="../ScannerPage" className="bg-(--color-bg-main) rounded-xl p-8 mb-6 flex flex-col items-center justify-center cursor-pointer hover:bg-(--color-green-accent) transition-colors">
          <FontAwesomeIcon icon={faCamera} className="text-3xl text-(--color-text-secondary) mb-4" />
          <p className="text-(--color-text-primary) font-medium text-center font-(family-name:--font-body)">Scan Your Waste with SEB</p>
        </Link>


        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link href="../MapPage" className="bg-(--color-bg-main) hover:bg-(--color-green-accent) rounded-xl py-6 flex flex-col items-center justify-center transition-colors">
            <FontAwesomeIcon icon={faMap} className="text-2xl text-(--color-green-primary) mb-2" />
            <span className="text-(--color-text-primary) font-medium text-sm font-(family-name:--font-body)">Nearby Bins</span>
          </Link>
          <Link href="../AiChatPage" className="bg-(--color-bg-main) hover:bg-(--color-green-accent) rounded-xl py-6 flex flex-col items-center justify-center transition-colors">
            <FontAwesomeIcon icon={faComments} className="text-2xl text-(--color-green-primary) mb-2" />
            <span className="text-(--color-text-primary) font-medium text-sm font-(family-name:--font-body)">Chat with SEB</span>
          </Link>
        </div>


        <div className="bg-(--color-bg-card) border-l-4 border-(--color-green-primary) rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-(--color-text-primary) mb-1 font-(family-name:--font-header)">Daily Challenge</h3>
          <p className="text-(--color-text-secondary) text-sm mb-3 font-(family-name:--font-body)">Scan 3 Cartons today!</p>
          <div className="w-full bg-(--color-green-accent) rounded-full h-2">
            <div className="bg-(--color-green-primary) h-2 rounded-full" style={{ width: "33%" }}></div>
          </div>
        </div>
      </div>


      <div className="border-t border-(--color-green-accent) bg-(--color-bg-card) px-6 py-4 flex justify-around">
        <button className="flex flex-col items-center gap-1 text-(--color-green-primary)">
          <FontAwesomeIcon icon={faHome} className="text-xl" />
          <span className="text-xs font-medium font-(family-name:--font-body)">Home</span>
        </button>
        <Link href="../ScannerPage" className="flex flex-col items-center gap-1 text-(--color-text-secondary) hover:text-(--color-text-primary)">
          <FontAwesomeIcon icon={faClock} className="text-xl" />
          <span className="text-xs font-medium font-(family-name:--font-body)">Scanner</span>
        </Link>
        <Link href="../MapPage" className="flex flex-col items-center gap-1 text-(--color-text-secondary) hover:text-(--color-text-primary)">
          <FontAwesomeIcon icon={faMap} className="text-xl" />
          <span className="text-xs font-medium font-(family-name:--font-body)">Map</span>
        </Link>
        <Link href="../AiChatPage" className="flex flex-col items-center gap-1 text-(--color-text-secondary) hover:text-(--color-text-primary)">
          <FontAwesomeIcon icon={faComments} className="text-xl" />
          <span className="text-xs font-medium font-(family-name:--font-body)">SEB</span>
        </Link>
        <Link href="../ProfilePage" className="flex flex-col items-center gap-1 text-(--color-text-secondary) hover:text-(--color-text-primary)">
          <FontAwesomeIcon icon={faUser} className="text-xl" />
          <span className="text-xs font-medium font-(family-name:--font-body)">Profile</span>
        </Link>
      </div>
    </div>
  );
}