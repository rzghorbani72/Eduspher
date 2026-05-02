"use client";

const CART_STORAGE_KEY = "edusphere_cart";
const CART_SYNC_KEY = "edusphere_cart_synced";

export interface CartItem {
  course_id: number;
  course_title?: string;
  course_price?: number;
  course_cover?: string;
  added_at: string;
}

function normalizeRawCart(raw: unknown[]): CartItem[] {
  const out: CartItem[] = [];
  const seen = new Set<number>();
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const cid = r.course_id;
    if (typeof cid !== "number" || !Number.isFinite(cid)) continue;
    if (seen.has(cid)) continue;
    seen.add(cid);
    out.push({
      course_id: cid,
      course_title: typeof r.course_title === "string" ? r.course_title : undefined,
      course_price: typeof r.course_price === "number" ? r.course_price : undefined,
      course_cover: typeof r.course_cover === "string" ? r.course_cover : undefined,
      added_at: typeof r.added_at === "string" ? r.added_at : new Date().toISOString(),
    });
  }
  return out;
}

function deduplicateCart(cart: CartItem[]): CartItem[] {
  const seen = new Set<number>();
  const deduplicated: CartItem[] = [];
  for (const item of cart) {
    if (!item.course_id) continue;
    if (seen.has(item.course_id)) continue;
    seen.add(item.course_id);
    deduplicated.push(item);
  }
  return deduplicated;
}

export function getLocalCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    if (!cartData) return [];
    const parsed = JSON.parse(cartData);
    const cart = Array.isArray(parsed) ? normalizeRawCart(parsed) : [];
    const deduplicated = deduplicateCart(cart);
    const serialized = JSON.stringify(deduplicated);

    if (serialized !== cartData) {
      localStorage.setItem(CART_STORAGE_KEY, serialized);
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
    if (cart.some((i) => i.course_id === item.course_id)) {
      return false;
    }

    cart.push({
      ...item,
      added_at: new Date().toISOString(),
    });

    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    localStorage.removeItem(CART_SYNC_KEY);
    window.dispatchEvent(new CustomEvent("cartUpdated"));

    return true;
  } catch {
    return false;
  }
}

export function removeFromLocalCart(course_id: number): boolean {
  if (typeof window === "undefined") return false;

  try {
    const cart = getLocalCart().filter((item) => item.course_id !== course_id);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
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

export async function syncCartToServer(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    const localCart = getLocalCart();
    const transformedItems = localCart.map((item) => ({
      item_type: "COURSE" as const,
      course_id: item.course_id,
      product_id: undefined as undefined,
      title: item.course_title,
      price: item.course_price,
      cover: item.course_cover,
      added_at: item.added_at,
    }));

    const response = await fetch("/api/cart/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: transformedItems }),
    });

    if (response.ok) {
      const result = await response.json();

      if (result.removedItems && Array.isArray(result.removedItems) && result.removedItems.length > 0) {
        const currentCart = getLocalCart();
        const removedIds = new Set(
          result.removedItems.map((item: { type: string; id: number }) => item.id),
        );
        const updatedCart = currentCart.filter((item) => !removedIds.has(item.course_id));
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart));
        window.dispatchEvent(new Event("cartUpdated"));
      }

      markCartSynced();
      return true;
    } else if (response.status === 401) {
      return false;
    } else {
      const errorText = await response.text();
      console.error("Cart sync failed:", response.status, errorText);
      return false;
    }
  } catch (error) {
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
    if (!data.items || !Array.isArray(data.items)) return [];

    return data.items
      .filter((item: { item_type?: string; course_id?: number }) => {
        const isCourse =
          item.item_type === "COURSE" ||
          (item.course_id != null && item.item_type !== "PRODUCT");
        return isCourse && typeof item.course_id === "number";
      })
      .map((item: any) => ({
        course_id: item.course_id,
        course_title: item.course?.title || item.course_title,
        course_price: item.course?.price ?? item.course_price,
        course_cover: item.course?.Image?.publicUrl || item.course_cover,
        added_at: item.created_at || new Date().toISOString(),
      }));
  } catch {
    return [];
  }
}

export function mergeCarts(localCart: CartItem[], serverCart: CartItem[]): CartItem[] {
  const merged = [...serverCart];
  const serverIds = new Set(serverCart.map((item) => item.course_id));

  for (const item of localCart) {
    if (!serverIds.has(item.course_id)) {
      merged.push(item);
    }
  }

  return merged;
}
