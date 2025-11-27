"use client";

/**
 * Hybrid Cart Storage - Best Practice Implementation
 * 
 * Strategy:
 * 1. Use localStorage for immediate UX (fast, no API calls)
 * 2. Sync to server when user is authenticated (persistence, multi-device)
 * 3. Merge server cart on login (recover abandoned carts)
 * 4. Clear localStorage after successful sync
 */

const CART_STORAGE_KEY = "edusphere_cart";
const CART_SYNC_KEY = "edusphere_cart_synced";

export interface CartItem {
  course_id: number;
  course_title: string;
  course_price: number;
  course_cover?: string;
  added_at: string;
}

// Client-side cart operations (localStorage)
export function getLocalCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  
  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    if (!cartData) return [];
    return JSON.parse(cartData);
  } catch {
    return [];
  }
}

export function addToLocalCart(item: Omit<CartItem, "added_at">): boolean {
  if (typeof window === "undefined") return false;
  
  try {
    const cart = getLocalCart();
    
    if (cart.some((i) => i.course_id === item.course_id)) {
      return false;
    }
    
    cart.push({
      ...item,
      added_at: new Date().toISOString(),
    });
    
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    localStorage.removeItem(CART_SYNC_KEY); // Mark as unsynced
    window.dispatchEvent(new CustomEvent("cartUpdated"));
    
    return true;
  } catch {
    return false;
  }
}

export function removeFromLocalCart(course_id: number): boolean {
  if (typeof window === "undefined") return false;
  
  try {
    const cart = getLocalCart();
    const filtered = cart.filter((item) => item.course_id !== course_id);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(filtered));
    localStorage.removeItem(CART_SYNC_KEY);
    window.dispatchEvent(new CustomEvent("cartUpdated"));
    
    return true;
  } catch {
    return false;
  }
}

export function clearLocalCart(): boolean {
  if (typeof window === "undefined") return false;
  
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem(CART_SYNC_KEY);
    window.dispatchEvent(new CustomEvent("cartUpdated"));
    
    return true;
  } catch {
    return false;
  }
}

export function isCartSynced(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(CART_SYNC_KEY) === "true";
}

export function markCartSynced(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_SYNC_KEY, "true");
}

// Server sync functions (to be called when authenticated)
export async function syncCartToServer(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  
  try {
    const localCart = getLocalCart();
    if (localCart.length === 0) {
      markCartSynced();
      return true;
    }

    // Call Next.js API route which will call backend
    const response = await fetch("/api/cart/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: localCart }),
    });

    if (response.ok) {
      markCartSynced();
      return true;
    }
    
    return false;
  } catch {
    return false;
  }
}

export async function loadCartFromServer(): Promise<CartItem[]> {
  if (typeof window === "undefined") return [];
  
  try {
    const response = await fetch("/api/cart");
    if (!response.ok) return [];
    
    const data = await response.json();
    if (data.items && Array.isArray(data.items)) {
      // Convert server cart items to local format
      const serverCart = data.items.map((item: any) => ({
        course_id: item.course_id,
        course_title: item.course?.title || item.course_title,
        course_price: item.course?.price || item.course_price,
        course_cover: item.course?.cover?.url || item.course_cover,
        added_at: item.created_at || new Date().toISOString(),
      }));
      
      return serverCart;
    }
    
    return [];
  } catch {
    return [];
  }
}

// Merge local and server carts (on login)
export function mergeCarts(localCart: CartItem[], serverCart: CartItem[]): CartItem[] {
  const merged = [...serverCart];
  const serverCourseIds = new Set(serverCart.map((item) => item.course_id));
  
  // Add local items that aren't in server cart
  localCart.forEach((item) => {
    if (!serverCourseIds.has(item.course_id)) {
      merged.push(item);
    }
  });
  
  return merged;
}

