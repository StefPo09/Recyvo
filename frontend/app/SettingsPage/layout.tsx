import type { Metadata } from "next";
import type { ReactNode } from "react";
import SettingsProvider from "@/lib/SettingsContext";

export const metadata: Metadata = {
  title: "Settings | Recyvo",
    icons: {
        icon: "favicon.png",
    },
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: ReactNode;
}>) {
  return <SettingsProvider>{children}</SettingsProvider>;
}
