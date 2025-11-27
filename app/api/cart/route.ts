import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getCart } from "@/lib/api/server";

export async function GET(request: NextRequest) {
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

    return NextResponse.json({
      items: cart.items || [],
    });
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

