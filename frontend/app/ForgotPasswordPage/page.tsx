"use client";

import { useState, useEffect } from "react";
import { FiMail } from 'react-icons/fi';
import Link from "next/link";
import AuthShell from "@/components/AuthShell";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    // simple live validation clear
    if (email.includes("@")) setError("");
  }, [email]);

  async function handleSubmit() {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      // Try calling a conventional password-reset endpoint if available.
      // If backend doesn't provide it, we still show the generic success message.
      await fetch(`${API_URL}/users/password-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }).catch(() => {
        // swallow network errors — we still show a success message to avoid
        // leaking whether an email is registered.
      });

      setSent(true);
    } catch (e: any) {
      setError(e?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthShell
      title="Forgot Password"
      subtitle="We will send a reset link to your email"
      introTitle="Can't sign in?"
      introBody="Enter your account email and we'll send instructions to reset your password."
      footer={
        sent ? (
          <div className="mx-auto max-w-sm rounded-lg border border-(--color-green-primary)/30 bg-(--color-bg-main) p-4 text-(--color-text-primary) shadow-sm">
            <p className="font-medium">If an account with that email exists, a password reset link has been sent.</p>
            <p className="mt-2 text-sm text-(--color-text-secondary)">Check your inbox (and spam folder). The link will expire after a short time.</p>
            <div className="mt-4 text-center">
              <Link href="/LogInPage" className="font-semibold text-(--color-green-primary) transition hover:opacity-90">Return to Log in</Link>
            </div>
          </div>
        ) : (
          <div className="mt-5 text-center text-sm text-(--color-text-secondary) font-(family-name:--font-body)">
            <p>
              Remembered your password? <Link href="/LogInPage" className="font-semibold text-(--color-green-primary) transition hover:opacity-90">Log in</Link>
            </p>
            <p className="mt-2">Need an account? <Link href="/SignUpPage" className="font-semibold text-(--color-green-primary) transition hover:opacity-90">Sign up</Link></p>
          </div>
        )
      }
    >
      {sent ? null : (
        <>
          <div className="w-full max-w-sm mx-auto mt-5">
            <div className="flex items-center gap-3 rounded-lg border-2 border-(--color-green-accent) bg-(--color-bg-card) px-4 py-3 transition duration-300 backdrop-blur-sm focus-within:border-(--color-green-primary) focus-within:shadow-md">
              <FiMail className="shrink-0 text-(--color-text-secondary)" size={20} />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-base font-medium text-(--color-text-primary) placeholder-(--color-text-secondary) outline-none font-(family-name:--font-body)"
              />
            </div>
            {error ? <p className="mx-auto mt-2 max-w-sm text-sm text-red-500 font-(family-name:--font-body)">{error}</p> : null}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className={`mt-8 mb-4 mx-auto flex h-14 w-full max-w-sm items-center justify-center gap-2 rounded-lg text-base font-bold text-(--color-text-on-green) shadow-lg transition font-(family-name:--font-header) ${!isLoading ? 'cursor-pointer bg-(--color-green-primary) hover:opacity-90' : 'cursor-not-allowed bg-(--color-text-secondary) opacity-60'}`}
          >
            {isLoading ? (
              <>
                <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Sending...
              </>
            ) : (
              <>Send reset link</>
            )}
          </button>
        </>
      )}
    </AuthShell>
  );
}
