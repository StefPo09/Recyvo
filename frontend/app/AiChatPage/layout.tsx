import type { Metadata } from "next";
import type { ReactNode } from "react";
import logoSrc from "@/Logo/Transparent/color.png";

export const metadata: Metadata = {
  title: "Ai Chat | Recyvo",
  // metadata.icons can be a simple URL string
  icons: logoSrc.src as unknown as string,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}