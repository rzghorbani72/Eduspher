import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getCart } from "@/lib/api/server";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.profileId) {
      return NextResponse.json(
        { items: [] },
        { status: 200 }
      );
    }

    const cart = await getCart();
    
    if (!cart) {
      return NextResponse.json({ items: [] }, { status: 200 });
    }

    const items =
      (cart as { CartItem?: typeof cart.items }).CartItem ?? cart.items ?? [];
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to get cart",
        items: [],
      },
      { status: 500 }
    );
  }
}

