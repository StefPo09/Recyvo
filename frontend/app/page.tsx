"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Root() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in by looking for user data in localStorage
    // Wrap in try/catch in case of unexpected errors (e.g. strict cookie policies)
    let handled = false;
    try {
      const userExists = localStorage.getItem("user");

      if (userExists) {
        // User is already logged in, redirect to HomePage
        router.replace("/HomePage");
        handled = true;
      } else {
        // No user logged in, redirect to StartPage
        router.replace("/StartPage");
        handled = true;
      }
    } catch (err) {
      // If anything goes wrong, log to console and fall back to StartPage
      // This prevents the UI from remaining stuck with no action.
      // eslint-disable-next-line no-console
      console.error("Redirect check failed:", err);
      try {
        router.replace("/StartPage");
        handled = true;
      } catch (e) {
        // ignore
      }
    }

    // Safety fallback: if router.replace didn't run (rare), navigate after 2s
    const t = setTimeout(() => {
      if (!handled) {
        // eslint-disable-next-line no-console
        console.warn("Fallback redirect to /StartPage after timeout");
        try {
          router.replace("/StartPage");
        } catch (e) {
          // ignore
        }
      }
    }, 2000);

    return () => clearTimeout(t);
  }, [router]);

  // Show a loading state while redirecting. Provide a visible fallback link
  // so the user can continue if programmatic navigation fails.
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-card)]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[var(--color-green-accent)] border-t-[var(--color-green-primary)] rounded-full animate-spin"></div>
        <p className="text-[var(--color-text-secondary)] font-[family-name:var(--font-body)]">Loading your account...</p>
        <p className="text-sm text-[var(--color-text-secondary)] mt-2 font-[family-name:var(--font-body)]">If this takes too long, <a href="/StartPage" className="text-[var(--color-green-primary)] underline">open the Start page</a>.</p>
      </div>
    </div>
  );
}