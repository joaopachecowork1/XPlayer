"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pin, Trash2 } from "lucide-react";
import { formatDateTime, initials } from "./hubUtils";

// Derive a stable hue from a name string for the avatar ring colour.
function nameColor(name: string): string {
  const PALETTE = [
    "#00ff44", "#ff2d75", "#ffe135", "#8b00ff", "#ff8c00",
    "#00e5ff", "#ff4444", "#00cc99",
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return PALETTE[h % PALETTE.length];
}

export function PostHeader({
  authorName,
  createdAtUtc,
  isPinned,
  isAdmin,
  onAdminPin,
  onAdminDelete,
}: Readonly<{
  authorName: string;
  createdAtUtc: string;
  isPinned?: boolean;
  isAdmin?: boolean;
  onAdminPin?: () => void;
  onAdminDelete?: () => void;
}>) {
  const color = nameColor(authorName);
  const abbr = initials(authorName);

  return (
    <div className="flex items-start justify-between gap-2.5">
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Avatar circle — neon border matching the author's derived colour */}
        <div
          aria-hidden="true"
          style={{
            width: 34,
            height: 34,
            minWidth: 34,
            borderRadius: "50%",
            background: `radial-gradient(circle at 35% 35%, ${color}28, rgba(0,0,0,0.6))`,
            border: `2px solid ${color}`,
            boxShadow: `0 0 8px ${color}55`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontFamily: "'Fredoka One', 'Nunito', system-ui",
            fontWeight: 900,
            color,
            flexShrink: 0,
          }}
        >
          {abbr}
        </div>

        <div className="min-w-0">
          <div
            className="text-[13px] sm:text-sm font-semibold truncate"
            style={{ color, fontFamily: "'Fredoka One', 'Nunito', system-ui" }}
          >
            {authorName}
          </div>
          <div className="text-xs text-muted-foreground">{formatDateTime(createdAtUtc)}</div>
        </div>

        {isPinned && (
          <Badge
            variant="secondary"
            style={{
              background: "rgba(255,225,53,0.10)",
              border: "1px solid rgba(255,225,53,0.35)",
              color: "#ffe135",
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 700,
              fontSize: "10px",
            }}
          >
            📌
          </Badge>
        )}
      </div>

      {isAdmin && (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="canhoes-tap h-8 w-8 px-0"
            onClick={onAdminPin}
            title="Fixar / Desafixar"
            style={{ color: "rgba(255,225,53,0.70)" }}
          >
            <Pin className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="canhoes-tap h-8 w-8 px-0"
            onClick={onAdminDelete}
            title="Eliminar"
            style={{ color: "rgba(255,45,117,0.70)" }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
