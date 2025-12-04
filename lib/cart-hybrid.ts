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

// Deduplicate cart items - keep only the first occurrence of each item
function deduplicateCart(cart: CartItem[]): CartItem[] {
  const seen = new Set<string>();
  const deduplicated: CartItem[] = [];
  
  for (const item of cart) {
    // Determine item type (handle legacy items)
    const itemType = item.item_type || (item.course_id ? 'COURSE' : 'PRODUCT');
    
    // Create unique key for the item
    let key: string;
    if (itemType === 'COURSE' && item.course_id !== undefined && item.course_id !== null) {
      key = `course_${item.course_id}`;
    } else if (itemType === 'PRODUCT' && item.product_id !== undefined && item.product_id !== null) {
      key = `product_${item.product_id}`;
    } else {
      // Skip invalid items
      continue;
    }
    
    // Only add if we haven't seen this key before
    if (!seen.has(key)) {
      seen.add(key);
      // Ensure item_type is set
      deduplicated.push({
        ...item,
        item_type: itemType,
      });
    }
  }
  
  return deduplicated;
}

// Client-side cart operations (localStorage)
export function getLocalCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  
  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    if (!cartData) return [];
    const cart = JSON.parse(cartData);
    // Deduplicate cart items
    const deduplicated = deduplicateCart(cart);
    
    // If duplicates were found, save the cleaned cart back to localStorage
    if (deduplicated.length !== cart.length) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(deduplicated));
      // Dispatch event to notify components of the cleanup
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    }
    
    return deduplicated;
  } catch {
    return [];
  }
}

export function addToLocalCart(item: Omit<CartItem, "added_at">): boolean {
  if (typeof window === "undefined") return false;
  
  try {
    const cart = getLocalCart();
    
    // Determine item type (handle legacy items)
    const itemType = item.item_type || (item.course_id ? 'COURSE' : 'PRODUCT');
    
    // Check if already in cart (by course_id or product_id)
    const isDuplicate = cart.some((i) => {
      // Determine existing item type (handle legacy items)
      const existingItemType = i.item_type || (i.course_id ? 'COURSE' : 'PRODUCT');
      
      // Only compare items of the same type
      if (itemType === 'COURSE' && existingItemType === 'COURSE') {
        return i.course_id === item.course_id && i.course_id !== undefined && i.course_id !== null;
      }
      if (itemType === 'PRODUCT' && existingItemType === 'PRODUCT') {
        return i.product_id === item.product_id && i.product_id !== undefined && i.product_id !== null;
      }
      return false;
    });
    
    if (isDuplicate) {
      return false;
    }
    
    cart.push({
      ...item,
      item_type: itemType, // Ensure item_type is set
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
      // Check item_type to ensure we're comparing the right type of item
      const actualItemType = item.item_type || (item.course_id ? 'COURSE' : 'PRODUCT');
      
      // Only filter out items that match both the type and the ID
      if (itemType === 'COURSE' && actualItemType === 'COURSE') {
        return item.course_id !== itemId;
      } else if (itemType === 'PRODUCT' && actualItemType === 'PRODUCT') {
        return item.product_id !== itemId;
      }
      // Keep items of different types
      return true;
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
    
    // Transform cart items to match backend format
    // Ensure item_type is set correctly for legacy items
    // IMPORTANT: Always sync, even if cart is empty, so server knows to clear it
    const transformedItems = localCart
      .filter((item) => {
        // Only include items that have valid IDs
        const itemType = item.item_type || (item.course_id ? 'COURSE' : 'PRODUCT');
        if (itemType === 'COURSE') {
          return item.course_id !== undefined && item.course_id !== null;
        } else {
          return item.product_id !== undefined && item.product_id !== null;
        }
      })
      .map((item) => {
        const itemType = item.item_type || (item.course_id ? 'COURSE' : 'PRODUCT');
        return {
          item_type: itemType,
          course_id: item.course_id,
          product_id: item.product_id,
          title: itemType === 'COURSE' ? item.course_title : item.product_title,
          price: itemType === 'COURSE' ? item.course_price : item.product_price,
          cover: itemType === 'COURSE' ? item.course_cover : item.product_cover,
          added_at: item.added_at,
        };
      });

    // Call Next.js API route which will call backend
    // Always send the sync request, even if cart is empty (to clear server cart)
    const response = await fetch("/api/cart/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: transformedItems }),
    });

    if (response.ok) {
      const result = await response.json();
      
      // Remove invalid items from localStorage if any were removed
      if (result.removedItems && Array.isArray(result.removedItems) && result.removedItems.length > 0) {
        // Re-read cart from localStorage to get the latest state (avoid stale data)
        const currentCart = getLocalCart();
        const removedIds = new Set(
          result.removedItems.map((item: { type: string; id: number }) => 
            item.type === 'COURSE' ? item.id : item.id
          )
        );
        
        // Filter out removed items from current cart
        const updatedCart = currentCart.filter((item) => {
          if (item.item_type === 'COURSE' && item.course_id) {
            return !removedIds.has(item.course_id);
          }
          if (item.item_type === 'PRODUCT' && item.product_id) {
            return !removedIds.has(item.product_id);
          }
          return true;
        });
        
        // Update localStorage
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart));
        
        // Dispatch event to notify components
        window.dispatchEvent(new Event("cartUpdated"));
      }
      
      markCartSynced();
      return true;
    } else if (response.status === 401) {
      // User not authenticated - don't mark as synced, but don't treat as error
      // Cart will sync when user logs in
      console.log("Cart sync skipped - user not authenticated");
      return false;
    } else {
      // Log error for debugging
      const errorText = await response.text();
      console.error("Cart sync failed:", response.status, errorText);
      // Don't mark as synced on error
      return false;
    }
  } catch (error) {
    // Log error for debugging
    console.error("Cart sync error:", error);
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

