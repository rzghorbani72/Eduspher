'use server';

import { cookies } from 'next/headers';
import { decodeJwt } from 'jose';
import { backendApiBaseUrl, env } from '@/lib/env';

/**
 * Check authentication status from SSR cookies
 * This avoids API calls and reduces server load
 */
export async function checkAuth(): Promise<{ isAuthenticated: boolean }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt')?.value;
    
    if (!token) {
      return { isAuthenticated: false };
    }

    try {
      // Validate the JWT token by decoding it
      const payload = decodeJwt(token);
      // Check if token has required fields and is not expired
      const hasUserId = payload.userId && (typeof payload.userId === 'number' || typeof payload.userId === 'string');
      const isExpired = payload.exp && typeof payload.exp === 'number' && payload.exp < Date.now() / 1000;
      
      if (hasUserId && !isExpired) {
        return { isAuthenticated: true };
      }
    } catch {
      // Token is invalid or expired
      return { isAuthenticated: false };
    }

    return { isAuthenticated: false };
  } catch {
    return { isAuthenticated: false };
  }
}

export async function logout(): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt');

    // Call backend logout endpoint if token exists
    if (token) {
      try {
        await fetch(`${backendApiBaseUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          cache: 'no-store',
        });
      } catch (error) {
        // Continue with cookie deletion even if backend call fails
        console.warn('Backend logout call failed:', error);
      }
    }

    // Delete the JWT cookie from the request
    cookieStore.delete('jwt');

    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Logout failed',
    };
  }
}

