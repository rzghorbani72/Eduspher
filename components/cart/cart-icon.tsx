"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useSchoolPath } from "@/components/providers/school-provider";
import { useEffect, useState } from "react";
import { getCartItemCount } from "@/app/actions/cart";
import { useCartSync } from "@/hooks/use-cart-sync";

interface CartIconProps {
  isAuthenticated?: boolean;
}

export function CartIcon({ isAuthenticated = false }: CartIconProps) {
  const buildPath = useSchoolPath();
  const [itemCount, setItemCount] = useState(0);

  // Sync cart when authenticated
  useCartSync(isAuthenticated);

  useEffect(() => {
    const updateCount = () => {
      setItemCount(getCartItemCount());
    };
    
    updateCount();
    
    // Listen for cart updates
    window.addEventListener("cartUpdated", updateCount);
    
    return () => {
      window.removeEventListener("cartUpdated", updateCount);
    };
  }, []);

  return (
    <Link
      href={buildPath("/checkout?cart=true")}
      className="relative inline-flex items-center justify-center rounded-full p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <ShoppingCart className="h-5 w-5" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-sky-600 text-xs font-semibold text-white">
          {itemCount > 9 ? "9+" : itemCount}
        </span>
      )}
    </Link>
  );
}

