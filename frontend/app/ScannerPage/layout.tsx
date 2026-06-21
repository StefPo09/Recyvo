import type { Metadata } from "next";
import type { ReactNode } from "react";
import logoSrc from "@/Logo/Transparent/color.png";

export const metadata: Metadata = {
  title: "Scanner | Recyvo",
  icons: {
    icon: logoSrc.src,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}