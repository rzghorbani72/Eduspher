import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { backendApiBaseUrl } from "@/lib/env";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.profileId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const paymentId = parseInt(id, 10);

    if (isNaN(paymentId)) {
      return NextResponse.json(
        { success: false, error: "Invalid payment ID" },
        { status: 400 }
      );
    }

    // Get auth token from cookies
    const cookieStore = await import("next/headers").then((m) => m.cookies());
    const token = cookieStore.get("jwt")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get store ID from cookies
    const storeId = cookieStore.get("skillforge_selected_store_id")?.value;

    // Fetch payment details from backend
    const response = await fetch(`${backendApiBaseUrl}/payments/${paymentId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(storeId && { "X-Store-ID": storeId }),
      },
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: "Payment not found" },
          { status: 404 }
        );
      }
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

