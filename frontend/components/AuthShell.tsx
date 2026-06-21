"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import logo from "@/Logo/Transparent/color.png";
import { useSettings } from "@/lib/SettingsContext";

type AuthShellProps = {
  title: string;
  subtitle: string;
  introTitle: string;
  introBody: string;
  children: ReactNode;
  footer?: ReactNode;
};

export default function AuthShell({
  title,
  subtitle,
  introTitle,
  introBody,
  children,
  footer,
}: AuthShellProps) {
  const { resolvedTheme } = useSettings();
  const isDark = resolvedTheme === "Dark";

  return (
    <main className="flex min-h-screen items-center justify-center bg-(--color-bg-main) px-5 py-6 text-(--color-text-primary)">
      <section className="flex w-full max-w-md flex-col items-center overflow-hidden rounded-3xl border border-(--color-green-accent) bg-(--color-bg-card) shadow-lg">
        <div
          className={`w-full rounded-b-3xl bg-linear-to-r px-6 pb-8 pt-8 text-center text-(--color-text-on-green) shadow-lg ${
            isDark ? "from-green-900 to-green-800" : "from-green-700 to-green-600"
          }`}
        >
          <div className="mx-auto mb-5 flex h-36 w-36 items-center justify-center rounded-full bg-(--color-text-on-green) shadow-lg">
            <Image src={logo} alt="Recyvo logo" height={118} width={118} priority />
          </div>

          <div className="mb-3 text-sm font-medium uppercase tracking-wider text-white/75 font-(family-name:--font-header)">
            Smart city sorting
          </div>
          <h1 className="text-[28px] font-bold leading-tight font-(family-name:--font-logo)">
            {title}
          </h1>
          <p className="mt-2 text-[20px] font-medium text-white/85 font-(family-name:--font-header)">
            {subtitle}
          </p>
        </div>

        <div className="w-full px-6 pb-7 pt-6">
          <div className="mb-5 rounded-xl border-l-4 border-(--color-green-primary) bg-(--color-bg-main) p-4">
            <p className="font-semibold text-(--color-text-primary) font-(family-name:--font-header)">
              {introTitle}
            </p>
            <p className="mt-1 text-sm leading-6 text-(--color-text-secondary) font-(family-name:--font-body)">
              {introBody}
            </p>
          </div>

          {children}
          {footer ? <div className="mt-5">{footer}</div> : null}
        </div>
      </section>
    </main>
  );
}
