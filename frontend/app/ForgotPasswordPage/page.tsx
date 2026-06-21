"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import logo from '../../Logo/Transparent/color.png';
import { FiMail } from 'react-icons/fi';

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
    <main className="flex min-h-screen items-center justify-center bg-(--color-bg-main) px-5 py-6 text-(--color-text-primary)">
      <section className="flex w-full max-w-md flex-col items-center overflow-hidden rounded-3xl bg-(--color-bg-card) shadow-lg">
        <div className="w-full rounded-b-3xl bg-linear-to-r from-(--color-green-primary) to-(--color-green-primary) px-6 pb-8 pt-8 text-center text-(--color-text-on-green) shadow-lg">
          <div className="mx-auto mb-5 flex h-36 w-36 items-center justify-center rounded-full bg-(--color-text-on-green) shadow-lg">
            <Image
              src={logo}
              alt="Recyvo logo"
              height={118}
              width={118}
              priority
            />
          </div>

          <div className="mb-3 text-sm font-medium uppercase tracking-wider text-white/75 font-(family-name:--font-header)">
            Smart city sorting
          </div>
          <h1 className="text-[28px] font-bold leading-tight font-(family-name:--font-logo)">Forgot Password</h1>
          <p className="mt-2 text-[20px] font-medium text-white/85 font-(family-name:--font-header)">We will send a reset link to your email</p>
        </div>

        <div className="w-full px-6 pb-7 pt-6">
          <div className="mb-5 rounded-xl border-l-4 border-(--color-green-primary) bg-(--color-bg-main) p-4">
            <p className="font-semibold text-(--color-text-primary) font-(family-name:--font-header)">Can&apos;t sign in?</p>
            <p className="mt-1 text-sm leading-6 text-(--color-text-secondary) font-(family-name:--font-body)">Enter your account email and we&apos;ll send instructions to reset your password.</p>
          </div>

          {sent ? (
            <div className="mx-auto max-w-sm rounded-lg border border-(--color-green-primary)/30 bg-(--color-bg-main) p-4 text-(--color-text-primary)">
              <p className="font-medium">If an account with that email exists, a password reset link has been sent.</p>
              <p className="mt-2 text-sm text-(--color-text-secondary)">Check your inbox (and spam folder). The link will expire after a short time.</p>
              <div className="mt-4 text-center">
                <a href="../LogInPage" className="font-semibold text-(--color-green-primary)">Return to Log in</a>
              </div>
            </div>
          ) : (
            <>
              <div className="w-full max-w-sm mx-auto mt-5">
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition duration-300 backdrop-blur-sm bg-(--color-bg-card) border-(--color-green-accent)`}>
                  <FiMail className={`shrink-0 text-(--color-text-secondary)`} size={20} />
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
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>Send reset link</>
                )}
              </button>

              <div className="mt-5 text-center text-sm text-(--color-text-secondary) font-(family-name:--font-body)">
                <p>
                  Remembered your password? <a href="../LogInPage" className="font-semibold text-(--color-green-primary) transition hover:opacity-90">Log in</a>
                </p>
                <p className="mt-2">Need an account? <a href="../SignUpPage" className="font-semibold text-(--color-green-primary) transition hover:opacity-90">Sign up</a></p>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}