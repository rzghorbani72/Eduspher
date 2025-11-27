"use client";

import { useEffect } from "react";
import { loadAndMergeCart } from "@/app/actions/cart";

/**
 * Hook to sync cart when user is authenticated
 * Call this after login or on app initialization
 */
export function useCartSync(isAuthenticated: boolean) {
  useEffect(() => {
    if (isAuthenticated) {
      // Load and merge cart from server (non-blocking)
      loadAndMergeCart().catch(() => {
        // Silently fail - cart is still in localStorage
      });
    }
  }, [isAuthenticated]);
}

/**
 * Manual cart sync function
 * Call this explicitly after login
 */
export async function syncCartAfterLogin(): Promise<void> {
  try {
    await loadAndMergeCart();
  } catch {
    // Silently fail
  }
}

