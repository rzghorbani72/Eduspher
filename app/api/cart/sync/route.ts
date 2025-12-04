import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { syncCart } from "@/lib/api/server";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.profileId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: "Invalid items format" },
        { status: 400 }
      );
    }

    // Sync cart to backend
    const result = await syncCart(items);

    return NextResponse.json({
      success: true,
      message: result.message || "Cart synced successfully",
      removedItems: result.removedItems,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to sync cart",
      },
      { status: 500 }
    );
  }
}

