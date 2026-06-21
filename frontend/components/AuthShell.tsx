"use client";

import React from "react";

type Props = {
  title?: string;
  subtitle?: string;
  introTitle?: string;
  introBody?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
};

export default function AuthShell({
  title,
  subtitle,
  introTitle,
  introBody,
  footer,
  children,
}: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-(--color-bg) p-6">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="hidden md:flex flex-col justify-center bg-(--color-bg-card) p-8 rounded-lg">
          {title && <h1 className="text-2xl font-bold mb-2">{title}</h1>}
          {subtitle && <p className="text-sm mb-4">{subtitle}</p>}
          {introTitle && <h2 className="font-semibold">{introTitle}</h2>}
          {introBody && <p className="text-sm mt-2">{introBody}</p>}
        </div>

        <div className="bg-(--color-bg-card) p-6 rounded-lg">
          <div className="mb-6">{children}</div>
          {footer && <div className="mt-4">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
