"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faMap, faClock, faHome, faUser, faComments, faUserGear, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const userExists = localStorage.getItem("user");

    if (userExists) {
      try {
        const user = JSON.parse(userExists);
        setUserData(user);
        setIsAuthenticated(true);
      } catch (e) {
        // Invalid user data, redirect to StartPage
        router.push("/StartPage");
      }
    } else {
      // No user logged in, redirect to StartPage
      router.push("/StartPage");
    }
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("userId");

    // Redirect to StartPage
    router.push("/StartPage");
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-card)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[var(--color-green-accent)] border-t-[var(--color-green-primary)] rounded-full animate-spin"></div>
          <p className="text-[var(--color-text-secondary)] font-[family-name:var(--font-body)]">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (router will handle redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-[var(--color-bg-card)]">

      <div className="bg-gradient-to-r from-[var(--color-green-primary)] to-[var(--color-green-primary)] text-[var(--color-text-on-green)] px-6 pt-6 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--color-text-on-green)] rounded-full flex items-center justify-center text-[var(--color-green-primary)] font-bold text-sm">
              🤖
            </div>
            <h1 className="text-lg font-semibold font-[family-name:var(--font-header)]">SEB: Eco Assistant</h1>
          </div>
          <Link
            href="../SettingsPage"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium hover:bg-white/20 transition-colors"
            aria-label="Settings"
          >
            <FontAwesomeIcon icon={faUserGear} className="text-sm" />
            <span>Settings</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm"
            title="Logout"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="text-lg" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>


        <div className="bg-[var(--color-bg-card)] rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-[var(--color-text-secondary)] text-sm font-medium font-[family-name:var(--font-body)]">{userData?.nume || "User"}</p>
              <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-1 font-[family-name:var(--font-header)]">Points: <span className="text-[var(--color-green-primary)]">{userData?.nr_puncte || 0}</span></p>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl">🏅</span>
              <span className="text-xs text-[var(--color-text-secondary)] mt-1">Level 7</span>
            </div>
          </div>

          <div className="w-full bg-[var(--color-green-accent)] rounded-full h-2">
            <div className="bg-[var(--color-green-primary)] h-2 rounded-full" style={{ width: "70%" }}></div>
          </div>
        </div>
      </div>


      <div className="flex-1 px-6 py-6 overflow-y-auto">

        <Link href="../ScannerPage" className="bg-[var(--color-bg-main)] rounded-xl p-8 mb-6 flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--color-green-accent)] transition-colors">
          <FontAwesomeIcon icon={faCamera} className="text-3xl text-[var(--color-text-secondary)] mb-4" />
          <p className="text-[var(--color-text-primary)] font-medium text-center font-[family-name:var(--font-body)]">Scan Your Waste with SEB</p>
        </Link>


        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link href="../MapPage" className="bg-[var(--color-bg-main)] hover:bg-[var(--color-green-accent)] rounded-xl py-6 flex flex-col items-center justify-center transition-colors">
            <FontAwesomeIcon icon={faMap} className="text-2xl text-[var(--color-green-primary)] mb-2" />
            <span className="text-[var(--color-text-primary)] font-medium text-sm font-[family-name:var(--font-body)]">Nearby Bins</span>
          </Link>
          <Link href="../AiChatPage" className="bg-[var(--color-bg-main)] hover:bg-[var(--color-green-accent)] rounded-xl py-6 flex flex-col items-center justify-center transition-colors">
            <FontAwesomeIcon icon={faComments} className="text-2xl text-[var(--color-green-primary)] mb-2" />
            <span className="text-[var(--color-text-primary)] font-medium text-sm font-[family-name:var(--font-body)]">Chat with SEB</span>
          </Link>
        </div>


        <div className="bg-[var(--color-bg-card)] border-l-4 border-[var(--color-green-primary)] rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-[var(--color-text-primary)] mb-1 font-[family-name:var(--font-header)]">Daily Challenge</h3>
          <p className="text-[var(--color-text-secondary)] text-sm mb-3 font-[family-name:var(--font-body)]">Scan 3 Cartons today!</p>
          <div className="w-full bg-[var(--color-green-accent)] rounded-full h-2">
            <div className="bg-[var(--color-green-primary)] h-2 rounded-full" style={{ width: "33%" }}></div>
          </div>
        </div>
      </div>


      <div className="border-t border-[var(--color-green-accent)] bg-[var(--color-bg-card)] px-6 py-4 flex justify-around">
        <button className="flex flex-col items-center gap-1 text-[var(--color-green-primary)]">
          <FontAwesomeIcon icon={faHome} className="text-xl" />
          <span className="text-xs font-medium font-[family-name:var(--font-body)]">Home</span>
        </button>
        <Link href="../ScannerPage" className="flex flex-col items-center gap-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
          <FontAwesomeIcon icon={faClock} className="text-xl" />
          <span className="text-xs font-medium font-[family-name:var(--font-body)]">Scanner</span>
        </Link>
        <Link href="../MapPage" className="flex flex-col items-center gap-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
          <FontAwesomeIcon icon={faMap} className="text-xl" />
          <span className="text-xs font-medium font-[family-name:var(--font-body)]">Map</span>
        </Link>
        <Link href="../AiChatPage" className="flex flex-col items-center gap-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
          <FontAwesomeIcon icon={faComments} className="text-xl" />
          <span className="text-xs font-medium font-[family-name:var(--font-body)]">SEB</span>
        </Link>
        <Link href="../ProfilePage" className="flex flex-col items-center gap-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
          <FontAwesomeIcon icon={faUser} className="text-xl" />
          <span className="text-xs font-medium font-[family-name:var(--font-body)]">Profile</span>
        </Link>
      </div>
    </div>
  );
}