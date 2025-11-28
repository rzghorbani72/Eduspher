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

export type CartItemType = 'COURSE' | 'PRODUCT';

export interface CartItem {
  item_type: CartItemType;
  course_id?: number;
  product_id?: number;
  course_title?: string;
  product_title?: string;
  course_price?: number;
  product_price?: number;
  course_cover?: string;
  product_cover?: string;
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
    
    // Check if already in cart (by course_id or product_id)
    const isDuplicate = cart.some((i) => {
      if (item.item_type === 'COURSE' && i.item_type === 'COURSE') {
        return i.course_id === item.course_id;
      }
      if (item.item_type === 'PRODUCT' && i.item_type === 'PRODUCT') {
        return i.product_id === item.product_id;
      }
      return false;
    });
    
    if (isDuplicate) {
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

export function removeFromLocalCart(itemId: number, itemType: CartItemType = 'COURSE'): boolean {
  if (typeof window === "undefined") return false;
  
  try {
    const cart = getLocalCart();
    const filtered = cart.filter((item) => {
      if (itemType === 'COURSE') {
        return item.course_id !== itemId;
      } else {
        return item.product_id !== itemId;
      }
    });
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

    // Transform cart items to match backend format
    const transformedItems = localCart.map((item) => ({
      item_type: item.item_type,
      course_id: item.course_id,
      product_id: item.product_id,
      title: item.item_type === 'COURSE' ? item.course_title : item.product_title,
      price: item.item_type === 'COURSE' ? item.course_price : item.product_price,
      cover: item.item_type === 'COURSE' ? item.course_cover : item.product_cover,
      added_at: item.added_at,
    }));

    // Call Next.js API route which will call backend
    const response = await fetch("/api/cart/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: transformedItems }),
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
      const serverCart = data.items.map((item: any) => {
        if (item.item_type === 'PRODUCT') {
          return {
            item_type: 'PRODUCT' as CartItemType,
            product_id: item.product_id,
            product_title: item.product?.title || item.product_title,
            product_price: item.product?.price || item.product_price,
            product_cover: item.product?.cover?.url || item.product_cover,
            added_at: item.created_at || new Date().toISOString(),
          };
        } else {
          return {
            item_type: 'COURSE' as CartItemType,
            course_id: item.course_id,
            course_title: item.course?.title || item.course_title,
            course_price: item.course?.price || item.course_price,
            course_cover: item.course?.cover?.url || item.course_cover,
            added_at: item.created_at || new Date().toISOString(),
          };
        }
      });
      
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
  const serverItemIds = new Set(
    serverCart.map((item) => 
      item.item_type === 'COURSE' ? `course_${item.course_id}` : `product_${item.product_id}`
    )
  );
  
  // Add local items that aren't in server cart
  localCart.forEach((item) => {
    const itemKey = item.item_type === 'COURSE' 
      ? `course_${item.course_id}` 
      : `product_${item.product_id}`;
    if (!serverItemIds.has(itemKey)) {
      merged.push(item);
    }
  });
  
  return merged;
}

