import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { getCart } from "@/lib/api/server";

/** GET /api/cart — soft empty cart when signed out; Nest body via getCart when signed in. */
export async function GET() {
  try {
    const session = await getSession();
    if (!session?.profileId) {
      return NextResponse.json({ items: [] });
    }

    const cart = await getCart();
    if (!cart) {
      return NextResponse.json({ items: [] });
    }

    const items =
      (cart as { CartItem?: typeof cart.items }).CartItem ?? cart.items ?? [];
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
