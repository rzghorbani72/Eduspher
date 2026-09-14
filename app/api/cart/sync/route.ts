import { NextRequest, NextResponse } from 'next/server';

import { getSession } from '@/lib/auth/session';
import { syncCart, UnauthorizedError } from '@/lib/api/server';

/**
 * POST /api/cart/sync — cookie-auth bridge to Nest `/cart/sync`.
 * On Nest failure, syncCart throws; clients treat non-OK as soft fail.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.profileId) {
      return new NextResponse(null, { status: 401 });
    }

    const body = await request.json();
    const { items } = body;
    if (!Array.isArray(items)) {
      return new NextResponse(null, { status: 400 });
    }

    const result = await syncCart(items);
    return NextResponse.json({
      message: result.message || 'Cart synced successfully',
      removedItems: result.removedItems,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return new NextResponse(null, { status: 401 });
    }
    return new NextResponse(null, { status: 500 });
  }
}
