"use client";

const CART_STORAGE_KEY = "edusphere_cart";

export interface CartItem {
  course_id: number;
  course_title: string;
  course_price: number;
  course_cover?: string;
  added_at: string;
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  
  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    if (!cartData) return [];
    return JSON.parse(cartData);
  } catch {
    return [];
  }
}

export function addToCart(item: Omit<CartItem, "added_at">): boolean {
  if (typeof window === "undefined") return false;
  
  try {
    const cart = getCart();
    
    // Check if already in cart
    if (cart.some((i) => i.course_id === item.course_id)) {
      return false; // Already in cart
    }
    
    cart.push({
      ...item,
      added_at: new Date().toISOString(),
    });
    
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    return true;
  } catch {
    return false;
  }
}

export function removeFromCart(course_id: number): boolean {
  if (typeof window === "undefined") return false;
  
  try {
    const cart = getCart();
    const filtered = cart.filter((item) => item.course_id !== course_id);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
}

export function clearCart(): boolean {
  if (typeof window === "undefined") return false;
  
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function getCartItemCount(): number {
  return getCart().length;
}

export function isInCart(course_id: number): boolean {
  return getCart().some((item) => item.course_id === course_id);
}

