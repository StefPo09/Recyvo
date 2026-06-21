import type { Metadata } from "next";
import type { ReactNode } from "react";
import SettingsProvider from "@/lib/SettingsContext";
import logoSrc from "@/Logo/Transparent/color.png";

export const metadata: Metadata = {
  title: "Settings | Recyvo",
  // Use the imported image's URL string so it matches the Metadata icon types
  icons: {
    icon: logoSrc.src,
  },
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: ReactNode;
}>) {
  return <SettingsProvider>{children}</SettingsProvider>;
}
