"use client";
import { absMediaUrl } from "@/lib/media";

export function MediaCarousel({ urls }: { urls: string[] }) {
  if (!urls?.length) return null;
  return (
    <div className="flex snap-x snap-mandatory overflow-x-auto gap-2">
      {urls.map((u) => (
        <img
          key={u}
          src={absMediaUrl(u)}
          className="snap-center w-full max-h-[70vh] object-contain rounded-xl border"
          alt=""
        />
      ))}
    </div>
  );
}
