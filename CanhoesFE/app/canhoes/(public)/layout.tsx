"use client";

import React from "react";

export default function CanhoesPublicLayout({ children }: { children: React.ReactNode }) {
  // No auth guard, no chrome. Background owned by each child page.
  return <div data-theme="canhoes" className="min-h-[100svh]">{children}</div>;
}