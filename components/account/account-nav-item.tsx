"use client";

import {
  AnimatedHoverIcon,
  type AnimateNavIcon,
} from "@/components/account/animated-hover-icon";
import Link from "@/components/ui/link";
import { cn } from "@/lib/utils";
import { useState } from "react";

type AccountNavItemProps = {
  href: string;
  label: string;
  icon?: AnimateNavIcon;
  isActive: boolean;
  isChild?: boolean;
};

export function AccountNavItem({
  href,
  label,
  icon,
  isActive,
  isChild = false,
}: AccountNavItemProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "flex items-center transition-colors",
        isChild
          ? cn(
              "account-nav-child relative w-full rounded-lg px-2.5 py-2 text-start text-sm",
              isActive
                ? "account-nav-child-active font-semibold text-(--theme-primary)"
                : "text-muted hover:text-foreground",
            )
          : cn(
              "shrink-0 gap-2 whitespace-nowrap rounded-full border border-theme px-3.5 py-2 text-sm font-medium lg:gap-3 lg:rounded-lg lg:border-0 lg:px-4 lg:py-2.5",
              isActive
                ? "border-transparent bg-(--theme-primary) font-semibold text-(--theme-on-primary) shadow-sm shadow-(--theme-primary)/30"
                : "text-muted hover:bg-surface hover:text-foreground",
            ),
      )}
    >
      {icon && !isChild ? (
        <AnimatedHoverIcon
          icon={icon}
          playing={!isActive && hovered}
          size={16}
        />
      ) : null}
      <span className="truncate">{label}</span>
    </Link>
  );
}
