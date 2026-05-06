"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useStorePath } from "@/components/providers/store-provider";
import { useEffect, useState, type CSSProperties } from "react";
import { getCartItemCount } from "@/app/actions/cart";
import { useCartSync } from "@/hooks/use-cart-sync";

interface CartIconProps {
  isAuthenticated?: boolean;
}

export function CartIcon({ isAuthenticated = false }: CartIconProps) {
  const buildPath = useStorePath();
  const [itemCount, setItemCount] = useState(0);

  useCartSync(isAuthenticated);

  useEffect(() => {
    const updateCount = () => {
      setItemCount(getCartItemCount());
    };

    updateCount();

    window.addEventListener("cartUpdated", updateCount);
    window.addEventListener("storage", updateCount);
    window.addEventListener("focus", updateCount);

    return () => {
      window.removeEventListener("cartUpdated", updateCount);
      window.removeEventListener("storage", updateCount);
      window.removeEventListener("focus", updateCount);
    };
  }, []);

  const chipStyle: CSSProperties = {
    borderColor: "var(--theme-border-strong, rgba(15, 23, 42, 0.22))",
    backgroundColor: "var(--theme-card-bg, #ffffff)",
    color: "var(--theme-primary, #2563eb)",
  };

  return (
    <Link
      href={buildPath("/checkout?cart=true")}
      className="relative z-10 inline-flex shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-primary,#2563eb)]"
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <span
        className="flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition-colors hover:opacity-[0.92]"
        style={chipStyle}
      >
        <ShoppingCart
          className="pointer-events-none h-5 w-5 shrink-0"
          aria-hidden
          strokeWidth={2}
          stroke="currentColor"
          fill="none"
        />
      </span>
      {itemCount > 0 ? (
        <span
          className="absolute -right-0.5 -top-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 px-1 text-[11px] font-bold shadow-sm"
          style={{
            borderColor: "var(--theme-background, #f8fafc)",
            backgroundColor: "var(--theme-primary, #2563eb)",
            color: "var(--theme-on-primary, #ffffff)",
          }}
        >
          {itemCount > 9 ? "9+" : itemCount}
        </span>
      ) : null}
    </Link>
  );
}
