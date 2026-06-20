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
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f9fA] px-5 py-6 text-[#1A2B23] dark:bg-black dark:text-green-100">
      <section className="flex w-full max-w-md flex-col items-center overflow-hidden rounded-3xl bg-white shadow-[0_18px_45px_rgba(26,43,35,0.12)] dark:bg-gray-900">
        <div className="w-full rounded-b-3xl bg-linear-to-r from-green-700 to-green-600 px-6 pb-8 pt-8 text-center text-white shadow-[0_10px_24px_rgba(18,84,39,0.22)] dark:from-green-900 dark:to-green-800">
          <div className="mx-auto mb-5 flex h-36 w-36 items-center justify-center rounded-full bg-white shadow-[inset_0_2px_8px_rgba(255,255,255,0.85),0_8px_18px_rgba(18,84,39,0.25)]">
            <Image
              src={logo}
              alt="Recyvo logo"
              height={118}
              width={118}
              priority
            />
          </div>

          <div className="mb-3 flex items-center justify-center gap-2 text-sm font-medium uppercase tracking-[0.18em] text-white/75">
            <FontAwesomeIcon icon={faLeaf} />
            Smart city sorting
          </div>
          <h1 className="text-[28px] font-bold leading-tight">
            Your smart path to a cleaner city.
          </h1>
          <p className="mt-2 text-[20px] font-medium text-white/85">
            Scan. Sort. Share.
          </p>
        </div>

        <div className="w-full px-6 pb-7 pt-6">
          <div className="mb-5 rounded-xl border-l-4 border-green-600 bg-[#f8f9fA] p-4 dark:bg-gray-800">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-700 text-white">
                <FontAwesomeIcon icon={faRecycle} className="text-lg" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-100">
                  Meet SEB
                </p>
                <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  Scan waste, find the right bin, and earn points for every
                  better choice.
                </p>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3">
            <Link
              href={"../LogInPage"}
              className="flex h-14 items-center justify-center rounded-lg bg-[#17692f] text-[18px] font-semibold text-white shadow-[inset_0_2px_6px_rgba(255,255,255,0.14),0_3px_7px_rgba(18,84,39,0.25)] transition hover:bg-[#125826] focus:outline-none focus:ring-4 focus:ring-[#17692f]/25"
            >
              LOGIN
              <FontAwesomeIcon
                icon={faArrowRight}
                className="ml-2 text-white/60"
              />
            </Link>
            <Link
              href={"../SignUpPage"}
              className="flex h-14 items-center justify-center rounded-lg border-2 border-[#17692f] bg-white text-[17px] font-semibold text-[#17692f] transition hover:bg-[#f3faf5] focus:outline-none focus:ring-4 focus:ring-[#17692f]/20 dark:bg-gray-900"
            >
              <FontAwesomeIcon icon={faUser} className="mr-3 text-[18px]" />
              CREATE FREE ACCOUNT
            </Link>
            <button className="flex h-12 items-center justify-center rounded-lg border-2 border-[#17692f] bg-white text-[16px] font-medium text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition hover:bg-[#e8ecee] focus:outline-none focus:ring-4 focus:ring-slate-300 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800">
              <FcGoogle className="mr-2 text-[22px]" />
              Sign in with Google
            </button>
          </div>

          <a
            href=""
            className="mt-5 block text-center text-[14px] font-medium text-[#1A2B23] hover:underline dark:text-green-200"
          >
            Forgot password? Contact support.
          </a>
        </div>
      </section>
    </main>
  );
}
