"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import AuthShell from "@/components/AuthShell";

export default function StartPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const userExists = localStorage.getItem("user");

    if (userExists) {
      // User is already logged in, redirect to HomePage
      router.push("/HomePage");
    } else {
      // No user logged in, show the StartPage
      setIsChecking(false);
    }
  }, [router]);

  // Show loading while checking
  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--color-bg-card)">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-(--color-green-accent) border-t-(--color-green-primary) rounded-full animate-spin"></div>
          <p className="text-(--color-text-secondary) font-(family-name:--font-body)">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthShell
      title="Your smart path to a cleaner city."
      subtitle="Scan. Sort. Share."
      introTitle="Meet SEB"
      introBody="Scan waste, find the right bin, and earn points for every better choice."
      footer={
        <Link
          href="/ForgotPasswordPage"
          className="mt-5 block text-center text-sm font-medium text-(--color-text-primary) hover:underline font-(family-name:--font-body)"
        >
          Forgot password? Contact support.
        </Link>
      }
    >
      <div className="flex w-full flex-col gap-3">
        <Link
          href="/LogInPage"
          className="flex h-14 items-center justify-center rounded-lg bg-(--color-green-primary) text-base font-bold text-(--color-text-on-green) shadow-lg transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-(--color-green-primary)/30 font-(family-name:--font-header)"
        >
          LOGIN
          <FontAwesomeIcon
            icon={faArrowRight}
            className="ml-2 text-white/60"
          />
        </Link>
        <Link
          href="/SignUpPage"
          className="flex h-14 items-center justify-center rounded-lg border-2 border-(--color-green-primary) bg-(--color-bg-card) text-base font-bold text-(--color-green-primary) transition hover:bg-(--color-green-accent) focus:outline-none focus:ring-4 focus:ring-(--color-green-primary)/20 font-(family-name:--font-header)"
        >
          <FontAwesomeIcon icon={faUser} className="mr-3 text-lg" />
          CREATE FREE ACCOUNT
        </Link>
        <button className="flex h-14 items-center justify-center rounded-lg border-2 border-(--color-green-primary) bg-(--color-bg-card) text-base font-medium text-(--color-text-primary) shadow-sm transition hover:bg-(--color-green-accent) focus:outline-none focus:ring-4 focus:ring-(--color-green-primary)/20 font-(family-name:--font-body)">
          <FcGoogle className="mr-2 text-2xl" />
          Sign in with Google
        </button>
      </div>
    </AuthShell>
  );
}
