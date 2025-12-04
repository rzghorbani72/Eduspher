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

export function addCourseToCart(item: {
  course_id: number;
  course_title: string;
  course_price: number;
  course_cover?: string;
}): boolean {
  const cartItem: Omit<CartItem, "added_at"> = {
    item_type: 'COURSE',
    course_id: item.course_id,
    course_title: item.course_title,
    course_price: item.course_price,
    course_cover: item.course_cover,
  };
  const success = addToLocalCart(cartItem);
  
  // Background sync if authenticated (non-blocking)
  if (success) {
    syncCartToServer().catch(() => {
      // Silently fail - cart is still in localStorage
    });
  }
  
  return success;
}

export function addProductToCart(item: {
  product_id: number;
  product_title: string;
  product_price: number;
  product_cover?: string;
}): boolean {
  const cartItem: Omit<CartItem, "added_at"> = {
    item_type: 'PRODUCT',
    product_id: item.product_id,
    product_title: item.product_title,
    product_price: item.product_price,
    product_cover: item.product_cover,
  };
  const success = addToLocalCart(cartItem);
  
  // Background sync if authenticated (non-blocking)
  if (success) {
    syncCartToServer().catch(() => {
      // Silently fail - cart is still in localStorage
    });
  }
  
  return success;
}

export function removeCourseFromCart(course_id: number): boolean {
  const success = removeFromLocalCart(course_id, 'COURSE');
  
  // Sync immediately after removal (don't wait for background)
  if (success) {
    syncCartToServer().catch((error) => {
      // Log error but don't block UI - cart is still in localStorage
      console.error("Failed to sync cart after removal:", error);
    });
  }
  
  return success;
}

export function removeProductFromCart(product_id: number): boolean {
  const success = removeFromLocalCart(product_id, 'PRODUCT');
  
  // Sync immediately after removal (don't wait for background)
  if (success) {
    syncCartToServer().catch((error) => {
      // Log error but don't block UI - cart is still in localStorage
      console.error("Failed to sync cart after removal:", error);
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

export function isProductInCart(product_id: number): boolean {
  return getCartItems().some((item) => item.product_id === product_id);
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

