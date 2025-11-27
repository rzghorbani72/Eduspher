"use client";

/**
 * Hybrid Cart Implementation
 * - Uses localStorage for immediate UX (fast, no API calls)
 * - Syncs to server when authenticated (persistence, multi-device)
 * - Merges local + server carts on login
 */

import {
  getLocalCart,
  addToLocalCart,
  removeFromLocalCart,
  clearLocalCart,
  isCartSynced,
  markCartSynced,
  syncCartToServer,
  loadCartFromServer,
  mergeCarts,
  type CartItem,
} from "@/lib/cart-hybrid";

// Re-export types
export type { CartItem };

// Main cart functions (hybrid approach)
export function getCartItems(): CartItem[] {
  return getLocalCart();
}

export function addCourseToCart(item: Omit<CartItem, "added_at">): boolean {
  const success = addToLocalCart(item);
  
  // Background sync if authenticated (non-blocking)
  if (success) {
    syncCartToServer().catch(() => {
      // Silently fail - cart is still in localStorage
    });
  }
  
  return success;
}

export function removeCourseFromCart(course_id: number): boolean {
  const success = removeFromLocalCart(course_id);
  
  // Background sync if authenticated (non-blocking)
  if (success) {
    syncCartToServer().catch(() => {
      // Silently fail - cart is still in localStorage
    });
  }
  
  return success;
}

export function clearUserCart(): boolean {
  const success = clearLocalCart();
  
  // Background sync if authenticated (non-blocking)
  if (success) {
    syncCartToServer().catch(() => {
      // Silently fail
    });
  }
  
  return success;
}

export function getCartItemCount(): number {
  return getCartItems().length;
}

export function isInCart(course_id: number): boolean {
  return getCartItems().some((item) => item.course_id === course_id);
}

/**
 * Sync cart to server (call after login or periodically)
 */
export async function syncCart(): Promise<boolean> {
  return syncCartToServer();
}

/**
 * Load cart from server and merge with local (call on login)
 */
export async function loadAndMergeCart(): Promise<CartItem[]> {
  try {
    const localCart = getLocalCart();
    const serverCart = await loadCartFromServer();
    
    if (serverCart.length === 0) {
      // No server cart, sync local to server
      if (localCart.length > 0) {
        await syncCartToServer();
      }
      return localCart;
    }
    
    // Merge carts (server takes precedence, add unique local items)
    const merged = mergeCarts(localCart, serverCart);
    
    // Update localStorage with merged cart
    if (typeof window !== "undefined") {
      localStorage.setItem("edusphere_cart", JSON.stringify(merged));
      markCartSynced();
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    }
    
    // Sync merged cart back to server
    await syncCartToServer();
    
    return merged;
  } catch {
    // If server sync fails, return local cart
    return getLocalCart();
  }
}

