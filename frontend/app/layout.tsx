import type { Metadata } from "next";
import logoSrc from "@/Logo/Transparent/color.png";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import SettingsProvider from "@/lib/SettingsContext";
import { cookies } from "next/headers";
config.autoAddCss = false;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Recyvo",
  description: "Eco waste scanning and recycling companion",
  icons: {
    icon: logoSrc.src,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read theme cookie on the server so the initial HTML can match user's preference
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("recyvo-theme")?.value ?? null;
  const initialTheme = themeCookie === "Dark" ? "Dark" : themeCookie === "Light" ? "Light" : undefined;

  // Add 'dark' class and data-theme attribute to html tag when the server knows the theme
  const htmlClass = `${geistSans.variable} ${geistMono.variable} h-full antialiased ${initialTheme === "Dark" ? "dark" : ""}`.trim();
  const dataTheme = initialTheme === "Dark" ? "Dark" : "Light";

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={htmlClass}
      data-theme={dataTheme}
    >
      <body className="min-h-full flex flex-col">
        <SettingsProvider initialTheme={initialTheme}>
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}