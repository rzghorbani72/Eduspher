import { NextRequest, NextResponse } from "next/server";
import { backendApiBaseUrl, env } from "@/lib/env";

const withTrailingSlash = (value: string) =>
  value.endsWith("/") ? value.slice(0, -1) : value;

const baseUrl = withTrailingSlash(backendApiBaseUrl);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathSegment = path.join("/");
  const url = `${baseUrl}/auth/${pathSegment}`;

  const body = await request.json().catch(() => ({}));
  const cookieStore = request.cookies;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const schoolId = cookieStore.get(env.schoolIdCookie)?.value;
  const schoolSlug = cookieStore.get(env.schoolSlugCookie)?.value;

  if (schoolId) {
    headers["X-School-ID"] = schoolId;
  } else if (env.defaultSchoolId) {
    headers["X-School-ID"] = String(env.defaultSchoolId);
  }

  if (schoolSlug) {
    headers["X-School-Slug"] = schoolSlug;
  }

  const jwtCookie = cookieStore.get("jwt")?.value;
  if (jwtCookie) {
    headers["Authorization"] = `Bearer ${jwtCookie}`;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      credentials: "include",
    });

    const responseData = await response.json().catch(() => ({}));

    const nextResponse = NextResponse.json(responseData, {
      status: response.status,
    });

    // Only set cookies if response is successful (2xx status)
    if (response.status >= 200 && response.status < 300) {
      const setCookieHeader = response.headers.get("set-cookie");
      if (setCookieHeader) {
        const cookies = setCookieHeader.split(/,(?=\s*\w+=)/);
        for (const cookie of cookies) {
          const [nameValue, ...attributes] = cookie.trim().split(";");
          const [name, ...valueParts] = nameValue.split("=");
          const value = valueParts.join("=");

          if (name && value) {
            const cookieOptions: {
              httpOnly?: boolean;
              secure?: boolean;
              sameSite?: "strict" | "lax" | "none";
              maxAge?: number;
              path?: string;
              domain?: string;
            } = {
              path: "/",
              sameSite: "lax",
            };

            for (const attr of attributes) {
              const trimmed = attr.trim().toLowerCase();
              if (trimmed === "httponly") {
                cookieOptions.httpOnly = true;
              } else if (trimmed.startsWith("secure")) {
                cookieOptions.secure = process.env.NODE_ENV === "production";
              } else if (trimmed.startsWith("samesite=")) {
                const sameSiteValue = trimmed.split("=")[1]?.toLowerCase();
                if (sameSiteValue === "strict" || sameSiteValue === "lax" || sameSiteValue === "none") {
                  cookieOptions.sameSite = sameSiteValue;
                }
              } else if (trimmed.startsWith("max-age=")) {
                const maxAge = parseInt(trimmed.split("=")[1] || "0", 10);
                if (!isNaN(maxAge)) {
                  cookieOptions.maxAge = maxAge;
                }
              } else if (trimmed.startsWith("path=")) {
                cookieOptions.path = trimmed.split("=")[1] || "/";
              } else if (trimmed.startsWith("domain=")) {
                const domain = trimmed.split("=")[1];
                if (domain) {
                  cookieOptions.domain = domain;
                }
              }
            }

            nextResponse.cookies.set(name.trim(), value, cookieOptions);
          }
        }
      }
    } else {
      // If login failed, ensure any existing jwt cookie is cleared
      nextResponse.cookies.delete("jwt");
    }

    return nextResponse;
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathSegment = path.join("/");
  const url = `${baseUrl}/auth/${pathSegment}`;

  const cookieStore = request.cookies;
  const searchParams = request.nextUrl.searchParams;

  const headers: HeadersInit = {
    Accept: "application/json",
  };

  const schoolId = cookieStore.get(env.schoolIdCookie)?.value;
  const schoolSlug = cookieStore.get(env.schoolSlugCookie)?.value;

  if (schoolId) {
    headers["X-School-ID"] = schoolId;
  } else if (env.defaultSchoolId) {
    headers["X-School-ID"] = String(env.defaultSchoolId);
  }

  if (schoolSlug) {
    headers["X-School-Slug"] = schoolSlug;
  }

  const jwtCookie = cookieStore.get("jwt")?.value;
  if (jwtCookie) {
    headers["Authorization"] = `Bearer ${jwtCookie}`;
  }

  const queryString = searchParams.toString();
  const fullUrl = queryString ? `${url}?${queryString}` : url;

  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers,
      credentials: "include",
    });

    const responseData = await response.json().catch(() => ({}));

    const nextResponse = NextResponse.json(responseData, {
      status: response.status,
    });

    // Only set cookies if response is successful (2xx status)
    if (response.status >= 200 && response.status < 300) {
      const setCookieHeader = response.headers.get("set-cookie");
      if (setCookieHeader) {
        const cookies = setCookieHeader.split(/,(?=\s*\w+=)/);
        for (const cookie of cookies) {
          const [nameValue, ...attributes] = cookie.trim().split(";");
          const [name, ...valueParts] = nameValue.split("=");
          const value = valueParts.join("=");

          if (name && value) {
            const cookieOptions: {
              httpOnly?: boolean;
              secure?: boolean;
              sameSite?: "strict" | "lax" | "none";
              maxAge?: number;
              path?: string;
              domain?: string;
            } = {
              path: "/",
              sameSite: "lax",
            };

            for (const attr of attributes) {
              const trimmed = attr.trim().toLowerCase();
              if (trimmed === "httponly") {
                cookieOptions.httpOnly = true;
              } else if (trimmed.startsWith("secure")) {
                cookieOptions.secure = process.env.NODE_ENV === "production";
              } else if (trimmed.startsWith("samesite=")) {
                const sameSiteValue = trimmed.split("=")[1]?.toLowerCase();
                if (sameSiteValue === "strict" || sameSiteValue === "lax" || sameSiteValue === "none") {
                  cookieOptions.sameSite = sameSiteValue;
                }
              } else if (trimmed.startsWith("max-age=")) {
                const maxAge = parseInt(trimmed.split("=")[1] || "0", 10);
                if (!isNaN(maxAge)) {
                  cookieOptions.maxAge = maxAge;
                }
              } else if (trimmed.startsWith("path=")) {
                cookieOptions.path = trimmed.split("=")[1] || "/";
              } else if (trimmed.startsWith("domain=")) {
                const domain = trimmed.split("=")[1];
                if (domain) {
                  cookieOptions.domain = domain;
                }
              }
            }

            nextResponse.cookies.set(name.trim(), value, cookieOptions);
          }
        }
      }
    } else {
      // If request failed, ensure any existing jwt cookie is cleared
      nextResponse.cookies.delete("jwt");
    }

    return nextResponse;
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

