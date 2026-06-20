import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;
import SettingsProvider from "../lib/SettingsContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SEB: Brašov Eco Assistant",
  description: "Eco waste scanning and recycling companion",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Try to read cookies/server headers in a defensive way so SSR can apply theme/lang
  let themeCookie: string | null = null;
  let langCookie: string | null = null;

  try {
    // dynamic import so this code only runs on server and we can guard against missing APIs
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const headersMod: any = await import("next/headers");

    // Preferred: cookies() with .get(name).value
    if (typeof headersMod.cookies === "function") {
      try {
        const cookieStore = headersMod.cookies();
        // cookieStore may have get(name) returning { value }
        if (cookieStore && typeof cookieStore.get === "function") {
          const c1 = cookieStore.get("recyvo-theme");
          themeCookie = c1?.value ?? null;
          const c2 = cookieStore.get("recyvo-lang");
          langCookie = c2?.value ?? null;
        }
      } catch (e) {
        // fallthrough to headers()
      }
    }

    // Fallback: headers().get('cookie') may be provided
    if (!themeCookie && typeof headersMod.headers === "function") {
      const h = headersMod.headers();
      // headers() may return an object with get or a plain map
      const cookieHeader = typeof h.get === "function" ? h.get("cookie") : h?.cookie ?? "";
      if (cookieHeader) {
        const parsed = Object.fromEntries(
          String(cookieHeader)
            .split(";")
            .map((c: string) => c.trim())
            .filter(Boolean)
            .map((c: string) => {
              const idx = c.indexOf("=");
              if (idx === -1) return [c, ""];
              const name = c.slice(0, idx).trim();
              const val = c.slice(idx + 1).trim();
              return [name, decodeURIComponent(val)];
            }),
        ) as Record<string, string>;

        themeCookie = parsed["recyvo-theme"] ?? themeCookie;
        langCookie = parsed["recyvo-lang"] ?? langCookie;
      }
    }
  } catch (err) {
    // if anything fails, silently continue with defaults
  }

  const htmlLang = langCookie ?? "en";
  const darkClass = themeCookie === "Dark" ? "dark" : "";

  return (
    <html lang={htmlLang} className={`${geistSans.variable} ${geistMono.variable} h-full antialiased ${darkClass}`}>
      <body className="min-h-full flex flex-col">
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}