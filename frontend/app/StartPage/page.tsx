"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faLeaf,
  faRecycle,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import logo from '../../Logo/Transparent/color.png';
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";

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
    <main className="flex min-h-screen items-center justify-center bg-(--color-bg-main) px-5 py-6">
      <section className="flex w-full max-w-md flex-col items-center overflow-hidden rounded-3xl bg-(--color-bg-card) shadow-lg">
        <div className="w-full rounded-b-3xl bg-linear-to-r from-(--color-green-primary) to-(--color-green-primary) px-6 pb-8 pt-8 text-center text-(--color-text-on-green) shadow-lg">
          <div className="mx-auto mb-5 flex h-36 w-36 items-center justify-center rounded-full bg-(--color-text-on-green) shadow-lg">
            <Image
              src={logo}
              alt="Recycylo logo"
              height={118}
              width={118}
              priority
            />
          </div>

          <div className="mb-3 flex items-center justify-center gap-2 text-sm font-medium uppercase tracking-wider text-white/75 font-(family-name:--font-header)">
            <FontAwesomeIcon icon={faLeaf} />
            Smart city sorting
          </div>
          <h1 className="text-[28px] font-bold leading-tight font-(family-name:--font-logo)">
            Your smart path to a cleaner city.
          </h1>
          <p className="mt-2 text-[20px] font-medium text-white/85 font-(family-name:--font-header)">
            Scan. Sort. Share.
          </p>
        </div>

        <div className="w-full px-6 pb-7 pt-6">
          <div className="mb-5 rounded-xl border-l-4 border-(--color-green-primary) bg-(--color-bg-main) p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--color-green-primary) text-(--color-text-on-green)">
                <FontAwesomeIcon icon={faRecycle} className="text-lg" />
              </div>
              <div>
                <p className="font-semibold text-(--color-text-primary) font-(family-name:--font-header)">
                  Meet SEB
                </p>
                <p className="mt-1 text-sm leading-6 text-(--color-text-secondary) font-(family-name:--font-body)">
                  Scan waste, find the right bin, and earn points for every
                  better choice.
                </p>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3">
            <Link
              href={"../LogInPage"}
              className="flex h-14 items-center justify-center rounded-lg bg-(--color-green-primary) text-base font-bold text-(--color-text-on-green) shadow-lg transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-(--color-green-primary)/30 font-(family-name:--font-header)"
            >
              LOGIN
              <FontAwesomeIcon
                icon={faArrowRight}
                className="ml-2 text-white/60"
              />
            </Link>
            <Link
              href={"../SignUpPage"}
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

          <a
            href=""
            className="mt-5 block text-center text-sm font-medium text-(--color-text-primary) hover:underline font-(family-name:--font-body)"
          >
            Forgot password? Contact support.
          </a>
        </div>
      </section>
    </main>
  );
}
