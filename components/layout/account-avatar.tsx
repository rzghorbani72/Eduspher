"use client";

import { useState } from "react";
import { sizedImageUrl } from "@/lib/images/sized-image-url";

interface AccountAvatarProps {
  name: string;
  avatarUrl: string | null;
  /** Rendered size in px. */
  size?: number;
  className?: string;
}

/**
 * The signed-in person's picture in the header, with their first letter as the
 * fallback — used both when there is no picture and when the picture fails to
 * load (expired storage link), so the header never shows a broken image.
 */
export function AccountAvatar({
  name,
  avatarUrl,
  size = 32,
  className = "",
}: AccountAvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(avatarUrl) && !failed;

  return (
    <span
      aria-hidden
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor:
          "color-mix(in srgb, var(--theme-primary) 22%, var(--theme-background))",
        color: "var(--theme-primary)",
      }}
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold ${className}`}
    >
      {showImage && avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={sizedImageUrl(avatarUrl, 96, 60) ?? avatarUrl}
          alt=""
          onError={() => setFailed(true)}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : (
        name.trim().charAt(0)
      )}
    </span>
  );
}
